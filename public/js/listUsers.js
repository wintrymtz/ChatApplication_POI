
let arrayContactos = document.getElementsByClassName('contact-item');

function getUsers() {
    // let response = await fetch();

    // response.foreach((user) => {

    // })

    let newUser = document.createElement('div');
    newUser.classList.add('contact-item');
    let container = document.getElementById('list-contact');
    newUser.innerHTML = `<div class="contact-item">
                    <img src="Images/profile1.jpg" alt="Liam Brown">
                    Liam JKSAHDKJHDKJAS
                    </div> `
    container.appendChild(newUser);
}

arrayContactos.forEach((e) => {
    arrayContactos
});

getUsers();