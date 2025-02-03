import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Modal, Form, Tabs, Tab, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import axios from 'axios';

const tipoPluvOptions = [
  "Tipo B",
  "Tipo Comercial",
  "Estación meteorológica"
];

const agenciaOptions = [
  'AER Reconquista',
  'AER Las Toscas',
  'AER San Javier',
  'AER Calchaquí',
  'AER Tostado',
  'AER Garabato',
  'AER Venado Tuerto',
  'AER Ceres',
  'AER San Cristóbal',
  'AER San Justo',
  'AER Carlos Pellegrini',
  'AER Máximo Paz',
  'AER Arroyo Seco',
  'AER Casilda',
  'AER Roldán',
  'AER Totoras',
  'AER Cañada de Gómez',
  'AER Las Rosas',
  'AER Gálvez',
  'AER Monte Vera',
  'AER Esperanza',
  'EEA Reconquista',
  'EEA Rafaela',
  'EEA Oliveros'
];

// Configuración base y creación de instancia de Axios
const baseURL = process.env.REACT_APP_Base_URL;
const api = axios.create({
  baseURL: baseURL
});

// Interceptor para agregar el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Componente para el formulario modal reutilizable
function PluviometroForm({ show, handleClose, onSubmit, initialValues }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initialValues
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{initialValues && initialValues.id ? 'Editar' : 'Agregar'} Pluviometro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit((data) => { onSubmit(data); reset(); })}>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group controlId="formLugar">
                <Form.Label>Lugar</Form.Label>
                <Form.Control type="text" placeholder="Ingrese el lugar" {...register("Lugar", { required: true })} />
                {errors.Lugar && <span className="text-danger">Este campo es requerido</span>}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group controlId="formAgencia">
                <Form.Label>Agencia</Form.Label>
                <Form.Select {...register("Agencia", { required: true })}>
                  <option value="">Seleccione una agencia</option>
                  {agenciaOptions.map((opcion, index) => (
                    <option key={index} value={opcion}>{opcion}</option>
                  ))}
                </Form.Select>
                {errors.Agencia && <span className="text-danger">Este campo es requerido</span>}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col xs={12} md={6}>
              <Form.Group controlId="formNombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" placeholder="Ingrese el nombre" {...register("Nombre", { required: true })} />
                {errors.Nombre && <span className="text-danger">Este campo es requerido</span>}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group controlId="formTip_Pluv">
                <Form.Label>Tipo de Pluviometro</Form.Label>
                <Form.Select {...register("Tip_Pluv", { required: true })}>
                  <option value="">Seleccione un tipo</option>
                  {tipoPluvOptions.map((opcion, index) => (
                    <option key={index} value={opcion}>{opcion}</option>
                  ))}
                </Form.Select>
                {errors.Tip_Pluv && <span className="text-danger">Este campo es requerido</span>}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col xs={12} md={6}>
              <Form.Group controlId="formDistrito">
                <Form.Label>Distrito</Form.Label>
                <Form.Control type="text" placeholder="Ingrese el distrito" {...register("Distrito", { required: true })} />
                {errors.Distrito && <span className="text-danger">Este campo es requerido</span>}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group controlId="formDepartamento">
                <Form.Label>Departamento</Form.Label>
                <Form.Control type="text" placeholder="Ingrese el departamento" {...register("Departamento", { required: true })} />
                {errors.Departamento && <span className="text-danger">Este campo es requerido</span>}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col xs={12} md={6}>
              <Form.Group controlId="formLatitud">
                <Form.Label>Latitud</Form.Label>
                <Form.Control type="number" step="any" placeholder="Ingrese la latitud" {...register("Latitud", { required: true })} />
                {errors.Latitud && <span className="text-danger">Este campo es requerido</span>}
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group controlId="formLongitud">
                <Form.Label>Longitud</Form.Label>
                <Form.Control type="number" step="any" placeholder="Ingrese la longitud" {...register("Longitud", { required: true })} />
                {errors.Longitud && <span className="text-danger">Este campo es requerido</span>}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col xs={12} md={6}>
              <Form.Group controlId="formProveedor">
                <Form.Label>Proveedor</Form.Label>
                <Form.Control type="text" placeholder="Ingrese el proveedor" {...register("Proveedor", { required: true })} />
                {errors.Proveedor && <span className="text-danger">Este campo es requerido</span>}
              </Form.Group>
            </Col>
            <Col xs={12} md={6} className="d-flex align-items-center">
              <Form.Group controlId="formActivo">
                <Form.Check type="checkbox" label="Activo" {...register("activo")} />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="primary" type="submit" className="mt-3">
            Guardar
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

function BaseCRUD() {
  // Estados para pluviómetros activos y pausados, que se cargarán desde el backend.
  const [activos, setActivos] = useState([]);
  const [pausados, setPausados] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [currentItem, setCurrentItem] = useState({});
  const [activeTab, setActiveTab] = useState("activos");

  // Funciones para cargar datos desde el servidor usando la instancia "api"
  const loadActivos = () => {
    api.get('/activos')
      .then(res => setActivos(res.data))
      .catch(err => console.error("Error al cargar activos:", err));
  };

  const loadPausados = () => {
    api.get('/pausados')
      .then(res => setPausados(res.data))
      .catch(err => console.error("Error al cargar pausados:", err));
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadActivos();
    loadPausados();
  }, []);

  // Manejar agregar/editar (POST o PUT dependiendo de si existe id)
  const onSubmit = (formData) => {
    if (formData.id) {
      // Si el registro ya existe, determinar en qué colección se encuentra
      const isActive = formData.activo;
      const endpoint = isActive ? `/activos/${formData.id}` : `/pausados/${formData.id}`;
      api.put(endpoint, formData)
        .then(() => {
          loadActivos();
          loadPausados();
        })
        .catch(err => console.error("Error al actualizar:", err));
    } else {
      // Agregar nuevo registro (siempre a activos al crearlo)
      api.post('/activos', formData)
        .then(() => {
          loadActivos();
        })
        .catch(err => console.error("Error al agregar:", err));
    }
    setModalShow(false);
  };

  // Eliminar un registro desde el backend
  const handleDelete = (id, isActive = true) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      const endpoint = isActive ? `/activos/${id}` : `/pausados/${id}`;
      api.delete(endpoint)
        .then(() => {
          loadActivos();
          loadPausados();
        })
        .catch(err => console.error("Error al eliminar:", err));
    }
  };

  // Mover un registro de activo a pausado o viceversa.
  const toggleActive = (item, isActive = true) => {
    if (isActive) {
      // Mover de activos a pausados
      api.delete(`/activos/${item.id}`)
        .then(() => {
          const newItem = { ...item, activo: false };
          api.post('/pausados', newItem)
            .then(() => {
              loadActivos();
              loadPausados();
            });
        })
        .catch(err => console.error("Error al pausar:", err));
    } else {
      // Mover de pausados a activos
      api.delete(`/pausados/${item.id}`)
        .then(() => {
          const newItem = { ...item, activo: true };
          api.post('/activos', newItem)
            .then(() => {
              loadActivos();
              loadPausados();
            });
        })
        .catch(err => console.error("Error al reactivar:", err));
    }
  };

  // Función para renderizar la tabla
  const renderTable = (data, isActive = true) => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Lugar</th>
          <th>Agencia</th>
          <th>Nombre</th>
          <th>Tipo de Pluviometro</th>
          <th>Distrito</th>
          <th>Departamento</th>
          <th>Latitud</th>
          <th>Longitud</th>
          <th>Proveedor</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.Lugar}</td>
            <td>{item.Agencia}</td>
            <td>{item.Nombre}</td>
            <td>{item.Tip_Pluv}</td>
            <td>{item.Distrito}</td>
            <td>{item.Departamento}</td>
            <td>{item.Latitud}</td>
            <td>{item.Longitud}</td>
            <td>{item.Proveedor}</td>
            <td>{item.activo ? "Sí" : "No"}</td>
            <td>
              <Button variant="info" size="sm" onClick={() => { setCurrentItem(item); setModalShow(true); }}>
                Editar
              </Button>{' '}
              <Button variant="danger" size="sm" onClick={() => handleDelete(item.id, isActive)}>
                Eliminar
              </Button>{' '}
              <Button variant="secondary" size="sm" onClick={() => toggleActive(item, isActive)}>
                {isActive ? "Pausar" : "Activar"}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col xs={12}>
          <h2 style={{fontWeight:"bold", fontFamily:"sans-serif"}} className="text-center">Sistema de gestión red de pluviómetros de Santa Fe</h2>
          <hr />
          <div className="d-flex justify-content-center mb-3">
            <Button variant="success" onClick={() => { setCurrentItem({}); setModalShow(true); }}>
              Agregar Nuevo
            </Button>
          </div>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3" justify>
            <Tab eventKey="activos" title="Pluviometros Activos">
              {renderTable(activos, true)}
            </Tab>
            <Tab eventKey="pausados" title="Pluviometros Pausados">
              {renderTable(pausados, false)}
            </Tab>
          </Tabs>
          <PluviometroForm
            show={modalShow}
            handleClose={() => setModalShow(false)}
            onSubmit={onSubmit}
            initialValues={currentItem}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default BaseCRUD;
