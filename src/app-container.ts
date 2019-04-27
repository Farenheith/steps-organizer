import { BaseAppContainer, ISettings, RequestInfoService } from "base-ddd";
import { IOrganizeStepsService } from "./interfaces/2 - domain/organize-steps-service.interface";
import { TYPES } from "./types";
import { OrganizeStepsService } from "./implementation/2 - domain/organize-steps.service";
import { IParallelizeStepsService } from "./interfaces/2 - domain/parallelize-steps-service.interface";
import { ParallelizeStepsService } from "./implementation/2 - domain/parallelize-steps.service";
import { IPlanStepsService } from "./interfaces/2 - domain/plan-steps-service.interface";
import { PlanStepsService } from "./implementation/2 - domain/plan-steps.service";

export class AppContainer extends BaseAppContainer<ISettings> {
    constructor() {
        super(RequestInfoService, {
            language: "pt-Br"
        } as any);
    }

    registerDomainServices(): void {
        this.bind<IOrganizeStepsService>(TYPES.domainServices.IOrganizeStepsService)
            .to(OrganizeStepsService);
        this.bind<IParallelizeStepsService>(TYPES.domainServices.IParallelizeStepsService)
            .to(ParallelizeStepsService);
        this.bind<IPlanStepsService>(TYPES.domainServices.IPlanStepsService)
            .to(PlanStepsService);
    }

    registerApplications(): void { }
}