const express = require('express');
const _ = require('underscore');

const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//============================
//Mostrar todas las categorias
//============================
app.get('/categoria', verificaToken, (req, res) => {

     Categoria.find()
          .sort('descripcion')
          .populate('usuario', 'nombre email')
          .exec( (err, categorias) => {
               if (err){
                    return res.status(400).json({
                         ok: false,
                         err
                    });
               }

               Categoria.count({}, (err, conteo) => {
                    res.json({
                         ok: true,
                         categorias,
                         cuantos: conteo
                    });
               });              
          });  

});
//============================
//Mostrar categoria por ID
//============================
app.get('/categoria/:id', verificaToken, (req, res) => {

     let id = req.params.id;
     
     Categoria.findById(id, (err, categoriaDB) =>{

          if (err){
               return res.status(400).json({
                    ok: false,
                    err
               });
          }

          if(!categoriaDB){
               return res.status(400).json({
                    ok: false,
                    error: {
                         message: 'El ID no es correcto.'
                    }
               });
          }

          res.json({
               ok: true,
               categoria: categoriaDB
          });

     });
});

//============================
//Crear nueva categoria
//============================
app.post('/categoria', verificaToken, (req, res) => {
     
     let body = req.body;

     let categoria = new Categoria({
          descripcion: body.descripcion,
          usuario: req.usuario._id
     });

     Categoria.find({descripcion: categoria.descripcion})          
          .exec( (err, categoriaDB) => {
               if (err){
                    return res.status(400).json({
                         ok: false,
                         err
                    });
               }

               if(categoriaDB.length > 0){
                    return res.status(400).json({
                         ok: false,
                         err: {
                              response: 'La descripción de categoria ya está en uso.'
                         }
                    });
               }

               categoria.save( (err, categoriaDB) => {
                    if (err){
                         return res.status(400).json({
                              ok: false,
                              err
                         });
                    }

                    if(!categoriaDB){
                         return res.status(400).json({
                              ok: false,
                              err
                         });  
                    }
          
                    res.json({
                         ok: true,
                         categoria: categoriaDB
                    });
               });              
          });     
});

//============================
//Actualizar categoria
//============================
app.put('/categoria/:id', verificaToken, (req, res) => {
     let id = req.params.id;

     let body = _.pick(req.body, [ 'descripcion' ]);

     Categoria.find({descripcion: body.descripcion})
          .exec( (err, categoriaDB) => {
               if (err){
                    return res.status(400).json({
                         ok: false,
                         err
                    });
               }

               if(categoriaDB.length > 0){
                    return res.status(400).json({
                         ok: false,
                         err: {
                              response: 'La descripción de categoria ya está en uso.'
                         }
                    });
               }

               Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true}, (err, categoriaDB) => {
        
                    if (err){
                         return res.status(400).json({
                              ok: false,
                              err
                         });
                    }

                    if(!categoriaDB){
                         return res.status(400).json({
                              ok: false,
                              err
                         });  
                    }
          
                    res.json({
                         ok: true,
                         categoria: categoriaDB
                    });
               });    
          });  
});

//============================
//Borrar física categoria
//============================
app.delete('/categoria/:id', [ verificaToken, verificaAdminRole ], (req, res) => {
     let id = req.params.id;

     Categoria.findByIdAndRemove(id, (err, categoriaBorrada) =>{
          if (err){
               return res.status(400).json({
                    ok: false,
                    err
               });
          }

          if(!categoriaBorrada){
               return res.status(400).json({
                    ok: false,
                    err: {
                         message: 'Categoria no encontrada'
                    }
               });
          }

          res.json({
               ok: true,
               message: 'Categoria borrada'
          });
     });
});

module.exports = app;