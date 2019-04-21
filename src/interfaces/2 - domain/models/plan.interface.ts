import { IMaterial } from "./material.interface";
import { IStep } from "./step.interface";

export interface IPlan {
    stages: IStage[];
    results: IMaterial[];
}

export interface IStage {
    startTime: number;
    steps: IStep[];
}