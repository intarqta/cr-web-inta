// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Inicio from './pages/Inicio';         // Menú público
import Login from './components/Login';       // Formulario de login
import ProtectedRoute from './components/ProteccionRute'; // Componente que protege rutas
import Dashboard from './pages/Dasboard';    // Gestor de pluviómetros
import PrivateLayout from './components/PrivateLayout';    // Layout privado con menú y botón de cerrar sesión

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Menú principal */}
        <Route path="/" element={<Inicio />} />

        {/* Ruta de login */}
        <Route path="/login" element={<Login onLoginSuccess={() => window.location.href = '/manager'} />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute><PrivateLayout /></ProtectedRoute>}>
          <Route path="/manager" element={<Dashboard />} />
          {/* Puedes agregar más rutas protegidas aquí */}
        </Route>

        {/* Redirige cualquier otra ruta a "/" */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
