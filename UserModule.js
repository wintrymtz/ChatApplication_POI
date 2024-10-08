const db = require('./database.js');

const usuarioMod = {
    registrarUsuario: function (_name, _email, _username, _password) {
        db.query(`insert into Usuario(nombreUsuario, correo, ApellidoUsuario, contrasena)
            VALUES ('${_name}', '${_email}', '${_username}', '${_password}')`, (error, result, fields) => {
            console.log(error);
            console.log(result);
            console.log(fields);
        });
    },

    findUser: async function (_email) {
        try {
            const [rows] = await db.execute(`SELECT * FROM Usuario WHERE correo = ?`, [_email]);
            return rows[0]; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    }
}

module.exports = usuarioMod;