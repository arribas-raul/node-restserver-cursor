const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// ============================
// Verificar Token
// ============================
let verificaToken = ( req, res, next ) =>{
     
     let token = req.get('token'); 

     jwt.verify(token, process.env.SEED, (err, decoded) =>{

          if( err ){
               return res.status(401).json({
                    ok: false,
                    err: {
                         message: 'Token no válido'
                    }
               });
          }

          req.usuario = decoded.usuario;

          next();
     });    
};

// ============================
// Verificar Token para imagen
// ============================
let verificaTokenImg = (req, res, next) => {
     let token = req.query.token;

     jwt.verify(token, process.env.SEED, (err, decoded) =>{

          if( err ){
               return res.status(401).json({
                    ok: false,
                    err: {
                         message: 'Token no válido'
                    }
               });
          }

          req.usuario = decoded.usuario;

          next();
     });
}

// ============================
// Verificar AdminRole
// ============================
let verificaAdminRole = ( req, res, next ) =>{

     let usuario = req.usuario;

     if ( usuario.rol != 'ADMIN_ROLE' ){
          return res.status(401).json({
               ok: false,
               err: {
                    message: 'El usuario no es administrador'
               }
          });
     }

     next();

};

module.exports = {
     verificaToken,
     verificaTokenImg,
     verificaAdminRole
}