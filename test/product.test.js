import app from "../index";
import request from "supertest";
import { getAccessToken } from "./test-utils/token";
import { errorCodes } from "../src/constants/errors";
import { messageCodes } from "../src/constants/messages";
import Product from "../src/models/product";

const accessToken = getAccessToken();

describe("/products.GET", () => {
    describe("read all products", () => {
        let response;

        test("response status code should be 200 ", async () => {
            response = await request(app)
                .get("/api/v1/products")
                .query({ page: 1 });
            expect(response.statusCode).toBe(200);
        });

        test("respond should be json type", async () => {
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json")
            );
        });

        test("response must contain _id, name, price, quantity, categories, image, thumbnail, description, createdAt and updatedAt", async () => {
            expect(Object.keys(response.body.result[0])).toContain("_id");
            expect(Object.keys(response.body.result[0])).toContain("name");
            expect(Object.keys(response.body.result[0])).toContain("price");
            expect(Object.keys(response.body.result[0])).toContain("quantity");
            expect(Object.keys(response.body.result[0])).toContain(
                "categories"
            );
            expect(Object.keys(response.body.result[0])).toContain("thumbnail");
            expect(Object.keys(response.body.result[0])).toContain("createdAt");
            expect(Object.keys(response.body.result[0])).toContain("updatedAt");
        });
    });
});

describe("/product.POST", () => {
    describe("create a new product", () => {
        let response;
        test("response status code should be 200", async () => {
            response = await request(app)
                .post("/api/v1/product")
                .send({
                    name: "Test 01",
                    price: 5000,
                    quantity: 700,
                    description: "new Product Test",
                    categoryId: ["6536dd8437c6fde975c59915"],
                    images: ["1698182686465-ice.png"],
                })
                .set({ Authorization: await accessToken });

            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[106]}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[106])
            );
        });
    });

    describe("Error", () => {
        describe("Invalid name", () => {
            let response;

            test(`statusCode be : ${errorCodes[306][1]}`, async () => {
                response = await request(app)
                    .post("/api/v1/product")
                    .send({
                        name: "Test !01",
                        price: 5000,
                        quantity: 700,
                        description: "new Product Test",
                        categoryId: ["6536dd8437c6fde975c59915"],
                        images: ["1698182686465-ice.png"],
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[306][1]);
            });

            test(`message be : ${errorCodes[306][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[306][0])
                );
            });
        });

        describe("MONGO_SERVER_ERROR", () => {
            let response;

            test(`statusCode be : ${errorCodes[303][1]}`, async () => {
                response = await request(app)
                    .post("/api/v1/product")
                    .send({
                        name: "Test 01",
                        price: 5000,
                        quantity: 700,
                        description: "new Product Test",
                        categoryId: ["6536dd8437c6fde975c59915"],
                        images: ["1698182686465-ice.png"],
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[303][1]);
            });

            test(`message be : ${errorCodes[303][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[303][0])
                );
            });
        });

        describe("Invalid category id", () => {
            let response;

            test(`statusCode be : ${errorCodes[304][1]}`, async () => {
                response = await request(app)
                    .post("/api/v1/product")
                    .send({
                        name: "Test 01",
                        price: 5000,
                        quantity: 700,
                        description: "new Product Test",
                        categoryId: ["6536dd2437c6fde975c59915"],
                        images: ["1698182686465-ice.png"],
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[304][1]);
            });

            test(`message be : ${errorCodes[304][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[304][0])
                );
            });
        });
    });
});

describe("/product/:Id.GET", () => {
    let product;
    describe("get product by id", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            product = await Product.findOne({ name: "Test 01" });

            response = await request(app)
                .get(`/api/v1/product/${product._id}`)
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[100]}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[100])
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Invalid ID Input", () => {
            let response;

            test(`statusCode be : ${errorCodes[300][1]}`, async () => {
                response = await request(app)
                    .get(`/api/v1/product/${product._id}12`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[300][1]);
            });

            test(`message be : ${errorCodes[300][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[300][0])
                );
            });
        });
    });
});

describe("/product/:Id.PATCH", () => {
    let product;
    describe("update product", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            product = await Product.findOne({ name: "Test 01" });
            response = await request(app)
                .patch(`/api/v1/product/${product._id}`)
                .send({
                    name: "Test 01",
                    price: 222,
                    quantity: 145,
                    description: "updated product",
                })
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[108]}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[108])
            );
        });
    });

    describe("Error", () => {
        describe("Invalid name", () => {
            let response;

            test(`statusCode be : ${errorCodes[306][1]}`, async () => {
                response = await request(app)
                    .patch(`/api/v1/product/${product._id}`)
                    .send({
                        name: "Test !01",
                        price: 222,
                        quantity: 145,
                        description: "updated product",
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[306][1]);
            });

            test(`message be : ${errorCodes[306][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[306][0])
                );
            });
        });

        describe("Invalid category id", () => {
            let response;

            test(`statusCode be : ${errorCodes[304][1]}`, async () => {
                response = await request(app)
                    .patch(`/api/v1/product/${product._id}`)
                    .send({
                        name: "Test 01",
                        price: 222,
                        categoryId: ["6536dd4437c6fde975c59915"],
                        quantity: 145,
                        description: "updated product",
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[304][1]);
            });

            test(`message be : ${errorCodes[304][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[304][0])
                );
            });
        });
    });
});

describe("/product/images/:Id.PATCH", () => {
    let product;
    describe("update product images", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            product = await Product.findOne({ name: "Test 01" });
            response = await request(app)
                .patch(`/api/v1/product/images/${product._id}`)
                .send({
                    images: ["example.png"],
                })
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[108]}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[108])
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Invalid ID Input", () => {
            let response;

            test(`statusCode be : ${errorCodes[300][1]}`, async () => {
                response = await request(app)
                    .patch(`/api/v1/product/images/${product._id}12`)
                    .send({
                        images: ["example.png"],
                    })
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[300][1]);
            });

            test(`message be : ${errorCodes[300][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[300][0])
                );
            });
        });
    });
});

describe("/product.DELETE/:Id", () => {
    let product;
    describe("disable product", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            product = await Product.findOne({ name: "Test 01" });

            response = await request(app)
                .delete(`/api/v1/product/${product._id}`)
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[107]}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[107])
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Already disabled product", () => {
            let response;

            test(`statusCode be : ${errorCodes[325][1]}`, async () => {
                response = await request(app)
                    .delete(`/api/v1/product/${product._id}`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[325][1]);
            });

            test(`message be : ${errorCodes[325][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[325][0])
                );
            });
        });

        describe("Invalid ID Input", () => {
            let response;

            test(`statusCode be : ${errorCodes[300][1]}`, async () => {
                response = await request(app)
                    .delete(`/api/v1/product/${product._id}12`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[300][1]);
            });

            test(`message be : ${errorCodes[300][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[300][0])
                );
            });
        });
    });
});

describe("/disable-products.GET", () => {
    describe("get disabled products", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            response = await request(app)
                .get(`/api/v1/disable-products`)
                .query({ page: 1 })
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[100]}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[100])
            );
        });
    });
});

describe("/product/enable/:Id.POST", () => {
    let product;
    describe("enable product", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            product = await Product.findOne({ name: "Test 01" });
            response = await request(app)
                .post(`/api/v1/product/enable/${product._id}`)
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[110]}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[110])
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Invalid ID Input", () => {
            let response;

            test(`statusCode be : ${errorCodes[300][1]}`, async () => {
                response = await request(app)
                    .post(`/api/v1/product/enable/${product._id}12`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[300][1]);
            });

            test(`message be : ${errorCodes[300][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[300][0])
                );
            });
        });

        describe("Already enabled product", () => {
            let response;

            test(`statusCode be : ${errorCodes[326][1]}`, async () => {
                response = await request(app)
                    .post(`/api/v1/product/enable/${product._id}`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[326][1]);
            });

            test(`message be : ${errorCodes[326][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[326][0])
                );
            });
        });
    });
});

describe("/product/force_delete/:Id.DELETE", () => {
    let product;
    describe("delete product", () => {
        let response;

        test(`statusCode be : 200}`, async () => {
            product = await Product.findOne({ name: "Test 01" });

            response = await request(app)
                .delete(`/api/v1/product/force_delete/${product._id}`)
                .set({ Authorization: await accessToken });
            expect(response.statusCode).toBe(200);
        });

        test(`message be : ${messageCodes[132]}`, async () => {
            expect(response.body.message).toEqual(
                expect.stringContaining(messageCodes[132])
            );
        });
    });

    describe("ERROR : ", () => {
        describe("Invalid ID Input", () => {
            let response;

            test(`statusCode be : ${errorCodes[300][1]}`, async () => {
                response = await request(app)
                    .delete(`/api/v1/product/force_delete/${product._id}`)
                    .set({ Authorization: await accessToken });
                expect(response.statusCode).toBe(errorCodes[300][1]);
            });

            test(`message be : ${errorCodes[300][0]}`, () => {
                expect(response.body.message).toEqual(
                    expect.stringContaining(errorCodes[300][0])
                );
            });
        });
    });
});
