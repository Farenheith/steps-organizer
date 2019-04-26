import { BaseService } from "base-ddd";
import { IPlan, IStage } from "../../interfaces/2 - domain/models/plan.interface";
import { IParallelizeStepsService } from "../../interfaces/2 - domain/parallelize-steps-service.interface";
import { IStep } from "../../interfaces/2 - domain/models/step.interface";
import { IStepZero } from "../../interfaces/2 - domain/models/step-zero.interface";
import { IStepChain } from "../../interfaces/2 - domain/models/step-chain.interface";

export class ParallelizeStepsService extends BaseService<IStepZero, IPlan> implements IParallelizeStepsService {
    async proceed(data: IStepZero): Promise<IPlan> {
        const result:IPlan = {
            results: [],
            stages: await this.getStages(data)
        };

        return result;
    }

    async getStages(data: IStepZero): Promise<IStage[]> {
        const stages:IStage[] = [];
        let stageNumber = -1;
        let startTime = 0;
        let count = 0;
        let reference: { [x: string]: IStepChain} = {};
        let working:IStepChain[] = [];
        const nexts:IStepChain[] = [];

        this.addNexts(nexts, data.children);
        while (nexts.length > 0) {
            stageNumber++;
            const stage:IStage = {
                stageNumber,
                startTime,
                steps: []
            };
            stages.push(stage);

            // Distributing workers, limiing by maxParallelization and available nexts steps
            while (count < data.maxParallelization && count < nexts.length) {
                const chain = nexts.pop()!;
                stage.steps.push(chain.step);
                reference[chain.step.id] = chain;
                //Adding in the working array maitaining the sorting (by StartTimne, desc)
                await insert(chain, working);
                count++;
            }

            // Determining the nexts steps from this point
            stage.steps.forEach(step => {
                const current = reference[step.id];
                this.addNexts(nexts, current.children);
            });

            // Checking which step will end sooner, so the startTime of the next stage can be determined 
            const pivot = working.pop()!;
            // For the next step, at least one worker will be available
            count--;
            startTime = pivot.endTime;
            while (working.length > 0 && working[working.length - 1].endTime == pivot.endTime) {
                working.pop();
                //For each step the will end simultaneously with the pivot step, one worker more will be available
                count--;
            }
        }

        return stages;
    }

    async addNexts(nexts: IStepChain[], children: IStepChain[]) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (nexts.length == 0) {
                nexts.push(child);
            } else if (nexts.findIndex(x => x.step.id === child.step.id) < 0) {
                await insert(child, nexts);
            }
        }
    }

    accept(step: IStep, concludedDependencies: string[]) {
        // The step is only acceptable if it doesn't have any dependency
        // or all dependencies are concluded;
        return !step.dependencies
            || !step.dependencies.some(x => concludedDependencies.indexOf(x) < 0)
    }
    
    getJoi() {
    }
}

async function locationOf(element: IStepChain, array: IStepChain[]) {
    let start = 0;
    let end = array.length;

    do {
        var pivot = ~~(start + (end - start) / 2);

        if (end-start <= 1 || array[pivot].endTime === element.endTime) {
            break;
        }

        if (array[pivot].endTime > element.endTime) {
            start = pivot;
        } else {
            end = pivot;
        }
    } while (true);

    return pivot;
}

async function insert(element: IStepChain, array: IStepChain[]) {
    array.splice((await locationOf(element, array)) + 1, 0, element);
    return array;
}
  

