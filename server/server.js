import express from 'express'
import cors from 'cors'
import * as http from "http";
import {route} from "./route.js";
import {Server} from "socket.io";

const app = express()
app.use(cors({
    origin: "*"
}))
app.use(route)

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

app.listen(5000, () => {
    console.log('Server is running')
})