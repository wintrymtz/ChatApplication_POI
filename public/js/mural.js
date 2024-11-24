import socketData from "./socket.js";

const idGrupo = localStorage.getItem('grupoID');
let room = 'GRUPO_' + idGrupo;
connect(room);

document.getElementById('send-message').addEventListener('click', () => {
    if (document.getElementById('message-input').value.length > 0) {
        renderInputMessage();
    }
})

document.addEventListener('keydown', (e) => {

    if (e.key === 'Enter' && document.getElementById('message-input').value.length > 0) {
        renderInputMessage();
    }
})

function renderInputMessage() {
    let fecha = new Date();
    let hora = fecha.getHours();
    let minuto = fecha.getMinutes();
    let message = {
        user: socketData.username,
        text: document.getElementById('message-input').value,
        date: hora + ':' + minuto
    }
    sendMessage(message);
    document.getElementById('message-input').value = '';
}

function connect(id) {
    if (socketData.socket) {
        socketData.socket.emit("leaveRoom", socketData.roomId); //salimos de la sala
        socketData.socket.emit("joinRoom", socketData.username, id); //ingresamos a la sala
        socketData.roomId = room;
    } else {
        alert('Conexion invalida');
    }
}

function getChat(idGrupo) {
    fetch("/get-group-messages", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            grupoID: idGrupo
        }),
    }).then(response => {
        return response.json();
    }).then(response => {
        console.log(response)
        response.data.forEach(e => {
            let message = {
                user: e.nombreUsuario,
                text: e.texto,
                date: e.fecha
            }
            console.log(socketData.id);
            if (e.usuarioID == socketData.id) {
                renderMessage("my", message);
            } else {
                renderMessage("other", message);

            }
        })
    })
}

function sendMessage(message) {
    console.log(message);
    renderMessage('my', message);

    //enviamos la informacion del mensaje al servidor
    socketData.socket.emit("chat", {
        user: socketData.username,
        text: message.text,
        date: message.date,
    }, socketData.roomId);

    fetch("/save-group-message", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            file: null,
            grupoId: idGrupo
        }),
    }).then(response => {
        console.log(response)
    })
}

function renderMessage(type, message) {
    let contenedor = document.getElementById('general');
    let item = document.createElement('div');
    if (type === 'my') {
        item.classList.add('message');
        item.innerHTML = `
                        <p><strong style="color:blue">${message.user}</strong> - ${message.date}</p>
                        <br>
                        <p>${message.text}</p>`;
    } else {
        item.classList.add('message');
        item.innerHTML = `
                        <p><strong>${message.user}</strong> - ${message.date}</p>
                        <br>
                        <p>${message.text}</p>`;
    }

    contenedor.appendChild(item);
}

//Escuchando los mensajes que lleguen del servidor
socketData.socket.on("chat", function (message) {
    renderMessage('other', message);
});

getChat(idGrupo)
