import app from "../index";
import request from "supertest";

describe("/categories.GET", () => {
  describe("read all categories", () => {
    // return a json consist of enable categoris
    // show _id , name , thumbnail , description , createdAt , updatedAt
    // responce status code be 200

    test("responce status code should be 200 ", async () => {
      const response = await request(app).get("/api/v1/categories");
      expect(response.statusCode).toBe(200);
    });

    test("respond should be json type" , async () => {
        const response = await request(app).get("/api/v1/categories");
        console.log(response);
        expect(response.headers['content-type']).toEqual(expect.stringContaining("json"))
    })
  });
});
