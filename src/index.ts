import { AppContainer } from "./app-container";
import { TYPES } from "./types";

const container = new AppContainer();

export function organizeSteps(req, res) {
    return container.adapter(TYPES.applications.IStepPlannerApplication, req, res);
}