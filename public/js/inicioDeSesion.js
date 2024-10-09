const formulario = document.getElementById('formulario');

formulario.addEventListener("submit", (event) => {
    event.preventDefault();
})

function iniciarSesion() {
    let user = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    // localStorage.removeItem("user");
    // localStorage.setItem("user", user);

    if (formulario.checkValidity()) {
        serverFindUser(user, password);
    }

}


async function serverFindUser(_email, _password) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const currentUser = {
        'email': _email,
        'password': _password
    }

    const response = await fetch("/login", {
        method: "POST",
        body: JSON.stringify(currentUser),
        headers: myHeaders,
    })
    let res = await response.json();

    switch (res['success']) {
        case true:
            console.log('INICIADO SESION :)');
            window.location.href = "chat.html";
            break;
        case false:
            alert(res['message']);
            break;
    }

}