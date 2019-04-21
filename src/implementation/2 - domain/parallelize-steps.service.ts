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
        let stageNumber = 1
        await ArrayHelper.forEachAsync(data.steps, async (x: IStep) => {
            const idx = await result.findIndex(s => s.startTime == x.startTime!);
            if (idx < 0) {
                result.push({ stageNumber, startTime: x.startTime!, steps: [ x ] });
                stageNumber++;
            } else {
                result[idx].steps.push(x);
            }
        });
        return result;
    }
    
    getJoi() {
    }
}