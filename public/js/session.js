import socketData from "./socket.js";

async function validateAuth() {
    fetch('/checkSession')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                console.log('Sesión activa: ', data.user);
                socketData.username = data.user['username'];
                socketData.id = data.user['userId'];
                updateUser();
                // let newRoomId = 'createRoomId(socketData.id, socketData.id);'
                // let newRoomId = 'none';
                // socketData.socket.emit("joinRoom", socketData.username, newRoomId);
                // socketData.roomId = newRoomId;
                // changeChat(socketData.id);
            } else {
                window.location.href = '/';
                console.log('No hay sesión activa');
            }
        });
}


function updateUser() {
    document.getElementById('current-user').innerHTML = socketData.username;
}

validateAuth();