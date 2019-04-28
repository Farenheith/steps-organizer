import { IStepPlannerApplication } from "../../interfaces/1 - application/step-planner-application.interface";
import { BaseCommandApplication, INotificationService, IRequestInfo, BASE_TYPES } from "base-ddd";
import { IWorkResume } from "../../interfaces/2 - domain/models/work-resume.interface";
import { IPlan } from "../../interfaces/2 - domain/models/plan.interface";
import { IPlanStepsService } from "../../interfaces/2 - domain/plan-steps-service.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";

@injectable()
export class StepPlannerApplication extends BaseCommandApplication<IWorkResume, IPlan>
        implements IStepPlannerApplication {

    constructor(
            @inject(BASE_TYPES.domainServices.INotificationService) notifications: INotificationService,
            @inject(BASE_TYPES.domainModels.IRequestInfo) requestInfo: IRequestInfo,
            @inject(TYPES.domainServices.IPlanStepsService) service: IPlanStepsService) {
        super(notifications, requestInfo, service);
    }
}