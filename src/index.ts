import express from "express";
import { expressMiddleware } from "@apollo/server/express4";

import graphql from "./graphql";

import cors from "cors";
import helmet from "helmet";

import zoom from "./zoom";

import Logger from "./util/logger";


async function startServer() {
    const app = express();

    app.use(express.json());
    app.use(helmet());
    app.use(cors());

    await graphql.start();

    app.use("/graphql", (req: any, res: any, next) =>
        expressMiddleware(graphql)(req, res, next)
    );

    app.use("/zoom", zoom);

    app.listen(4000, () => {
        Logger.success("🚀 GraphQL ready at http://localhost:4000/graphql");
        Logger.success("🚀 Zoom ready at http://localhost:4000/zoom");
    });
}

startServer();