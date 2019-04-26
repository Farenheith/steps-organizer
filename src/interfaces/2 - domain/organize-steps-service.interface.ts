import { IBaseService } from "base-ddd";
import { IWorkResume } from "./models/work-resume.interface";
import { IStepsInteractor } from "./models/step-interactor.interface";

export interface IOrganizeStepsService extends IBaseService<IWorkResume, IStepsInteractor> {
}