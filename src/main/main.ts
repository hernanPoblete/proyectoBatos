import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import {join} from 'path';
import {sql} from './controller/db'


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
const port: Number = parseInt(process.env.PORT!);

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
        components: ["./components/HelloWorld/content.ejs", "./components/test/graphGrading.ejs"],
        scripts:[],
    });
});


/**
 * App gets info necessary to generate a graph
 */
app.get("/fetch/:graph", async (req: Request, res: Response)=>{

    /**
     * Pattern matching for graph to be made
     */
    switch (req.params.graph){
        case "grades":
            interface Count{
                puntaje: number,
                count: number
            }

            let data: Count[] = await sql<Count[]>`SELECT PUNTAJE, COUNT(PUNTAJE) FROM PREGUNTAPRUEBA WHERE NUMPREGUNTA IN (1,2) GROUP BY PUNTAJE ORDER BY PUNTAJE;`
            res.json(data.map((x:Count) =>{return {"x":x.puntaje, "y":parseInt(x.count.toString())}}));
            break;
        default:
            res.status(404).json({error: 404, description: "Resquested type of graph not found"})
    }
})


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