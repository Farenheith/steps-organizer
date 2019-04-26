import { IStepChain } from "./step-chain.interface";
import { IMaterial } from "./material.interface";

export interface IStepZero {
    maxParallelization: number;
    children: IStepChain[];
    results: IMaterial[];
}