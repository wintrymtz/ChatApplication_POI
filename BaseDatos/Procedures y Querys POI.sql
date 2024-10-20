USE BD_POI;



CALL getKardex(101);

DROP PROCEDURE IF EXISTS getKardex;

-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de USUARIOS-----------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- 1. PROCEDURE AGREGAR USUARIO
DELIMITER $$
CREATE PROCEDURE USUARIOS_AgregarUsuario(
    IN p_nombreUsuario VARCHAR(50),
    IN p_nombreApellido VARCHAR(50),
    IN p_correo VARCHAR(100),
    IN p_contrasena VARCHAR(20),
    IN p_foto BLOB
)
BEGIN
    INSERT INTO Usuario (nombreUsuario, nombreApellido, correo, contrasena, foto) 
    VALUES (p_nombreUsuario, p_nombreApellido, p_correo, p_contrasena, p_foto);
END $$
DELIMITER ;



-- 2. SUMARLE LOS PUNTOS AL USUARIO
DELIMITER $$
CREATE PROCEDURE USUARIOS_SumarPuntosUsuario(
    IN p_usuarioID INT,  -- Puntos a sunar
    IN p_puntos INT      -- Usuario a aplicar puntos
)
BEGIN
    UPDATE Usuario
    SET puntos = puntos + p_puntos
    WHERE usuarioID = p_usuarioID;
END $$
DELIMITER ;



-- 3. Actualizar el ID del titulo del usuario
DELIMITER $$
CREATE PROCEDURE USUARIOS_ActualizarTituloUsuario(
    IN p_usuarioID INT, -- ID del usuario que eligió el título
    IN p_titulo VARCHAR(50) -- Título seleccionado por el usuario
)
BEGIN
    -- Primero buscamos el premioID relacionado con el título proporcionado
    DECLARE v_premioID INT;
    
    SELECT premioID INTO v_premioID
    FROM Premio
    WHERE titulo = p_titulo;

    -- Si encontramos el premio, actualizamos el tituloID en la tabla Usuario
    IF v_premioID IS NOT NULL THEN
        UPDATE Usuario
        SET tituloID = v_premioID
        WHERE usuarioID = p_usuarioID;
    END IF;
END $$
DELIMITER ;


-- 4. QUERY PARA MOSTRAR USUARIOS EN EL BUSCADOR
DELIMITER $$
CREATE PROCEDURE USUARIOS_BuscarUsuarios(
    IN p_busqueda VARCHAR(100) -- Parámetro de búsqueda
)
BEGIN
    SELECT CONCAT(nombreUsuario, ' ', nombreApellido) AS nombreCompleto
    FROM Usuario
    WHERE CONCAT(nombreUsuario, ' ', nombreApellido) LIKE CONCAT('%', p_busqueda, '%');
END $$
DELIMITER ;



-- 5. INFOMRACIÓN PERSONALE DEL USUARIO POR ID
DELIMITER $$
CREATE PROCEDURE USUARIOS_ObtenerUsuarioPorID(
    IN p_usuarioID INT -- ID del usuario que se quiere obtener
)
BEGIN
    SELECT U.usuarioID,
           U.nombreUsuario, 
           U.nombreApellido, 
           U.correo, 
           U.puntos, 
           P.titulo AS tituloActual
    FROM Usuario U
    LEFT JOIN Premio P ON U.tituloID = P.premioID
    WHERE U.usuarioID = p_usuarioID;
END $$
DELIMITER ;


-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de PREMIOS------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- 1. MOSTRAR LA SIGUIENTE META A ALCANZAR

DELIMITER $$
CREATE PROCEDURE PREMIOS_ObtenerSiguienteTitulo(
    IN p_usuarioID INT -- ID del usuario para el que se quiere obtener el siguiente título
)
BEGIN
    DECLARE v_puntosUsuario INT;
    
    -- Obtener los puntos actuales del usuario
    SELECT puntos INTO v_puntosUsuario
    FROM Usuario
    WHERE usuarioID = p_usuarioID;

    -- Obtener el siguiente título y los puntos necesarios
    SELECT P.titulo, P.puntaje
    FROM Premio P
    WHERE P.puntaje > v_puntosUsuario
    ORDER BY P.puntaje ASC
    LIMIT 1; -- Traer solo el siguiente título
END $$
DELIMITER ;


-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de USUARIO-PREMIOS----------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- 1. PROCEDURE AGREGAR RECOMPENSA QUE TIENE EL USUARIO
DELIMITER $$
CREATE PROCEDURE USUARIOPREMIOS_AsignarRecompensa(
    IN p_usuarioID INT,
    IN p_premioID INT
)
BEGIN
    INSERT INTO Recompensa (usuarioID, premioID)
    VALUES (p_usuarioID, p_premioID);
END $$
DELIMITER ;



-- 2. QUERY PARA TRAER LOS TITULOS DE UN USUARIO
DELIMITER $$
CREATE PROCEDURE USUARIOPREMIOS_ObtenerPremiosUsuario(
    IN p_usuarioID INT -- Parámetro del ID del usuario
)
BEGIN
    SELECT P.premioID, P.titulo, P.puntaje
    FROM Recompensa R
    INNER JOIN Premio P ON R.premioID = P.premioID
    WHERE R.usuarioID = p_usuarioID;
END $$
DELIMITER ;


-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de MENSAJE------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de CONTENIDO----------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de GRUPO--------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de USUARIO-GRUPO------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de MENSAJE-GRUPO------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de TAREAS-------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- 1. CREAR TAREA
DELIMITER $$
CREATE PROCEDURE TAREAS_CrearTarea(
    IN p_instrucciones VARCHAR(250),  
    IN p_vencimiento DATE,            
    IN p_puntosTarea INT,             
    IN p_grupoID INT                  
)
BEGIN
    INSERT INTO Tarea (instrucciones, vencimiento, puntosTarea, grupoID)
    VALUES (p_instrucciones, p_vencimiento, p_puntosTarea, p_grupoID);
END $$
DELIMITER ;



-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de TAREA-GRUPO--------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- 1. ASIGNAR TAREA A LOS ALUMNOS DE UN GRUPO
DELIMITER $$
CREATE PROCEDURE TAREAGRUPO_AsignarTarea(
    IN p_tareaID INT,
    IN p_usuarioID INT
)
BEGIN
    INSERT INTO Asignar_Tarea (tareaID, usuarioID)
    VALUES (p_tareaID, p_usuarioID);
END $$
DELIMITER ;



-- 2. ALUMNO SUBIENDO LA TAREA
DELIMITER $$
CREATE PROCEDURE TAREAGRUPO_ActualizarTareaAsignada(
    IN p_tareaID INT,      -- ID de la tarea que se quiere actualizar
    IN p_usuarioID INT,    -- ID del usuario que sube la tara
    IN p_homework LONGBLOB -- Tarea a sunir
)
BEGIN
    UPDATE Asignar_Tarea
    SET homework = p_homework
    WHERE tareaID = p_tareaID
      AND usuarioID = p_usuarioID;
END $$
DELIMITER ;



-- 3. CALIFICAR Y SUMAR PUNTOS
DELIMITER $$
CREATE PROCEDURE TAREAGRUPO_ActualizarCalificacionYSumarPuntos(
    IN p_tareaID INT,      -- ID de la tarea
    IN p_usuarioID INT,    -- ID del usuario al que se le asigna la calificación
    IN p_calificacion INT   -- Calificación
)
BEGIN 

    -- Actualizar la calificación de la tarea asignada
    UPDATE Asignar_Tarea
    SET calificacion = p_calificacion
    WHERE tareaID = p_tareaID
      AND usuarioID = p_usuarioID;

    -- Sumar los puntos al usuario de la calificación
    UPDATE Usuario
    SET puntos = puntos + p_calificacion 
    WHERE usuarioID = p_usuarioID;
END $$
DELIMITER ;



-- 4. MOSTRAR AL USUARIO QUE IMPUSO LAS TAREAS QUIEN FALTA DE CALIFICAR
DELIMITER $$
CREATE PROCEDURE TAREAGRUPO_MostrarTareasNoCalificadasPorCreador(
    IN p_creadorID INT  -- ID del creador del grupo
)
BEGIN
    SELECT 
        A.tareaID, 
        U.usuarioID,
        CONCAT(U.nombreUsuario, ' ', U.nombreApellido) AS nombreCompleto,
        T.instrucciones, 
        T.vencimiento,
        G.nombreGrupo
    FROM 
        Asignar_Tarea A
    INNER JOIN 
        Tarea T ON A.tareaID = T.tareaID
    INNER JOIN 
        Grupo G ON T.grupoID = G.grupoID
    INNER JOIN 
        Usuario U ON A.usuarioID = U.usuarioID
    WHERE 
        G.creadorID = p_creadorID    -- Que pertenecen al grupo del creador específico
        AND A.calificacion IS NULL;  -- Tareas no calificadas
END $$
DELIMITER ;



-- 5. MOSTRAR AL USUARIO LAS TAREAS QUE DEBE HACER
DELIMITER $$
CREATE PROCEDURE sp_MostrarTareasSinCalificacion(
    IN p_usuarioID INT -- ID del usuario para el que se quieren mostrar las tareas
)
BEGIN
    SELECT 
        A.tareaID, 
        T.instrucciones, 
        T.vencimiento
    FROM 
        Asignar_Tarea A
    INNER JOIN 
        Tarea T ON A.tareaID = T.tareaID
    WHERE 
        A.usuarioID = p_usuarioID 
        AND A.calificacion IS NULL; -- Tareas sin calificación
END $$
DELIMITER ;




