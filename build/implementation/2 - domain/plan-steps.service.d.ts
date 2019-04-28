import { BaseService, INotificationService, IRequestInfo } from "base-ddd";
import { IWorkResume } from "../../interfaces/2 - domain/models/work-resume.interface";
import { IPlan } from "../../interfaces/2 - domain/models/plan.interface";
import { IPlanStepsService } from "../../interfaces/2 - domain/plan-steps-service.interface";
import { IOrganizeStepsService } from "../../interfaces/2 - domain/organize-steps-service.interface";
import { IParallelizeStepsService } from "../../interfaces/2 - domain/parallelize-steps-service.interface";
export declare class PlanStepsService extends BaseService<IWorkResume, IPlan> implements IPlanStepsService {
    readonly organize: IOrganizeStepsService;
    readonly parallelize: IParallelizeStepsService;
    constructor(notifications: INotificationService, requestInfo: IRequestInfo, organize: IOrganizeStepsService, parallelize: IParallelizeStepsService);
    proceed(data: IWorkResume): Promise<IPlan | null>;
    getJoi(): void;
}
