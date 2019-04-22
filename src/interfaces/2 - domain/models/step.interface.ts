import { IMaterial } from "./material.interface";
import { StepTypeEnum } from "./enums/step-type.enum";

export interface IStep {
    readonly id: string;
    readonly description: string;
    readonly dependencies: string[];
    readonly materials: IMaterial[];
    readonly type: StepTypeEnum;
    readonly duration: number;
    metadata: IMetadata;
}

interface IMetadata {
    greaterEndTime?: number;
    greaterDependencyId?: string;
    result?: IMaterial;
    startTime: number;
}