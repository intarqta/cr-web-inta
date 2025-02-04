// Login.js
import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('https://cr-web-inta.vercel.app:3001/login', { username, password })
      .then(response => {
        const { token } = response.data;
        // Guardar el token en localStorage (o en otro lugar seguro)
        localStorage.setItem('authToken', token);
        onLoginSuccess();
      })
      .catch(err => {
        setError('Credenciales inválidas');
      });
  };

  return (
    <Container style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2 className="text-center">Iniciar Sesión</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formUsername" className="mb-3">
          <Form.Label>Usuario</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Ingresa tu usuario" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </Form.Group>
        <Form.Group controlId="formPassword" className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Ingresa tu contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100">
          Ingresar
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
