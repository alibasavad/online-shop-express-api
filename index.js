import mongoose from "mongoose";
import bodyParser from "body-parser";
import env from "./src/configs/env.json";

const express = require("express");
const errorHandler = require("./src/handlers/error-handler");
const routes = require("./src/routes/route");

const app = express();

// swagger

const swaggerui = require("swagger-ui-express");
import swaggerJSDoc from "swagger-jsdoc";

const swaggerdocs = swaggerJSDoc(env.SWAGGER_OPTIONS);

app.use("/api-docs", swaggerui.serve, swaggerui.setup(swaggerdocs));

// mongoDB

mongoose.Promise = global.Promise;
mongoose.connect(env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//  bodyParser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Under Developement :)...");
});

app.use("/api/v1/", routes);

app.use(errorHandler.errorHandler);

// show images

app.use("/api/v1/", express.static("public/images"));

app.use(errorHandler.notFound);

app.listen(env.PORT, () => {
  console.log(`\x1B[35mServer listening on port: ${env.PORT}`);
});

export default app;
