import "jasmine";
import "reflect-metadata";
import { ParallelizeStepsService, insert } from "../../src/implementation/2 - domain/parallelize-steps.service"
import { IStepChain } from "../../src/interfaces/2 - domain/models/step-chain.interface";
import { StepTypeEnum } from "../../src/interfaces/2 - domain/models/enums/step-type.enum";
import { IStepZero } from "../../src/interfaces/2 - domain/models/step-zero.interface";

describe("ParallelizeStepsService", () => {
    it("proceed: ok", async () => {
        //Arrange
        const target = new ParallelizeStepsService({} as any, {} as any);
        spyOn(target, "getStages").and.returnValue(Promise.resolve({ stages: "EXPECTED_STAGES" } as any));

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
        const target = new ParallelizeStepsService({} as any, {} as any);

        //First workflow
        const chain1:IStepChain = {
            step: {
                description: "First step",
                dependencies: [],
                duration: 1,
                id: "STEP1",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            children: [],
            parents: [],
            endTime: 1,
            startTime: 0
        };
        const chain2:IStepChain = {
            step: {
                description: "Final step",
                dependencies: [ "STEP1" ],
                duration: 2,
                id: "STEP2",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            children: [],
            parents: [ chain1 ],
            endTime: 3,
            startTime: 1
        };
        chain1.children.push(chain2);

        //Second workflow
        const chain1_2:IStepChain = {
            step: {
                description: "First step 2",
                dependencies: [],
                duration: 1,
                id: "STEP1_2",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            children: [],
            parents: [],
            endTime: 1,
            startTime: 0
        };
        const chain2_2:IStepChain = {
            step: {
                description: "Second step 2",
                dependencies: [ "STEP1_2" ],
                duration: 2,
                id: "STEP2_2",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            children: [],
            parents: [ chain1 ],
            endTime: 3,
            startTime: 1
        };
        const chain3_2:IStepChain = {
            step: {
                description: "Final step 2",
                dependencies: [ "STEP2_2" ],
                duration: 2,
                id: "STEP3_2",
                type: StepTypeEnum.Intervention,
                materials: []
            },
            children: [],
            parents: [ chain1 ],
            endTime: 5,
            startTime: 3
        };
        chain1.children.push(chain2);
        chain1_2.children.push(chain2_2);
        chain2_2.children.push(chain3_2);

        //Assert
        const data:IStepZero = {
            children: [ chain1, chain1_2 ],
            maxParallelization: 2,
            results: [ "RESULT1" as any, "RESULT2" ]
        }

        //Act
        const result = await target.getStages(data);

        //Assert
        expect(result).toEqual({
            stages: [
            {
                stageNumber: 0,
                startTime: 0,
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
                        description: "First step 2",
                        dependencies: [],
                        duration: 1,
                        id: "STEP1_2",
                        type: StepTypeEnum.Intervention,
                        materials: []
                    }
                ]
            },
            {
                stageNumber: 1,
                startTime: 1,
                steps: [
                    {
                        description: "Final step",
                        dependencies: [ "STEP1" ],
                        duration: 2,
                        id: "STEP2",
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
                    }
                ]
            },
            {
                stageNumber: 2,
                startTime: 3,
                steps: [
                    {
                        description: "Final step 2",
                        dependencies: [ "STEP2_2" ],
                        duration: 2,
                        id: "STEP3_2",
                        type: StepTypeEnum.Intervention,
                        materials: []
                    }
                ]
            }
        ], endTime: 5});
    });

    

    it("insert: ok (first)", async () => {
        //Arrange
        const array = [
            {
                endTime: 3
            },
            {
                endTime: 2
            },
            {
                endTime: 1
            }
        ] as any[];
        const element = {
            endTime: 4
        } as any;

        //Act
        const result = await insert(element, array);

        //Assert
        expect(result).toEqual([
            {
                endTime: 4
            },
            {
                endTime: 3
            },
            {
                endTime: 2
            },
            {
                endTime: 1
            }
        ] as any);
    });

    it("insert: ok (last)", async () => {
        //Arrange
        const array = [
            {
                endTime: 3
            },
            {
                endTime: 2
            },
            {
                endTime: 1
            }
        ] as any[];
        const element = {
            endTime: 0
        } as any;

        //Act
        const result = await insert(element, array);

        //Assert
        expect(result).toEqual([
            {
                endTime: 3
            },
            {
                endTime: 2
            },
            {
                endTime: 1
            },
            {
                endTime: 0
            }
        ] as any);
    });
});