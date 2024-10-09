const db = require('./database.js');

const usuarioMod = {
    registrarUsuario: async function (_name, _email, _username, _password) {
        try {
            const [rows] = await db.execute(`insert into Usuario(nombreUsuario, correo, ApellidoUsuario, contrasena)
            VALUES ('${_name}', '${_email}', '${_username}', '${_password}')`);
            console.log(rows)
        } catch (error) {
            console.error("Error en la consulta:", error);
        }
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