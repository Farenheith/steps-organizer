export const TYPES = {
    applications: {
        IStepPlannerApplication: Symbol.for("IStepPlannerApplication")
    },
    domainServices: {
        IOrganizeStepsService: Symbol.for("IOrganizeStepsService"),
        IParallelizeStepsService: Symbol.for("IParallelizeStepsService"),
        IPlanStepsService: Symbol.for("IPlanStepsService")
    }
}