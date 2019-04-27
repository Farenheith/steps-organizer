"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_ddd_1 = require("base-ddd");
const types_1 = require("./types");
const organize_steps_service_1 = require("./implementation/2 - domain/organize-steps.service");
const parallelize_steps_service_1 = require("./implementation/2 - domain/parallelize-steps.service");
const plan_steps_service_1 = require("./implementation/2 - domain/plan-steps.service");
class AppContainer extends base_ddd_1.BaseAppContainer {
    constructor() {
        super(base_ddd_1.RequestInfoService, {
            language: "pt-Br"
        });
    }
    registerDomainServices() {
        this.bind(types_1.TYPES.domainServices.IOrganizeStepsService)
            .to(organize_steps_service_1.OrganizeStepsService);
        this.bind(types_1.TYPES.domainServices.IParallelizeStepsService)
            .to(parallelize_steps_service_1.ParallelizeStepsService);
        this.bind(types_1.TYPES.domainServices.IPlanStepsService)
            .to(plan_steps_service_1.PlanStepsService);
    }
    registerApplications() { }
}
exports.AppContainer = AppContainer;
