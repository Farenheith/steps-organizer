import { IStep } from "./step.interface";
import { IMaterial } from "./material.interface";

export interface IRecipe {
    readonly name: string;
    readonly description: string;
    readonly steps: IStep[];
    readonly result: IMaterial[];
}