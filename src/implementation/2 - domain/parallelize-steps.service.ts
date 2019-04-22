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
        });
        return result;
    }
    
    getJoi() {
    }
}