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
const types_1 = require("../../types");
let StepPlannerApplication = class StepPlannerApplication extends base_ddd_1.BaseCommandApplication {
    constructor(notifications, requestInfo, service) {
        super(notifications, requestInfo, service);
    }
};
StepPlannerApplication = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(base_ddd_1.BASE_TYPES.domainServices.INotificationService)),
    __param(1, inversify_1.inject(base_ddd_1.BASE_TYPES.domainModels.IRequestInfo)),
    __param(2, inversify_1.inject(types_1.TYPES.domainServices.IPlanStepsService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], StepPlannerApplication);
exports.StepPlannerApplication = StepPlannerApplication;
