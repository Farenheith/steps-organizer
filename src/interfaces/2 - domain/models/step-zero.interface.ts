import { IStepChain } from "./step-chain.interface";

export interface IStepZero {
    maxParallelization: number;
    children: IStepChain[];
}