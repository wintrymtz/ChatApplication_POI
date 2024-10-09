const express = require("express");
const path = require("path");
const session = require('express-session');

const app = express();
const server = require("http").createServer(app);
app.use(express.json()); // Para soportar solicitudes con JSON

const io = require("socket.io")(server);
console.log('Servidor iniciado');

const db = require('./database.js');
const userMod = require('./UserModule.js');
const { URLSearchParams } = require("url");
const { error } = require("console");

app.use(express.static(path.join(__dirname + "/public")));

app.use(session({
    secret: '123456',
    cookie: { maxAge: 300000 },
    resave: true,
    saveUninitialized: true
}));

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

app.post('/registrar-usuario', async (req, res) => {
    let newUser = req.body;
    console.log(newUser);
    // Guardar información mandada del cliente
    await userMod.registrarUsuario(
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
    try {
        let validation = req.body;

        let user = await userMod.findUser(validation['email']);

        if (user === undefined) {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            return;
        }
        //validamos la contraseña
        if (user['contrasena'] !== validation['password']) {
            res.status(401).json({ success: false, message: 'Validación de usuario incorrecta' });
            return;
        }
        else {//INICIO CORRECTO
            if (req.session.authenticated) {
                req.session.authenticated = false;
            } else {
                req.session.authenticated = true;
                req.session.user = {
                    userId: user['usuarioID'],
                    userEmail: user['correo']
                }
            }
            res.status(200).json({ success: true, message: 'Validación de usuario correcta' });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
})

app.post('/getChat', async (req, res) => {
    try {
        let data = req.body;
        // let user1 = await userMod.findUser(data['user']);
        let user1 = await userMod.findUser(req.session.user['userEmail']);

        let user2 = await userMod.findUser(data['contact']);

        if (user1 === undefined || user2 === undefined) {
            res.status(404).json({ success: false, message: 'Usuarios no encontrados' });
            return;
        }

        let maxID;
        let minID;
        if (user1['usuarioID'] > user2['usuarioID']) {
            maxID = user1['usuarioID'];
            minID = user2['usuarioID'];
        } else {
            maxID = user2['usuarioID'];
            minID = user1['usuarioID'];
        }
        let chatId = 's' + minID + maxID;
        res.status(200).json({ chatId: chatId });
    } catch (error) {
        console.log(error)
    }

})

server.listen(4000);