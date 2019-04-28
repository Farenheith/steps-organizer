import "jasmine";
import "reflect-metadata";
import { OrganizeStepsService } from "../../src/implementation/2 - domain/organize-steps.service"
import { IWorkResume } from "../../src/interfaces/2 - domain/models/work-resume.interface";
import { StepTypeEnum } from "../../src/interfaces/2 - domain/models/enums/step-type.enum";
import { IStepChain } from "../../src/interfaces/2 - domain/models/step-chain.interface";
import { StepPlannerApplication } from "../../src/implementation/1 - application/step-planner.application";
import { AppContainer } from "../../src/app-container";
import { TYPES } from "../../src/types";

describe("OrganizeStepsService", () => {
    it("constructor: ok", async () => {
        //Arrange
        const container = new AppContainer();

        //Act
        const result = container.get(TYPES.applications.IStepPlannerApplication);

        //Assert
        expect(result instanceof StepPlannerApplication).toBeTruthy();
    });
});