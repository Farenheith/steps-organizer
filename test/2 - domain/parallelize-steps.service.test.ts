import "jasmine";
import "reflect-metadata";
import { ParallelizeStepsService } from "../../src/implementation/2 - domain/parallelize-steps.service"

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
        spyOn(target, "getMinEndTime");

        //Act
        const result = await target.getStages({ steps:[
            {
                id: "a",
                metadata: {
                    startTime: 0
                }
            } as any,
            {
                id: "b",
                metadata: {
                    startTime: 0
                }
            },
            {
                id: "c",
                metadata: {
                    startTime: 1
                }
            },
            {
                id: "d",
                metadata: {
                    startTime: 2
                }
            },
            {
                id: "e",
                metadata: {
                    startTime: 3
                }
            },
            {
                id: "f",
                metadata: {
                    startTime: 3
                }
            },
            {
                id: "g",
                metadata: {
                    startTime: 3
                }
            }
        ],
        metadata: {
            maxParallelization: 3
        }} as any);

        //Assert
        expect(result).toEqual([ {
                stageNumber: 1,
                startTime: 0,
                steps: [ {
                        id: "a",
                        metadata: {
                            startTime: 0
                        }
                    } as any,
                    {
                        id: "b",
                        metadata: {
                            startTime: 0
                        }
                    }
                ]
            }, {
                stageNumber: 2,
                startTime: 1,
                steps: [ {
                        id: "c",
                        metadata: {
                            startTime: 1
                        }
                    }
                ]
            }, {
                stageNumber: 3,
                startTime: 2,
                steps: [
                    {
                        id: "d",
                        metadata: {
                            startTime: 2
                        }
                    }
                ]
            }, {
                stageNumber: 4,
                startTime: 3,
                steps: [
                    {
                        id: "e",
                        metadata: {
                            startTime: 3
                        }
                    },
                    {
                        id: "f",
                        metadata: {
                            startTime: 3
                        }
                    },
                    {
                        id: "g",
                        metadata: {
                            startTime: 3
                        }
                    }
                ]
            }
            ] as any);
    });
});