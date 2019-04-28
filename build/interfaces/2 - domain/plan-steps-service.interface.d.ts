import { IBaseService } from "base-ddd";
import { IWorkResume } from "./models/work-resume.interface";
import { IPlan } from "./models/plan.interface";
export interface IPlanStepsService extends IBaseService<IWorkResume, IPlan> {
}
