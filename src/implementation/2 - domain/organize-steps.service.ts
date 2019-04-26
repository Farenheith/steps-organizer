import { BaseService, INotificationService, IRequestInfo, BASE_TYPES } from "base-ddd";
import { IWorkResume } from "../../interfaces/2 - domain/models/work-resume.interface";
import { IStep } from "../../interfaces/2 - domain/models/step.interface";
import { IOrganizeStepsService } from "../../interfaces/2 - domain/organize-steps-service.interface";
import { injectable, inject } from "inversify";
import * as joi from "joi";
import { IStepChain } from "../../interfaces/2 - domain/models/step-chain.interface";
import { IStepsInteractor as IStepZero } from "../../interfaces/2 - domain/models/step-interactor.interface";
import { ArrayHelper } from "base-ddd";

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
        await ArrayHelper.forEachAsync(data.recipes, async (recipe, index) => {
            for (let i = 0; i < recipe.steps.length; i++) {
                const step = recipe.steps[i];
                const stepChain = this.getStepChain(step, stepChains);
                //define dependencies
                if (step.dependencies && step.dependencies.length > 0) {
                    step.dependencies.forEach(id => {
                        const parent = stepChains[id];
                        if (!parent) {
                            this.message(`Cadeia de passos mal definida! Verifique a receita ${index + 1}`, `invalidOrder`);
                            return false;
                        }
                        parent.children.push(stepChain);
                        stepChain.parents.push(parent);
                    });
                } else {
                    children.push(stepChain);
                }
            }
        });

        return { children };
    }

    getStepChain(step: IStep, stepChains: { [x: string]: IStepChain }) {
        let result = stepChains[step.id];
        if (!result) {
            this.getStepChain[step.id] = result = {
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
        }
    }
}