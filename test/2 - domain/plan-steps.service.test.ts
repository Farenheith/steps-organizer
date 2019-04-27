import "jasmine";
import "reflect-metadata";
import { IWorkResume } from "../../src/interfaces/2 - domain/models/work-resume.interface";
import { StepTypeEnum } from "../../src/interfaces/2 - domain/models/enums/step-type.enum";
import { AppContainer } from "../../src/app-container";
import { TYPES } from "../../src/types";
import { IPlanStepsService } from "../../src/interfaces/2 - domain/plan-steps-service.interface";
import { IOrganizeStepsService } from "../../src/interfaces/2 - domain/organize-steps-service.interface";
import { PlanStepsService } from "../../src/implementation/2 - domain/plan-steps.service";
import { IPlan } from "../../src/interfaces/2 - domain/models/plan.interface";

describe("PlanStepsService", () => {
    it("do: ok case 1", () => {
        return testCase(case1.input, case1.expect);
    });

    it("do: ok case 2 (parallelization 2)", () => {
        return testCase(case2_2.input, case2_2.expect);
    });

    it("do: ok case 2 (parallelization 4)", () => {
        return testCase(case2_4.input, case2_4.expect);
    });

    it("do: ok case 2 (parallelization 1)", () => {
        return testCase(case2_1.input, case2_1.expect);
    });

    it("proceed: fail organize", async () => {
        //Arrange
        const organize = jasmine.createSpyObj<IOrganizeStepsService>("organize", {
            do: Promise.resolve(null)
        });
        const target = new PlanStepsService({} as any, {} as any, organize, {} as any);

        //Act
        const result = await target.proceed({} as any);

        //Assert
        expect(organize.do).toHaveBeenCalledTimes(1);
        expect(result).toBeNull();
    });
});

async function testCase(input: IWorkResume, expected: IPlan) {
    //Arrange
    const container = new AppContainer();
    // Why we didn't mock the constructor parameters here?
    // Because this service is the best opportunity to validate the whole algorithm, as it's entry
    // is simplier thant the entry expected by ParallelizeStepsService
    // but is crucial that those classes doesn't access any external resource, to make
    // this test able to also run on the cloud
    const target = container.get<IPlanStepsService>(TYPES.domainServices.IPlanStepsService);

    //Act
    const result = await target.do(input);

    //Assert
    expect(target["notifications"].getNotifications()).toEqual([]);
    const json = JSON.stringify(result);
    expect(json).toBeDefined();
    expect(result).toEqual(expected);
}

const case1 = {
    input: {
        workflows: [ {
            description: "A workflow",
            name: "Workflow 1",
            results: [ "RESULT1" as any ],
            steps: [
                {
                    description: "First step",
                    dependencies: [],
                    duration: 1,
                    id: "STEP1",
                    type: StepTypeEnum.Intervention,
                    materials: []
                },
                {
                    description: "Final step",
                    dependencies: [ "STEP1" ],
                    duration: 2,
                    id: "STEP2",
                    type: StepTypeEnum.Intervention,
                    materials: []
                }
            ]
        },
        {
            description: "Another workflow",
            name: "Workflow 2",
            results: [ "RESULT2" as any ],
            steps: [
                {
                    description: "First step 2",
                    dependencies: [],
                    duration: 1,
                    id: "STEP1_2",
                    type: StepTypeEnum.Intervention,
                    materials: []
                },
                {
                    description: "Second step 2",
                    dependencies: [ "STEP1_2" ],
                    duration: 2,
                    id: "STEP2_2",
                    type: StepTypeEnum.Intervention,
                    materials: []
                },
                {
                    description: "Final step 2",
                    dependencies: [ "STEP2_2" ],
                    duration: 2,
                    id: "STEP3_2",
                    type: StepTypeEnum.Intervention,
                    materials: []
                }
            ]
        } ],
        maxParallelization: 2,
    },
    expect: {
        stages: [
            {
                stageNumber: 1,
                startTime: 0,
                steps: [
                    {
                        description: "First step 2",
                        dependencies: [],
                        duration: 1,
                        id: "STEP1_2",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "First step",
                        dependencies: [],
                        duration: 1,
                        id: "STEP1",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 2,
                startTime: 1,
                steps: [
                    {
                        description: "Final step",
                        dependencies: [
                            "STEP1"
                        ],
                        duration: 2,
                        id: "STEP2",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Second step 2",
                        dependencies: [
                            "STEP1_2"
                        ],
                        duration: 2,
                        id: "STEP2_2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 3,
                startTime: 3,
                steps: [
                    {
                        description: "Final step 2",
                        dependencies: [
                            "STEP2_2"
                        ],
                        duration: 2,
                        id: "STEP3_2",
                        type: 0,
                        materials: []
                    }
                ]
            }
        ],
        endTime: 5,
        results: [
            "RESULT1" as any,
            "RESULT2"
        ]
    }
}

const input2 = [ {
        description: "A workflow",
        name: "Workflow 1",
        results: [ "RESULT1" as any ],
        steps: [
            {
                description: "First step",
                dependencies: [],
                duration: 1,
                id: "STEP1",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "First step 1",
                dependencies: [],
                duration: 2,
                id: "STEP1.1",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "First step 2",
                dependencies: [],
                duration: 3,
                id: "STEP1.2",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Second step",
                dependencies: [ "STEP1" ],
                duration: 4,
                id: "STEP2",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Second step 1",
                dependencies: [ "STEP1.1", "STEP1.2" ],
                duration: 2,
                id: "STEP2.1",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Second step 2",
                dependencies: [ "STEP1.1", "STEP1.2" ],
                duration: 3,
                id: "STEP2.2",
                type: StepTypeEnum.Waiting,
                materials: []
            },
            {
                description: "Third step",
                dependencies: [ "STEP2" ],
                duration: 2,
                id: "STEP3",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Third step",
                dependencies: [ "STEP2" ],
                duration: 3,
                id: "STEP3.1",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Third step",
                dependencies: [ "STEP2" ],
                duration: 1,
                id: "STEP3.2",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Third step",
                dependencies: [ "STEP2.1" ],
                duration: 4,
                id: "STEP3.3",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Third step",
                dependencies: [ "STEP2.2" ],
                duration: 7,
                id: "STEP3.4",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Third step",
                dependencies: [ "STEP2.2" ],
                duration: 3,
                id: "STEP3.5",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Fourth step",
                dependencies: [ "STEP3.1", "STEP3.2", "STEP3.3" ],
                duration: 2,
                id: "STEP4",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Fourth step",
                dependencies: [ "STEP3.1", "STEP3.2", "STEP3.3" ],
                duration: 1,
                id: "STEP4.1",
                type: StepTypeEnum.Waiting,
                materials: []
            },
            {
                description: "Fourth step",
                dependencies: [ "STEP3.1", "STEP3.2", "STEP3.3", "STEP3.4", "STEP3.5" ],
                duration: 1,
                id: "STEP4.2",
                type: StepTypeEnum.Waiting,
                materials: []
            },
            {
                description: "Fourth step 2",
                dependencies: [ "STEP3.1", "STEP3.2", "STEP3.3" ],
                duration: 1,
                id: "STEP4.3",
                type: StepTypeEnum.Waiting,
                materials: []
            },
            {
                description: "Final step",
                dependencies: [ "STEP1", "STEP3", "STEP4", "STEP4.1", "STEP4.2" ],
                duration: 1,
                id: "STEP5",
                type: StepTypeEnum.Waiting,
                materials: []
            }
        ]
    },
    {
        description: "Another workflow",
        name: "Workflow 2",
        results: [ "RESULT2" as any ],
        steps: [
            {
                description: "First step 2",
                dependencies: [],
                duration: 1,
                id: "STEP1_2",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Second step 2",
                dependencies: [ "STEP1_2" ],
                duration: 2,
                id: "STEP2_2",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            {
                description: "Final step 2",
                dependencies: [ "STEP2_2" ],
                duration: 2,
                id: "STEP3_2",
                type: StepTypeEnum.Intervention,
                materials: []
            }
        ]
    } ];

const case2_2 = {
    input: {
        workflows: input2,
        maxParallelization: 2,
    },
    expect: {
        stages: [
            {
                stageNumber: 1,
                startTime: 0,
                steps: [
                    {
                        description: "First step 2",
                        dependencies: [],
                        duration: 1,
                        id: "STEP1_2",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "First step 2",
                        dependencies: [],
                        duration: 3,
                        id: "STEP1.2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 2,
                startTime: 1,
                steps: [
                    {
                        description: "Second step 2",
                        dependencies: [
                            "STEP1_2"
                        ],
                        duration: 2,
                        id: "STEP2_2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 3,
                startTime: 3,
                steps: [
                    {
                        description: "Final step 2",
                        dependencies: [
                            "STEP2_2"
                        ],
                        duration: 2,
                        id: "STEP3_2",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "First step 1",
                        dependencies: [],
                        duration: 2,
                        id: "STEP1.1",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 4,
                startTime: 5,
                steps: [
                    {
                        description: "Second step 1",
                        dependencies: [
                            "STEP1.1",
                            "STEP1.2"
                        ],
                        duration: 2,
                        id: "STEP2.1",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "First step",
                        dependencies: [],
                        duration: 1,
                        id: "STEP1",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Second step 2",
                        dependencies: [
                            "STEP1.1",
                            "STEP1.2"
                        ],
                        duration: 3,
                        id: "STEP2.2",
                        type: 1,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 5,
                startTime: 6,
                steps: [
                    {
                        description: "Second step",
                        dependencies: [
                            "STEP1"
                        ],
                        duration: 4,
                        id: "STEP2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 6,
                startTime: 7,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2.1"
                        ],
                        duration: 4,
                        id: "STEP3.3",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 7,
                startTime: 10,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2"
                        ],
                        duration: 1,
                        id: "STEP3.2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 8,
                startTime: 11,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2"
                        ],
                        duration: 3,
                        id: "STEP3.1",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2"
                        ],
                        duration: 2,
                        id: "STEP3",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 9,
                startTime: 14,
                steps: [
                    {
                        description: "Fourth step",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3"
                        ],
                        duration: 2,
                        id: "STEP4",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2.2"
                        ],
                        duration: 3,
                        id: "STEP3.5",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Fourth step 2",
                        dependencies: [ "STEP3.1", "STEP3.2", "STEP3.3" ],
                        duration: 1,
                        id: "STEP4.3",
                        type: StepTypeEnum.Waiting,
                        materials: []
                    },
                    {
                        description: "Fourth step",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3"
                        ],
                        duration: 1,
                        id: "STEP4.1",
                        type: 1,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 10,
                startTime: 16,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2.2"
                        ],
                        duration: 7,
                        id: "STEP3.4",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 11,
                startTime: 23,
                steps: [
                    {
                        description: "Fourth step",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3",
                            "STEP3.4",
                            "STEP3.5"
                        ],
                        duration: 1,
                        id: "STEP4.2",
                        type: 1,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 12,
                startTime: 24,
                steps: [
                    {
                        description: "Final step",
                        dependencies: [
                            "STEP1",
                            "STEP3",
                            "STEP4",
                            "STEP4.1",
                            "STEP4.2"
                        ],
                        duration: 1,
                        id: "STEP5",
                        type: 1,
                        materials: []
                    }
                ]
            }
        ],
        endTime: 25,
        results: [
            "RESULT1" as any,
            "RESULT2"
        ]
    }
}

const case2_4 = {
    input: {
        workflows: input2,
        maxParallelization: 4,
    },
    expect: {
        stages: [
            {
                stageNumber: 1,
                startTime: 0,
                steps: [
                    {
                        description: "First step 2",
                        dependencies: [],
                        duration: 1,
                        id: "STEP1_2",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "First step 2",
                        dependencies: [],
                        duration: 3,
                        id: "STEP1.2",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "First step 1",
                        dependencies: [],
                        duration: 2,
                        id: "STEP1.1",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "First step",
                        dependencies: [],
                        duration: 1,
                        id: "STEP1",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 2,
                startTime: 1,
                steps: [
                    {
                        description: "Second step 2",
                        dependencies: [
                            "STEP1_2"
                        ],
                        duration: 2,
                        id: "STEP2_2",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Second step",
                        dependencies: [
                            "STEP1"
                        ],
                        duration: 4,
                        id: "STEP2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 3,
                startTime: 3,
                steps: [
                    {
                        description: "Final step 2",
                        dependencies: [
                            "STEP2_2"
                        ],
                        duration: 2,
                        id: "STEP3_2",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Second step 1",
                        dependencies: [
                            "STEP1.1",
                            "STEP1.2"
                        ],
                        duration: 2,
                        id: "STEP2.1",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Second step 2",
                        dependencies: [
                            "STEP1.1",
                            "STEP1.2"
                        ],
                        duration: 3,
                        id: "STEP2.2",
                        type: 1,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 4,
                startTime: 5,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2"
                        ],
                        duration: 1,
                        id: "STEP3.2",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2"
                        ],
                        duration: 3,
                        id: "STEP3.1",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2"
                        ],
                        duration: 2,
                        id: "STEP3",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2.1"
                        ],
                        duration: 4,
                        id: "STEP3.3",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 5,
                startTime: 9,
                steps: [
                    {
                        description: "Fourth step",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3"
                        ],
                        duration: 2,
                        id: "STEP4",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2.2"
                        ],
                        duration: 3,
                        id: "STEP3.5",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2.2"
                        ],
                        duration: 7,
                        id: "STEP3.4",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Fourth step 2",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3"
                        ],
                        duration: 1,
                        id: "STEP4.3",
                        type: 1,
                        materials: []
                    },
                    {
                        description: "Fourth step",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3"
                        ],
                        duration: 1,
                        id: "STEP4.1",
                        type: 1,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 6,
                startTime: 16,
                steps: [
                    {
                        description: "Fourth step",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3",
                            "STEP3.4",
                            "STEP3.5"
                        ],
                        duration: 1,
                        id: "STEP4.2",
                        type: 1,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 7,
                startTime: 17,
                steps: [
                    {
                        description: "Final step",
                        dependencies: [
                            "STEP1",
                            "STEP3",
                            "STEP4",
                            "STEP4.1",
                            "STEP4.2"
                        ],
                        duration: 1,
                        id: "STEP5",
                        type: 1,
                        materials: []
                    }
                ]
            }
        ],
        endTime: 18,
        results: [
            "RESULT1" as any,
            "RESULT2"
        ]
    }
}

const case2_1 = {
    input: {
        workflows: input2,
        maxParallelization: 1,
    },
    expect: {
        stages: [
            {
                stageNumber: 1,
                startTime: 0,
                steps: [
                    {
                        description: "First step 2",
                        dependencies: [],
                        duration: 1,
                        id: "STEP1_2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 2,
                startTime: 1,
                steps: [
                    {
                        description: "Second step 2",
                        dependencies: [
                            "STEP1_2"
                        ],
                        duration: 2,
                        id: "STEP2_2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 3,
                startTime: 3,
                steps: [
                    {
                        description: "Final step 2",
                        dependencies: [
                            "STEP2_2"
                        ],
                        duration: 2,
                        id: "STEP3_2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 4,
                startTime: 5,
                steps: [
                    {
                        description: "First step 2",
                        dependencies: [],
                        duration: 3,
                        id: "STEP1.2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 5,
                startTime: 8,
                steps: [
                    {
                        description: "First step 1",
                        dependencies: [],
                        duration: 2,
                        id: "STEP1.1",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 6,
                startTime: 10,
                steps: [
                    {
                        description: "Second step 1",
                        dependencies: [
                            "STEP1.1",
                            "STEP1.2"
                        ],
                        duration: 2,
                        id: "STEP2.1",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Second step 2",
                        dependencies: [
                            "STEP1.1",
                            "STEP1.2"
                        ],
                        duration: 3,
                        id: "STEP2.2",
                        type: 1,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 7,
                startTime: 12,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2.1"
                        ],
                        duration: 4,
                        id: "STEP3.3",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 8,
                startTime: 16,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2.2"
                        ],
                        duration: 3,
                        id: "STEP3.5",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 9,
                startTime: 19,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2.2"
                        ],
                        duration: 7,
                        id: "STEP3.4",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 10,
                startTime: 26,
                steps: [
                    {
                        description: "First step",
                        dependencies: [],
                        duration: 1,
                        id: "STEP1",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 11,
                startTime: 27,
                steps: [
                    {
                        description: "Second step",
                        dependencies: [
                            "STEP1"
                        ],
                        duration: 4,
                        id: "STEP2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 12,
                startTime: 31,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2"
                        ],
                        duration: 1,
                        id: "STEP3.2",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 13,
                startTime: 32,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2"
                        ],
                        duration: 3,
                        id: "STEP3.1",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 14,
                startTime: 35,
                steps: [
                    {
                        description: "Fourth step",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3"
                        ],
                        duration: 2,
                        id: "STEP4",
                        type: 0,
                        materials: []
                    },
                    {
                        description: "Fourth step 2",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3"
                        ],
                        duration: 1,
                        id: "STEP4.3",
                        type: 1,
                        materials: []
                    },
                    {
                        description: "Fourth step",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3",
                            "STEP3.4",
                            "STEP3.5"
                        ],
                        duration: 1,
                        id: "STEP4.2",
                        type: 1,
                        materials: []
                    },
                    {
                        description: "Fourth step",
                        dependencies: [
                            "STEP3.1",
                            "STEP3.2",
                            "STEP3.3"
                        ],
                        duration: 1,
                        id: "STEP4.1",
                        type: 1,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 15,
                startTime: 37,
                steps: [
                    {
                        description: "Third step",
                        dependencies: [
                            "STEP2"
                        ],
                        duration: 2,
                        id: "STEP3",
                        type: 0,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 16,
                startTime: 39,
                steps: [
                    {
                        description: "Final step",
                        dependencies: [
                            "STEP1",
                            "STEP3",
                            "STEP4",
                            "STEP4.1",
                            "STEP4.2"
                        ],
                        duration: 1,
                        id: "STEP5",
                        type: 1,
                        materials: []
                    }
                ]
            }
        ],
        endTime: 40,
        results: [
            "RESULT1" as any,
            "RESULT2"
        ]
    }
}