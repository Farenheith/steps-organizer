import { BaseService, INotificationService, IRequestInfo } from "base-ddd";
import { IPlan, IStage } from "../../interfaces/2 - domain/models/plan.interface";
import { IParallelizeStepsService } from "../../interfaces/2 - domain/parallelize-steps-service.interface";
import { IStepZero } from "../../interfaces/2 - domain/models/step-zero.interface";
import { IStepChain } from "../../interfaces/2 - domain/models/step-chain.interface";
import { LinkedList } from "./helpers/linked-list";
export declare class ParallelizeStepsService extends BaseService<IStepZero, IPlan> implements IParallelizeStepsService {
    constructor(notifications: INotificationService, requestInfo: IRequestInfo);
    proceed(data: IStepZero): Promise<IPlan>;
    getStages(data: IStepZero): Promise<{
        stages: IStage[];
        endTime: number;
    }>;
    choosePivot(working: IStepChain[], nexts: LinkedList, sleepers: LinkedList, occupied: number): any;
    addNexts(nexts: LinkedList, sleepers: LinkedList, children: IStepChain[]): Promise<{
        hasAdded: boolean;
        remaining: number;
    }>;
    getJoi(): void;
}
export declare function insert(element: IStepChain, array: IStepChain[]): Promise<IStepChain[]>;
