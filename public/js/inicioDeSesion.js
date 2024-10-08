const formulario = document.getElementById('formulario');

formulario.addEventListener("submit", (event) => {
    event.preventDefault();
})

function iniciarSesion() {
    let user = document.getElementById("username").value;
    localStorage.removeItem("user");
    localStorage.setItem("user", user);

    serverFindUser(user);

    window.location.href = "chat.html";
}


function serverFindUser(_email) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    fetch(`/get-user?id=josejaime.delosriosm`, {
    }).then(response => {
        console.log(response.data);
    })
        .catch(error => {
            console.log(error);
        });
}