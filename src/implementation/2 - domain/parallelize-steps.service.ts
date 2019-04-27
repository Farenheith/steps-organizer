import { BaseService, BASE_TYPES, INotificationService, IRequestInfo } from "base-ddd";
import { IPlan, IStage } from "../../interfaces/2 - domain/models/plan.interface";
import { IParallelizeStepsService } from "../../interfaces/2 - domain/parallelize-steps-service.interface";
import { IStepZero } from "../../interfaces/2 - domain/models/step-zero.interface";
import { IStepChain } from "../../interfaces/2 - domain/models/step-chain.interface";
import { injectable, inject } from "inversify";
import { StepTypeEnum } from "../../interfaces/2 - domain/models/enums/step-type.enum";
import { LinkedList } from "./helpers/linked-list";

@injectable()
export class ParallelizeStepsService extends BaseService<IStepZero, IPlan> implements IParallelizeStepsService {
    constructor(
            @inject(BASE_TYPES.domainServices.INotificationService) notifications: INotificationService,
            @inject(BASE_TYPES.domainModels.IRequestInfo) requestInfo: IRequestInfo) {
        super("ParallelizeStepsService", notifications, requestInfo);
    }

    async proceed(data: IStepZero): Promise<IPlan> {
        const result:IPlan = {...await this.getStages(data),
            ...{
            results: data.results,
        }};

        return result;
    }

    async getStages(data: IStepZero): Promise<{ stages: IStage[], endTime:number }> {
        const stages:IStage[] = [];
        let stageNumber = -1;
        let startTime = 0;
        let workerNro = 0;
        let working:IStepChain[] = [];
        const nexts = new LinkedList();
        const sleepers = new LinkedList();
        let stage:IStage | undefined = undefined;

        this.addNexts(nexts, sleepers, data.children);
        do {
            if (!stage || stage.startTime != startTime) {
                stageNumber++;
                stage = {
                    stageNumber,
                    startTime,
                    steps: []
                };
                stages.push(stage);
            }
            let minEndTime = 0;
            let minSleeperTime = 0;

            // Distributing workers, limiting by maxParallelization and available nexts steps
            while (workerNro < data.maxParallelization && nexts.length > 0) {
                const chain = nexts.pop()!;
                chain.startTime = startTime;
                chain.endTime = startTime + chain.step.duration;
                if (minEndTime == 0 || chain.endTime < minEndTime) {
                    minEndTime = chain.endTime;
                }
                stage.steps.push(chain.step);
                //Adding in the working array maitaining the sorting (by StartTimne, desc)
                await insert(chain, working);
                workerNro++;
            }

            // Executing sleepers, who doesn't need a worker to advance
            while (sleepers.length > 0) {
                const chain = sleepers.pop()!;
                chain.startTime = startTime;
                chain.endTime = startTime + chain.step.duration;
                if (minSleeperTime == 0 || chain.endTime < minSleeperTime) {
                    minSleeperTime = chain.endTime;
                }
                stage.steps.push(chain.step);
                //Adding in the working array maitaining the sorting (by StartTimne, desc)
                await insert(chain, working);
            }

            // Checking which step will end sooner, so the startTime of the next stage can be determined
            const pivot = await this.choosePivot(working, nexts, sleepers, workerNro);
            // For the next step, at least one worker will be available
            workerNro -= pivot.free;
            
            if (pivot.node) {
                startTime = pivot.node.endTime;
            } else if (minEndTime > 0) {
                startTime = minEndTime;
            } else {
                startTime = minSleeperTime;
            }
        } while (nexts.length > 0 || sleepers.length > 0);

        const result = {
            stages,
            endTime: 0
        };
        const lastStage = result.stages[result.stages.length - 1];
        lastStage.steps.forEach(step => {
            const candidate = lastStage.startTime + step.duration;
            if (result.endTime < candidate) {
                result.endTime = candidate;
            }
        })

        return result;
    }

    async choosePivot(working: IStepChain[], nexts: LinkedList, sleepers: LinkedList, max: number, i?: number) {
        i = i || working.length - 1;
        let free = 0;
        let node: IStepChain | undefined;
        do {
            let pivotCandidate = working[i];
            if (!pivotCandidate.concluded) {
                pivotCandidate.concluded = true;
                if (pivotCandidate.step.type == StepTypeEnum.Intervention) {
                    free++;
                }
                const result = await this.addNexts(nexts, sleepers, pivotCandidate.children);

                if (result.remaining == 0) {
                    working.splice(i, 1); //Remove node because it doesn't need to be revisited
                    i--;
                }
                if (result.hasAdded) {
                    node = pivotCandidate; //Returns node which reproduced new nexts ocurrences
                    break;
                }
            }
            i--;
        } while (i >= 0 && free < max);

        if (node) {
            if (node.step.type == StepTypeEnum.Waiting) { //Check if there is an intervention node in execution
                const result = await this.choosePivot(working, nexts, sleepers, max - free, i);
                if (result.node) {
                    node = result.node;
                }
                free += result.free;
            } else if (free < max) {
                i--;
                while (i >= 0 && working[i].endTime == node!.endTime) {
                    const chain = working[i];
                    if (!chain.concluded) {
                        chain.concluded = true;
                        //For each step the will end simultaneously with the pivot step, one worker more will be available
                        if (chain.step.type == StepTypeEnum.Intervention) {
                            free++;
                        }
                    }
                    // Determining the nexts steps from this point
                    if ((await this.addNexts(nexts, sleepers, chain.children)).remaining == 0) {
                        working.slice(i, 1);
                        i--;
                    }
                    i--;
                }
            }
        }

        return { node, free };
    }

    async addNexts(nexts: LinkedList, sleepers: LinkedList, children: IStepChain[]) {
        let hasAdded = false;
        let remaining = children.length;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child.parents || child.parents.every(x => x.concluded as boolean)) {
                remaining--;
                const target = child.step.type === StepTypeEnum.Waiting ? sleepers : nexts;
                if (!target.get(child.step.id)) {
                    target.push(child);
                    hasAdded = true;
                }
            }
        }
        return { hasAdded, remaining };
    }
    
    getJoi() {
    }
}

/// O(log(n))
async function locationOf(element: IStepChain, array: IStepChain[]) {
    let start = 0;
    let end = array.length;

    do {
        var pivot = ~~(start + (end - start) / 2);

        if (end-start == 1) {
            if (array[pivot].endTime > element.endTime)
                pivot++;
                break;
        } else if (end-start < 1 || array[pivot].endTime === element.endTime) {
                pivot++;
            break;
        }

        if (array[pivot].endTime >= element.endTime) {
            start = pivot;
        } else {
            end = pivot;
        }
    } while (true);

    return pivot;
}

/// O(n) + O(log(n))
export async function insert(element: IStepChain, array: IStepChain[]) {
    array.splice((await locationOf(element, array)), 0, element);
    return array;
}