const express = require("express");
const path = require("path");
const session = require('express-session');

const app = express();
const server = require("http").createServer(app);
app.use(express.json()); // Para soportar solicitudes con JSON

const io = require("socket.io")(server);
console.log('Servidor iniciado');

const db = require('./database.js');
const userMod = require('./Modules/UserModule.js');
const chatMod = require('./Modules/ChatModule.js');
const groupMod = require('./Modules/GroupModule.js');
const rewardsMod = require('./Modules/RewardsModule.js');

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
        console.log(typeof (roomId));
        console.log(`${socket.id} se unió a la sala ${roomId}`);
        socket.broadcast.to(roomId).emit("update", username + " se unió a la conversacion", roomId);
    });

    socket.on("leaveRoom", function (roomId) {
        socket.leave(roomId);
        console.log(`${socket.id} salió de la sala ${roomId}`);
    });

    socket.on("chat", function (message, roomId) {
        socket.broadcast.to(roomId).emit("chat", message,);

        console.log(`${message} se envió a la sala ${roomId}`);
    });
})


//SOLICITUDES


app.get('/checkSession', (req, res) => {
    if (req.session.authenticated) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
        }
        // Redirige al usuario o responde con un mensaje de éxito
        res.status(200).json({ success: true, message: 'Sesión cerrada correctamente' });
    });
})

app.post('/registrar-usuario', async (req, res) => {
    let newUser = req.body;
    // console.log(newUser);
    // Guardar información mandada del cliente
    let request = await userMod.registrarUsuario(
        newUser['name'],
        newUser['email'],
        newUser['username'],
        newUser['password'],);

    if (request) {
        res.send({
            success: true,
            message: 'se registró correctamente',
            data: newUser,
        })
    }
    else {
        res.send({
            success: false,
            message: 'error de registro',
            data: newUser,
        })
    }
});

app.post('/login', async (req, res) => {
    try {
        let validation = req.body;
        req.session.authenticated = false;

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

            req.session.authenticated = true;
            req.session.user = {
                userId: user['usuarioID'],
                userEmail: user['correo'],
                username: user['nombreUsuario']
            }

            res.status(200).json({ success: true, message: 'Validación de usuario correcta', session: req.session.user });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error en el servidor' })
    }
})

// app.post('/getChat', async (req, res) => {
//     try {
//         let data = req.body;
//         // let user1 = await userMod.findUser(data['user']);
//         let user1 = await userMod.findUser(req.session.user['userEmail']);

//         let user2 = await userMod.findUser(data['contact']);

//         if (user1 === undefined || user2 === undefined) {
//             res.status(404).json({ success: false, message: 'Usuarios no encontrados' });
//             return;
//         }

//         let maxID;
//         let minID;
//         if (user1['usuarioID'] > user2['usuarioID']) {
//             maxID = user1['usuarioID'];
//             minID = user2['usuarioID'];
//         } else {
//             maxID = user2['usuarioID'];
//             minID = user1['usuarioID'];
//         }
//         let chatId = 's' + minID + maxID;
//         res.status(200).json({ chatId: chatId });
//     } catch (error) {
//         console.log(error)
//     }

// });


app.post('/search-user', async (req, res) => {
    try {
        let data = req.body;
        // let user1 = await userMod.findUser(data['user']);
        let users = await userMod.searchUsers(data['data']);

        if (users === undefined) {
            res.status(200).json({ success: true, message: 'Usuarios no encontrados' });
            return;
        }
        // console.log(data['data']);
        // console.log(users);
        res.status(200).json({ data: users });
    } catch (error) {
        console.log(error)
    }

});

app.post('/search-user-id', async (req, res) => {
    try {
        let data = req.body;
        let user2 = await userMod.findUserbyId(data['id']);
        let user1 = await userMod.findUserbyId(req.session.user['userId']);

        if (user2 === undefined) {
            res.status(404).json({ success: true, message: 'Usuario no encontrado' });
            return;
        }

        if (user1 === undefined) {
            res.status(404).json({ success: true, message: 'Error con las credenciales' });
            return;
        }

        let message = await chatMod.getPrivateChat(user1[0]['usuarioID'], user2[0]['usuarioID']);

        // console.log(data['data']);
        // console.log(users);
        res.status(200).json({ data: user2, messages: message });
    } catch (error) {
        console.log(error)
    }

});

app.post('/save-private-message', async (req, res) => {
    try {
        let data = req.body;
        if (data['file'] === undefined) {
            data['file'] = null;
        }
        if (data['destinatarioID']) {
            let message = await chatMod.savePrivateMessage(data['message'], data['file'], req.session.user['userId'], data['destinatarioID']);
        }

        res.status(200).json({ data: 'almacenado correctamente' });
    } catch (error) {
        console.log(error)
    }
});

app.post('/create-group', async (req, res) => {
    try {
        let data = req.body;
        data = data['data'];
        if (req.session.user) {
            let grupoId = await groupMod.createGroup(data['nombreGrupo'], data['descripcionGrupo'], req.session.user['userId']);
            console.log('------GRUPO ID: ', grupoId);
            if (grupoId && data['users'].length > 0) {
                let usuarios = data['users'];
                console.log(usuarios, data['users']);
                usuarios.forEach(async element => {
                    let res = await groupMod.addUsersToGroup(grupoId, element, 1);
                    console.log(element, res);
                });
                res.status(200).json({ data: 'Accion completada correctamente' });
            }
        }
        else {
            res.status(404).json({ data: 'se requiere iniciar sesion' });
        }
    } catch (error) {
        console.log(error)
    }
});

app.get('/get-groups', async (req, res) => {
    try {

        let data = await groupMod.getAllGroups(req.session.user['userId']);

        res.status(200).json({ data: data });
    } catch (error) {
        console.log(error)
    }
});




// DATOS DEL PERFIL DE USUARIO

app.get('/get-perfilUser', async (req, res) => {
    try {     
        console.log("User ID:", req.session.user?.userId); // Debug para revisar userId

        let data = await userMod.findUserbyId(req.session.user['userId']);

        res.status(200).json({ data: data });
    } catch (error) {
        console.log(error)
    }
});

// FUNCIONES DE LA GAMIFICACION

// Obtener título actual del usuario
app.get('/get-user-title', async (req, res) => {
    try {
        const tituloID = req.session.user?.tituloID;
        const title = await rewardsMod.getTitleById(tituloID);
        res.json({ title });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el título del usuario' });
    }
});

// Obtener títulos desbloqueados del usuario
app.get('/get-unlocked-titles', async (req, res) => {
    try {
        const unlockedTitles = await rewardsMod.getUnlockedTitles(req.session.user.userId);
        res.json({ unlockedTitles });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los títulos desbloqueados' });
    }
});

// Obtener puntos para la próxima recompensa
app.get('/get-next-reward-points', async (req, res) => {
    try {
        const nextPoints = await rewardsMod.getNextRewardPoints(req.session.user.userId);
        res.json({ data: { nextPoints: nextPoints || 0 } }); 
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener puntos para la próxima recompensa' });
    }
});



// Cambiar título del usuario
app.post('/update-user-title', async (req, res) => {
    try {
        const { newTituloID } = req.body;
        const result = await rewardsMod.updateUserTitle(req.session.user.userId, newTituloID);
        if (result) {
            res.json({ success: true, message: 'Título actualizado' });
        } else {
            res.json({ success: false, message: 'No se pudo actualizar el título' });
        }
    } catch (error) {
        console.error('Error al actualizar el título:', error);
        res.status(500).json({ error: 'Error al actualizar el título' });
    }
});




server.listen(4000);