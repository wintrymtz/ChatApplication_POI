
const db = require('../database.js'); 


const homeworkMod = {

    // Crear Tarea
    createTask: async function (instrucciones, puntosTarea, vencimiento, grupoID) {
        try {
            const [result] = await db.query(
                'INSERT INTO Tarea (instrucciones, puntosTarea, vencimiento, grupoID) VALUES (?, ?, ?, ?)',
                [instrucciones, puntosTarea, vencimiento, grupoID]
            );
            return { success: true, taskId: result.insertId }; // Devuelve el ID de la tarea creada
        } catch (error) {
            console.error('Error al crear tarea:', error);
            throw error;
        }
    },

    // // Obtener todas las tareas
    // getAllTasks: async function () {
    //     try {
    //         const [tasks] = await db.query('SELECT * FROM tasks');
    //         return tasks;
    //     } catch (error) {
    //         console.error('Error al obtener tareas:', error);
    //         throw error;
    //     }
    // },

    // // Calificar Tarea
    // rateTask: async function (taskId, rating) {
    //     try {
    //         const [result] = await db.query(
    //             'UPDATE tasks SET rating = ? WHERE id = ?', 
    //             [rating, taskId]
    //         );
    //         return result.affectedRows > 0; // Retorna true si la actualización fue exitosa
    //     } catch (error) {
    //         console.error('Error al calificar tarea:', error);
    //         throw error;
    //     }
    // },

    // // Subir archivo para una Tarea (solo guarda la información del archivo, sin manejarlo)
    // uploadTaskFile: async function (taskId, filePath) {
    //     try {
    //         const [result] = await db.query(
    //             'UPDATE tasks SET file_path = ? WHERE id = ?', 
    //             [filePath, taskId]
    //         );
    //         return result.affectedRows > 0;
    //     } catch (error) {
    //         console.error('Error al subir archivo de tarea:', error);
    //         throw error;
    //     }
    // }

    
}


module.exports = homeworkMod;

// // Crear Tarea
// router.post('/create', async (req, res) => {
//     const { title, description, cost, deadline } = req.body;
//     try {
//         await db.query(
//             'INSERT INTO tasks (title, description, cost, deadline) VALUES (?, ?, ?, ?)', 
//             [title, description, cost, deadline]
//         );
//         res.status(201).json({ success: true, message: 'Tarea creada con éxito' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error al crear tarea', error });
//     }
// });

// // Subir archivo para una Tarea
// router.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
//     }
//     res.status(200).json({ 
//         success: true, 
//         message: 'Archivo subido con éxito', 
//         file: req.file 
//     });
// });

// // Calificar Tarea
// router.post('/rate', async (req, res) => {
//     const { taskId, rating } = req.body;
//     try {
//         await db.query(
//             'UPDATE tasks SET rating = ? WHERE id = ?', 
//             [rating, taskId]
//         );
//         res.status(200).json({ success: true, message: 'Tarea calificada con éxito' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error al calificar tarea', error });
//     }
// });

// // Mostrar Tarea
// router.get('/', async (req, res) => {
//     try {
//         const [tasks] = await db.query('SELECT * FROM tasks');
//         res.status(200).json(tasks);
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error al obtener tareas', error });
//     }
// });

// // Crear Tarea
// router.post('/create', async (req, res) => {
//     const { title, description, cost, deadline } = req.body;
//     try {
//         await db.query(
//             'INSERT INTO tasks (title, description, cost, deadline) VALUES (?, ?, ?, ?)', 
//             [title, description, cost, deadline]
//         );
//         res.status(201).json({ success: true, message: 'Tarea creada con éxito' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Error al crear tarea', error });
//     }
// });

