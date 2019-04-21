import { BaseService, ArrayHelper, INotificationService, IRequestInfo, BASE_TYPES } from "base-ddd";
import { IRecipe } from "../../interfaces/2 - domain/models/recipe.interface";
import { IWorkResume } from "../../interfaces/2 - domain/models/work-resume.interface";
import { IStep } from "../../interfaces/2 - domain/models/step.interface";
import { promisify } from "bluebird";
import { IMaterial } from "../../interfaces/2 - domain/models/material.interface";
import { IPlan } from "../../interfaces/2 - domain/models/plan.interface";
import { IOrganizeStepsService } from "../../interfaces/2 - domain/organize-steps-service.interface";
import { injectable, inject } from "inversify";
import { TYPES } from "../../types";
import { IParallelizeStepsService } from "../../interfaces/2 - domain/parallelize-steps-service.interface";

@injectable()
export class OrganizeStepsService extends BaseService<IWorkResume, IPlan>
        implements IOrganizeStepsService {

    constructor(
        @inject(BASE_TYPES.domainServices.INotificationService) notifications: INotificationService,
        @inject(BASE_TYPES.domainModels.IRequestInfo) settings: IRequestInfo,
        @inject(TYPES.domainServices.IParallelizeStepsService) private readonly parallelize: IParallelizeStepsService) {
        super("OrganizeSteps", notifications, settings);
    }

    async proceed(data: IWorkResume): Promise<IPlan> {
        const description = "Receita resultante";
        const results = new Array<IMaterial>();
        const recipeCount = data.recipes.length;
        const iterators = new Array<IterableIterator<[ Number, IStep]>>();

        const name = await this.setup(data, results, iterators);
        await this.setStartTimes(recipeCount, iterators, data.recipes);
        const steps = await this.joinAndSort(data);

        return this.parallelize.proceed({ name, description, results, steps });
    }

    setup(data: IWorkResume, result: IMaterial[], iterators: IterableIterator<[Number, IStep]>[]
            ) {
        return promisify<string>(() => {
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
                Object.assign(result, x.results);
                iterators.push(x.steps.entries());
            });
            return name;
        })();
    }

    joinAndSort(data: IWorkResume): PromiseLike<IStep[]> {
        return promisify(() => {
            const result = new Array<IStep>();
            data.recipes.forEach(x => Object.assign(result, x.steps));
            return result.sort((a, b) => b.startTime! < a.startTime! ? 1  : 0);
        })();
    }

    async setStartTime(currentStep: IStep, recipe: IRecipe, dependencies: string[]) {
        if (!dependencies || dependencies.length == 0) {
            return 0;
        }

        if (currentStep.startTime) {
            this.message(`passo ${currentStep.id} processado duas vezes! Verifique a cadeia de dependências`,
                        'invalidDependencies');
            return;
        }

        currentStep.startTime = 0;

        await ArrayHelper.forEachAsync(dependencies, async (x) => {
            const index = await recipe.steps.findIndex(s => s.id === x);
            if (index < 0) {
                this.message(`passo ${x} não encontrado!`, 'registerNotFound');
                return true;
            }
            const step = recipe.steps[index];
            if (!step.startTime) {
                this.message(`Passo ${currentStep.id} está sendo processado antes de sua dependência ${x}`,
                        'invalidOrder', `steps[${index}].dependencies`);
                return true;
            }
            const resultCandidate = step.duration + step.startTime;
            if (currentStep.startTime! < resultCandidate) {
                currentStep.startTime = resultCandidate;
            }
        });
    }
    
    async setStartTimes(recipeCount: number, iterators: IterableIterator<[Number, IStep]>[],
            recipes: IRecipe[]): Promise<void> {
        do {
            const lastValues = new Array<IteratorResult<[Number, IStep]>>(recipeCount);
            await ArrayHelper.forEachAsync(iterators, async (x, i) => {
                lastValues[i] = x.next();
                await this.setStartTime(lastValues[i].value[1], recipes[i], lastValues[i].value[1].dependencies);
                return this.hasNotification();
            });
            if (this.hasNotification()) {
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
            name: this.joi().string().min(3),
            descriptiosn: this.joi().string(),
        }
    }
}