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
        const result:IPlan = {
            results: data.results,
            stages: await this.getStages(data)
        };

        return result;
    }

    async getStages(data: IStepZero): Promise<IStage[]> {
        const stages:IStage[] = [];
        let stageNumber = -1;
        let startTime = 0;
        let count = 0;
        let working:IStepChain[] = [];
        const nexts = new LinkedList();
        const sleepers = new LinkedList();

        this.addNexts(nexts, sleepers, data.children);
        do {
            stageNumber++;
            const stage:IStage = {
                stageNumber,
                startTime,
                steps: []
            };
            stages.push(stage);

            // Distributing workers, limiting by maxParallelization and available nexts steps
            while (count < data.maxParallelization && nexts.length > 0) {
                const chain = nexts.shift()!;
                stage.steps.push(chain.step);
                //Adding in the working array maitaining the sorting (by StartTimne, desc)
                await insert(chain, working);
                count++;
            }

            // Executing sleepers, who doesn't need a worker to advance
            while (sleepers.length > 0) {
                const chain = sleepers.shift()!;
                stage.steps.push(chain.step);
                //Adding in the working array maitaining the sorting (by StartTimne, desc)
                await insert(chain, working);
            }

            // Checking which step will end sooner, so the startTime of the next stage can be determined
            const pivot = await this.choosePivot(working, nexts, sleepers);
            // For the next step, at least one worker will be available
            count--;
            startTime = pivot.endTime;
            while (working.length > 0 && working[0].endTime == pivot.endTime) {
                const chain = working.shift()!;
                chain.concluded = true;
                // Determining the nexts steps from this point
                this.addNexts(nexts, sleepers, chain.children);
                //For each step the will end simultaneously with the pivot step, one worker more will be available
                if (chain.step.type == StepTypeEnum.Intervention) {
                    count--;
                }
            }
        } while (nexts.length > 0 || working.length > 0 || sleepers.length > 0);

        return stages;
    }

    async choosePivot(working: IStepChain[], nexts: LinkedList, sleepers: LinkedList) {
        let pivotCandidate = working.shift()!
        pivotCandidate.concluded = true;

        while (!await this.addNexts(nexts, sleepers, pivotCandidate.children) && working.length > 0) {
            pivotCandidate = working.shift()!
            pivotCandidate.concluded = true;
        }

        return pivotCandidate;
    }

    async addNexts(nexts: LinkedList, sleepers: LinkedList, children: IStepChain[]) {
        let result = false;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child.parents || child.parents.every(x => x.concluded as boolean)) {
                const target = child.step.type === StepTypeEnum.Waiting ? sleepers : nexts;
                if (!target.get(child.step.id)) {
                    target.push(child);
                    result = true;
                }    
            }
        }
        return result;
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
            if (array[pivot].endTime <= element.endTime)
                pivot++;
                break;
        } else if (end-start < 1 || array[pivot].endTime === element.endTime) {
                pivot++;
            break;
        }

        if (array[pivot].endTime < element.endTime) {
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