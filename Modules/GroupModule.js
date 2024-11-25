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
    },

    saveGroupMessage: async function (message, file, idUser, idGroup) {
        try {

            const [rows] = await db.execute(`CALL GRUPO_GuardarMensaje(?, ?, ?, ?)`, [idGroup, idUser, message, file]);
            return rows[0]; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    },

    getGroupChat: async function (idGrupo) {
        try {
            const [rows] = await db.execute(`CALL GRUPO_ObtenerMensajes(?)`, [idGrupo]);
            return rows[0]; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    },

    getGroupCreator: async function(groupID) {
        try {
            const query = 'SELECT creadorID FROM Grupo WHERE grupoID = ?';
            const [rows] = await db.execute(query, [groupID]);

            // Muestra el resultado de la consulta en consola para verificar
            console.log("Resultado de la consulta getGroupCreator:", rows);

            // Si rows tiene datos, devuelve el creadorID
            return rows[0]?.creadorID || null;  // Devuelve null si no hay datos
        } catch (error) {
            console.error("Error al obtener el creador del grupo:", error);
            throw error;
        }
    }
}

module.exports = groupMod;