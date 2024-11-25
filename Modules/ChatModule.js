const db = require('../database.js');

const chatMod = {
    getPrivateChat: async function (userID1, userID2) {
        try {
            console.log(userID1, userID2);
            const [rows] = await db.execute(`CALL CHAT_obtenerMensajesPrivados(?, ?)`, [userID1, userID2]);
            return rows[0]; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    },

    savePrivateMessage: async function (message, file, remitenteID, destinatarioID, encriptado) {
        try {
            const [rows] = await db.execute(`CALL CHAT_EnviarMensajePrivado(?, ?, ?, ?, ?)`, [message, file, remitenteID, destinatarioID, encriptado]);
            return rows[0]; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    }
}

module.exports = chatMod;