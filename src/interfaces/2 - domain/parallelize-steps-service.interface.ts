import { IBaseService } from "base-ddd";
import { IPlan } from "./models/plan.interface";
import { IRecipe } from "./models/recipe.interface";

export interface IParallelizeStepsService extends IBaseService<IRecipe, IPlan> {
    proceed(recipe: IRecipe): PromiseLike<IPlan>;
}