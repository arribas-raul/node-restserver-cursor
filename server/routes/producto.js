const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');
let Producto = require('../models/producto');
let Categoria = require('../models/categoria');
let app = express();


// ====================================
//   Obtener productos
// ====================================
app.get('/producto', verificaToken, (req, res) => {
     // trae todos los productos
     // populate: usuario categoria
     // paginado

     let desde = req.query.desde || 0;
     desde = Number(desde);

     let limite = req.query.limite || 5;
     limite = Number(limite);

     Producto.find({ disponible:true })
          .sort('nombre')
          .populate('usuario', 'nombre email')
          .populate('categoria')
          .skip(desde)
          .limit(limite)
          .exec( (err, productos) => {
               if (err){
                    return res.status(400).json({
                         ok: false,
                         err
                    });
               }

               Producto.countDocuments({ disponible:true }, (err, conteo) => {
                    res.json({
                         ok: true,
                         productos,
                         cuantos: conteo
                    });
               });              
          });  
});

// ====================================
//   Obtener producto por ID
// ====================================
app.get('/producto/:id', verificaToken, (req, res) => {
     // populate: usuario categoria

     let id = req.params.id;

     Producto.findById(id)
     .populate('usuario', 'nombre email')
     .populate('categoria')
     .exec( (err, productoDB) =>{

          if (err){
               return res.status(500).json({
                    ok: false,
                    err
               });
          }

          if(!productoDB){
               return res.status(400).json({
                    ok: false,
                    error: {
                         message: 'El ID no es correcto.'
                    }
               });
          }

          res.json({
               ok: true,
               categoria: productoDB
          });

     });
});

// ====================================
//   Crear un nuevo producto
// ====================================
app.post('/producto', verificaToken, (req, res) => {
     // grabar el usuario
     // grabar una categoria del listado 
     
     let body = req.body;

     Categoria.findById(body.categoria)          
          .exec( (err, categoriaDB) => {
               if (err){
                    return res.status(400).json({
                         ok: false,
                         err
                    });
               }

               if(!categoriaDB){
                    return res.status(400).json({
                         ok: false,
                         err: {
                              response: 'No se ha encontrado la acategoria especificada.'
                         }
                    });
               }

               let producto = new Producto({
                    nombre: body.nombre,
                    precioUni: body.precioUni,
                    descripcion: body.descripcion,
                    categoria: categoriaDB._id,
                    usuario: req.usuario._id
               });

               producto.save( (err, productoDB) => {
                    if (err){
                         return res.status(500).json({
                              ok: false,
                              err
                         });
                    }

                    if(!productoDB){
                         return res.status(400).json({
                              ok: false,
                              err
                         });  
                    }
          
                    res.status(201).json({
                         ok: true,
                         producto: productoDB
                    });
               }); 
          });       
});

// ====================================
//   Buscar productos
// ====================================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

     let termino = req.params.termino;

     let regex = new RegExp(termino, 'i');

     Producto.find({nombre: regex})
          .populate('categoria')
          .exec( (err, productos) =>{
               if (err){
                    return res.status(500).json({
                         ok: false,
                         err
                    });
               }

               res.json({
                    ok:true, 
                    productos
               });
          });
});

// ====================================
//   Actualizar un producto
// ====================================
app.put('/producto/:id', verificaToken, (req, res) => {
     // grabar el usuario
     // grabar una categoria del listado   
     
     let id = req.params.id;
     let body = req.body;

     Categoria.findById(body.categoria)          
          .exec( (err, categoriaDB) => {
               if (err){
                    return res.status(400).json({
                         ok: false,
                         err
                    });
               }

               if(!categoriaDB){
                    return res.status(400).json({
                         ok: false,
                         err: {
                              response: 'No se ha encontrado la acategoria especificada.'
                         }
                    });
               }

               let producto = new Producto({
                    nombre: body.nombre,
                    precioUni: body.precioUni,
                    descripcion: body.descripcion,
                    categoria: categoriaDB._id
               });

               Producto.findById(id, (err, productoDB) => {
        
                    if (err){
                         return res.status(500).json({
                              ok: false,
                              err
                         });
                    }

                    if(!productoDB){
                         return res.status(400).json({
                              ok: false,
                              err
                         });  
                    }

                    productoDB.nombre      = producto.nombre;
                    productoDB.precioUni   = producto.precioUni;
                    productoDB.categoria   = producto.categoria;
                    productoDB.descripcion = producto.descripcion;

                    productoDB.save( (err, productoGuardado) => {
                         if (err){
                              return res.status(500).json({
                                   ok: false,
                                   err
                              });
                         }

                         res.json({
                              ok: true,
                              producto: productoGuardado
                         });
                    })
               });    
          });       
});

// ====================================
//   Borrar un producto lógico
// ====================================
app.delete('/producto/:id', verificaToken, (req, res) => {
     // set disponible = false
     let id = req.params.id;

     let disponible = { disponible: false};

     Producto.findByIdAndUpdate(id, disponible, {new: true}, (err, productoDB) => {
        
          if (err){
               return res.status(500).json({
                    ok: false,
                    err
               });
          }

          if(!productoDB){
               return res.status(400).json({
                    ok: false,
                    err: {
                         message: 'ID no existe'
                    }
               });  
          }

          res.json({
               ok: true,
               producto: productoDB,
               mensaje: 'Producto borrado'
          });
     });
});

module.exports = app;