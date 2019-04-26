import { IStep } from "./step.interface";
import { IMaterial } from "./material.interface";

export interface IWorkflow {
    readonly name: string;
    readonly description: string;
    readonly steps: IStep[];
    readonly results: IMaterial[];
}