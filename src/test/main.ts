import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import {join} from 'path';
import {sql} from '../main/controller/db'
import {match, P} from 'ts-pattern'
import { string } from 'ts-pattern/dist/patterns';

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

/**Configures static serving */
app.use(express.static(join('src','main','public')))



/**
 * Configures the main request of the app to
 * render and then display the content inside
 * index.ejs
 */
app.get("/", async (req: Request, res: Response)=>{
    res.status(200).render('index.ejs', {
        components: ["./components/HelloWorld/content.ejs", "./components/test/graphGrading.ejs"],
        scripts:[],
    });
});


/**
 * Testing app gets query specified inside query of url and returns it as json
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
    console.log(`TESTING App Listening in port ${port}`);
});