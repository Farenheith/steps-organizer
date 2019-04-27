import { BaseService, BASE_TYPES, INotificationService, IRequestInfo } from "base-ddd";
import { IWorkResume } from "../../interfaces/2 - domain/models/work-resume.interface";
import { IPlan } from "../../interfaces/2 - domain/models/plan.interface";
import { IPlanStepsService } from "../../interfaces/2 - domain/plan-steps-service.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { IOrganizeStepsService } from "../../interfaces/2 - domain/organize-steps-service.interface";
import { IParallelizeStepsService } from "../../interfaces/2 - domain/parallelize-steps-service.interface";

@injectable()
export class PlanStepsService extends BaseService<IWorkResume, IPlan> implements IPlanStepsService {
    constructor(
            @inject(BASE_TYPES.domainServices.INotificationService) notifications: INotificationService,
            @inject(BASE_TYPES.domainModels.IRequestInfo) requestInfo: IRequestInfo,
            @inject(TYPES.domainServices.IOrganizeStepsService) readonly organize: IOrganizeStepsService,
            @inject(TYPES.domainServices.IParallelizeStepsService) readonly parallelize: IParallelizeStepsService) {
        super("PlanStepsService", notifications, requestInfo);
    }

    async proceed(data: IWorkResume): Promise<IPlan | null> {
        const organized = await this.organize.do(data);
        if (!organized) {
            return null;
        }

        return await this.parallelize.do(organized);
    }
    
    getJoi() { }

    
}