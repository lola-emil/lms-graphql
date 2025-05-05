import express, { ErrorRequestHandler } from "express";
import { expressMiddleware } from "@apollo/server/express4";

import graphql from "./graphql";

import cors from "cors";
import helmet from "helmet";

import zoom from "./zoom";
import auth from "./auth";

import Logger from "./util/logger";
import { graphqlUploadExpress } from "./lib/graphql-upload";
import { PORT } from "./config/constants";
import errorHandler from "./middlewares/errorhandler";


async function startServer() {
    const app = express();

    app.use(express.json());
    app.use(helmet());
    app.use(cors());


    await graphql.start();

    app.use(graphqlUploadExpress());
    app.use("/graphql", (req: any, res: any, next) =>
        expressMiddleware(graphql)(req, res, next)
    );

    app.use("/zoom", zoom);
    app.use("/auth", auth);



    app.use(errorHandler as ErrorRequestHandler);

    app.listen(PORT, () => {
        Logger.success(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`);
        Logger.success(`🚀 Zoom ready at http://localhost:${PORT}/zoom`);
    });
}

startServer();