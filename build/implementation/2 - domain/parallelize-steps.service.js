"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_ddd_1 = require("base-ddd");
class ParallelizeSteps extends base_ddd_1.BaseService {
    async proceed(data) {
        const result = {
            results: data.results,
            stages: await this.getStages(data)
        };
        return result;
    }
    async getStages(data) {
        const result = new Array();
        await base_ddd_1.ArrayHelper.forEachAsync(data.steps, async (x) => {
            const idx = await result.findIndex(x => x.startTime == x.startTime);
            if (idx < 0) {
                result.push({ startTime: x.startTime, steps: [x] });
            }
            else {
                result[idx].steps.push(x);
            }
        });
        return result;
    }
    getJoi() {
    }
}
exports.ParallelizeSteps = ParallelizeSteps;
