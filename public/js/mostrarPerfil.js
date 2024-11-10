
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

const groups = document.getElementById('profile-info');


function obtenerDatos() {

    console.log('obteniendo datos...');
    fetch('/get-perfilUser')
        .then(response => {
            return response.json();
        }).then(response => {
            let data = response.data;
            console.log(data);

            data.forEach((element) => {
                let info_contenedor = document.getElementById('profile-info');
                let groupDiv = document.createElement('div');
                
                groupDiv.innerHTML = `
                                <div id="info">
                                    <h2>Nombre(s): ${element.nombreUsuario}</h2>
                                    <h2>Apellido(s): ${element.nombreApellido}</h2>
                                    <h2>Correo: ${element.correo}</h2>
                                    <h2>Contraseña: ${element.contrasena}</h2>
                                </div>
                                    `
                groups.appendChild(groupDiv);
                info_contenedor.scrollTop = info_contenedor.scrollHeight - info_contenedor.clientHeight;

            });
        });
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

obtenerDatos();