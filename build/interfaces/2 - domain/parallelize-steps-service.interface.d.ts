import { IBaseService } from "base-ddd";
import { IPlan } from "./models/plan.interface";
import { IStepZero } from "./models/step-zero.interface";
export interface IParallelizeStepsService extends IBaseService<IStepZero, IPlan> {
}
