import { IBaseService } from "base-ddd";
import { IWorkResume } from "./models/work-resume.interface";
import { IStepZero } from "./models/step-zero.interface";
export interface IOrganizeStepsService extends IBaseService<IWorkResume, IStepZero> {
}
