import { BaseService } from "base-ddd";
import { IRecipe } from "../../interfaces/2 - domain/models/recipe.interface";

export class OrganizeStepsService extends BaseService<IRecipe[], IRecipe>  {
    proceed(data: IRecipe[]): PromiseLike<IRecipe> {
        const result = {
            name: "",
            description: "Receita resultante",
            result: [],
            steps: []
        };
        let first = true;
        let greater = 0;

        data.forEach(x => {
            if (first) {
                first = false;
            } else {
                result.name += " / ";
            }
            result.name += x.name;
            Object.assign(result.result, x.result);
            if (greater < result.steps.length) {
                greater = result.steps.length;
            }
        });

        for (let step = 0; step < greater; step++) {
            
        }
    }
    
    getJoi() {
        return {
            name: this.joi().string().min(3),
            description: this.joi().string(),
        }
    }
}