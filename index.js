import mongoose from "mongoose";
import bodyParser from "body-parser";
import routes from "./src/routes/route";
import env from "./src/configs/env.json";

const express = require("express");

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

app.get("/", (req, res) => {
  res.send("Hello_World_...");
});

routes(app);

app.listen(env.PORT, () => {
  console.log(`\x1B[35mServer listening on port: ${env.PORT}`);
});
