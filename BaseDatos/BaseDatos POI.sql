CREATE DATABASE BD_POI;
USE BD_POI;

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


-- TABLAS DE LA BASE DE DATOS --

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


CREATE TABLE Premio (
    premioID 		INT AUTO_INCREMENT PRIMARY KEY,
    titulo			VARCHAR(50) NOT NULL,
    puntaje			INT	NOT NULL	
);


CREATE TABLE Recompensa (
	usuarioID		INT NOT NULL,
    premioID		INT NOT NULL,

	FOREIGN KEY (usuarioID) REFERENCES Usuario(usuarioID),
    FOREIGN KEY (premioID) REFERENCES Premio(premioID)
);


CREATE TABLE Contenido (
	contenidoID		INT AUTO_INCREMENT PRIMARY KEY,
    texto			TEXT, 
    archivo			LONGBLOB
);


CREATE TABLE Mensaje (
	mensajeID		INT AUTO_INCREMENT PRIMARY KEY,
    usuarioID		INT NOT NULL,
    contenidoID		INT NOT NULL,
    fecha			DATETIME NOT NULL,
    
    FOREIGN KEY (usuarioID) REFERENCES Usuario(usuarioID),
    FOREIGN KEY (contenidoID) REFERENCES Contenido(contenidoID)
);


CREATE TABLE Grupo (
	grupoID			INT AUTO_INCREMENT PRIMARY KEY,
    nombreGrupo		VARCHAR(50) NOT NULL,
    descripcion		VARCHAR(250),
    tipoGrupo		ENUM('grupo', 'subgrupo', 'mensaje'),
    creadorID		INT NOT NULL,
    subgrupoID		INT DEFAULT NULL,
    
    FOREIGN KEY (creadorID) REFERENCES Usuario(usuarioID),
    FOREIGN KEY (subgrupoID) REFERENCES Grupo(grupoID)
);


CREATE TABLE Usuario_Grupo (
	usuarioID		INT NOT NULL,
    grupoID			INT NOT NULL,

	FOREIGN KEY (usuarioID) REFERENCES Usuario(usuarioID),
    FOREIGN KEY (grupoID) REFERENCES Grupo(grupoID)
);


CREATE TABLE Mensaje_Grupo (
	mensajeID		INT NOT NULL,
    grupoID			INT NOT NULL,

	FOREIGN KEY (mensajeID) REFERENCES Mensaje(mensajeID),
    FOREIGN KEY (grupoID) REFERENCES Grupo(grupoID)
);


CREATE TABLE Tarea (
	tareaID			INT AUTO_INCREMENT PRIMARY KEY,
    instrucciones	VARCHAR(250),
    vencimiento		DATE NOT NULL,
    puntosTarea		INT NOT NULL,
    grupoID			INT NOT NULL,
    
	FOREIGN KEY (grupoID) REFERENCES Grupo(grupoID)
);


CREATE TABLE Asignar_Tarea (
	tareaID			INT NOT NULL,
    usuarioID		INT NOT NULL,
    homework		LONGBLOB DEFAULT NULL,
	calificacion	INT DEFAULT NULL,
    
    FOREIGN KEY (usuarioID) REFERENCES Usuario(usuarioID),
    FOREIGN KEY (tareaID) REFERENCES Tarea(tareaID)
);





