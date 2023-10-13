import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import {MongoClient, ObjectId} from "mongodb";


const app = express();
const port = process.env.PORT || 3000
app.listen(port);
app.use(bodyParser.json());
dotenv.config();

export const todoApi = new express.Router();

//Connect to database
const url = process.env.MONGODB_URL;
const client = new MongoClient("mongodb+srv://andreaskm12:uMBL0DUE7LwkDUJF@tododb.nex9ds5.mongodb.net/?retryWrites=true&w=majority");

console.log("Server running on: http://localhost:" + port);

client.connect().then(connection =>{
    console.log("Connecting...")
    const db = connection.db("Todo_DB");
    todoApi.get("/api/todos", async (req, res) => {
        const todos = await db
            .collection("Todos")
            .find().toArray();

        res.json(todos);

    })
})
//update current todo in mongodb
client.connect().then(connection => {
    console.log("Sending start doing")
    const db = connection.db("Todo_DB");
    todoApi.post("/api/todos/start-doing/:id", async (req,res) =>{
        const id = req.params.id;
        const objectId = new ObjectId(id);
        try{

            await db.collection("Todos").updateOne({_id: objectId}, {$set: {status: "doing"}});
            res.sendStatus(204)
        }catch (error){
            res.status(400).json({error: "invalid id"});
        }
    })
})

//Completing task
client.connect().then(connection => {
    console.log("Complete")
    const db = connection.db("Todo_DB");
    todoApi.post("/api/todos/complete/:id", async (req,res) =>{
        const id = req.params.id;
        const objectId = new ObjectId(id);
        try{

            await db.collection("Todos").updateOne({_id: objectId}, {$set: {status: "complete"}});
            res.sendStatus(204)
        }catch (error){
            res.status(400).json({error: "invalid id"});
        }
    })
})


client.connect().then(connection => {
    const db = connection.db("Todo_DB");
    todoApi.post("/api/todos", async (req,res) =>{
        const {name} = req.body;
        await db.collection("Todos").insertOne({name: name, status : "todo"} );
        res.sendStatus(204)
    })
})

app.use(express.static("../client/dist"));
app.use(todoApi);


