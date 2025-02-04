// api/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.secre_pass; // Clave secreta desde variable de entorno

// Configuración de CORS:
// Se especifica el origen permitido y los métodos/headers necesarios. 
// Ajusta "origin" según tu entorno (por ejemplo, en desarrollo 'http://localhost:3000').
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Manejo explícito de las peticiones preflight OPTIONS
app.options('*', cors());

// Middleware para parsear JSON
app.use(express.json());

// Usuario de ejemplo. En producción, estos datos deben venir de una base de datos.
const user = {
  username: process.env.REACT_APP_usuario,
  // La contraseña se hashea utilizando la variable de entorno REACT_APP_password
  passwordHash: bcrypt.hashSync(process.env.REACT_APP_password, 10)
};

// Ruta de login (sin protección)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== user.username) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  // Comparar la contraseña con el hash almacenado
  bcrypt.compare(password, user.passwordHash, (err, isMatch) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno' });
    }
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // Si la contraseña es correcta, se firma un token JWT
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Middleware para proteger rutas
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Se espera el formato "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  
  jwt.verify(token, JWT_SECRET, (err, userData) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = userData;
    next();
  });
}

// Rutas a los archivos JSON
const activosPath = path.join(__dirname, '..', 'src', 'Json', 'PluviometrosActivos.json');
const pausadosPath = path.join(__dirname, '..', 'src', 'Json', 'PluviometrosPausados.json');

// Función auxiliar para leer un archivo JSON.
function readJsonFile(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(err);
    try {
      const json = JSON.parse(data);
      callback(null, json);
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}

// Función auxiliar para escribir datos en un archivo JSON.
function writeJsonFile(filePath, data, callback) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', callback);
}

// ---------------------------
// Rutas para Pluviometros Activos (protegidas)
// ---------------------------
app.get('/activos', authenticateToken, (req, res) => {
  readJsonFile(activosPath, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer los datos de activos.' });
    }
    res.json(data.activos);
  });
});

app.post('/activos', authenticateToken, (req, res) => {
  readJsonFile(activosPath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los datos de activos.' });
    if (!Array.isArray(data.activos)) data.activos = [];
    const newItem = req.body;
    newItem.id = Date.now();
    newItem.activo = true;
    data.activos.push(newItem);
    writeJsonFile(activosPath, data, (err) => {
      if (err) return res.status(500).json({ error: 'Error al guardar los datos de activos.' });
      res.status(201).json(newItem);
    });
  });
});

app.put('/activos/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  readJsonFile(activosPath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los datos de activos.' });
    const index = data.activos.findIndex(item => item.id === id);
    if (index === -1) return res.status(404).json({ error: 'Pluviómetro no encontrado.' });
    const updatedItem = { ...data.activos[index], ...req.body, id };
    data.activos[index] = updatedItem;
    writeJsonFile(activosPath, data, (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar los datos de activos.' });
      res.json(updatedItem);
    });
  });
});

app.delete('/activos/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  readJsonFile(activosPath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los datos de activos.' });
    const index = data.activos.findIndex(item => item.id === id);
    if (index === -1) return res.status(404).json({ error: 'Pluviómetro no encontrado.' });
    data.activos.splice(index, 1);
    writeJsonFile(activosPath, data, (err) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar el pluviómetro.' });
      res.json({ message: 'Pluviómetro eliminado correctamente.' });
    });
  });
});

// ---------------------------
// Rutas para Pluviometros Pausados (protegidas)
// ---------------------------
app.get('/pausados', authenticateToken, (req, res) => {
  readJsonFile(pausadosPath, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al leer los datos de pausados.' });
    }
    res.json(data.pausados);
  });
});

app.post('/pausados', authenticateToken, (req, res) => {
  readJsonFile(pausadosPath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los datos de pausados.' });
    if (!Array.isArray(data.pausados)) data.pausados = [];
    const newItem = req.body;
    newItem.id = Date.now();
    newItem.activo = false;
    data.pausados.push(newItem);
    writeJsonFile(pausadosPath, data, (err) => {
      if (err) return res.status(500).json({ error: 'Error al guardar los datos de pausados.' });
      res.status(201).json(newItem);
    });
  });
});

app.put('/pausados/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  readJsonFile(pausadosPath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los datos de pausados.' });
    const index = data.pausados.findIndex(item => item.id === id);
    if (index === -1) return res.status(404).json({ error: 'Pluviómetro no encontrado.' });
    const updatedItem = { ...data.pausados[index], ...req.body, id };
    data.pausados[index] = updatedItem;
    writeJsonFile(pausadosPath, data, (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar los datos de pausados.' });
      res.json(updatedItem);
    });
  });
});

app.delete('/pausados/:id', authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  readJsonFile(pausadosPath, (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los datos de pausados.' });
    const index = data.pausados.findIndex(item => item.id === id);
    if (index === -1) return res.status(404).json({ error: 'Pluviómetro no encontrado.' });
    data.pausados.splice(index, 1);
    writeJsonFile(pausadosPath, data, (err) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar el pluviómetro.' });
      res.json({ message: 'Pluviómetro eliminado correctamente.' });
    });
  });
});

// ---------------------------
// Exportar para entorno serverless (por ejemplo, Vercel)
// ---------------------------
module.exports.handler = serverless(app);
