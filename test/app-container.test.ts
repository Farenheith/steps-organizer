import "jasmine";
import "reflect-metadata";
import { AppContainer } from "../src/app-container"; 
import { TYPES } from "../src/types";
import { OrganizeStepsService } from "../src/implementation/2 - domain/organize-steps.service";
import { ParallelizeStepsService } from "../src/implementation/2 - domain/parallelize-steps.service";

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
        expect(AppContainer.prototype.bind).toHaveBeenCalledTimes(2);
        expect(mapping[TYPES.domainServices.IOrganizeStepsService.toString()]).toBe(OrganizeStepsService);
        expect(mapping[TYPES.domainServices.IParallelizeStepsService.toString()]).toBe(ParallelizeStepsService);
    });
});