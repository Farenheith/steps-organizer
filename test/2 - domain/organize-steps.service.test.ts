import "jasmine";
import "reflect-metadata";
import { OrganizeStepsService } from "../../src/implementation/2 - domain/organize-steps.service"
import { IWorkResume } from "../../src/interfaces/2 - domain/models/work-resume.interface";
import { StepTypeEnum } from "../../src/interfaces/2 - domain/models/enums/step-type.enum";
import { IStepChain } from "../../src/interfaces/2 - domain/models/step-chain.interface";
import { AppContainer } from "../../src/app-container";
import { TYPES } from "../../src/types";

describe("OrganizeStepsService", () => {
    it("constructor: ok", async () => {
        //Arrange
        const container = new AppContainer();

        //Act
        const result = container.get(TYPES.domainServices.IOrganizeStepsService);

        //Assert
        expect(result instanceof OrganizeStepsService).toBeTruthy();
    });

    it("proceed: fail (parent not found)", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any);
        spyOn(target, "message");

        const data: IWorkResume = {
            workflows: [ {
                description: "Uma receita",
                name: "Receita 1",
                results: [ "RESULT1" as any, "RESULT2" ],
                steps: [
                    {
                        description: "Erro de dependência",
                        dependencies: [ "NOTFOUND" ],
                        duration: 1,
                        id: "IEXIST",
                        type: StepTypeEnum.Intervention,
                        materials: []
                    } as any
                ]
            } ],
            maxParallelization: 2,

        }

        //Act
        const result = await target.proceed(data);

        //Assert
        expect(result).toBeFalsy();
        expect(target.message).toHaveBeenCalledTimes(1);
    });

    it("proceed: ok", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any);
        spyOn(target, "message");

        const data: IWorkResume = {
            workflows: [ {
                description: "A workflow",
                name: "Workflow 1",
                results: [ "RESULT1" as any, "RESULT2" ],
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
            } ],
            maxParallelization: 2,

        };
        //Act
        const result = await target.proceed(data);
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

        //Assert
        expect(result).toEqual({
            children: [ chain1 ],
            maxParallelization: 2,
            results: [ "RESULT1" as any, "RESULT2" ]
        });
        expect(target.message).toHaveBeenCalledTimes(0);
    });
});