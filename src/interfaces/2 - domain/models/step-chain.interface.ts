import { IStep } from "./step.interface";

export interface IStepChain {
    readonly step: IStep;
    startTime: number;
    endTime: number;
    parents: IStepChain[];
    children: IStepChain[];
}