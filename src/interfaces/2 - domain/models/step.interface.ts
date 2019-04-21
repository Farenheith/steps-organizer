import { IMaterial } from "./material.interface";

export interface IStep {
    readonly name: string;
    readonly order: number;
    readonly description: string;
    readonly dependencies: number[];
    readonly materials: IMaterial[];
    readonly waitingTime: number;
    readonly result?: IMaterial;
    readonly stimatedTime: number;
}