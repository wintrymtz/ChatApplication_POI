// let localUser = localStorage.getItem("user");
import socketData from "./socket.js";

let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('roomId');

let fileInput = document.getElementById("input-file");

// async function getChatRoom(my_email, contact_email) {
//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");

//     const response = await fetch("/getChat", {
//         method: "POST",
//         body: JSON.stringify(data = {
//             user: my_email,
//             contact: contact_email
//         }),
//         headers: myHeaders,
//     })

//     let res = await response.json();
//     console.log(res);
//     return res['chatId'];
// }

// chat.js
const socket = io();

const callButton = document.getElementById("call-btn");
// const recipientId = socketData.roomId;

callButton.addEventListener("click", () => {
    const recipientId = socketData.roomId;

    if (recipientId) { // Comprueba si recipientId está definido
        window.location.href = `./videollamadav2.html?roomId=${recipientId}`; // Redirige con el ID en la URL
    } else {
        console.error("Error: No se ha seleccionado un destinatario para la llamada.");
    }
});

async function startCall() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("local-video").srcObject = stream;

    const peer = new RTCPeerConnection(servers);
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("callUser", {
                to: recipientId, // ID del usuario con quien se quiere iniciar la llamada
                from: socket.id,
                signal: peer.localDescription
            });
        }
    };

    peer.ontrack = (event) => {
        document.getElementById("remote-video").srcObject = event.streams[0];
    };

    socket.on("callAccepted", (signal) => {
        peer.setRemoteDescription(new RTCSessionDescription(signal));
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("callUser", { to: recipientId, signal: offer });
}

socket.on("callIncoming", (data) => {
    acceptCall(data);
});

async function acceptCall(data) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("local-video").srcObject = stream;

    const peer = new RTCPeerConnection(servers);
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
        document.getElementById("remote-video").srcObject = event.streams[0];
    };

    peer.setRemoteDescription(new RTCSessionDescription(data.signal));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("acceptCall", { to: data.from, signal: answer });
}

function endCall() {
    socket.emit("endCall", { to: recipientId });
    const localVideo = document.getElementById("local-video");
    const remoteVideo = document.getElementById("remote-video");

    localVideo.srcObject.getTracks().forEach(track => track.stop());
    remoteVideo.srcObject = null;
}

socket.on("callEnded", () => {
    endCall();
});


(async function () {
    const app = document.querySelector(".chat-content");
    console.log('inició correctamente el chat');
    // socket = io();

    // roomId = prompt('Ingrese numero de sala');
    // my_email = prompt('ingrese su correo');
    let my_email = '';
    // contact_email = prompt('ingrese el correo del contacto');
    // roomId = await getChatRoom(my_email, contact_email);
    console.log(socketData.roomId);
    let uname;

    joinRoom();

    // app.querySelector(".join-screen #join-user").addEventListener("click", function () {
    //     let username = app.querySelector(".join-screen #username").value;
    //     if (username.lenght == 0) {
    //         return;
    //     }
    //     socket.emit("newuser", username);
    //     uname = username;
    //     app.querySelector(".join-screen").classList.remove("active");
    //     app.querySelector(".chat-screen").classList.remove("active");
    // })

    function joinRoom() {
        let username = 'wintry';
        if (username.lenght == 0) {
            return;
        }
        console.log('se intenta unir a la sala:' + socketData.roomId);
        // socketData.socket.emit("joinRoom", username, socketData.roomId);
        uname = username;
    }
    // document.addEventListener("DOMContentLoaded", () => {
    //     // let username = app.querySelector(".join-screen #username").value;
    //     let username = 'wintry';
    //     if (username.lenght == 0) {
    //         return;
    //     }
    //     socket.emit("joinRoom", username, roomId);
    //     uname = username;
    //     //     app.querySelector(".join-screen").classList.remove("active");
    //     //     app.querySelector(".chat-screen").classList.remove("active");
    // });

    app.querySelector(".chat-input #send-message").addEventListener("click", function () {
        // let message = app.querySelector(".chat-content #message-input").value;
        let message = document.getElementById("message-input").value;
        if (message.lenght == 0) {
            return;
        }
        renderMessage("my", {
            username: uname,
            text: message
        });
    });

    function changed() {
        socketData.socket.emit("exituser", uname);
        window.location.href = window.location.href;
    }

    socketData.socket.on("update", function (update, _roomId) {
        renderMessage("update", update);
    });

    socketData.socket.on("chat", function (message) {
        renderMessage("other", message);
    });

    socketData.socket.on("file", function (file) {
        renderMessageFile("other", file);
    });


    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // Lee el archivo como un DataURL (Base64)
            const reader = new FileReader();
            reader.onloadend = function () {
                // Obtén el contenido Base64 del archivo
                const base64File = reader.result.split(',')[1]; // Elimina la parte 'data:...'

                renderMessageFile('my', base64File);
            };

            reader.readAsDataURL(file); // Lee el archivo como DataURL (Base64)
        }
    });

    function renderMessageFile(type, file) {
        console.log('intentnaod renderizar:', file);
        let messageContainer = app.querySelector(".chat-content .chat-messages");

        if (type == "my") {
            let container = document.createElement("div");
            container.setAttribute('class', 'message-container');

            let el = document.createElement("div");
            // el.setAttribute("class", "message my-message");
            el.setAttribute("class", "message sent");
            el.innerHTML = `
                <!-- <div class="name">You--</div> -->
                 <div class="user-info">
                      <img src ="data:;base64,${file}" width = 50%></img>
                    </div>
            `;
            container.appendChild(el);
            messageContainer.appendChild(container);
        } else if (type == "other") {
            console.log("se recivió: ", file);
            let container = document.createElement("div");
            container.setAttribute('class', 'message-container');

            let el = document.createElement("div");
            el.setAttribute("class", "message received");
            el.innerHTML = `
                  <div class="user-info">
                            <img src ="data:;base64,${file.file}" width = 50%></img>
                        </div>
            `;

            container.appendChild(el);
            messageContainer.appendChild(container);

        } else if (type == "update") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }

        //scroll chat to end
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }

    function renderMessage(type, message) {
        console.log('intentnaod renderizar:', message);
        let messageContainer = app.querySelector(".chat-content .chat-messages");


        if (type == "my") {
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
                        <p>${message.text}</p>
            `;
            container.appendChild(el);
            messageContainer.appendChild(container);
        } else if (type == "other") {
            let container = document.createElement("div");
            container.setAttribute('class', 'message-container');

            let el = document.createElement("div");
            el.setAttribute("class", "message received");
            el.innerHTML = `
                  <div class="user-info">
                            <span class="message-username">${message.username}</span>
                            <img src="Images/profile-genius.jpg" alt="Code Genius" class="message-icon">
                        </div>
                        <p>${message.text}</p>
            `;

            container.appendChild(el);
            messageContainer.appendChild(container);

        } else if (type == "update") {
            let el = document.createElement("div");
            el.setAttribute("class", "update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }

        //scroll chat to end
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    }
})();


document.querySelectorAll('.user-item').forEach(item => {
    item.addEventListener('click', (e) => {
        recipientId = e.target.getAttribute('data-id'); // Aquí asignamos el ID del usuario seleccionado
        openChatWithUser(recipientId); // Función para abrir el chat privado
    });
});

// window.addEventListener("DOMContentLoaded", async () => {
//     // Extrae roomId de la URL
//     let queryString = window.location.search;
//     let urlParams = new URLSearchParams(queryString);
//     let roomId = urlParams.get('roomId');

//     // Comprueba si roomId está definido antes de continuar
//     if (!roomId) {
//         console.error("No se encontró el roomId en la URL.");
//         return;
//     }

//     // Configura la videollamada
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     document.getElementById("local-video").srcObject = stream;

//     // Configura los eventos y conexión RTCPeerConnection
//     initVideoCall(roomId, stream); // Define la función `initVideoCall` para gestionar la conexión
// });





/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////   UBICACIÓN DEL USUARIO   //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

const locationButton = document.getElementById('location-btn');
const messageInput = document.getElementById('message-input');

locationButton.addEventListener('click', () => {

    // Verifica si el navegador soporta la API paara obtener la ubicación
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Generamos el enlace de Google Maps con la ubicación
            const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            messageInput.value = googleMapsLink;
        }, (error) => {
            console.error("Error obteniendo la ubicación: ", error);
            alert("No se pudo obtener la ubicación. Por favor, verifica los permisos de ubicación en tu navegador.");
        });
    } else {
        alert("La Geolocalización no está soportada en tu navegador.");
    }
});





//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////// Pop-up para donde aparecerá donde el usuario puede escribir el correo /////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Pop up
// Obtener el botón y el contenedor del pop-up
const mailBtn = document.getElementById('mail-btn');
const emailPopup = document.getElementById('emailPopup');
const closePopupBtn = document.getElementById('closePopup');

// Mostrar el pop-up
mailBtn.addEventListener('click', () => {
    emailPopup.style.display = 'block';
});

// Ocultar el pop-up
closePopupBtn.addEventListener('click', () => {
    emailPopup.style.display = 'none';
});

// Función adicional para cerrar el pop-up después de enviar el correo
function closePopup() {
    emailPopup.style.display = 'none';
}



//Enviar correo
document.getElementById('emailForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const to = document.getElementById('toEmail').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    try {
        fetch('/send-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: recipientEmail, subject: emailSubject, message: emailMessage })
        });

        const result = await response.json();
        if (result.success) {
            alert('Correo enviado exitosamente');
            closePopup(); // Cierra el pop-up después del envío exitoso
        } else {
            alert('Error al enviar el correo: ' + result.message);
        }
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        alert('Error al enviar el correo');
    }
});


