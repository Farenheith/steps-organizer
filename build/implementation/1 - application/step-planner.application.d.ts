import { IStepPlannerApplication } from "../../interfaces/1 - application/step-planner-application.interface";
import { BaseCommandApplication, INotificationService, IRequestInfo } from "base-ddd";
import { IWorkResume } from "../../interfaces/2 - domain/models/work-resume.interface";
import { IPlan } from "../../interfaces/2 - domain/models/plan.interface";
import { IPlanStepsService } from "../../interfaces/2 - domain/plan-steps-service.interface";
export declare class StepPlannerApplication extends BaseCommandApplication<IWorkResume, IPlan> implements IStepPlannerApplication {
    constructor(notifications: INotificationService, requestInfo: IRequestInfo, service: IPlanStepsService);
}
