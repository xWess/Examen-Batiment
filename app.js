const http = require("http");
const express = require("express");
const mongo = require("mongoose");
const bodyParser = require("body-parser");
const mongoconnect = require("./config/dbconnection.json");
const path = require("path");

/*
 * SOCKET.IO EXPLANATION:
 * Socket.IO enables real-time, bidirectional communication between clients and server
 * 
 * Key differences:
 * - socket.emit() = sends message to ONE specific client
 * - io.emit() = sends message to ALL connected clients (broadcast)
 * - socket.on() = listens for events from the client
 * 
 * Common use cases:
 * - Real-time chat systems
 * - Live game updates
 * - Collaborative applications
 * - Live notifications
 */

const {
  getallNiveau,
  construction,
  calculBatiemnt,
} = require("./controller/batimentcontroller");
const { add } = require("./controller/chatcontroller");
const {
  addpartiesocket,
  affichesocket,
} = require("./controller/joueurcontroller");
mongo
  .connect(mongoconnect.url)
  .then(() => console.log("mongo connecter"))
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
    console.log("Please ensure MongoDB is running and credentials are correct");
  });

const classroomrouter = require("./routes/classroom");
const joueurrouter = require("./routes/joueur");
const batimentrouter = require("./routes/batiment");
var app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "twig");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/classroom", classroomrouter);
app.use("/joueur", joueurrouter);
app.use("/batiment", batimentrouter);

// Create HTTP server and attach Socket.IO to it
const server = http.createServer(app);
const io = require("socket.io")(server); // Socket.IO enables real-time, bidirectional communication between web clients and servers

// Listen for new client connections to the socket
io.on("connection", async (socket) => {
  console.log("user connected");
  
  // Send a welcome message to the newly connected client
  socket.emit("msg", "user is connected");
  
  // Get all building levels and send them to the client
  const lb = await getallNiveau();
  socket.emit("msg", JSON.stringify(lb));
  
  // Listen for "partie" event from client (when someone wants to start a game)
  socket.on("partie", (data) => {
    // Create a new game in the database with the provided data
    addpartiesocket(data);
    // Broadcast the game data to ALL connected clients
    io.emit("partie", data);
  });

  // Listen for "construire" event from client (when someone wants to build something)
  socket.on("construire", async (data) => {
    // Create a fake request object to simulate HTTP request format
    req = { params: { id: data } };
    // Call the construction function with the building ID
    await construction(req);
    // Get updated building levels after construction
    const lb = await getallNiveau();
    // Send updated levels back to THIS specific client only
    socket.emit("msg", JSON.stringify(lb));
  });

  // Listen for "aff" event from client (when someone wants to display player info)
  socket.on("aff", async (data) => {
    // Get information about two players using their IDs
    const r = await affichesocket(data);
    console.log("jjjjjj", JSON.stringify(r));
    // Send player information to ALL connected clients
    io.emit("aff", r);
  });

  // Listen for "calcul" event from client (when someone wants to calculate building totals)
  socket.on("calcul", async (data) => {
    // Calculate the sum of all building levels
    const c = await calculBatiemnt();
    console.log("jjjjjj", "la somme des niveaux est :" + JSON.stringify(c));
    // Send calculation result to ALL connected clients
    io.emit("msg", "la somme des niveaux est :" + JSON.stringify(c));
  });

  // Listen for "typing" event from client (when someone is typing in chat)
  socket.on("typing", (data) => {
    // Broadcast typing indicator to ALL connected clients
    io.emit("typing", data + "is typing");
  });

  // Listen for "msg" event from client (when someone sends a chat message)
  socket.on("msg", (data) => {
    // Save the message to database
    add(data.object);
    // Broadcast the message to ALL connected clients with sender's name
    io.emit("msg", data.name + ":" + data.object);
  });

  // Listen for client disconnection
  socket.on("disconnect", () => {
    console.log("user disconnect");
    // Notify ALL connected clients that someone disconnected
    io.emit("msg", "user disconnect");
  });
});
server.listen(3000, console.log("server run"));
module.exports = app;
