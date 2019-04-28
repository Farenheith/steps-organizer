"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPES = {
    applications: {
        IStepPlannerApplication: Symbol.for("IStepPlannerApplication")
    },
    domainServices: {
        IOrganizeStepsService: Symbol.for("IOrganizeStepsService"),
        IParallelizeStepsService: Symbol.for("IParallelizeStepsService"),
        IPlanStepsService: Symbol.for("IPlanStepsService")
    }
};
