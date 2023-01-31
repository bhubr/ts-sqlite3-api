import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import pluralize from "pluralize";

import { port } from "./settings";
import createApiRouter from "./create-api-router";

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const entity = "dummy";
const endpointBase = `/${pluralize(entity)}`;
const dummyApi = createApiRouter(entity);

app.get("/", (req: Request, res: Response) =>
  res.send({
    message: "Hello world!",
  })
);

app.use(endpointBase, dummyApi);

app.listen(port, () => console.log(`listening on ${port}`));
