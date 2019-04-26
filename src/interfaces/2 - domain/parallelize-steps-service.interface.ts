import { IBaseService } from "base-ddd";
import { IPlan } from "./models/plan.interface";
import { IWorkflow } from "./models/workflow.interface";
import { IStepZero } from "./models/step-zero.interface";

export interface IParallelizeStepsService extends IBaseService<IStepZero, IPlan> {
    proceed(data: IStepZero): PromiseLike<IPlan>;
}