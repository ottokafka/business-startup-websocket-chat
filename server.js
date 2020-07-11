const express = require("express");
const mongoose = require("mongoose");
const Chat = require("./models/user/Chat");
const WebSocket = require("ws");
const WebSocketServer = WebSocket.Server;

const path = require("path");
const app = express();

// connecting to mongodb
const connectDB = async () => {
  try {
    await mongoose.connect(
      // "mongodb://127.0.0.1:27017",
      "mongodb://automan:qwertyuiop1@ds115360.mlab.com:15360/startup-business-db",
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );
    console.log("mongoDB connected successfully");
  } catch (err) {
    console.error(err);
  }
};
connectDB();

// getting json from user
app.use(express.json({ extended: false }));

// PORT number for Express Server and Websocket Server
const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";

const server = express().listen(PORT, () =>
  console.log(`Listening on ${PORT}`)
);

const wss = new WebSocketServer({ server });
console.log("[WebSocket] Starting WebSocket server...");

// ---------------------------- All the Websocket Server Code -----------------------
wss.on("connection", (ws, request) => {
  const clientIp = request.connection.remoteAddress;
  console.log(`[WebSocket] Client with IP ${clientIp} has connected`);

  // Broadcast to all connected clients
  ws.on("message", (message) => {
    var json = JSON.parse(message);
    // Access database here otherwise it will accese multiple time bc of amount of clients
    const checkNsave = async () => {
      if (json.message === "" || json.message === null) {
        console.log("Dont save if empty string");
        return "";
      }
      if (json.message !== "" && json.message !== null) {
        // Save the message
        const newChat = new Chat({
          business: json.businessID,
          user: json.userID,
          sender: json.sender,
          message: json.message,
        }).save();
      }
    };
    checkNsave();

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const send2Clients = async () => {
          if (json.message === "" || json.message === null) {
            var chats1 = await Chat.find({
              business: json.businessID,
              user: json.userID,
            }).sort({
              _id: -1,
            });
            var test = JSON.stringify(chats1);
            client.send(test);
            console.log("Send to clients");
          } else {
            var chats = await Chat.find({
              business: json.businessID,
              user: json.userID,
            }).sort({
              _id: -1,
            });
            var test = JSON.stringify(chats);
            console.log("3");
            client.send(test);
          }
        };
        send2Clients();
      }
    });
    console.log(`[WebSocket] Message ${message} was received`);
  });
});
