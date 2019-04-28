import { ICommand } from "base-ddd";
import { IWorkResume } from "../2 - domain/models/work-resume.interface";
import { IPlan } from "../2 - domain/models/plan.interface";

export interface IStepPlannerApplication extends ICommand<IWorkResume, IPlan> { }