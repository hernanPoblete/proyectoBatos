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
app.get("/", async (req: Request, res: Response)=>{

    interface RegionData{
        region: string
    }

    var regionData = (await sql<RegionData[]>`SELECT DISTINCT REGION FROM SEDE`).map(x=>x.region);

    res.status(200).render('index.ejs', {
        components: ["./components/graphPanel/panel.ejs"],
        scripts:["./scripts/graphGeneration.js"],
        regionData: regionData
    });
});


/**
 * Testing app gets query specified inside query of url and returns it as json
 */
app.get("/fetch/:info", async (req: Request, res: Response)=>{

    /**
     * Pattern matching for graph to be made
     */
    switch (req.params.info){

        case "grades":
            interface Count{
                puntaje: number,
                count: number
            }

            var gradeData: Count[] = await sql<Count[]>`SELECT PUNTAJE, COUNT(PUNTAJE) FROM PREGUNTAPRUEBA WHERE NUMPREGUNTA IN (1,2) GROUP BY PUNTAJE ORDER BY PUNTAJE;`
            res.json(gradeData.map((x:Count) =>{return {"x":x.puntaje, "y":parseInt(x.count.toString())}}));
            break;

        default:
            res.status(404).json({error: 404, description: "Resquested type of graph not found"})
    }
})

app.post("/fetch/:info", async (req: Request, res: Response)=>{

    switch(req.params.info){
        case "mainGraphData":
            interface InputData{
                min: number,
                max: number,
                region: string,
                grupal: boolean
                niveles: number[]
            }


            interface OutputData{
                round: number,
                count: number
            }

            let input: InputData = req.body;

            
            let table =  `caracterizacion_anual_${input.grupal ? "grup" : "ind"}`;
            
            let output = await sql<OutputData[]>`
            SELECT ROUND,COUNT(ROUND) FROM ${sql(table)} WHERE (REGION = ${input.region} OR ${input.region===""}) and curso IN ${sql(input.niveles)} and round BETWEEN ${input.min} AND ${input.max} GROUP BY ROUND
            `;

            res.json(output.map((x: OutputData)=>{
                return {
                    "x": x.round,
                    "y": x.count
                }
            }));
            break;

        default:
            res.status(404).json({error: 404, description: "Resquested type of graph not found"});
            break;

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