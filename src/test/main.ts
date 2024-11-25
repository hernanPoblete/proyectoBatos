import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import {join} from 'path';
import {sql} from '../main/controller/db'

/**
 * Settings for the environment vars. Provides security
 * by not exposing directly credentials
 */

dotenv.config({
    path: join("./", ".env")
});

/**
 * Creates an express app for the project
 */
const app = express();
const port: Number = parseInt(process.env.DEBUGPORT!);

/**
 * Sets the view engine to ejs
 */
app.set('view engine', require('ejs'));

/**
 * Configures the views directory to be 
 * src/views 
 */
app.set('views', join('src', 'main', 'views'));

/**
 * Configures the main request of the app to
 * render and then display the content inside
 * index.ejs
 */
app.get("/", (req: Request, res: Response)=>{
    res.status(200).render('index.ejs', {
        components: ["./components/HelloWorld/content.ejs"]
    });
});

/**
 * configures request for paths 
 * not found within the app
 */
app.get("*", (req: Request, res: Response)=>{
    res.status(404).send("OHOH. Pagina No encontrada");
})

/**
 * Runs the app.
 * Once the app is listening on set port
 * prints a message
 */
app.listen(port, ()=>{
    console.log(`App Listening in port ${port}`);
});