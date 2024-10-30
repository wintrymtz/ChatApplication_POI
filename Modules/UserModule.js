const db = require('../database.js');

const usuarioMod = {
    registrarUsuario: async function (_name, _email, _username, _password) {
        try {
            const [rows] = await db.execute(`CALL USUARIOS_AgregarUsuario('${_name}','${_username}','${_email}','${_password}', null)`)

            return true;
        } catch (error) {
            console.error("Error en la consulta:", error);
            return false;
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
    },

    getAllUsers: async function () {
        try {
            const [rows] = await db.execute(`SELECT usuarioID, nombreUsuario, correo FROM Usuario`);
            return rows; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    },

    searchUsers: async function (_value) {
        try {
            const [rows] = await db.execute(`SELECT usuarioID, nombreUsuario, correo, foto FROM Usuario WHERE nombreUsuario LIKE ?`, [`%${_value}%`]);
            return rows; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    },

    findUserbyId: async function (id) {
        try {
            const [rows] = await db.execute(`CALL USUARIOS_ObtenerUsuarioPorID(?)`, [id]);
            return rows[0]; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    }
}

module.exports = usuarioMod;