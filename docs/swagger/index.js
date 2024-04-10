const env = require("../../src/configs/env.json");
const express = require("express");
const app = express();

// swagger

const swaggerui = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerdocs = swaggerJSDoc(env.SWAGGER_OPTIONS);

app.use("/", swaggerui.serve, swaggerui.setup(swaggerdocs));

app.listen(env.SWAGGER_PORT, () => {
  console.log(`\x1B[35mServer listening on port: ${env.SWAGGER_PORT}`);
});
