import postgres from "postgres"
import * as dotenv from 'dotenv';
import {join} from 'path';


/**
 * Settings for the environment vars. Provides security
 * by not exposing directly credentials
 */

dotenv.config({
    path: join("./", ".env")
});

/**
 * Creates the sql connection to the database
 */
export const sql = postgres({
    host: process.env.dbHost,
    port: parseInt(process.env.dbPort!),
    user: process.env.dbUser,
    pass: process.env.dbPassword
})