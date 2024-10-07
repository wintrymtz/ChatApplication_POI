const formulario = document.getElementById('formulario');

formulario.addEventListener("submit", (event) => {
    event.preventDefault();
})

function iniciarSesion() {
    let user = document.getElementById("username").value;
    localStorage.removeItem("user");
    localStorage.setItem("user", user);


    window.location.href = "chat.html";
}