const db = require('./database.js');

const chatMod = {
    getChatId: async function (my_id, contact_id) {
        try {
            const [rows] = await db.execute(`SELECT * FROM Grupo WHERE correo = ?`, [_email]);
            return rows[0]; // Devolver los datos de la consulta
        } catch (error) {
            console.error("Error en la consulta:", error);
            throw error; // Lanzar el error para manejarlo en la ruta si es necesario
        }
    },
}

module.exports = chatMod;