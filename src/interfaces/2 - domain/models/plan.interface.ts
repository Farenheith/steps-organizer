import { IMaterial } from "./material.interface";
import { IStep } from "./step.interface";

export interface IPlan {
    stages: IStage[];
    results: IMaterial[];
}

export interface IStage {
    stageNumber: number;
    startTime: number;
    steps: IStep[];
}