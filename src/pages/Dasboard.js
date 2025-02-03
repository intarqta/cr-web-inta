
import MapComp from "./Mapa2";
import BaseCRUD from '../components/BaseCRUD'
import { Container, Row, Col } from 'react-bootstrap';


// Componente principal que combina el mapa y la interfaz CRUD en una sola página
const Dashboard = () => {
    return (
      <Container fluid style={{ height: "90vh" }}>
        <Row className="h-100">
          {/* Columna izquierda: mapa */}
          <Col md={4} className="p-0" style={{ height: "90%" }}>
            <MapComp />
          </Col>
          {/* Columna derecha: interfaz CRUD con scroll */}
          <Col md={8} style={{ height: "100%",overflowY: "auto", padding: "15px", backgroundColor: "#f8f9fa" }}>
            <BaseCRUD />
          </Col>
        </Row>
      </Container>
    );
  };
  
  export default Dashboard;