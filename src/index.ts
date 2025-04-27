import express from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";

import Logger from "./util/logger";
import { PORT } from "./config/constants";

import { graphqlHTTP } from 'express-graphql';

import { typeDefs, resolvers } from './graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';


export const app = express();
export const server = http.createServer(app);

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});


app.use(helmet());
app.use(cors());


app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
}));

server.listen(PORT, () =>
    Logger.success(`Server is running on http://localhost:${PORT}`)
);
