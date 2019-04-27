import { BaseService, INotificationService, IRequestInfo, BASE_TYPES } from "base-ddd";
import { IWorkResume } from "../../interfaces/2 - domain/models/work-resume.interface";
import { IStep } from "../../interfaces/2 - domain/models/step.interface";
import { IOrganizeStepsService } from "../../interfaces/2 - domain/organize-steps-service.interface";
import { injectable, inject } from "inversify";
import * as joi from "joi";
import { IStepChain } from "../../interfaces/2 - domain/models/step-chain.interface";
import { IStepZero } from "../../interfaces/2 - domain/models/step-zero.interface";
import { IMaterial } from "../../interfaces/2 - domain/models/material.interface";

@injectable()
export class OrganizeStepsService extends BaseService<IWorkResume, IStepZero>
        implements IOrganizeStepsService {

    constructor(
            @inject(BASE_TYPES.domainServices.INotificationService) notifications: INotificationService,
            @inject(BASE_TYPES.domainModels.IRequestInfo) settings: IRequestInfo) {
        super("OrganizeSteps", notifications, settings);
    }

    async proceed(data: IWorkResume): Promise<IStepZero | null> {
        const children:IStepChain[] = [];
        const stepChains: { [x: string]: IStepChain } = {};
        const results: IMaterial[] = [];
        for (let index = 0; index < data.workflows.length; index++) {
            const workflow = data.workflows[index];
            workflow.results.forEach(x => results.push(x));

            for (let i = 0; i < workflow.steps.length; i++) {
                const step = workflow.steps[i];
                const stepChain = this.getStepChain(step, stepChains);
                //define dependencies
                if (step.dependencies && step.dependencies.length > 0) {
                    for (let d = 0; d < step.dependencies.length; d++) {
                        const parent = stepChains[step.dependencies[d]];
                        if (!parent) {
                            this.message(`Cadeia de passos mal definida! Verifique a receita ${index + 1} (pai: ${step.dependencies[d]} de ${step.id})`, `invalidOrder`);
                            return null;
                        }
                        parent.children.push(stepChain);
                        stepChain.parents.push(parent);
                        if (stepChain.startTime < parent.endTime) {
                            stepChain.startTime = parent.endTime;
                            stepChain.endTime = stepChain.startTime + stepChain.step.duration;
                        }
                    }
                } else {
                    stepChain.endTime = stepChain.startTime + stepChain.step.duration;
                    children.push(stepChain);
                }
            }
        }

        return { children, maxParallelization: data.maxParallelization, results };
    }

    getStepChain(step: IStep, stepChains: { [x: string]: IStepChain }) {
        let result = stepChains[step.id];
        if (!result) {
            stepChains[step.id] = result = {
                step,
                children: [],
                parents: [],
                endTime: 0,
                startTime: 0
            };
        }

        return result;
    }

    getJoi() {
        return {
            name: joi.string().min(3),
            descriptiosn: joi.string(),
            workflows: joi.array(),
            maxParallelization: joi.number().positive().integer()
        }
    }
}