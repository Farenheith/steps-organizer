"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_ddd_1 = require("base-ddd");
const types_1 = require("./types");
const organize_steps_service_1 = require("./implementation/2 - domain/organize-steps.service");
const parallelize_steps_service_1 = require("./implementation/2 - domain/parallelize-steps.service");
const plan_steps_service_1 = require("./implementation/2 - domain/plan-steps.service");
const step_planner_application_1 = require("./implementation/1 - application/step-planner.application");
require("reflect-metadata");
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
    registerApplications() {
        this.bind(types_1.TYPES.applications.IStepPlannerApplication).to(step_planner_application_1.StepPlannerApplication);
    }
}
exports.AppContainer = AppContainer;
