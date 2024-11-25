USE BD_POI;

DROP PROCEDURE IF EXISTS PREMIOS_ProximaRecompensa;
DROP TRIGGER IF EXISTS verificar_desbloqueo_recompensa;

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
    SELECT CONCAT(nombreUsuario, ' ', nombreApellido) AS nombreCompleto, actividad
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
           U.contrasena,
           U.puntos, 
           P.titulo AS tituloActual
    FROM Usuario U
    LEFT JOIN Premio P ON U.tituloID = P.premioID
    WHERE U.usuarioID = p_usuarioID;
END $$
DELIMITER ;



-- 6. OBTENER TITULO ACTUAL DEL USUARIO POR ID
DELIMITER $$
CREATE PROCEDURE USUARIOS_ObtenerTituloActual(
    IN p_idUsuario INT
)
BEGIN
    SELECT P.premioID, P.titulo
    FROM Usuario U
    JOIN Premio P ON U.tituloID = P.premioID
    WHERE U.usuarioID = p_idUsuario;
END $$
DELIMITER ;



 

-- 7. OBTENER LOS TITULOS DESBLOQUEADOS POR EL USUARIO
DELIMITER $$
CREATE PROCEDURE USUARIOS_ObtenerTitulosDesbloqueados(
    IN p_idUsuario INT
)
BEGIN
    SELECT P.premioID, P.titulo
    FROM Recompensa R
    JOIN Premio P ON R.premioID = P.premioID
    WHERE R.usuarioID = p_idUsuario;
END $$
DELIMITER ;




-- 8. ACTUALIZAR TITULO
DELIMITER $$
CREATE PROCEDURE USUARIOS_ActualizarTitulo(
    IN p_idUsuario INT,
    IN p_nuevoTituloID INT
)
BEGIN
    UPDATE Usuario
    SET tituloID = p_nuevoTituloID
    WHERE usuarioID = p_idUsuario;
END $$
DELIMITER ;



-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de PREMIOS------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- 1. MOSTRAR LA SIGUIENTE META A ALCANZAR

DELIMITER $$
CREATE PROCEDURE PREMIOS_ProximaRecompensa(
    IN p_idUsuario INT
)
BEGIN
    DECLARE puntaje_actual INT;

    -- Obtener el puntaje actual del usuario
    SELECT puntos INTO puntaje_actual
    FROM Usuario
    WHERE usuarioID = p_idUsuario;

    -- Seleccionar el puntaje mínimo de la tabla Premio que sea mayor que el puntaje actual del usuario
    SELECT MIN(P.puntaje) AS proxima_meta
    FROM Premio P
    WHERE P.puntaje > puntaje_actual;
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
-- Procedure para chats privados (crear el chat y almacenar contenido)
delimiter //
CREATE PROCEDURE CHAT_EnviarMensajePrivado(
IN p_mensaje TEXT,
IN p_archivo LONGBLOB,
IN p_remitente INT,
IN p_destinatario INT,
IN p_encriptado BOOL
)
BEGIN
	declare _grupoID int;
    declare _response varchar(100);
    declare _contenidoID INT;
    declare _mensajeID INT;
    declare _userValidation INT;
    declare _count INT;
    declare _groupCount INT;
    
    SELECT a.grupoID, count(*) INTO _grupoID, _groupCount
		FROM Usuario_Grupo a
		INNER JOIN Grupo b ON b.grupoID = a.grupoID
		WHERE a.usuarioID IN (p_remitente, p_destinatario)
		AND b.tipoGrupo = 'mensaje'
		GROUP BY a.grupoID
		HAVING COUNT(*) =2;

			
	select COUNT(*) into _userValidation FROM usuario WHERE usuario.usuarioID in (p_remitente, p_destinatario);
    IF _userValidation != 2
    THEN
    SELECT 'NO EXISTEN LOS USUARIOS'; 
    ELSE                    
		IF	_grupoID is null OR _groupCount != 2
		THEN
		set _response = 'Grupo no existe, se creó el grupo';
		INSERT INTO Grupo(nombreGrupo, tipoGrupo, creadorID) VALUES('privateChat', 3, null);
		SET _grupoID = LAST_INSERT_ID();
		INSERT INTO Usuario_Grupo VALUES 
		(p_destinatario, _grupoID),
		(p_remitente, _grupoID);
		END IF;
		
		INSERT INTO Contenido(texto, archivo, escriptacion) VALUES (p_mensaje, p_archivo, p_encriptado);
		SET _contenidoID = LAST_INSERT_ID();     
		INSERT INTO Mensaje (usuarioID, contenidoID, fecha) VALUES (p_remitente, _contenidoID, now());
		SET _mensajeID = LAST_INSERT_ID();     
		INSERT INTO Mensaje_Grupo VALUES(_mensajeID, _grupoID);  
	END IF;

END //
delimiter ;
-- OBTENER MENSAJES PRIVADOS
DELIMITER //
CREATE PROCEDURE CHAT_obtenerMensajesPrivados(
IN p_usuarioID INT,
IN p_usuario2ID INT
)
BEGIN

declare _grupoID INT;
declare _cantidad INT;

 SELECT a.grupoID, count(*) INTO _grupoID, _cantidad
		FROM Usuario_Grupo a
		INNER JOIN Grupo b ON b.grupoID = a.grupoID
		WHERE a.usuarioID IN (p_usuarioID, p_usuario2ID)
		AND b.tipoGrupo = 'mensaje'
		GROUP BY a.grupoID
		HAVING COUNT(*) =2;

        
        IF _cantidad = 2 THEN
	SELECT m.usuarioID, c.texto, c.archivo, m.fecha, c.encriptacion FROM Contenido c
			INNER JOIN Mensaje m ON c.contenidoID = m.contenidoID
			INNER JOIN mensaje_grupo mg ON mg.mensajeID = m.mensajeID
			INNER JOIN grupo g ON g.grupoID = mg.grupoID
			WHERE g.grupoID = _grupoID;
		END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE CHAT_Historial(IN p_usuarioID INT)
BEGIN
SELECT u.nombreUsuario, u.usuarioID, g.grupoID, MAX(fecha) as ultima_fecha  FROM Mensaje m
		INNER JOIN mensaje_grupo mg ON mg.mensajeID = m.mensajeID
        INNER JOIN Grupo g ON g.grupoID = mg.grupoID
        INNER JOIN Usuario_Grupo ug ON ug.grupoID = g.grupoID
        INNER JOIN Usuario u ON u.usuarioID = ug.usuarioID
        WHERE m.usuarioID = p_usuarioID AND g.tipoGrupo = 'mensaje' AND u.usuarioID != p_usuarioID
        GROUP BY grupoID, u.nombreUsuario, u.usuarioID
        ORDER BY ultima_fecha DESC
        LIMIT 5;
END //
DELIMITER ;

-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de CONTENIDO----------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

-- ---------------------------------------------------------------------------------------------------------------------
-- -----------------------------Tabla de GRUPO--------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------------------------------------------

--- CREAR GRUPO
DELIMITER //
CREATE PROCEDURE GRUPO_CrearGrupo(
IN p_nombre varchar(50),
IN p_descripcion varchar(250),
IN p_creadorID int
)
BEGIN

declare _grupoID int;
	INSERT INTO Grupo(nombreGrupo, descripcion, tipoGrupo, creadorID)
	VALUES(p_nombre, p_descripcion, 1, p_creadorID);

	SET _grupoID = LAST_INSERT_ID();
    
    INSERT INTO usuario_grupo VALUES(p_creadorID, _grupoID);
    
    SELECT _grupoID as grupoID;
END //
DELIMITER ;

CALL GRUPO_CrearGrupo('BUENOS DIAS', 'ASDADS', 1);

--- AGREGAR USUARIOS A UN GRUPO
DELIMITER //
CREATE PROCEDURE GRUPO_AgregarUsuarios(
IN p_grupoID INT,
IN p_correo varchar(100)
)
BEGIN
declare idUsuario INT;

SELECT usuario.usuarioID INTO idUsuario FROM Usuario WHERE Usuario.correo = p_correo;

IF idUsuario is not null THEN
INSERT INTO usuario_grupo VALUES (idUsuario, p_grupoID);
SELECT 'Usuario agregado' as response;
ELSE
SELECT 'error, usuario no existente' as response;
END IF;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GRUPO_ObtenerGrupos(
IN p_userID INT)
BEGIN
SELECT g.grupoID, g.nombreGrupo, g.descripcion, g.creadorID 
		FROM Grupo g
        INNER JOIN usuario_grupo ug ON ug.grupoID = g.grupoID
        WHERE ug.usuarioID = p_userID AND g.tipoGrupo = 1;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GRUPO_GuardarMensaje(
p_grupoID INT,
p_usuarioID INT,
p_mensaje TEXT,
p_archivo LONGBLOB
)
BEGIN
	DECLARE _contenidoID INT;
    DECLARE _mensajeID INT;
	INSERT INTO Contenido (texto, archivo) VALUES (p_mensaje, p_archivo);
	SET _contenidoID = LAST_INSERT_ID();
    INSERT INTO Mensaje (usuarioID, contenidoID, fecha) VALUES (p_usuarioID, _contenidoID, now());
    SET _mensajeID = LAST_INSERT_ID();
    INSERT INTO Mensaje_Grupo(mensajeID, grupoID) VALUES (_mensajeID, p_grupoID);
    
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GRUPO_ObtenerMensajes(
IN p_grupoID INT)
BEGIN
SELECT u.usuarioID, correo, nombreUsuario, nombreApellido, texto, archivo, fecha FROM Mensaje_Grupo mg
		INNER JOIN Mensaje m ON m.mensajeID = mg.mensajeID
        INNER JOIN Contenido c ON c.contenidoID = m.contenidoID
        INNER JOIN Usuario u ON u.usuarioID = m.usuarioID
        WHERE mg.grupoID = p_grupoID
        ORDER BY 7 ASC;
END //
DELIMITER ;
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




-- ---------------------------------------------------------------------------------------
-- --------------------------- TRIGGERS, FUNCIONES, VIEWS Y DEMAS ------------------------
-- ---------------------------------------------------------------------------------------

DELIMITER $$
CREATE TRIGGER verificar_desbloqueo_recompensa
AFTER UPDATE ON Usuario
FOR EACH ROW
BEGIN
    DECLARE puntos_usuario INT DEFAULT NEW.puntos;
    DECLARE premio_id INT;

    -- Obtener premios que el usuario ha ganado con sus puntos
    DECLARE premios_cursor CURSOR FOR 
        SELECT premioID FROM Premio WHERE puntaje <= puntos_usuario;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET premio_id = NULL;

    OPEN premios_cursor;
    premio_loop: LOOP
        FETCH premios_cursor INTO premio_id;
        IF premio_id IS NULL THEN
            LEAVE premio_loop;
        END IF;

        -- Insertar en Recompensa si no existe ya para ese premio
        IF NOT EXISTS (SELECT 1 FROM Recompensa WHERE usuarioID = NEW.usuarioID AND premioID = premio_id) THEN
            INSERT INTO Recompensa (usuarioID, premioID) VALUES (NEW.usuarioID, premio_id);
        END IF;
    END LOOP;

    CLOSE premios_cursor;
END$$
DELIMITER ;

