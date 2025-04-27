import knex from "knex";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "./constants";


export const db = knex({
  client: "mysql2",

  connection: {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD
  }
});
