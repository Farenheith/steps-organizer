import { IRecipe } from "./recipe.interface";

export interface IWorkResume {
    maxParallelization: number;
    recipes: IRecipe[];
}