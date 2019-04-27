import "jasmine";
import "reflect-metadata";
import { IWorkResume } from "../../src/interfaces/2 - domain/models/work-resume.interface";
import { StepTypeEnum } from "../../src/interfaces/2 - domain/models/enums/step-type.enum";
import { AppContainer } from "../../src/app-container";
import { TYPES } from "../../src/types";
import { IPlanStepsService } from "../../src/interfaces/2 - domain/plan-steps-service.interface";
import { IOrganizeStepsService } from "../../src/interfaces/2 - domain/organize-steps-service.interface";
import { PlanStepsService } from "../../src/implementation/2 - domain/plan-steps.service";

describe("PlanStepsService", () => {
    it("do: ok", async () => {
        //Arrange
        const container = new AppContainer();
        // Why we didn't mock the constructor parameters here?
        // Because this service is the best opportunity to validate the whole algorithm, as it's entry
        // is simplier thant the entry expected by ParallelizeStepsService
        // but is crucial that those classes doesn't access any external resource, to make
        // this test able to also run on the cloud
        const target = container.get<IPlanStepsService>(TYPES.domainServices.IPlanStepsService);

        const data: IWorkResume = {
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
        };

        //Act
        const result = await target.do(data);

        //Assert
        expect(target["notifications"].getNotifications()).toEqual([]);
        expect(result).toEqual({
            results: [ "RESULT1" as any, "RESULT2" ],
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
            ]
        });
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