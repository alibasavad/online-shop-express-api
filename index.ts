import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { errorHandler, notFound } from "./src/handlers/error-handler";
import routes from "./src/routes/route";
import env from "./src/configs/env.json";
import cors from "cors";

const app = express();

// mongoDB

mongoose.Promise = global.Promise;
mongoose.connect(env.MONGODB_URL);

//  bodyParser

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// cors

app.use(cors());

app.get("/", (req, res) => {
    res.send("Under Developement :)...");
});

app.use("/api/v1/", routes);

app.use(errorHandler);

// show images

app.use("/api/v1/image", express.static("public/images"));

app.use(notFound);

if (process.env.NODE_ENV !== "test") {
    app.listen(env.PORT, () =>
        console.log(`\x1B[35mServer listening on port: ${env.PORT}`)
    );
}

export default app;
