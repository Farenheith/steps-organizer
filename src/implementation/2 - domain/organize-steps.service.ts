import { BaseService, ArrayHelper, INotificationService, IRequestInfo, BASE_TYPES } from "base-ddd";
import { IRecipe } from "../../interfaces/2 - domain/models/recipe.interface";
import { IWorkResume } from "../../interfaces/2 - domain/models/work-resume.interface";
import { IStep } from "../../interfaces/2 - domain/models/step.interface";
import { IMaterial } from "../../interfaces/2 - domain/models/material.interface";
import { IPlan } from "../../interfaces/2 - domain/models/plan.interface";
import { IOrganizeStepsService } from "../../interfaces/2 - domain/organize-steps-service.interface";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { IParallelizeStepsService } from "../../interfaces/2 - domain/parallelize-steps-service.interface";
import * as joi from "joi";

@injectable()
export class OrganizeStepsService extends BaseService<IWorkResume, IPlan>
        implements IOrganizeStepsService {

    constructor(
        @inject(BASE_TYPES.domainServices.INotificationService) notifications: INotificationService,
        @inject(BASE_TYPES.domainModels.IRequestInfo) settings: IRequestInfo,
        @inject(TYPES.domainServices.IParallelizeStepsService) private readonly parallelize: IParallelizeStepsService) {
        super("OrganizeSteps", notifications, settings);
    }

    async proceed(data: IWorkResume): Promise<IPlan | null> {
        const description = "Receita resultante";
        const results = new Array<IMaterial>();
        const recipeCount = data.recipes.length;
        const iterators = new Array<IterableIterator<[ Number, IStep]>>();

        const name = await this.setup(data, results, iterators);
        await this.setStartTimes(recipeCount, iterators, data.recipes);
        if (this.hasNotification()) {
            return null;
        }
        const steps = await this.joinAndSort(data);

        return this.parallelize.proceed({ name, description, results,
                    steps, metadata: {
                        maxParallelization: data.maxParallelization
                    } });
    }

    async setup(data: IWorkResume, results: IMaterial[], iterators: IterableIterator<[Number, IStep]>[]
            ) {
        let first = true;
        let name = "";
        data.recipes.forEach(x => {
            if (first) {
                first = false;
            }
            else {
                name += " / ";
            }
            name += x.name;
            x.results.forEach(x => results.push(x));
            iterators.push(x.steps.entries());
        });
        return name;
    }

    async joinAndSort(data: IWorkResume) {
        const result = new Array<IStep>();
        data.recipes.forEach(r =>
            r.steps.forEach(x => result.push(x)));
        return result.sort((a, b) => b.metadata.startTime < a.metadata.startTime ? 1  : 0);
    }

    async setStartTime(currentStep: IStep, recipe: IRecipe) {
        if (!currentStep.dependencies || currentStep.dependencies.length == 0) {
            currentStep.metadata = {
                startTime: 0
            };
            return;
        }

        if (currentStep.metadata) {
            this.message(`passo ${currentStep.id} processado duas vezes! Verifique a cadeia de dependências`,
                        'invalidDependencies');
            return;
        }

        currentStep.metadata = {
            startTime: 0
        };

        await ArrayHelper.forEachAsync(currentStep.dependencies, async (x) => {
            const index = await recipe.steps.findIndex(s => s.id === x);
            if (index < 0) {
                this.message(`passo ${x} não encontrado!`, 'registerNotFound');
                return true;
            }
            const step = recipe.steps[index];
            if (!step.metadata) {
                this.message(`Passo ${currentStep.id} está sendo processado antes de sua dependência ${x}`,
                        'invalidOrder', `steps[${index}].dependencies`);
                return true;
            }
            const resultCandidate = step.duration + step.metadata.startTime;
            if (currentStep.metadata.startTime! < resultCandidate) {
                currentStep.metadata.startTime = resultCandidate;
                currentStep.metadata.greaterEndTime = resultCandidate;
                currentStep.metadata.greaterDependencyId = step.id;
            }
        });
    }
    
    async setStartTimes(recipeCount: number, iterators: IterableIterator<[Number, IStep]>[],
            recipes: IRecipe[]): Promise<void> {
        do {
            const lastValues = new Array<IteratorResult<[Number, IStep]>>(recipeCount);
            let error = false;
            await ArrayHelper.forEachAsync(iterators, async (x, i) => {
                lastValues[i] = x.next();
                if (!lastValues[i].done) {
                    await this.setStartTime(lastValues[i].value[1], recipes[i]);
                    error = this.hasNotification()
                    return error;
                }
            });
            if (error) {
                break;
            }
            const newIterators = new Array<IterableIterator<[Number, IStep]>>();
            lastValues.forEach((x, i) => {
                if (!x.done) {
                    newIterators.push(iterators[i]);
                }
            });
            iterators = newIterators;
        } while (iterators.length > 0);
    }

    getJoi() {
        return {
            name: joi.string().min(3),
            descriptiosn: joi.string(),
        }
    }
}