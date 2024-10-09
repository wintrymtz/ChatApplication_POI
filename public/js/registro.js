form = document.getElementById('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
})



function registrarse() {

    let name = document.getElementById('fullname').value;
    let email = document.getElementById('email').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    const user = {
        name: name,
        email: email,
        username: username,
        password: password,
    };

    //Dar de alta
    serverRegistrar(user);
    // console.log(user);
}

async function serverRegistrar(_user) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch("/registrar-usuario", {
        method: "POST",
        body: JSON.stringify(_user),
        headers: myHeaders,
    })
    let res = await response.json(response);
}
