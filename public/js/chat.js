// let localUser = localStorage.getItem("user");
import socketData from "./socket.js";

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
        let message = app.querySelector(".chat-content #message-input").value;
        if (message.lenght == 0) {
            return;
        }

        console.log('se mandó el mensaje:', message);
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

    function renderMessage(type, message) {
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