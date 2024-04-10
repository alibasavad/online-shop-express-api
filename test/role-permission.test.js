import app from "../index";
import request from "supertest";
import { getAccessToken } from "./test-utils/token";
import { errorCodes } from "../src/constants/errors";
import { messageCodes } from "../src/constants/messages";
import Role from "../src/models/role";

const accessToken = getAccessToken();

describe("/roles.GET", () => {
    describe("get all roles", () => {
        let response;
        test("response status code should be 200", async () => {
            response = await request(app)
                .get("/api/v1/roles")
                .set({ Authorization: await accessToken });

            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[100].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[100].message)
            );
        });
    });
});

describe("/role.POST", () => {
    describe("create a new role", () => {
        let response;
        test("response status code should be 200", async () => {
            response = await request(app)
                .post("/api/v1/role")
                .send({
                    name: "Test 01",
                    permissions: [
                        "product.post",
                        "product/:Id.patch",
                        "product/:Id.delete",
                    ],
                })
                .set({ Authorization: await accessToken });

            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[111].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[111].message)
            );
        });
    });

    describe("Error", () => {
        describe("Invalid name", () => {
            let response;

            test(`statusCode be : ${errorCodes[306].code}`, async () => {
                response = await request(app)
                    .post("/api/v1/role")
                    .send({
                        name: "Test !01",
                        permissions: [
                            "product.post",
                            "product/:Id.patch",
                            "product/:Id.delete",
                        ],
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[306].code);
            });

            test(`message be : ${errorCodes[306].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[306].message)
                );
            });
        });

        describe("MONGO_SERVER_ERROR", () => {
            let response;

            test(`statusCode be : ${errorCodes[303].code}`, async () => {
                response = await request(app)
                    .post("/api/v1/role")
                    .send({
                        name: "Test 01",
                        permissions: [
                            "product.post",
                            "product/:Id.patch",
                            "product/:Id.delete",
                        ],
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[303].code);
            });

            test(`message be : ${errorCodes[303].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[303].message)
                );
            });
        });

        describe("Invalid permission list", () => {
            let response;

            test(`statusCode be : ${errorCodes[310].code}`, async () => {
                response = await request(app)
                    .post("/api/v1/role")
                    .send({
                        name: "Test 01",
                        permissions: ["invalid.post"],
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[310].code);
            });

            test(`message be : ${errorCodes[310].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[310].message)
                );
            });
        });
    });
});

describe("/role/:Id.GET", () => {
    let role;
    describe("get role by id", () => {
        let response;
        test("response status code should be 200", async () => {
            role = await Role.findOne({ name: "Test 01" });
            response = await request(app)
                .get(`/api/v1/role/${role._id}`)
                .set({ Authorization: await accessToken });

            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[100].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[100].message)
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Invalid ID Input", () => {
            let response;

            test(`statusCode be : ${errorCodes[300].code}`, async () => {
                response = await request(app)
                    .get(`/api/v1/role/${role._id}12`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[300].code);
            });

            test(`message be : ${errorCodes[300].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[300].message)
                );
            });
        });
    });
});

describe("/role/:Id.PATCH", () => {
    let role;
    describe("update role", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            role = await Role.findOne({ name: "Test 01" });
            response = await request(app)
                .patch(`/api/v1/role/${role._id}`)
                .send({
                    permissions: [
                        "product.post",
                        "product/:Id.patch",
                        "product/:Id.delete",
                        "category.post",
                    ],
                })
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[114].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[114].message)
            );
        });
    });

    describe("Error", () => {
        describe("Invalid permission list", () => {
            let response;

            test(`statusCode be : ${errorCodes[310].code}`, async () => {
                response = await request(app)
                    .patch(`/api/v1/role/${role._id}`)
                    .send({
                        permissions: ["invalid.post"],
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[310].code);
            });

            test(`message be : ${errorCodes[310].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[310].message)
                );
            });
        });
    });
});

describe("/role.DELETE/:Id", () => {
    let role;
    describe("disable role", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            role = await Role.findOne({ name: "Test 01" });

            response = await request(app)
                .delete(`/api/v1/role/${role._id}`)
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[115].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[115].message)
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Already disabled role", () => {
            let response;

            test(`statusCode be : ${errorCodes[325].code}`, async () => {
                response = await request(app)
                    .delete(`/api/v1/role/${role._id}`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[325].code);
            });

            test(`message be : ${errorCodes[325].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[325].message)
                );
            });
        });

        describe("Invalid ID Input", () => {
            let response;

            test(`statusCode be : ${errorCodes[300].code}`, async () => {
                response = await request(app)
                    .delete(`/api/v1/role/${role._id}12`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[300].code);
            });

            test(`message be : ${errorCodes[300].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[300].message)
                );
            });
        });
    });
});

describe("/permissions.GET", () => {
    describe("get all permissions", () => {
        let response;
        test("response status code should be 200", async () => {
            response = await request(app)
                .get("/api/v1/permissions")
                .set({ Authorization: await accessToken });

            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[100].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[100].message)
            );
        });
    });
});

describe("/disable-roles.GET", () => {
    describe("get disabled roles", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            response = await request(app)
                .get(`/api/v1/disable-roles`)
                .query({ page: 1 })
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[100].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[100].message)
            );
        });
    });
});

describe("/role/enable/:Id.POST", () => {
    let role;
    describe("enable role", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            role = await Role.findOne({ name: "Test 01" });
            response = await request(app)
                .post(`/api/v1/role/enable/${role._id}`)
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[116].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[116].message)
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Invalid ID Input", () => {
            let response;

            test(`statusCode be : ${errorCodes[300].code}`, async () => {
                response = await request(app)
                    .post(`/api/v1/role/enable/${role._id}12`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[300].code);
            });

            test(`message be : ${errorCodes[300].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[300].message)
                );
            });
        });

        describe("Already enabled role", () => {
            let response;

            test(`statusCode be : ${errorCodes[326].code}`, async () => {
                response = await request(app)
                    .post(`/api/v1/role/enable/${role._id}`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[326].code);
            });

            test(`message be : ${errorCodes[326].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[326].message)
                );
            });
        });
    });
});

describe("/user_role/add.PATCH", () => {
    let user = "654aae81fae769161ce33a7e";
    let role;
    describe("add role to user", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            role = await Role.findOne({ name: "Test 01" });

            response = await request(app)
                .patch(`/api/v1/user_role/add`)
                .send({
                    userId: user,
                    role: role.name,
                })
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[113].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[113].message)
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Incorrect Role or User Id", () => {
            let response;

            test(`statusCode be : ${errorCodes[311].code}`, async () => {
                response = await request(app)
                    .patch(`/api/v1/user_role/add`)
                    .send({
                        userId: "624aae81fae769161ce33a7e",
                        role: "role.name",
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[311].code);
            });

            test(`message be : ${errorCodes[311].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[311].message)
                );
            });
        });
    });
});

describe("/user_role/change.PATCH", () => {
    let user = "654aae81fae769161ce33a7e";
    let role;
    describe("change user role", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            role = await Role.findOne({ name: "Test 01" });
            response = await request(app)
                .patch(`/api/v1/user_role/change`)
                .send({
                    userId: user,
                    role: role.name,
                })
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[112].message}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[112].message)
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Incorrect Role or User Id", () => {
            let response;

            test(`statusCode be : ${errorCodes[311].code}`, async () => {
                await role.deleteOne();
                response = await request(app)
                    .patch(`/api/v1/user_role/change`)
                    .send({
                        userId: "624aae81fae769161ce33a7e",
                        role: "role.name",
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[311].code);
            });

            test(`message be : ${errorCodes[311].message}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[311].message)
                );
            });
        });
    });
});
