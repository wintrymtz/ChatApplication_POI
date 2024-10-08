const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
app.use(express.json()); // Para soportar solicitudes con JSON

const io = require("socket.io")(server);
console.log('Servidor iniciado');

const db = require('./database.js');
const userMod = require('./UserModule.js');
const { URLSearchParams } = require("url");

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
    // Guardar información mandada del cliente
    userMod.registrarUsuario(
        newUser['name'],
        newUser['email'],
        newUser['username'],
        newUser['password'],);

    // console.log(newUser['name']);

    res.send({
        message: 'se registró correctamente',
        data: newUser,
    })
});

app.post('/login', async (req, res) => {
    let validation = req.body;

    let user = await userMod.findUser(validation['email']);

    if (user === undefined) {
        res.send({ message: "User doesn't exist" });
        return;
    }
    //validamos la contraseña
    if (user['contrasena'] !== validation['password']) {
        res.send({ message: 'User exist, no valid credentials' });
    }
    else {
        res.send(user);
    }
    // userMod.findUser('josejaime.delosriosm@gmail.com');
})

server.listen(4000);