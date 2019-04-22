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
        const result = new Array<IStage>();
        let stageNumber = 0;
        let canSum = true;
        let lastStage:IStage;
        let minEndTime:number;
        await ArrayHelper.forEachAsync(data.steps, async (x: IStep) => {
            const idx = await result.findIndex(s => s.startTime == x.metadata.startTime
                                    && s.stageNumber == stageNumber);
            let stage:IStage;
            if (idx < 0) {
                if (canSum) {
                    stageNumber++;
                } else {
                    canSum = true;
                }
                result.push(stage = { stageNumber, startTime: x.metadata.startTime, steps: [ x ] });
            } else {
                (stage = result[idx]).steps.push(x);
            }
            if (stage.steps.length >= data.metadata.maxParallelization) {
                stageNumber++;
                canSum = false;
                lastStage = stage;
                minEndTime = this.getMinEndTime(stage);
            }
        });
        return result;
    }

    getMinEndTime(stage: IStage) {
        let result = stage.steps[0].metadata.startTime + stage.steps[0].duration;
        for (let i = 1; i < stage.steps.length; i++) {
            const minCandidate = stage.steps[i].metadata.startTime + stage.steps[i].duration;
            if (result > minCandidate) {
                result = minCandidate;
            }
        }

        return result;
    }
    
    getJoi() {
    }
}