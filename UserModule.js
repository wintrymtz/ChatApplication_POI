const db = require('./database.js');

const usuarioMod = {
    registrarUsuario: function (_name, _email, _username, _password) {
        db.query(`insert into Usuario(nombreUsuario, correo, ApellidoUsuario, contrasena)
            VALUES ('${_name}', '${_email}', '${_username}', '${_password}')`, (error, result, fields) => {
            console.log(error);
            console.log(result);
            console.log(fields);
        });
    },

    findUser: function (_email) {
        db.query(`select * from Usuario where '${_email}' = correo`,
            (error, result, fields) => {
                console.log(error);
                console.log(result);
                console.log(fields);
            });
    }
}

module.exports = usuarioMod;