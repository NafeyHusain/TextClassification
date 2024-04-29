// const toxicity = require("@tensorflow-models/toxicity");
// require("@tensorflow/tfjs-backend-webg");
// import { requirejs } from "requirejs";
// var requirejs = require("requirejs");
// import * as toxicity from "@tensorflow-models/toxicity";
import * as toxicity from "@tensorflow-models/toxicity";

import "@tensorflow/tfjs-backend-webgl";
// const path = requirejs("path");
import path from "path";
import http from "http";
import express from "express";
import { Server } from "socket.io";

import { formatMessage, alertNotification } from "./utils/messages.js";
// import { userJoin, getCurrentUser, userLeave, getRoomUsers } from "./utils/user";
import { userJoin, getCurrentUser, userLeave, getRoomUsers, getCurrentUserName } from "./utils/user.js";
// Load the model. Users optionally pass in a threshold and an array of
// labels to include.
// const Server1 = new Server();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";
// const threshold = 0.9;

// Run when client connects
io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat`));

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

    socket.on("alert", (msg) => {
        const user = getCurrentUserName(msg.username);

        const user1 = getCurrentUser(socket.id);
        console.log("**********");
        console.log(user);
        console.log(user1);
        console.log("**********");
        // console.log(userId);
        // const user = userJoin(socket.id, username, room);
        // socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat`));
        if (user.username === user1.username) {
            console.log("Skip alert message");
        } else {
            console.log("*****123456*****");
            console.log(user1);
            io.to(user1.id).emit("event", user);
            // socket.broadcast.to(user1.username).emit("event", user);
        }

        // socket.broadcast.to(user.room).emit("event", user);
        // io.to(user.room).emit("event", user);
        // socket.emit("event", userId);
    });

    socket.on("approvedToBlock", (user) => {
        console.log("***************** check ***********");
        const user1 = getCurrentUser(socket.id);
        console.log(user1);
        socket.broadcast.to(user1.room).emit("block", user1);
        // io.to(user1.room).emit("block", user);
        // user = getRoomUsers(user.room);
        // console.log(user);

        // check
        // socket.emit("block", "message");
        // , formatMessage(user.username, formatMessage("You are being blocked")
        // const user = getCurrentUser(socket.id);
    });

    // Runs when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));

            // Send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// function classify() {}

// export default classify;
