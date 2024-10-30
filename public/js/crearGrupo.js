
document.getElementById('right-button').addEventListener('click', () => {
    const rightMenu = document.getElementById('right-menu');

    // Cambia la visibilidad del menú
    if (rightMenu.style.display == 'block') {
        rightMenu.style.display = 'none'; // Ocultar si está visible
    } else {
        rightMenu.style.display = 'block'; // Mostrar si está oculto
    }

    console.log(rightMenu.style);
})

const selectedUsers = [];
const form = document.getElementById('group-form');
const groups = document.getElementById('grupos');

function mostrarFormulario() {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    groups.style.display = groups.style.display === 'none' ? 'block' : 'none';
}

function obtenerGrupos() {

    console.log('obteniendo grupos...');
    fetch('/get-groups')
        .then(response => {
            return response.json();
        }).then(response => {
            data = response.data;
            console.log(data);

            data.forEach((element) => {
                let grupos_contenedor = document.getElementById('grupos');
                let groupDiv = document.createElement('div');
                groupDiv.classList.add('LinkEquipo');
                groupDiv.id = `${element.grupoID}`;
                groupDiv.innerHTML = `
                                <div class="team">
                                    <h2>${element.nombreGrupo}</h2>
                                    <p>${element.descripcion}</p>
                                </div>
                                    `
                groups.appendChild(groupDiv);
                grupos_contenedor.scrollTop = grupos_contenedor.scrollHeight - grupos_contenedor.clientHeight;

                groupDiv.addEventListener('click', () => {
                    localStorage.setItem('grupoID', element.grupoID);
                    window.location.href = 'muralV2.html'
                })
            });
        });
}

function agregarUsuario() {
    const userInput = document.getElementById('user-search').value;
    if (userInput.trim() !== '' && !selectedUsers.includes(userInput)) {
        selectedUsers.push(userInput);
        actualizarLista();
        document.getElementById('user-search').value = ''; // Limpiar el input después de agregar
    }
}

function actualizarLista() {
    const selectedList = document.getElementById('selected-users');
    selectedList.innerHTML = '';
    selectedUsers.forEach(user => {
        selectedList.innerHTML += `<li>${user} <button type="button" onclick="eliminarUsuario('${user}')">Eliminar</button></li>`;
    });
}

function eliminarUsuario(user) {
    const index = selectedUsers.indexOf(user);
    if (index > -1) {
        selectedUsers.splice(index, 1);
        actualizarLista();
    }
}

let inputSearch = document.getElementById('user-search');
inputSearch.addEventListener("keydown", debounce(async function (e) {

    const divs = document.querySelectorAll(".s2_result");
    divs.forEach(div => div.remove());

    const query = inputSearch.value;
    await search(query);
}, 300));

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
    console.log(res.data);
    let elementos = res.data;

    let container = document.getElementById('search-results2');
    for (let i = 0; i <= 5; i++) {
        if (elementos.at(i)) {
            let e = elementos.at(i);

            let newUser = document.createElement('div');
            newUser.classList.add('s2_result');
            newUser.id = `${e['usuarioID']}`;
            newUser.innerHTML = `
                            <span class="s2_name">
                                <p>${e['nombreUsuario']}</p>
                            </span>
                            <span class="s2_email">
                                <p> ${e['correo']} </p>
                            </span>
                                `
            container.appendChild(newUser);

            newUser.addEventListener('click', () => {
                document.getElementById('user-search').value = e['correo'];
            })
        }
        else {
            return;
        }
    }
}

function debounce(func, delay) {
    let debounceTimer;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    let nombreGrupo = document.getElementById('group-name').value;
    let descGrupo = document.getElementById('group-description').value;

    data = {
        nombreGrupo: nombreGrupo,
        descripcionGrupo: descGrupo,
        users: selectedUsers
    }

    fetch("/create-group", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data: data
        }),
    }).then(response => {
        return response.json()
    }).then(response => {
        console.log(response);
    });

    console.log(data);
})

obtenerGrupos();