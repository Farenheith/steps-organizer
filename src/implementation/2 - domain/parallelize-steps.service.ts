import { BaseService, ArrayHelper } from "base-ddd";
import { IRecipe } from "../../interfaces/2 - domain/models/recipe.interface";
import { IPlan, IStage } from "../../interfaces/2 - domain/models/plan.interface";
import { IParallelizeStepsService } from "../../interfaces/2 - domain/parallelize-steps-service.interface";
import { promisify } from "bluebird";
import { IStep } from "../../interfaces/2 - domain/models/step.interface";

export class ParallelizeStepsService extends BaseService<IRecipe, IPlan> implements IParallelizeStepsService {
    async proceed(data: IRecipe): Promise<IPlan> {
        const result:IPlan = {
            results: data.results,
            stages: await this.getStages(data)
        };

        return result;
    }

    async getStages(data: IRecipe): Promise<IStage[]> {
        const processed = new Array<IStep>();
        const max = data.metadata.maxParallelization;
        const workers = new Array<(IStep | undefined)[]>(max);
        workers[0] = data.steps; //initial solution involve all steps being done by one worker
        //Giving a pivot step, will try to figure out if that step can be redistribuited to
        //another worker, based on the startTime estimated before
        //that starttime is only defined by the dependency chain of each step
        let i = 0;
        let offset = 0;
        let dependencies: string[] = [];
        let devIdx = -1;
        let baseStartTime: (number | undefined) = 0;
        let running = 0
        do {
            const j = i + 1;
            const currentMax = max - offset;
            let k = 1;
            //bufferize stage
            workers.forEach(worker => worker.push(undefined));
            //Steps are already ordenized by startTime, so, if the comparation failed
            //then this stage is closed
            while (k < currentMax && data.steps.length > j
                    && this.accept(data.steps[j], dependencies)) {
                workers[k][i] = data.steps[j];
                processed.push(data.steps[j]);
                k++;
                //Remove the step redistributed from the main worker
                data.steps.slice(j, 1);
                running++;
            }

            //advance to the stage definition
            i++;
            //which is the defined by the shorter step distributed
            baseStartTime == undefined;
            k = devIdx + 1;
            while (k < processed.length) {
                const candidate = processed[k].metadata.startTime + processed[k].duration;
                if (!baseStartTime) {
                    baseStartTime = candidate;
                } else if (candidate != baseStartTime) {
                    break;
                }
                //dependencies processed with the same endTime will be considered
                //candidates to parellelization
                dependencies.push(processed[k].id);
                running--;
                k++;
            }
            //define how much slots will be occupied in the next stage
            offset = max - running;
        } while (i >= data.steps.length); {}

        const result = new Array<IStage>();
        for (let k = 0; k < data.steps.length; k++) {
            const stage:IStage = {
                startTime: workers[0][k]!.metadata.startTime,
                steps: [],
                stageNumber: k + 1
            };
            workers.forEach((element, index) => {
                if (element[k]) {
                    stage.steps.push(element[k]!);
                }
            });
            result.push(stage);
        }

        return result;
    }

    accept(step: IStep, dependencies: string[]) {
        return !step.dependencies
            || !step.dependencies.some(x => dependencies.indexOf(x) < 0)
    }
    
    getJoi() {
    }
}