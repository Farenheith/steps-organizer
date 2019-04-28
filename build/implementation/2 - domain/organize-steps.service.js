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
const inversify_1 = require("inversify");
const joi = require("joi");
let OrganizeStepsService = class OrganizeStepsService extends base_ddd_1.BaseService {
    constructor(notifications, settings) {
        super("OrganizeSteps", notifications, settings);
    }
    async proceed(data) {
        const children = [];
        const stepChains = {};
        const results = [];
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
                }
                else {
                    stepChain.endTime = stepChain.startTime + stepChain.step.duration;
                    children.push(stepChain);
                }
            }
        }
        return { children, maxParallelization: data.maxParallelization, results };
    }
    getStepChain(step, stepChains) {
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
        };
    }
};
OrganizeStepsService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(base_ddd_1.BASE_TYPES.domainServices.INotificationService)),
    __param(1, inversify_1.inject(base_ddd_1.BASE_TYPES.domainModels.IRequestInfo)),
    __metadata("design:paramtypes", [Object, Object])
], OrganizeStepsService);
exports.OrganizeStepsService = OrganizeStepsService;
