
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




function mostrarTituloActual(tituloActual) {
    const rewardInfoDiv = document.getElementById('reward-info');
    const tituloActualElement = document.createElement('h2');

    if (tituloActual) {
        tituloActualElement.textContent = `Título actual: ${tituloActual}`;
        rewardInfoDiv.insertBefore(tituloActualElement, rewardInfoDiv.firstChild);
    }
}


function agregarOpcionesSelect(unlockedTitles) {
    const selectElement = document.getElementById('select-titulos');
    
    const optionNinguno = document.createElement('option');
    optionNinguno.value = '';  // 
    optionNinguno.textContent = 'Ninguno';
    selectElement.appendChild(optionNinguno);

    unlockedTitles.forEach((title) => {
        const option = document.createElement('option');
        option.value = title.premioID;
        option.textContent = title.titulo;
        selectElement.appendChild(option);
    });
}


function obtenerDatos() {

    console.log('obteniendo datos de usuario...');
    fetch('/get-perfilUser')
        .then(response => {
            return response.json();
        }).then(response => {
            let data = response.data;
            console.log(data);

            data.forEach((element) => {
                let groups = document.getElementById('user-info');
                let groups2 = document.getElementById('next-info');
                let groupDiv = document.createElement('div');
                let groupDiv2 = document.createElement('div');
            
                // Crear el contenido condicionalmente
                let tituloActualHTML = element.tituloActual 
                    ? `<h2>Título Actual: ${element.tituloActual}</h2>` 
                    : '';
            
                // Agregar el HTML completo al innerHTML de groupDiv
                groupDiv.innerHTML = `
                    <div id="info">
                        <h2>${element.nombreUsuario} ${element.nombreApellido}</h2>
                        ${tituloActualHTML}
                    </div>
                `;

                groupDiv2.innerHTML = `
                    <div id="info">
                        <h3>Puntos actuales: ${element.puntos}</h3>
                    </div>
                `;
            
                groups.appendChild(groupDiv);
                groups2.appendChild(groupDiv2);
            });
            
        });
}



function obtenerMeta() {
    console.log('obteniendo meta a perseguir...');
    fetch('/get-next-reward-points')
        .then(response => response.json())
        .then(response => {
            let nextPoints = response.data.nextPoints; 
            
            if (nextPoints !== null && nextPoints !== undefined) {
                let info_contenedor = document.getElementById('next-info');
                let groupDiv = document.createElement('div');
                
                groupDiv.innerHTML = `
                    <div>
                        <h3>Puntos para la Próxima Recompensa: ${nextPoints}</h3>
                    </div>
                `;
                
                info_contenedor.appendChild(groupDiv);
                info_contenedor.scrollTop = info_contenedor.scrollHeight - info_contenedor.clientHeight;
            } else {
                let info_contenedor = document.getElementById('next-info');
                let groupDiv = document.createElement('div');
                
                groupDiv.innerHTML = `
                    <div>
                        <h3>Se han conseguido todas las Recompensas disponibles.</h3>
                    </div>
                `;
                
                info_contenedor.appendChild(groupDiv);
                info_contenedor.scrollTop = info_contenedor.scrollHeight - info_contenedor.clientHeight;
            }
        })
        .catch(error => console.error('Error:', error));
}



// Llamada inicial para cargar el título actual y los títulos desbloqueados
fetch('/get-unlocked-titles')
    .then(response => response.json())
    .then(response => {
        agregarOpcionesSelect(response.unlockedTitles); // Agrega los títulos al select
    });

// Elementos del DOM
const selectElement = document.getElementById('select-titulos');
const updateButton = document.getElementById('actualizar-titulo');


// Enviar solicitud de actualización al hacer clic en el botón
updateButton.addEventListener('click', () => {
    const selectedTitleID = selectElement.value || null; // Si es "Ninguno", será null

    fetch('/update-user-title', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newTituloID: selectedTitleID })  
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Título actualizado con éxito');
            location.reload();
        } else {
            alert('Error al actualizar el título');
        }
    })
    .catch(error => {
        console.error('Error al actualizar el título:', error);
    });
});



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
obtenerMeta();
