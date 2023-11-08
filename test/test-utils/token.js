import app from "../../index";
import request from "supertest";

export const getAccessToken = async () => {
  const response = await request(app).post("/api/v1/login").send({
    email: "test@test.com",
    password: "Pass1234",
  });

  let token = "bearer " + response.body.accessToken.token;

  return token;
};
