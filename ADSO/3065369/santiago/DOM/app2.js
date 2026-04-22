const input = document.getElementById('mensajeInput');
        const boton = document.getElementById('btnEnviar');
        const contenedor = document.getElementById('contenedorMensajes');

        boton.addEventListener('click', function() {
            
            const texto = input.value;

            if (texto === "") {
                alert("Debes escribir algo de información.");
            } else {
                const nuevoMensaje = document.createElement('p');

                nuevoMensaje.textContent = texto;

                contenedor.appendChild(nuevoMensaje);

                input.value = "";
            }
        });