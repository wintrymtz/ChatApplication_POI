import socketData from "./socket.js";

let arrayContactos = document.getElementsByClassName('contact-item');
let destinatarioID;


// async function validateAuth() {
//     fetch('/checkSession')
//         .then(response => response.json())
//         .then(data => {
//             if (data.authenticated) {
//                 console.log('Sesión activa: ', data.user);
//                 socketData.username = data.user['username'];
//                 socketData.id = data.user['userId'];
//                 updateUser();
//                 let newRoomId = createRoomId(socketData.id, socketData.id);
//                 socketData.socket.emit("joinRoom", socketData.username, newRoomId);
//                 socketData.roomId = newRoomId;
//                 changeChat(socketData.id);
//             } else {
//                 window.location.href = '/';
//                 console.log('No hay sesión activa');
//             }
//         });
// }

function getUsers() {
    // let response = await fetch();

    // response.foreach((user) => {

    // })

    let newUser = document.createElement('div');
    newUser.classList.add('contact-item');
    let container = document.getElementById('contact-list');
    newUser.innerHTML = `<div class="contact-item">
                    <img src="Images/profile1.jpg" alt="Liam Brown">
                    Liam JKSAHDKJHDKJAS
                    </div> `
    // container.appendChild(newUser);
}

// arrayContactos.forEach((e) => {
//     e.addEventListener();
// });

let inputSearch = document.getElementById('search-input');
inputSearch.addEventListener("keydown", debounce(async function (e) {

    const divs = document.querySelectorAll(".s_result");
    divs.forEach(div => div.remove());

    const query = inputSearch.value;
    await search(query);
}, 300));

function debounce(func, delay) {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

async function search(query) {
    console.log('buscando');
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch("/search-user", {
        method: "POST",
        body: JSON.stringify({ data: query }),
        headers: myHeaders,
    })
    let res = await response.json();
    console.log(res);

    showSearchList(res['data']);
}

function showSearchList(array) {
    array.forEach(element => {
        let container = document.getElementById('search-results');

        let newUser = document.createElement('div');
        newUser.classList.add('s_result');
        newUser.id = `${element['usuarioID']}`;
        newUser.innerHTML = `<img src="Images/profile1.jpg" alt="Liam Brown">
                        <p>${element['nombreUsuario']}</p>
                            `

        if (element.actividad == 1) {
            newUser.innerHTML += `<div class="circle" style="background-color: rgb(0, 206, 0);"></div>`;
        } else {
            newUser.innerHTML += `<div class="circle" style="background-color: rgb(240, 0, 0);"></div>`;
        }
        container.appendChild(newUser);

        newUser.addEventListener('click', (e) => {

            // console.log(e.currentTarget.id);

            if (socketData.socket) {
                socketData.socket.emit("leaveRoom", socketData.roomId);
                let newIdRoom = createRoomId(socketData.id, e.currentTarget.id);
                console.log('mi id es ' + socketData.id + ' y me intento conectar con el id: ' + e.currentTarget.id);
                socketData.socket.emit("joinRoom", socketData.username, newIdRoom);
                socketData.roomId = newIdRoom;
                changeChat(e.currentTarget.id);
                destinatarioID = e.currentTarget.id;
            } else {
                console.error("Socket no está definido o no está conectado.");
            }
            return;
        });
    });
}

async function changeChat(_id) {
    const divs = document.querySelectorAll(".message-container");
    divs.forEach(div => div.remove());

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch("/search-user-id", {
        method: "POST",
        body: JSON.stringify({ id: _id }),
        headers: myHeaders,
    })
    let res = await response.json();
    let user = res['data'][0];
    let messages = res['messages'];
    console.log(res);

    let tituloActualHTML = user.tituloActual
        ? `<h4>${user.tituloActual}</h4>`
        : '';

    const nombreContacto = document.getElementById('contact-name');
    nombreContacto.innerHTML =
        `
    <img src="Images/profile-genius.jpg" alt="Code Genius" class="header-icon">
    ${user['nombreUsuario']} ${user['nombreApellido']}

    ${tituloActualHTML}
    `;

    if (messages) {
        renderMessages(user, messages);
    }

    console.log('Obteniendo chat...', user, messages);
}

function renderMessages(objUser, objMessage) {
    let messageContainer = document.querySelector(".chat-content .chat-messages");

    objMessage.forEach((m) => {
        if (m.encriptacion == 1) {
            // console.log(atob('cGVybyB3YXRhZm9r'));
            m.texto = atob(m.texto)
        }

        if (m.usuarioID == objUser['usuarioID']) {
            let container = document.createElement("div");
            container.setAttribute('class', 'message-container');

            let el = document.createElement("div");
            el.setAttribute("class", "message received");
            el.innerHTML = `
                  <div class="user-info">
                            <span class="message-username">${objUser.nombreUsuario}</span>
                            <img src="Images/profile-genius.jpg" alt="Code Genius" class="message-icon">
                        </div>
                        <p>${m.texto}</p>
            `;

            container.appendChild(el);
            messageContainer.appendChild(container);
        } else {
            let container = document.createElement("div");
            container.setAttribute('class', 'message-container');

            let el = document.createElement("div");
            // el.setAttribute("class", "message my-message");
            el.setAttribute("class", "message sent");
            el.innerHTML = `
                <!-- <div class="name">You--</div> -->
                 <div class="user-info">
                            <img src="Images/profile-genius.jpg" alt="Code Genius" class="message-icon">
                        </div>
                        <p>${m.texto}</p>
            `;
            container.appendChild(el);
            messageContainer.appendChild(container);
        }
    })
}


function createRoomId(s_id1, s_id2) {
    let id1 = parseInt(s_id1);
    let id2 = parseInt(s_id2);

    let maxID = '';
    let minID = '';
    if (id1 > id2) {
        maxID = id1;
        minID = id2;
    } else {
        maxID = id2;
        minID = id1;
    }

    let chatId = 'private' + minID + maxID;
    return chatId;
}

document.getElementById('logout').addEventListener('click', () => {

    console.log('hola');
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/';
            } else {
                console.error('Error al cerrar sesión:', data.message);
            }
        });
})

document.querySelector(".chat-input #send-message").addEventListener("click", function () {
    let message = document.getElementById("message-input").value;
    if (message.lenght == 0) {
        return;
    }
    // console.log(message);

    let encrypt = document.getElementById("checkboxInput");

    if (encrypt.checked) {
        message = btoa(message);
    } else {
        // console.log(' no encriptacion')
    }

    socketData.socket.emit("chat", {
        username: socketData.username,
        text: message
    }, socketData.roomId);

    fetch("/save-private-message", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            file: null,
            destinatarioID: destinatarioID,
            encriptacion: encrypt.checked,
        }),
    });
    document.getElementById("message-input").value = "";

});


getUsers();
