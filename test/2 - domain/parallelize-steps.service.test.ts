import "jasmine";
import "reflect-metadata";
import { ParallelizeStepsService } from "../../src/implementation/2 - domain/parallelize-steps.service"
import { IParallelizeStepsService } from "../../src/interfaces/2 - domain/parallelize-steps-service.interface";
import { IWorkResume } from "../../src/interfaces/2 - domain/models/work-resume.interface";
import { IMaterial } from "../../src/interfaces/2 - domain/models/material.interface";
import { IStep } from "../../src/interfaces/2 - domain/models/step.interface";
import { IRecipe } from "../../src/interfaces/2 - domain/models/recipe.interface";

describe("ParallelizeStepsService", () => {
    it("proceed: ok", async () => {
        //Arrange
        const target = new ParallelizeStepsService({} as any, {} as any, {} as any);
        spyOn(target, "getStages").and.returnValue(Promise.resolve("EXPECTED_STAGES" as any));

        //Act
        const result = await target.proceed({ results: "RESULTS" } as any);

        //Assert
        expect(result).toEqual({
            results: "RESULTS",
            stages: "EXPECTED_STAGES"
        } as any);
        expect(target.getStages).toHaveBeenCalledTimes(1);
    });

    it("getStages: ok", async () => {
        //Arrange
        const target = new ParallelizeStepsService({} as any, {} as any, {} as any);

        //Act
        const result = await target.getStages({ steps:[
            {
                id: "a",
                startTime: 0
            } as any,
            {
                id: "b",
                startTime: 0
            },
            {
                id: "c",
                startTime: 1
            },
            {
                id: "d",
                startTime: 2
            },
            {
                id: "e",
                startTime: 3
            },
            {
                id: "f",
                startTime: 3 
            },
            {
                id: "g",
                startTime: 3 
            }
        ],
        results: "RESULTS" as any,
        description: "DESCRIPTION",
        name: "NAME" });

        //Assert
        expect(result).toEqual([ {
                stageNumber: 1,
                startTime: 0,
                steps: [ {
                        id: "a",
                        startTime: 0
                    } as any,
                    {
                        id: "b",
                        startTime: 0
                    }
                ]
            }, {
                stageNumber: 2,
                startTime: 1,
                steps: [ {
                        id: "c",
                        startTime: 1
                    }
                ]
            }, {
                stageNumber: 3,
                startTime: 2,
                steps: [
                    {
                        id: "d",
                        startTime: 2
                    }
                ]
            }, {
                stageNumber: 4,
                startTime: 3,
                steps: [
                    {
                        id: "e",
                        startTime: 3
                    },
                    {
                        id: "f",
                        startTime: 3 
                    },
                    {
                        id: "g",
                        startTime: 3 
                    }
                ]
            }
            ] as any);
    });
});