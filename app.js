const express = require("express");
const path = require("path");
const session = require('express-session');
const multer = require('multer');

const app = express();
const server = require("http").createServer(app);
app.use(express.json({ limit: '50mb' })); // Para soportar solicitudes con JSON

// Configuración de Multer para almacenar el archivo en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const io = require("socket.io")(server);
console.log('Servidor iniciado');

const db = require('./database.js');
const userMod = require('./Modules/UserModule.js');
const chatMod = require('./Modules/ChatModule.js');
const groupMod = require('./Modules/GroupModule.js');
const rewardsMod = require('./Modules/RewardsModule.js');
const transporter = require('./Modules/mailServiceModule.js');
const homeworkMod = require('./Modules/TaskRoutesModule.js')


// app.use('/tasks', taskRoutes);
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Server corriendo en el puerto ${PORT}`)
// });

module.exports = app;

app.use(express.static(path.join(__dirname + "/public")));

app.use(session({
    secret: '123456',               // Usar un valor secreto seguro (puedes usar algo aleatorio y largo)
    resave: false,                  // No resguardar la sesión si no ha sido modificada
    saveUninitialized: false,       // No guardar una sesión vacía si no ha sido modificada
    cookie: { maxAge: 600000 }      // Tiempo máximo para la cookie de sesión (600000ms = 10 minutos)
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

    socket.on('disconnect', () => {

    })

    socket.on("chat", function (message, roomId) {
        socket.broadcast.to(roomId).emit("chat", message,);

        console.log(`${message.text} se envió a la sala ${roomId}`);
    });

    socket.on("file", function (file, roomId) {
        socket.broadcast.to(roomId).emit("file", file,);

        // console.log(`${message.text} se envió a la sala ${roomId}`);
    });

    socket.on("callUser", (data) => {
        io.to(data.to).emit("callIncoming", { from: data.from, signal: data.signal });
    });

    socket.on("acceptCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    });

    socket.on("endCall", (data) => {
        io.to(data.to).emit("callEnded");
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

    userMod.activeUser(false, req.session.user.userId);
    io.emit('user-connected', { usuario: req.session.user.userId, status: false });

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

            io.emit('user-connected', { usuario: user['usuarioID'], status: true });
            userMod.activeUser(true, req.session.user.userId);

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

        message.forEach((m) => {
            if (m.archivo && Buffer.isBuffer(m.archivo)) {
                const base64File = m.archivo.toString('base64');
                m.archivo = base64File;
            }
        })

        // console.log(data['data']);
        // console.log(users);
        res.status(200).json({ data: user2, messages: message });
    } catch (error) {
        console.log(error)
    }

});

app.post('/save-private-message', upload.single('file'), async (req, res) => {
    try {
        let data = req.body;
        let fileBuffer;
        if (!req.body.buffer) {
            fileBuffer = null;
        } else {

            fileBuffer = Buffer.from(req.body.buffer, 'base64');; // El archivo en formato binario
        }

        console.log(data);

        if (data['destinatarioID']) {
            let message = await chatMod.savePrivateMessage(data['message'], fileBuffer, req.session.user['userId'], data['destinatarioID'], data['encriptacion']);
        }

        res.status(200).json({ data: 'almacenado correctamente' });
    } catch (error) {
        console.log(error)
    }
});

app.post('/get-history', async (req, res) => {
    try {
        let data = req.body;

        let history = await chatMod.getHistory(req.session.user['userId']);

        // console.log(data['data']);
        // console.log(users);
        res.status(200).json({ data: history });
    } catch (error) {
        console.log(error)
    }

});

app.post('/save-group-message', async (req, res) => {
    try {
        let data = req.body;
        if (data['file'] === undefined) {
            data['file'] = null;
        }
        if (data['grupoId']) {
            let message = await groupMod.saveGroupMessage(data['message'].text, data['file'], req.session.user['userId'], data['grupoId']);
        }
        res.status(200).json({ data: 'almacenado correctamente' });
    } catch (error) {
        console.log('/save-group-message (ERROR):', error)
    }
})


app.post('/get-group-messages', async (req, res) => {
    try {
        let data = req.body;

        let messages = await groupMod.getGroupChat(data.grupoID);

        res.status(200).json({ data: messages });
    } catch (error) {
        console.log('/save-group-message (ERROR):', error)
    }
})

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




// Solicitud para enviar el correo
app.post('/send-mail', async (req, res) => {
    const { to, subject, message } = req.body;
    try {
        const info = await transporter.sendMail({
            from: '"Mi Aplicación" <tu-email@example.com>',
            to,
            subject,
            text: message
        });
        res.json({ success: true, message: 'Correo enviado correctamente', info });
    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({ success: false, message: 'Error al enviar el correo' });
    }
});




//Solicitud para obtener el correo
app.get('/get-user-email', (req, res) => {
    if (req.session.authenticated) {
        res.json({ success: true, email: req.session.user.Email });
    } else {
        res.json({ success: false, message: 'Usuario no autenticado' });
    }
});





//Solicitud para obtener el id del creador del grupo
app.get('/checkGroupCreator', async (req, res) => {
    const groupID = req.query.groupID;
    const userID = req.session.user.userId;

    try {
        const creatorID = await groupMod.getGroupCreator(groupID);
        const isCreator = creatorID === userID;

        // Responder con el estado y los IDs involucrados
        res.json({
            isCreator: isCreator,
            userID: userID,
            creatorID: creatorID
        });
    } catch (error) {
        console.error("Error al verificar el creador del grupo:", error);
        res.status(500).json({ success: false, message: "Error al verificar el creador del grupo" });
    }
});



// Solicitud para crear tarea
app.post('/tasks/create', async (req, res) => {
    const { instrucciones, puntosTarea, vencimiento, grupoID } = req.body;
    try {
        const result = await homeworkMod.createTask(instrucciones, puntosTarea, vencimiento, grupoID);
        res.status(201).json({ success: true, message: 'Tarea creada con éxito', taskId: result.taskId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear tarea', error });
    }
});



// // Solicitud para obtener todas las tareas
// app.get('/tasks', async (req, res) => {
//     try {
//         const tasks = await homeworkMod.getAllTasks();
//         res.status(200).json(tasks);
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error al obtener tareas', error });
//     }
// });

// // Solicitud para calificar tarea
// app.post('/tasks/rate', async (req, res) => {
//     const { taskId, rating } = req.body;
//     try {
//         const success = await homeworkMod.rateTask(taskId, rating);
//         if (success) {
//             res.status(200).json({ success: true, message: 'Tarea calificada con éxito' });
//         } else {
//             res.status(404).json({ success: false, message: 'Tarea no encontrada' });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error al calificar tarea', error });
//     }
// });

// // Solicitud para subir archivo para una tarea
// app.post('/tasks/upload', upload.single('file'), async (req, res) => {
//     const { taskId } = req.body;
//     if (!req.file) {
//         return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
//     }

//     try {
//         const success = await homeworkMod.uploadTaskFile(taskId, req.file.path);
//         if (success) {
//             res.status(200).json({ success: true, message: 'Archivo subido con éxito' });
//         } else {
//             res.status(404).json({ success: false, message: 'Tarea no encontrada' });
//         }
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error al subir archivo de tarea', error });
//     }
// });




server.listen(4000);