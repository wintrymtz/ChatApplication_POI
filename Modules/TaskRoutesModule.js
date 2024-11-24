const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const db = require('../database.js'); 

// Crear Tarea
router.post('/create', async (req, res) => {
    const { title, description, cost, deadline } = req.body;
    try {
        await db.query(
            'INSERT INTO tasks (title, description, cost, deadline) VALUES (?, ?, ?, ?)', 
            [title, description, cost, deadline]
        );
        res.status(201).json({ success: true, message: 'Tarea creada con éxito' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear tarea', error });
    }
});

// Subir archivo para una Tarea
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No se subió ningún archivo' });
    }
    res.status(200).json({ 
        success: true, 
        message: 'Archivo subido con éxito', 
        file: req.file 
    });
});

// Calificar Tarea
router.post('/rate', async (req, res) => {
    const { taskId, rating } = req.body;
    try {
        await db.query(
            'UPDATE tasks SET rating = ? WHERE id = ?', 
            [rating, taskId]
        );
        res.status(200).json({ success: true, message: 'Tarea calificada con éxito' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al calificar tarea', error });
    }
});

// Mostrar Tarea
router.get('/', async (req, res) => {
    try {
        const [tasks] = await db.query('SELECT * FROM tasks');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener tareas', error });
    }
});

module.exports = router;
