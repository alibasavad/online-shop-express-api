import app from "../index";
import request from "supertest";
import { getAccessToken } from "./test-utils/token";
import { errorCodes } from "../src/constants/errors";
import { messageCodes } from "../src/constants/messages";
import Category from "../src/models/category";

const accessToken = getAccessToken();

describe("/categories.GET", () => {
  describe("read all categories", () => {
    test("response status code should be 200 ", async () => {
      const response = await request(app)
        .get("/api/v1/categories")
        .query({ page: 1 });
      expect(response.statusCode).toBe(200);
    });

    test("respond should be json type", async () => {
      const response = await request(app)
        .get("/api/v1/categories")
        .query({ page: 1 });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    test("response must contain _id, name, thumbnail, description, createdAt and updatedAt", async () => {
      const response = await request(app)
        .get("/api/v1/categories")
        .query({ page: 1 });

      expect(Object.keys(response.body.result[0])).toContain("_id");
      expect(Object.keys(response.body.result[0])).toContain("name");
      expect(Object.keys(response.body.result[0])).toContain("thumbnail");
      expect(Object.keys(response.body.result[0])).toContain("description");
      expect(Object.keys(response.body.result[0])).toContain("createdAt");
      expect(Object.keys(response.body.result[0])).toContain("updatedAt");
    });
  });
});

describe("/category.POST", () => {
  describe("create a new category", () => {
    let response;
    test("response status code should be 200", async () => {
      response = await request(app)
        .post("/api/v1/category")
        .send({
          name: "Test 01",
          description: "New Category",
          thumbnail: "1699220385727-banana.png",
        })
        .set({ Authorization: await accessToken });

      expect(response.statusCode).toBe(200);
    });

    test("respond should be json type", async () => {
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    test("response must contain _id, name, thumbnail, description, createdAt and updatedAt", async () => {
      expect(Object.keys(response.body.result)).toContain("_id");
      expect(Object.keys(response.body.result)).toContain("name");
      expect(Object.keys(response.body.result)).toContain("thumbnail");
      expect(Object.keys(response.body.result)).toContain("description");
      expect(Object.keys(response.body.result)).toContain("createdAt");
      expect(Object.keys(response.body.result)).toContain("updatedAt");
    });
  });

  describe("errors", () => {
    describe("Invalid name", () => {
      let response;

      test(`statusCode be : ${errorCodes[306][1]}`, async () => {
        response = await request(app)
          .post("/api/v1/category")
          .send({
            name: "Test !01",
            description: "New Category",
            thumbnail: "1699220385727-banana.png",
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
          .post("/api/v1/category")
          .send({
            name: "Test 01",
            description: "New Category",
            thumbnail: "1699220385727-banana.png",
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
  });
});

describe("/category/:Id.GET", () => {
  let category;
  describe("get category by id", () => {
    let response;

    test(`statusCode be : 200}`, async () => {
      category = await Category.findOne({ name: "Test 01" });

      response = await request(app)
        .get(`/api/v1/category/${category._id}`)
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
          .get(`/api/v1/category/${category._id}12`)
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

describe("/category/:Id.PATCH", () => {
  let category;
  describe("update category", () => {
    let response;

    test(`statusCode be : 200}`, async () => {
      category = await Category.findOne({ name: "Test 01" });
      response = await request(app)
        .patch(`/api/v1/category/${category._id}`)
        .send({
          name: "Test 01",
          description: "updated Category",
        })
        .set({ Authorization: await accessToken });
      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[103]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[103])
      );
    });
  });

  describe("ERROR : ", () => {
    describe("Invalid ID Input", () => {
      let response;

      test(`statusCode be : ${errorCodes[300][1]}`, async () => {
        response = await request(app)
          .patch(`/api/v1/category/${category._id}12`)
          .send({
            name: "Test 01",
            description: "updated Category",
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

    describe("Invalid Name", () => {
      let response;

      test(`statusCode be : ${errorCodes[306][1]}`, async () => {
        response = await request(app)
          .patch(`/api/v1/category/${category._id}`)
          .send({
            name: "Test #01",
            description: "updated Category",
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
  });
});

describe("/category/thumbnail/:Id.PATCH", () => {
  let category;
  describe("update category thumbnail", () => {
    let response;

    test(`statusCode be : 200}`, async () => {
      category = await Category.findOne({ name: "Test 01" });
      response = await request(app)
        .patch(`/api/v1/category/thumbnail/${category._id}`)
        .send({
          thumbnail: "example.png",
        })
        .set({ Authorization: await accessToken });
      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[103]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[103])
      );
    });
  });

  describe("ERROR : ", () => {
    describe("Invalid ID Input", () => {
      let response;

      test(`statusCode be : ${errorCodes[300][1]}`, async () => {
        response = await request(app)
          .patch(`/api/v1/category/thumbnail/${category._id}12`)
          .send({
            thumbnail: "example.png",
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

describe("/category.DELETE/:Id", () => {
  let category;
  describe("disable category", () => {
    let response;

    test(`statusCode be : 200}`, async () => {
      category = await Category.findOne({ name: "Test 01" });

      response = await request(app)
        .delete(`/api/v1/category/${category._id}`)
        .set({ Authorization: await accessToken });
      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[102]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[102])
      );
    });
  });

  describe("ERROR : ", () => {
    describe("Already disabled category", () => {
      let response;

      test(`statusCode be : ${errorCodes[325][1]}`, async () => {
        response = await request(app)
          .delete(`/api/v1/category/${category._id}`)
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
          .delete(`/api/v1/category/${category._id}12`)
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

describe("/disable-categories.GET", () => {
  describe("get disabled categories", () => {
    let response;

    test(`statusCode be : 200}`, async () => {
      response = await request(app)
        .get(`/api/v1/disable-categories`)
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

describe("/category/enable/:Id.POST", () => {
  let category;
  describe("enable category", () => {
    let response;

    test(`statusCode be : 200}`, async () => {
      category = await Category.findOne({ name: "Test 01" });
      response = await request(app)
        .post(`/api/v1/category/enable/${category._id}`)
        .set({ Authorization: await accessToken });
      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[105]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[105])
      );
    });
  });

  describe("ERROR : ", () => {
    describe("Invalid ID Input", () => {
      let response;

      test(`statusCode be : ${errorCodes[300][1]}`, async () => {
        response = await request(app)
          .post(`/api/v1/category/enable/${category._id}12`)
          .set({ Authorization: await accessToken });
        expect(response.statusCode).toBe(errorCodes[300][1]);
      });

      test(`message be : ${errorCodes[300][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[300][0])
        );
      });
    });

    describe("Already enabled category", () => {
      let response;

      test(`statusCode be : ${errorCodes[326][1]}`, async () => {
        response = await request(app)
          .post(`/api/v1/category/enable/${category._id}`)
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

describe("/category/force_delete/:Id.DELETE", () => {
  let category;
  describe("delete category", () => {
    let response;

    test(`statusCode be : 200}`, async () => {
      category = await Category.findOne({ name: "Test 01" });

      response = await request(app)
        .delete(`/api/v1/category/force_delete/${category._id}`)
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
          .delete(`/api/v1/category/force_delete/${category._id}`)
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
