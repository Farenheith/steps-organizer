"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_ddd_1 = require("base-ddd");
const bluebird_1 = require("bluebird");
const inversify_1 = require("inversify");
const types_1 = require("../../types");
let OrganizeStepsService = class OrganizeStepsService extends base_ddd_1.BaseService {
    constructor(notifications, settings, parallelize) {
        super("OrganizeSteps", notifications, settings);
        this.parallelize = parallelize;
    }
    async proceed(data) {
        const description = "Receita resultante";
        const results = new Array();
        const recipeCount = data.recipes.length;
        const iterators = new Array();
        const name = await this.setup(data, results, iterators);
        await this.setStartTimes(recipeCount, iterators, data.recipes);
        const steps = await this.joinAndSort(data);
        return this.parallelize.proceed({ name, description, results, steps });
    }
    setup(data, result, iterators) {
        return bluebird_1.promisify(() => {
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
    joinAndSort(data) {
        return bluebird_1.promisify(() => {
            const result = new Array();
            data.recipes.forEach(x => Object.assign(result, x.steps));
            return result.sort((a, b) => b.startTime < a.startTime ? 1 : 0);
        })();
    }
    async setStartTime(currentStep, recipe, dependencies) {
        if (!dependencies || dependencies.length == 0) {
            return 0;
        }
        if (currentStep.startTime) {
            this.message(`passo ${currentStep.id} processado duas vezes! Verifique a cadeia de dependências`, 'invalidDependencies');
            return;
        }
        currentStep.startTime = 0;
        await base_ddd_1.ArrayHelper.forEachAsync(dependencies, async (x) => {
            const index = await recipe.steps.findIndex(s => s.id === x);
            if (index < 0) {
                this.message(`passo ${x} não encontrado!`, 'registerNotFound');
                return true;
            }
            const step = recipe.steps[index];
            if (!step.startTime) {
                this.message(`Passo ${currentStep.id} está sendo processado antes de sua dependência ${x}`, 'invalidOrder', `steps[${index}].dependencies`);
                return true;
            }
            const resultCandidate = step.duration + step.startTime;
            if (currentStep.startTime < resultCandidate) {
                currentStep.startTime = resultCandidate;
            }
        });
    }
    async setStartTimes(recipeCount, iterators, recipes) {
        do {
            const lastValues = new Array(recipeCount);
            await base_ddd_1.ArrayHelper.forEachAsync(iterators, async (x, i) => {
                lastValues[i] = x.next();
                await this.setStartTime(lastValues[i].value[1], recipes[i], lastValues[i].value[1].dependencies);
                return this.hasNotification();
            });
            if (this.hasNotification()) {
                break;
            }
            const newIterators = new Array();
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
        };
    }
};
OrganizeStepsService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(base_ddd_1.BASE_TYPES.domainServices.INotificationService)),
    __param(1, inversify_1.inject(base_ddd_1.BASE_TYPES.domainModels.IRequestInfo)),
    __param(2, inversify_1.inject(types_1.TYPES.domainServices.IParallelizeStepsService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], OrganizeStepsService);
exports.OrganizeStepsService = OrganizeStepsService;
