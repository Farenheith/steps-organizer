import { BaseService, INotificationService, IRequestInfo } from "base-ddd";
import { IWorkResume } from "../../interfaces/2 - domain/models/work-resume.interface";
import { IStep } from "../../interfaces/2 - domain/models/step.interface";
import { IOrganizeStepsService } from "../../interfaces/2 - domain/organize-steps-service.interface";
import * as joi from "joi";
import { IStepChain } from "../../interfaces/2 - domain/models/step-chain.interface";
import { IStepZero } from "../../interfaces/2 - domain/models/step-zero.interface";
export declare class OrganizeStepsService extends BaseService<IWorkResume, IStepZero> implements IOrganizeStepsService {
    constructor(notifications: INotificationService, settings: IRequestInfo);
    proceed(data: IWorkResume): Promise<IStepZero | null>;
    getStepChain(step: IStep, stepChains: {
        [x: string]: IStepChain;
    }): IStepChain;
    getJoi(): {
        name: joi.StringSchema;
        descriptiosn: joi.StringSchema;
        workflows: joi.ArraySchema;
        maxParallelization: joi.NumberSchema;
    };
}
