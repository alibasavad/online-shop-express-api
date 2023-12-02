import mongoose from "mongoose";
import bodyParser from "body-parser";
import env from "./src/configs/env.json";

const express = require("express");
const errorHandler = require("./src/handlers/error-handler");
const routes = require("./src/routes/route");
const cors = require("cors");

const app = express();

// mongoDB

mongoose.Promise = global.Promise;
mongoose.connect(env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//  bodyParser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// cors

app.use(cors());

app.get("/", (req, res) => {
  res.send("Under Developement :)...");
});

app.use("/api/v1/", routes);

app.use(errorHandler.errorHandler);

// show images

app.use("/api/v1/image", express.static("public/images"));

app.use(errorHandler.notFound);

if (process.env.NODE_ENV !== "test") {
  app.listen(env.PORT, () =>
    console.log(`\x1B[35mServer listening on port: ${env.PORT}`)
  );
}

export default app;
