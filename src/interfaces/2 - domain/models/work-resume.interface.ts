import { IWorkflow } from "./workflow.interface";

export interface IWorkResume {
    maxParallelization: number;
    workflows: IWorkflow[];
}