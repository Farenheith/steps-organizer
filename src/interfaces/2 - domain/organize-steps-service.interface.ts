import { IBaseService } from "base-ddd";
import { IWorkResume } from "./models/work-resume.interface";
import { IPlan } from "./models/plan.interface";

export interface IOrganizeStepsService extends IBaseService<IWorkResume, IPlan> {
}