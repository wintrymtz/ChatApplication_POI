const db = require('../database.js');

const rewardsMod = {
    
    // Obtener el título actual del usuario por `tituloID`
    getTitleById: async function (idUsuario) {
        try {
            const [rows] = await db.query(`CALL USUARIOS_ObtenerTituloActual(?)`, [idUsuario]);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener el título actual:', error);
            throw error;
        }
    },

    // Obtener títulos desbloqueados del usuario 
    getUnlockedTitles: async function (idUsuario) {
        try {
            const [rows] = await db.query(`CALL USUARIOS_ObtenerTitulosDesbloqueados(?)`, [idUsuario]);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener títulos desbloqueados:', error);
            throw error;
        }
    },


    // Obtener el puntaje necesario para la próxima recompensa
    getNextRewardPoints: async function (idUsuario) {
        try {
            const [rows] = await db.query(`CALL PREMIOS_ProximaRecompensa(?)`, [idUsuario]);
            
            // Verifica cómo se estructura el resultado
            console.log('Resultado de rows:', rows);
        
            // Asegúrate de que accedemos correctamente al campo `proxima_meta`
            return rows[0] && rows[0][0] ? rows[0][0].proxima_meta : null;
        } catch (error) {
            console.error('Error al obtener puntaje para próxima recompensa:', error);
            throw error;
        }
    },


    // Actualizar el título actual del usuario en `Usuario`
    updateUserTitle: async function (idUsuario, nuevoTitulo) {
        try {
            const [result] = await db.query(`CALL USUARIOS_ActualizarTitulo(?, ?)`, [idUsuario, nuevoTitulo]);
            return result.affectedRows > 0; // Retorna true si se actualizó con éxito
        } catch (error) {
            console.error('Error al actualizar el título del usuario:', error);
            throw error;
        }
    }
};

module.exports = rewardsMod;
