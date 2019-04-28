"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_container_1 = require("./app-container");
const types_1 = require("./types");
const container = new app_container_1.AppContainer();
function organizeSteps(req, res) {
    return container.adapter(types_1.TYPES.applications.IStepPlannerApplication, req, res);
}
exports.organizeSteps = organizeSteps;
