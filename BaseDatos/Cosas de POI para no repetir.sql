
SELECT * FROM Usuario;
SELECT * FROM Premio;
SELECT * FROM Recompensa;
SELECT * FROM Contenido;
SELECT * FROM Mensaje;
SELECT * FROM Grupo;
SELECT * FROM Usuario_Grupo;
SELECT * FROM Mensaje_Grupo;
SELECT * FROM Tarea;
SELECT * FROM Asignar_Tarea;

SELECT u.usuarioID, nombreUsuario, correo, foto, actividad FROM Usuario u
		INNER JOIN Usuario_Grupo ug ON ug.usuarioID = u.usuarioID
        INNER JOIN 
        
        SELECT * FROM Usuario u
		INNER JOIN Usuario_Grupo ug ON ug.usuarioID = u.usuarioID
        INNER JOIN 

SELECT * FROM Mensaje m
		INNER JOIN mensaje_grupo mg ON mg.mensajeID = m.mensajeID
        INNER JOIN Grupo g ON g.grupoID = mg.grupoID
        WHERE m.usuarioID = 1 AND g.tipoGrupo = 'mensaje'
        
DELIMITER //
CREATE PROCEDURE USUARIO_ObtenerHistorial(
IN p_usuarioID INT
)
BEGIN
	DECLARE GroupID INT;
    
    SELECT m.usuarioID, mg.grupoID FROM Mensaje m INNER JOIN Mensaje_Grupo mg ON mg.mensajeID = m.mensajeID
							INNER JOIN Grupo g ON g.grupoID = mg.grupoID
    WHERE m.usuarioID = 1 AND g.tipoGrupo = 'mensaje'
    GROUP BY  2
END;
DELIMITER ;

DROP TABLE Asignar_Tarea;
DROP TABLE Tarea;
DROP TABLE Mensaje_Grupo;
DROP TABLE Usuario_Grupo;
DROP TABLE Grupo;
DROP TABLE Mensaje;
DROP TABLE Contenido;
DROP TABLE Recompensa;
DROP TABLE Usuario;
DROP TABLE Premio;



INSERT INTO Usuario (nombreUsuario, nombreApellido, correo, contrasena) VALUES ('Guillermo', 'Morin', 'guill@gmail.com', '123a');
INSERT INTO Usuario (nombreUsuario, nombreApellido, correo, contrasena) VALUES ('Jose', 'Rios', 'jose@gmail.com', '123b');
INSERT INTO Usuario (nombreUsuario, nombreApellido, correo, contrasena) VALUES ('Aldo', 'Zapata', 'aldo@gmail.com', '123c');
INSERT INTO Usuario (nombreUsuario, nombreApellido, correo, contrasena) VALUES ('Uriel', 'Guerrero', 'uri@gmail.com', '123d');
INSERT INTO Usuario (nombreUsuario, nombreApellido, correo, contrasena) VALUES ('Andrea', 'Estrada', 'andy@gmail.com', '123e');
INSERT INTO Usuario (nombreUsuario, nombreApellido, correo, contrasena) VALUES ('Sofia', 'Cazares', 'sofi@gmail.com', '123f');
INSERT INTO Usuario (nombreUsuario, nombreApellido, correo, contrasena) VALUES ('Cristina', 'Ascencio', 'cris@gmail.com', '123g');



INSERT INTO Premio (titulo, puntaje) VALUES ('Iniciador', 50);
INSERT INTO Premio (titulo, puntaje) VALUES ('Novato', 100);
INSERT INTO Premio (titulo, puntaje) VALUES ('Mensajeador ocasional', 150);
INSERT INTO Premio (titulo, puntaje) VALUES ('Jefe de grupo', 200);
INSERT INTO Premio (titulo, puntaje) VALUES ('Animador', 250);
INSERT INTO Premio (titulo, puntaje) VALUES ('Maquina de tareas', 300);
INSERT INTO Premio (titulo, puntaje) VALUES ('Usuario activo', 350);
INSERT INTO Premio (titulo, puntaje) VALUES ('El estudiante definitivo', 400);
INSERT INTO Premio (titulo, puntaje) VALUES ('Creador de grupos', 450);
INSERT INTO Premio (titulo, puntaje) VALUES ('Hoy no chateo, mañana si', 500);
INSERT INTO Premio (titulo, puntaje) VALUES ('El estudiante maestro', 550);
INSERT INTO Premio (titulo, puntaje) VALUES ('Solo contesto emojis', 660);
INSERT INTO Premio (titulo, puntaje) VALUES ('Hola, estoy usando el PIA de POI para mensajear', 700);
INSERT INTO Premio (titulo, puntaje) VALUES ('El mensajero insaciable', 750);
INSERT INTO Premio (titulo, puntaje) VALUES ('(Inserte titulo ingenioso)', 800);
INSERT INTO Premio (titulo, puntaje) VALUES ('El ultimo titulo', 850);
INSERT INTO Premio (titulo, puntaje) VALUES ('No me hablen', 900);
INSERT INTO Premio (titulo, puntaje) VALUES ('Cumplidor profesional de tareas que imponen', 950);
INSERT INTO Premio (titulo, puntaje) VALUES ('Alcanzando el limite', 1000);



CALL USUARIOS_ObtenerTituloActual(4);
CALL USUARIOS_ObtenerTitulosDesbloqueados(4);
CALL PREMIOS_ProximaRecompensa(4);
CALL USUARIOS_ActualizarTitulo(4, 2);

UPDATE Usuario SET puntos = 220 WHERE usuarioID = 4;

UPDATE Usuario SET correo = 'guillermo.morin04@gmail.com' WHERE usuarioID = 1;
UPDATE Usuario SET contrasena = 'Guillermo2004.' WHERE usuarioID = 1;
UPDATE Usuario SET correo = 'josejaime.riosm@gmail.com' WHERE usuarioID = 2;

DELETE FROM Grupo WHERE grupoID = 5;

DROP PROCEDURE IF EXISTS USUARIOS_ObtenerTituloActual;
DROP TRIGGER IF EXISTS verificar_desbloqueo_recompensa;



CREATE TABLE Usuario (
    usuarioID 		INT AUTO_INCREMENT PRIMARY KEY,
    nombreUsuario 	VARCHAR(50) NOT NULL,
    nombreApellido  VARCHAR(50) NOT NULL,
    correo 			VARCHAR (100) UNIQUE NOT NULL,
    contrasena		VARCHAR(20) NOT NULL,
    foto			BLOB,
    puntos 			INT DEFAULT 0,
    tituloID        INT DEFAULT NULL,
    
    FOREIGN KEY (tituloID) REFERENCES Premio(premioID)    
);
