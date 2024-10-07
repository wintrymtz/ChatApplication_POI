const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
app.use(express.json()); // Para soportar solicitudes con JSON

const io = require("socket.io")(server);
console.log('Servidor iniciado');

const db = require('./database.js');
const userMod = require('./UserModule.js');

app.use(express.static(path.join(__dirname + "/public")));



io.on("connection", function (socket) {

    socket.on("joinRoom", function (username, roomId) {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("update", username + "joined the conversation: " + roomId);
    });

    socket.on("chat", function (message, roomId) {
        socket.broadcast.to(roomId).emit("chat", message,);
        console.log(roomId);
    });
})


//SOLICITUDES
app.post('/registrar-usuario', (req, res) => {
    let newUser = req.body;
    // Save the data of user that was sent by the client
    userMod.registrarUsuario(
        newUser['name'],
        newUser['email'],
        newUser['username'],
        newUser['password'],);
    // Send a response to client that will show that the request was successfull.
    console.log(newUser['name']);

    res.send({
        message: 'se registró correctamente',
        data: newUser,
    })
});

// GET method route
app.get('/getUser', (req, res) => {
    let newUser = req.body;
    db.findUser(newUser['email']);
    res.send('usuario encontrado')
})

server.listen(4000);