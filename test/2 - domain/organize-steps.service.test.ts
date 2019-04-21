import "jasmine";
import "reflect-metadata";
import { OrganizeStepsService } from "../../src/implementation/2 - domain/organize-steps.service"
import { IParallelizeStepsService } from "../../src/interfaces/2 - domain/parallelize-steps-service.interface";
import { IWorkResume } from "../../src/interfaces/2 - domain/models/work-resume.interface";
import { IMaterial } from "../../src/interfaces/2 - domain/models/material.interface";
import { IStep } from "../../src/interfaces/2 - domain/models/step.interface";
import { IRecipe } from "../../src/interfaces/2 - domain/models/recipe.interface";

describe("OrganizeStepsService", () => {
    it("proceed: fail notifications", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        spyOn(target, "hasNotification").and.returnValue(true);
        spyOn(target, "setup").and.returnValue(Promise.resolve("teste"));
        spyOn(target, "setStartTimes").and.returnValue(Promise.resolve());
        spyOn(target, "joinAndSort");

        //Act
        const result = await target.proceed({ recipes: { length: 2 } } as any);

        //Assert
        expect(result).toBeNull();
        expect(target.hasNotification).toHaveBeenCalledTimes(1);
        expect(target.setup).toHaveBeenCalledTimes(1);
        expect(target.setStartTimes).toHaveBeenCalledTimes(1);
        expect(target.joinAndSort).toHaveBeenCalledTimes(0);
    });

    it("proceed: ok", async () => {
        //Arrange
        const parallelize = jasmine.createSpyObj<IParallelizeStepsService>("parallelize", {
            proceed: Promise.resolve("EXPECTED_RESULT" as any)
        });
        const target = new OrganizeStepsService({} as any, {} as any, parallelize);
        spyOn(target, "hasNotification").and.returnValue(false);
        spyOn(target, "setup").and.returnValue(Promise.resolve("teste"));
        spyOn(target, "setStartTimes").and.returnValue(Promise.resolve());
        spyOn(target, "joinAndSort");

        //Act
        const result = await target.proceed({ recipes: { length: 2 } } as any);

        //Assert
        expect(result).toBe("EXPECTED_RESULT" as any);
        expect(target.hasNotification).toHaveBeenCalledTimes(1);
        expect(target.setup).toHaveBeenCalledTimes(1);
        expect(target.setStartTimes).toHaveBeenCalledTimes(1);
        expect(target.joinAndSort).toHaveBeenCalledTimes(1);
        expect(parallelize.proceed).toHaveBeenCalledTimes(1);
    });

    it("setup: ok", async () => {
        //Arrange
        const parallelize = jasmine.createSpyObj<IParallelizeStepsService>("parallelize", {
            proceed: Promise.resolve("EXPECTED_RESULT" as any)
        });
        const target = new OrganizeStepsService({} as any, {} as any, parallelize);
        const workResume: IWorkResume = {
            maxParallelization: 1,
            recipes: [
                {
                    description: "teste",
                    name: "receita 1",
                    results: [ "RESULTADO1" as any ],
                    steps: [ "PASSO1_1", "PASSO1_2", "PASSO1_3" ] as any[]
                },
                {
                    description: "teste",
                    name: "receita 2",
                    results: [ "RESULTADO2", "RESULTADO2_2" ] as any[],
                    steps: [ "PASSO2_1", "PASSO2_2", "PASSO2_3" ] as any[]
                }
            ]
        };
        const results = new Array<IMaterial>();
        const iterators = new Array<IterableIterator<[ Number, IStep]>>();

        //Act
        const result = await target.setup(workResume, results, iterators);

        //Assert
        expect(result).toBe("receita 1 / receita 2");
        let count = 0;
        do {
            const result = iterators[0].next();
            if (result.done) {
                break;
            } else {
                expect(result.value[1]).toBe(workResume.recipes[0].steps[result.value[0].valueOf()]);
                count++;
            }
        } while (true);
        expect(workResume.recipes[0].steps.length).toBe(count);
        count = 0;
        do {
            const result = iterators[1].next();
            if (result.done) {
                break;
            } else {
                expect(result.value[1]).toBe(workResume.recipes[1].steps[result.value[0].valueOf()]);
                count++;
            }
        } while (true);
        expect(workResume.recipes[1].steps.length).toBe(count);
        expect(results.length).toBe(3);
        expect(results).toContain("RESULTADO1" as any);
        expect(results).toContain("RESULTADO2" as any);
        expect(results).toContain("RESULTADO2_2" as any);
    });

    it("joinAndSort: ok", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        const workResume: IWorkResume = {
            maxParallelization: 1,
            recipes: [
                {
                    description: "teste",
                    name: "receita 1",
                    results: [ "RESULTADO1" as any ],
                    steps: [ {
                        name: "PASSO1_1",
                        startTime: 10
                    }, {
                        name: "PASSO1_2",
                        startTime: 5
                    }, {
                        name: "PASSO1_3",
                        startTime: 8
                    } ] as any[],
                },
                {
                    description: "teste",
                    name: "receita 2",
                    results: [ "RESULTADO2", "RESULTADO2_2" ] as any[],
                    steps: [ {
                        name: "PASSO2_1",
                        startTime: 2
                    }, {
                        name: "PASSO2_2",
                        startTime: 7
                    }, {
                        name: "PASSO2_3",
                        startTime: 9
                    } ] as any[]
                }
            ]
        };

        //Act
        const result = await target.joinAndSort(workResume);

        //Assert
        expect(result).toEqual([ {
            name: "PASSO2_1",
            startTime: 2
        }, {
            name: "PASSO1_2",
            startTime: 5
        }, {
            name: "PASSO2_2",
            startTime: 7
        }, {
            name: "PASSO1_3",
            startTime: 8
        }, {
            name: "PASSO2_3",
            startTime: 9
        }, {
            name: "PASSO1_1",
            startTime: 10
        } ] as any[]);
    });

    it("setStarttime: ok (dependencies undefined)", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        const step: IStep = {} as any;

        //Act
        await target.setStartTime(step, {} as any);

        //Assert
        expect(step.startTime).toBe(0);
    });

    it("setStarttime: ok (dependencies empty)", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        const step: IStep = { dependencies: [] } as any;

        //Act
        await target.setStartTime(step, {} as any);

        //Assert
        expect(step.startTime).toBe(0);
    });

    it("setStarttime: fail (startTime already defined)", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        const step: IStep = { dependencies: ["b"], startTime: 0 } as any;
        spyOn(target, "message");

        //Act
        await target.setStartTime(step, {} as any);

        //Assert
        expect(target.message).toHaveBeenCalledTimes(1);
    });

    it("setStarttime: fail (dependency not found)", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        const step: IStep = { dependencies: ["d"] } as any;
        const recipe:IRecipe = {
            description: "teste",
            name: "receita 1",
            results: [ "RESULTADO1" as any ],
            steps: [],
        };
        spyOn(target, "message");

        //Act
        await target.setStartTime(step, recipe);

        //Assert
        expect(target.message).toHaveBeenCalledTimes(1);
    });

    it("setStarttime: fail (startTime not setted on dependency)", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        const step: IStep = { dependencies: ["a"] } as any;
        const recipe:IRecipe = {
            description: "teste",
            name: "receita 1",
            results: [ "RESULTADO1" as any ],
            steps: [ {
                id: "a",
                name: "PASSO1_1"
            }] as any[],
        };
        spyOn(target, "message");

        //Act
        await target.setStartTime(step, recipe);

        //Assert
        expect(target.message).toHaveBeenCalledTimes(1);
    });

    it("setStarttime: ok", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        const step: IStep = { dependencies: ["a", "b"] } as any;
        const recipe:IRecipe = {
            description: "teste",
            name: "receita 1",
            results: [ "RESULTADO1" as any ],
            steps: [ {
                id: "a",
                name: "PASSO1_1",
                startTime: 1,
                duration: 3
            }, {
                id: "b",
                name: "PASSO1_1",
                startTime: 1,
                duration: 2
            }] as any[],
        };

        //Act
        await target.setStartTime(step, recipe);

        //Assert
        expect(step.startTime).toBe(4);
    });

    it("setStarttimes: fail (notification)", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        const recipes:IRecipe[] = [{
            description: "teste",
            name: "receita 1",
            results: [ "RESULTADO1" as any ],
            steps: [ {
                id: "a",
                name: "PASSO1_1",
                startTime: 1,
                duration: 3
            }] as any[],
        }, {
            description: "teste",
            name: "receita 2",
            results: [ "RESULTADO1" as any ],
            steps: [ {
                id: "a",
                name: "PASSO1_1",
                startTime: 1,
                duration: 3
            }, {
                id: "a",
                name: "PASSO1_1",
                startTime: 1,
                duration: 2
            }] as any[],
        }];
        const iterators = [ recipes[0].steps.entries(),
            recipes[1].steps.entries() ];
        spyOn(target, "hasNotification").and.returnValue(true);
        spyOn(target, "setStartTime");

        //Act
        await target.setStartTimes(1, iterators,recipes);

        //Assert
        expect(target.hasNotification).toHaveBeenCalledTimes(1);
        expect(target.setStartTime).toHaveBeenCalledTimes(1);
        expect(target.setStartTime).toHaveBeenCalledWith(recipes[0].steps[0], recipes[0]);
    });

    it("setStarttimes: ok", async () => {
        //Arrange
        const target = new OrganizeStepsService({} as any, {} as any, {} as any);
        const recipes:IRecipe[] = [{
            description: "teste",
            name: "receita 1",
            results: [ "RESULTADO1" as any ],
            steps: [ {
                id: "a",
                name: "PASSO1_1",
                startTime: 1,
                duration: 3
            }] as any[],
        }, {
            description: "teste",
            name: "receita 2",
            results: [ "RESULTADO1" as any ],
            steps: [ {
                id: "a",
                name: "PASSO1_1",
                startTime: 1,
                duration: 3
            }, {
                id: "b",
                name: "PASSO1_1",
                startTime: 1,
                duration: 2
            }] as any[],
        }];
        const iterators = [ recipes[0].steps.entries(),
            recipes[1].steps.entries() ];
        spyOn(target, "hasNotification").and.returnValue(false);
        spyOn(target, "setStartTime");

        //Act
        await target.setStartTimes(1, iterators,recipes);

        //Assert
        expect(target.hasNotification).toHaveBeenCalledTimes(3);
        expect(target.setStartTime).toHaveBeenCalledTimes(3);
        expect(target.setStartTime).toHaveBeenCalledWith(recipes[0].steps[0], recipes[0]);
        expect(target.setStartTime).toHaveBeenCalledWith(recipes[1].steps[0], recipes[1]);
    });
});