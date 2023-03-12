import express from 'express'
import cors from 'cors'
import * as http from "http";
import {route} from "./route.js";
import {Server} from "socket.io";
import {addUser, findUser, getRoomUsers, removeUser} from "./user.js";


const port = process.env.PORT || 3000;
const app = express()
app.use(cors({ origin: "*" }));
app.use(route);

const index = http.createServer(app);

const io = new Server(index, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    socket.on("join", ({ name, room }) => {
        socket.join(room);

        const { user, isExist } = addUser({ name, room });

        const userMessage = isExist
            ? `${user.name}, here you go again`
            : `Hey my love ${user.name}`;

        socket.emit("message", {
            data: { user: { name: "Admin" }, message: userMessage },
        });

        socket.broadcast.to(user.room).emit("message", {
            data: { user: { name: "Admin" }, message: `${user.name} has joined` },
        });

        io.to(user.room).emit("room", {
            data: { users: getRoomUsers(user.room) },
        });
    });

    socket.on("sendMessage", ({ message, params }) => {
        const user = findUser(params);

        if (user) {
            io.to(user.room).emit("message", { data: { user, message } });
        }
    });

    socket.on("leftRoom", ({ params }) => {
        const user = removeUser(params);

        if (user) {
            const { room, name } = user;

            io.to(room).emit("message", {
                data: { user: { name: "Admin" }, message: `${name} has left` },
            });

            io.to(room).emit("room", {
                data: { users: getRoomUsers(room) },
            });
        }
    });

    io.on("disconnect", () => {
        console.log("Disconnect");
    });
});

index.listen(port, () => {
    console.log("Server is running");
});