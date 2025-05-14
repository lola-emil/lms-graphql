import express, { ErrorRequestHandler } from "express";
import http from "http";
import { expressMiddleware } from "@apollo/server/express4";

import graphql from "./services/graphql";
import graphqlExt from "./services/graphql-ext";

import cors from "cors";
import helmet from "helmet";

import zoom from "./services/zoom";
import auth from "./services/auth";
import bulkImport from "./services/bulk-import";

import Logger from "./util/logger";
import { PORT } from "./config/constants";
import errorHandler from "./middlewares/errorhandler";


export const app = express();
export const server = http.createServer(app);

app.use(express.json());
app.use(helmet());
app.use(cors());

graphql.start().then(() => {
    app.use("/graphql", (req: any, res: any, next) =>
        expressMiddleware(graphql)(req, res, next)
    );

    app.use("/graphql-ext", graphqlExt);
});

app.use("/public", express.static("public"));
app.use("/zoom", zoom);
app.use("/auth", auth);
app.use("/bulk-import", bulkImport);


app.use(errorHandler as ErrorRequestHandler);

server.listen(PORT, () => {
    Logger.success(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
    Logger.success(`🚀 Zoom ready at http://localhost:${PORT}/zoom`);
});
