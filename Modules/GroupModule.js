const db = require('../database.js');

const groupMod = {
    createGroup: async function (nombre, descripcion, idCreador) {
        try {
            const [rows] = await db.execute(`CALL GRUPO_CrearGrupo(?, ?, ?)`, [nombre, descripcion, idCreador]);
            // console.log(rows[0][0].grupoID);
            return rows[0][0].grupoID; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    },

    addUsersToGroup: async function (idGroup, correo, groupType) {
        try {
            if (groupType == 1) {
                const [rows] = await db.execute(`CALL GRUPO_AgregarUsuarios(?, ?)`, [idGroup, correo]);
                return rows[0][0].response; // Devolver los datos de la consulta
            }
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    },

    getAllGroups: async function (id_user) {
        try {
            const [rows] = await db.execute(`CALL GRUPO_ObtenerGrupos(?)`, [id_user]);
            return rows[0]; // Devolver los datos de la consulta

        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    }
}

module.exports = groupMod;