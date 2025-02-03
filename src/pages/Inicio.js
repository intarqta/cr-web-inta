// Inicio.js
import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { DropdownSubmenu, NavDropdownMenu } from "react-bootstrap-submenu";
import logo from '../IMG/Logo_INTA.png';
import '../style/style.body.css';
import { Link, useNavigate } from 'react-router-dom';
import Dashboard from './Dasboard'; // Componente con el sistema de gestión

function Inicio() {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/'); // Redirige a la página principal (menú)
  };

  return (
    <>
      <div className="header-container">
        <div id="contenedor-principal">
          <Navbar id="menu-nav" expand="lg" className="bg-body-tertiary">
            <Container className="container-fluid">
              <a href="https://www.argentina.gob.ar/inta">
                <img height={63} src={logo} alt="Logo INTA" id="logo-inta" />
              </a>
              <Navbar.Toggle
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </Navbar.Toggle>
              <Navbar.Collapse id="navbarSupportedContent">
                <Nav className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
                      Inicio
                    </Link>
                  </li>
                  <NavDropdownMenu title="Redes de información" className="nav-item dropdown" id="myDropdown">
                    <DropdownSubmenu title="Meteorología">
                      <NavDropdownMenu.Item>
                        <Link to="/mapapluv" style={{ textDecoration: 'none', color: 'black' }}>
                          Pluviómetros
                        </Link>
                      </NavDropdownMenu.Item>
                    </DropdownSubmenu>
                  </NavDropdownMenu>
                  <li className="nav-item">
                    <Link to="/publicaciones" style={{ textDecoration: 'none', color: 'black' }}>
                      Publicaciones
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/contacto" style={{ textDecoration: 'none', color: 'black' }}>
                      Contacto
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/nosotros" style={{ textDecoration: 'none', color: 'black' }}>
                      CRUD
                    </Link>
                  </li>
                </Nav>
                <Nav>
                  <Nav.Item>
                    {token ? (
                      <button className="btn btn-danger" onClick={handleLogout}>
                        Cerrar Sesión
                      </button>
                    ) : (
                      <Link to="/login" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary">
                          Iniciar Sesión
                        </button>
                      </Link>
                    )}
                  </Nav.Item>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </div>
      </div>
      {/* Solo se muestra el Dashboard (gestor de pluviómetros) si el usuario está autenticado */}
      {token && <Dashboard />}
    </>
  );
}

export default Inicio;
