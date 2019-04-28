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
const step_type_enum_1 = require("../../interfaces/2 - domain/models/enums/step-type.enum");
const linked_list_1 = require("./helpers/linked-list");
let ParallelizeStepsService = class ParallelizeStepsService extends base_ddd_1.BaseService {
    constructor(notifications, requestInfo) {
        super("ParallelizeStepsService", notifications, requestInfo);
    }
    async proceed(data) {
        const result = { ...await this.getStages(data),
            ...{
                results: data.results,
            } };
        return result;
    }
    async getStages(data) {
        const stages = [];
        let stageNumber = 0;
        let startTime = 0;
        let workerNro = 0;
        let working = [];
        const nexts = new linked_list_1.LinkedList();
        const sleepers = new linked_list_1.LinkedList();
        let stage = undefined;
        this.addNexts(nexts, sleepers, data.children);
        do {
            if (!stage || stage.startTime != startTime) {
                stageNumber++;
                stage = {
                    stageNumber,
                    startTime,
                    steps: []
                };
                stages.push(stage);
            }
            let minEndTime = 0;
            let minSleeperTime = 0;
            // Distributing workers, limiting by maxParallelization and available nexts steps
            while (workerNro < data.maxParallelization && nexts.length > 0) {
                const chain = nexts.pop();
                chain.startTime = startTime;
                chain.endTime = startTime + chain.step.duration;
                if (minEndTime == 0 || chain.endTime < minEndTime) {
                    minEndTime = chain.endTime;
                }
                stage.steps.push(chain.step);
                //Adding in the working array maitaining the sorting (by StartTimne, desc)
                await insert(chain, working);
                workerNro++;
            }
            // Executing sleepers, who doesn't need a worker to advance
            while (sleepers.length > 0) {
                const chain = sleepers.pop();
                chain.startTime = startTime;
                chain.endTime = startTime + chain.step.duration;
                if (minSleeperTime == 0 || chain.endTime < minSleeperTime) {
                    minSleeperTime = chain.endTime;
                }
                stage.steps.push(chain.step);
                //Adding in the working array maitaining the sorting (by StartTimne, desc)
                await insert(chain, working);
            }
            // Checking which step will end sooner, so the startTime of the next stage can be determined
            const pivot = await this.choosePivot(working, nexts, sleepers, workerNro);
            // For the next step, at least one worker will be available
            workerNro -= pivot.free;
            if (pivot.node && pivot.node.step.type == step_type_enum_1.StepTypeEnum.Intervention) {
                startTime = pivot.node.endTime;
            }
            else if (minEndTime > 0) {
                startTime = minEndTime;
            }
            else {
                startTime = minSleeperTime;
            }
        } while (nexts.length > 0 || sleepers.length > 0);
        const result = {
            stages,
            endTime: 0
        };
        const lastStage = result.stages[result.stages.length - 1];
        lastStage.steps.forEach(step => {
            const candidate = lastStage.startTime + step.duration;
            if (result.endTime < candidate) {
                result.endTime = candidate;
            }
        });
        return result;
    }
    async choosePivot(working, nexts, sleepers, occupied) {
        let i = working.length - 1;
        let free = 0;
        let node;
        do {
            let pivotCandidate = working[i];
            if (!pivotCandidate.concluded) {
                pivotCandidate.concluded = true;
                if (free < occupied && pivotCandidate.step.type == step_type_enum_1.StepTypeEnum.Intervention) {
                    free++;
                }
            }
            const result = await this.addNexts(nexts, sleepers, pivotCandidate.children);
            working.pop(); //Remove node because it doesn't need to be revisited
            i--;
            if (result.hasAdded) {
                node = pivotCandidate; //Returns node which reproduced new nexts ocurrences
                break;
            }
        } while (i >= 0);
        if (node) {
            if (node.step.type == step_type_enum_1.StepTypeEnum.Waiting) { //Check if there is an intervention node in execution
                if (working.length > 0) {
                    const result = await this.choosePivot(working, nexts, sleepers, occupied - free);
                    if (result.node) {
                        node = result.node;
                    }
                    free += result.free;
                }
            }
            else {
                while (i >= 0 && working[i].endTime == node.endTime) {
                    const chain = working[i];
                    if (!chain.concluded) {
                        chain.concluded = true;
                        //For each step the will end simultaneously with the pivot step, one worker more will be available
                        if (free < occupied && chain.step.type == step_type_enum_1.StepTypeEnum.Intervention) {
                            free++;
                        }
                    }
                    // Determining the nexts steps from this point
                    await this.addNexts(nexts, sleepers, chain.children);
                    working.pop();
                    i--;
                }
            }
        }
        return { node, free };
    }
    async addNexts(nexts, sleepers, children) {
        let hasAdded = false;
        let remaining = children.length;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child.parents || child.parents.every(x => x.concluded)) {
                remaining--;
                const target = child.step.type === step_type_enum_1.StepTypeEnum.Waiting ? sleepers : nexts;
                if (!target.get(child.step.id)) {
                    target.push(child);
                    hasAdded = true;
                }
            }
        }
        return { hasAdded, remaining };
    }
    getJoi() {
    }
};
ParallelizeStepsService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(base_ddd_1.BASE_TYPES.domainServices.INotificationService)),
    __param(1, inversify_1.inject(base_ddd_1.BASE_TYPES.domainModels.IRequestInfo)),
    __metadata("design:paramtypes", [Object, Object])
], ParallelizeStepsService);
exports.ParallelizeStepsService = ParallelizeStepsService;
/// O(log(n))
async function locationOf(element, array) {
    let start = 0;
    let end = array.length;
    do {
        var pivot = ~~(start + (end - start) / 2);
        if (end - start == 1) {
            if (array[pivot].endTime > element.endTime)
                pivot++;
            break;
        }
        else if (end - start < 1 || array[pivot].endTime === element.endTime) {
            pivot++;
            break;
        }
        if (array[pivot].endTime >= element.endTime) {
            start = pivot;
        }
        else {
            end = pivot;
        }
    } while (true);
    return pivot;
}
/// O(n) + O(log(n))
async function insert(element, array) {
    array.splice((await locationOf(element, array)), 0, element);
    return array;
}
exports.insert = insert;
