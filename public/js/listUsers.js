import socketData from "./socket.js";

let arrayContactos = document.getElementsByClassName('contact-item');

async function validateAuth() {
    fetch('/checkSession')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                console.log('Sesión activa: ', data.user);
                socketData.username = data.user['username'];
                socketData.id = data.user['userId'];
                updateUser();
                let newRoomId = createRoomId(socketData.id, socketData.id);
                socketData.socket.emit("joinRoom", socketData.username, newRoomId);
                socketData.roomId = newRoomId;
                changeChat(socketData.id);
            } else {
                window.location.href = '/';
                console.log('No hay sesión activa');
            }
        });
}

validateAuth();

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
    container.appendChild(newUser);
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
    console.log(res);

    const nombreContacto = document.getElementById('contact-name');
    nombreContacto.innerHTML =
        `
    <img src="Images/profile-genius.jpg" alt="Code Genius" class="header-icon">
    ${user['nombreUsuario']}
    `;

}

function updateUser() {
    document.getElementById('current-user').innerHTML = socketData.username;
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

updateUser();

getUsers();