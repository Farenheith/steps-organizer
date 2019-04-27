"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_ddd_1 = require("base-ddd");
const inversify_1 = require("inversify");
let ParallelizeStepsService = class ParallelizeStepsService extends base_ddd_1.BaseService {
    async proceed(data) {
        const result = {
            results: data.results,
            stages: await this.getStages(data)
        };
        return result;
    }
    async getStages(data) {
        const stages = [];
        let stageNumber = -1;
        let startTime = 0;
        let count = 0;
        let reference = {};
        let working = [];
        const nexts = [];
        this.addNexts(nexts, data.children);
        while (nexts.length > 0) {
            stageNumber++;
            const stage = {
                stageNumber,
                startTime,
                steps: []
            };
            stages.push(stage);
            // Distributing workers, limiing by maxParallelization and available nexts steps
            while (count < data.maxParallelization && nexts.length > 0) {
                const chain = nexts.shift();
                stage.steps.push(chain.step);
                reference[chain.step.id] = chain;
                //Adding in the working array maitaining the sorting (by StartTimne, desc)
                working.push(chain);
                // await insert(chain, working);
                count++;
            }
            // Determining the nexts steps from this point
            stage.steps.forEach(step => {
                const current = reference[step.id];
                this.addNexts(nexts, current.children);
            });
            // Checking which step will end sooner, so the startTime of the next stage can be determined 
            const pivot = working.shift();
            // For the next step, at least one worker will be available
            count--;
            startTime = pivot.endTime;
            while (working.length > 0 && working[0].endTime == pivot.endTime) {
                working.shift();
                //For each step the will end simultaneously with the pivot step, one worker more will be available
                count--;
            }
        }
        return stages;
    }
    async addNexts(nexts, children) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (nexts.length == 0 || nexts.findIndex(x => x.step.id === child.step.id) < 0) {
                nexts.push(child);
                // await insert(chain, nexts);
            }
        }
    }
    getJoi() {
    }
};
ParallelizeStepsService = __decorate([
    inversify_1.injectable()
], ParallelizeStepsService);
exports.ParallelizeStepsService = ParallelizeStepsService;
/*
async function locationOf(element: IStepChain, array: IStepChain[]) {
    let start = 0;
    let end = array.length;

    do {
        var pivot = ~~(start + (end - start) / 2);

        if (end-start <= 1 || array[pivot].endTime === element.endTime) {
            break;
        }

        if (array[pivot].endTime > element.endTime) {
            start = pivot;
        } else {
            end = pivot;
        }
    } while (true);

    return pivot;
}

async function insert(element: IStepChain, array: IStepChain[]) {
    array.splice((await locationOf(element, array)) + 1, 0, element);
    return array;
}
*/ 
