import app from "../index";
import request from "supertest";
import { getAccessToken } from "./test-utils/token";
import { errorCodes } from "../src/constants/errors";
import { messageCodes } from "../src/constants/messages";
import User from "../src/models/user";

const accessToken = getAccessToken();
var refreshToken; 
var token;

describe("/register.POST", () => {
  describe("register a new user", () => {
    let response;

    test("response status code should be 200", async () => {
      response = await request(app).post("/api/v1/register").send({
        firstName: "TEST",
        lastName: "TEST",
        email: "test1@test.com",
        phoneNumber: "09123456789",
        password: "Pass1234",
      });

      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[117]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[117])
      );
    });
  });

  describe("Error", () => {
    describe("Alpha regex error", () => {
      let response;

      test(`statusCode be : ${errorCodes[306][1]}`, async () => {
        response = await request(app).post("/api/v1/register").send({
          firstName: "T@EST",
          lastName: "TE3ST",
          email: "test1@test.com",
          phoneNumber: "09123456789",
          password: "Pass1234",
        });
        expect(response.statusCode).toBe(errorCodes[306][1]);
      });

      test(`message be : ${errorCodes[306][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[306][0])
        );
      });
    });

    describe("phone number regex error", () => {
      let response;

      test(`statusCode be : ${errorCodes[306][1]}`, async () => {
        response = await request(app).post("/api/v1/register").send({
          firstName: "TEST",
          lastName: "TEST",
          email: "test1@test.com",
          phoneNumber: "02123456789",
          password: "Pass1234",
        });
        expect(response.statusCode).toBe(errorCodes[306][1]);
      });

      test(`message be : ${errorCodes[306][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[306][0])
        );
      });
    });

    describe("password regex error", () => {
      let response;

      test(`statusCode be : ${errorCodes[306][1]}`, async () => {
        response = await request(app).post("/api/v1/register").send({
          firstName: "TEST",
          lastName: "TEST",
          email: "test1@test.com",
          phoneNumber: "09123456789",
          password: "www",
        });
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
        response = await request(app).post("/api/v1/register").send({
          firstName: "TEST",
          lastName: "TEST",
          email: "test1@test.com",
          phoneNumber: "09123456789",
          password: "Pass1234",
        });
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

describe("/verify.POST", () => {
  let user;

  describe("verify user", () => {
    let response;

    test("response should contain tokens", async () => {
      user = await User.findOne({ email: "test1@test.com" });
      response = await request(app).post("/api/v1/verify").send({
        email: user.email,
        password: "Pass1234",
        verificationCode: user.verificationCode.code,
      });

      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(Object.keys(response.body)).toContain("accessToken");
      expect(Object.keys(response.body)).toContain("refreshToken");
    });
  });

  describe("Error", () => {
    describe("wrong email or password", () => {
      let response;

      test(`statusCode be : ${errorCodes[317][1]}`, async () => {
        response = await request(app).post("/api/v1/verify").send({
          email: "invalid@email.com",
          password: "Pass12dd34",
          verificationCode: user.verificationCode.code,
        });
        expect(response.statusCode).toBe(errorCodes[317][1]);
      });

      test(`message be : ${errorCodes[317][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[317][0])
        );
      });
    });

    describe("User already verified", () => {
      let response;

      test(`statusCode be : ${errorCodes[319][1]}`, async () => {
        response = await request(app).post("/api/v1/verify").send({
          email: user.email,
          password: "Pass1234",
          verificationCode: user.verificationCode.code,
        });
        expect(response.statusCode).toBe(errorCodes[319][1]);
      });

      test(`message be : ${errorCodes[319][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[319][0])
        );
      });
    });
  });
});

describe("/login.POST", () => {
  let user;
  describe("login", () => {
    let response;

    test("response should contain tokens", async () => {
      user = await User.findOne({ email: "test1@test.com" });
      response = await request(app).post("/api/v1/login").send({
        email: user.email,
        password: "Pass1234",
      });

      refreshToken = response.body.refreshToken.token;

      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(Object.keys(response.body)).toContain("accessToken");
      expect(Object.keys(response.body)).toContain("refreshToken");
    });
  });

  describe("Error", () => {
    describe("wrong email or password", () => {
      let response;

      test(`statusCode be : ${errorCodes[317][1]}`, async () => {
        response = await request(app).post("/api/v1/login").send({
          email: "invalid@email.com",
          password: "Pass12dd34",
        });
        expect(response.statusCode).toBe(errorCodes[317][1]);
      });

      test(`message be : ${errorCodes[317][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[317][0])
        );
      });
    });
  });
});

describe("/generate_token.POST", () => {
  describe("generate access token", () => {
    let response;

    test("response should contain token", async () => {
      response = await request(app)
        .post("/api/v1/generate_token")
        .set({ Authorization: "bearer " + refreshToken });

      token = response.body.accessToken.token;
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
      expect(Object.keys(response.body)).toContain("accessToken");
    });
  });

  describe("Error", () => {
    describe("wrong token", () => {
      let response;

      test(`statusCode be : ${errorCodes[315][1]}`, async () => {
        response = await request(app).post("/api/v1/generate_token");

        expect(response.statusCode).toBe(errorCodes[315][1]);
      });

      test(`message be : ${errorCodes[315][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[315][0])
        );
      });
    });
  });
});

describe("/logout.POST", () => {
  describe("register a new user", () => {
    let response;

    test("response status code should be 200", async () => {
      response = await request(app)
        .post("/api/v1/logout")
        .set({ Authorization: "bearer " + token });

      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[131]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[131])
      );
    });
  });

  describe("Error : ", () => {
    describe("wrong token", () => {
      let response;

      test(`statusCode be : ${errorCodes[315][1]}`, async () => {
        response = await request(app).post("/api/v1/logout");

        expect(response.statusCode).toBe(errorCodes[315][1]);
      });

      test(`message be : ${errorCodes[315][0]}`, async () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[315][0])
        );
      });
    });
  });
});

describe("/disable_account.POST", () => {
  let user;
  describe("disable account", () => {
    let response;

    test("response status code should be 200", async () => {
      user = await User.findOne({ email: "test1@test.com" });
      response = await request(app).post("/api/v1/disable_account").send({
        email: user.email,
        password: "Pass1234",
      });

      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[118]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[118])
      );
    });
  });

  describe("Error", () => {
    describe("wrong email or password", () => {
      let response;

      test(`statusCode be : ${errorCodes[317][1]}`, async () => {
        response = await request(app).post("/api/v1/disable_account").send({
          email: "invalid@email.com",
          password: "Pass12dd34",
        });
        expect(response.statusCode).toBe(errorCodes[317][1]);
      });

      test(`message be : ${errorCodes[317][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[317][0])
        );
      });
    });
  });
});

describe("/verification_code.POST", () => {
  let user;
  describe("send verification code", () => {
    let response;

    test("response status code should be 200", async () => {
      user = await User.findOne({ email: "test1@test.com" });
      user.verificationCode.expiresAt = 1;
      await user.save();
      response = await request(app).post("/api/v1/verification_code").send({
        email: user.email,
        password: "Pass1234",
      });

      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[121]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[121])
      );
    });
  });

  describe("Error", () => {
    describe("wrong email or password", () => {
      let response;

      test(`statusCode be : ${errorCodes[317][1]}`, async () => {
        response = await request(app).post("/api/v1/verification_code").send({
          email: "invalid@email.com",
          password: "Pass12dd34",
        });
        expect(response.statusCode).toBe(errorCodes[317][1]);
      });

      test(`message be : ${errorCodes[317][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[317][0])
        );
      });
    });

    describe("Too many request", () => {
      let response;

      test(`statusCode be : ${errorCodes[321][1]}`, async () => {
        response = await request(app).post("/api/v1/verification_code").send({
          email: user.email,
          password: "Pass1234",
        });
        expect(response.statusCode).toBe(errorCodes[321][1]);
      });

      test(`message be : ${errorCodes[321][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[321][0])
        );
      });
    });
  });
});

describe("/forget_password.POST", () => {
  let user;
  describe("send temporary password to email", () => {
    let response;

    test("response status code should be 200", async () => {
      user = await User.findOne({ email: "test1@test.com" });
      response = await request(app).post("/api/v1/forget_password").send({
        email: user.email,
      });

      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[124]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[124])
      );
    });
  });

  describe("Error", () => {
    describe("wrong email", () => {
      let response;

      test(`statusCode be : ${errorCodes[300][1]}`, async () => {
        response = await request(app).post("/api/v1/forget_password").send({
          email: "invalid@email.com",
        });
        expect(response.statusCode).toBe(errorCodes[300][1]);
      });

      test(`message be : ${errorCodes[300][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[300][0])
        );
      });
    });

    describe("Too many request", () => {
      let response;

      test(`statusCode be : ${errorCodes[321][1]}`, async () => {
        response = await request(app).post("/api/v1/forget_password").send({
          email: user.email,
        });
        await user.deleteOne();
        expect(response.statusCode).toBe(errorCodes[321][1]);
      });

      test(`message be : ${errorCodes[321][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[321][0])
        );
      });
    });
  });
});

describe("/users.GET", () => {
  describe("get all users", () => {
    let response;

    test("response status code should be 200", async () => {
      response = await request(app)
        .get("/api/v1/users")
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

describe("/profile.GET", () => {
  describe("get user profile", () => {
    let response;

    test("response status code should be 200", async () => {
      response = await request(app)
        .get("/api/v1/profile")
        .set({ Authorization: await accessToken });

      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[100]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[100])
      );
    });
  });

  describe("Error", () => {
    describe("not authenticated", () => {
      let response;

      test(`statusCode be : ${errorCodes[328][1]}`, async () => {
        response = await request(app).get("/api/v1/profile");
        expect(response.statusCode).toBe(errorCodes[328][1]);
      });

      test(`message be : ${errorCodes[328][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[328][0])
        );
      });
    });
  });
});

describe("/profile.PATCH", () => {
  describe("update user profile", () => {
    let response;

    test("response status code should be 200", async () => {
      response = await request(app)
        .patch("/api/v1/profile")
        .send({
          firstName: "Test",
        })
        .set({ Authorization: await accessToken });

      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[122]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[122])
      );
    });
  });

  describe("Error", () => {
    describe("not authenticated", () => {
      let response;

      test(`statusCode be : ${errorCodes[328][1]}`, async () => {
        response = await request(app).patch("/api/v1/profile").send({
          firstName: "Test",
        });
        expect(response.statusCode).toBe(errorCodes[328][1]);
      });

      test(`message be : ${errorCodes[328][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[328][0])
        );
      });
    });

    describe("Alpha regex error", () => {
      let response;

      test(`statusCode be : ${errorCodes[306][1]}`, async () => {
        response = await request(app)
          .patch("/api/v1/profile")
          .send({
            firstName: "Te!st",
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

    describe("phone number regex error", () => {
      let response;

      test(`statusCode be : ${errorCodes[306][1]}`, async () => {
        response = await request(app)
          .patch("/api/v1/profile")
          .send({
            firstName: "Test",
            phoneNumber: "01251",
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

describe("/profile/change_password.PATCH", () => {
  describe("update user password", () => {
    let response;

    test("response status code should be 200", async () => {
      response = await request(app)
        .patch("/api/v1/profile/change_password")
        .send({
          currentPass: "Pass1234",
          newPass: "Pass1234",
          newPassRepeat: "Pass1234",
        })
        .set({ Authorization: await accessToken });

      expect(response.statusCode).toBe(200);
    });

    test(`message be : ${messageCodes[123]}`, async () => {
      expect(response.body.message).toEqual(
        expect.stringContaining(messageCodes[123])
      );
    });
  });

  describe("Error", () => {
    describe("not authenticated", () => {
      let response;

      test(`statusCode be : ${errorCodes[328][1]}`, async () => {
        response = await request(app)
          .patch("/api/v1/profile/change_password")
          .send({
            currentPass: "Pass1234",
            newPass: "Pass1234",
            newPassRepeat: "Pass1234",
          });
        expect(response.statusCode).toBe(errorCodes[328][1]);
      });

      test(`message be : ${errorCodes[328][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[328][0])
        );
      });
    });

    describe("password regex error", () => {
      let response;

      test(`statusCode be : ${errorCodes[306][1]}`, async () => {
        response = await request(app)
          .patch("/api/v1/profile/change_password")
          .send({
            currentPass: "Pass1234",
            newPass: "www",
            newPassRepeat: "www",
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

    describe("wrong repeat password", () => {
      let response;

      test(`statusCode be : ${errorCodes[323][1]}`, async () => {
        response = await request(app)
          .patch("/api/v1/profile/change_password")
          .send({
            currentPass: "Pass1234",
            newPass: "Pass1234",
            newPassRepeat: "Pass123411",
          })
          .set({ Authorization: await accessToken });
        expect(response.statusCode).toBe(errorCodes[323][1]);
      });

      test(`message be : ${errorCodes[323][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[323][0])
        );
      });
    });

    describe("incorrect current password", () => {
      let response;

      test(`statusCode be : ${errorCodes[322][1]}`, async () => {
        response = await request(app)
          .patch("/api/v1/profile/change_password")
          .send({
            currentPass: "Pass123412",
            newPass: "www",
            newPassRepeat: "www",
          })
          .set({ Authorization: await accessToken });
        expect(response.statusCode).toBe(errorCodes[322][1]);
      });

      test(`message be : ${errorCodes[322][0]}`, () => {
        expect(response.body.message).toEqual(
          expect.stringContaining(errorCodes[322][0])
        );
      });
    });
  });
});
