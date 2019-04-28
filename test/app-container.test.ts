import "jasmine";
import "reflect-metadata";
import { AppContainer } from "../src/app-container"; 
import { TYPES } from "../src/types";
import { OrganizeStepsService } from "../src/implementation/2 - domain/organize-steps.service";
import { ParallelizeStepsService } from "../src/implementation/2 - domain/parallelize-steps.service";
import { PlanStepsService } from "../src/implementation/2 - domain/plan-steps.service";
import { StepPlannerApplication } from "../src/implementation/1 - application/step-planner.application";

describe("BaseAppContainer", () => {
    it("constructor: ok", () => {
        //Arrange
        const mapping: any = {

        };
        let next: any = undefined;
        const mapper:any = {
            to(value: any) {
                mapping[next] = value;
            },
            toConstantValue(value: any) {
                this.to(value);
            }
        }
        spyOn(AppContainer.prototype, "bind").and.callFake((x: any):any => {
            next = x.toString();
            return mapper;
        });
        spyOn(AppContainer.prototype, "register");
        const target = new AppContainer();
        
        //Act
        target.registerDomainServices();
        target.registerApplications();

        //Assert
        expect(target.register).toHaveBeenCalledTimes(1);
        expect(AppContainer.prototype.bind).toHaveBeenCalledTimes(4);
        expect(mapping[TYPES.domainServices.IOrganizeStepsService.toString()]).toBe(OrganizeStepsService);
        expect(mapping[TYPES.domainServices.IParallelizeStepsService.toString()]).toBe(ParallelizeStepsService);
        expect(mapping[TYPES.domainServices.IPlanStepsService.toString()]).toBe(PlanStepsService);

        expect(mapping[TYPES.applications.IStepPlannerApplication.toString()]).toBe(StepPlannerApplication);
    });
});