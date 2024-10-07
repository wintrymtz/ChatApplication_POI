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

function serverRegistrar(_user) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    fetch("/registrar-usuario", {
        method: "POST",
        body: JSON.stringify(_user),
        headers: myHeaders,
    }).then(response => {
        console.log(response.data);
    })
        .catch(error => {
            console.log(error);
        });
}
