import { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, WMSTileLayer, TileLayer } from "react-leaflet";
import Modal from '../components/Modal';
import { Button, ModalHeader, Card } from "react-bootstrap";
import { ModalTitle, ModalBody } from "react-bootstrap";
import L from 'leaflet';
import marker from '../IMG/cloud_img.svg';

const myIcon = new L.Icon({
  iconUrl: marker,
  color: 'blue',
  iconRetinaUrl: marker,
  popupAnchor: [0, 0],
  iconSize: [30, 30],
});

const MapComp = () => {
  // Estado para la ventana modal
  const [show, setShow] = useState({
    "Lugar": null,
    "Nombre": null,
    "Distrito": null,
    "Departamento": null,
    "data": [],
    "show": false,
  });

  // Estados para los datos de pluviómetros activos y pausados
  const [pluviometrosData, setPluviometrosData] = useState([]);
  const [pausedData, setPausedData] = useState([]);

  // Función para obtener el token de autorización desde localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  // Funciones para cargar datos desde los endpoints con el token en la cabecera
  const loadActivos = () => {
    fetch('http://localhost:3001/activos', { headers: getAuthHeaders() })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error fetching active pluviometers");
        }
        return response.json();
      })
      .then(data => setPluviometrosData(data))
      .catch(error => console.error("Error fetching active pluviometers:", error));
  };

  const loadPausados = () => {
    fetch('http://localhost:3001/pausados', { headers: getAuthHeaders() })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error fetching paused pluviometers");
        }
        return response.json();
      })
      .then(data => setPausedData(data))
      .catch(error => console.error("Error fetching paused pluviometers:", error));
  };

  // Cargar datos iniciales y establecer polling para actualizarlos cada 5 segundos
  useEffect(() => {
    loadActivos();
    loadPausados();
    const interval = setInterval(() => {
      loadActivos();
      loadPausados();
    }, 5000); // actualiza cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  // Estado para los datos de kobotoolbox
  const [userData, setUserData] = useState({});

  // Cargar datos de kobotoolbox (no protegido, por lo que no se incluye token)
  useEffect(() => {
    fetch(process.env.REACT_APP_URL_SHEETS_PLUV)
      .then(response => response.json())
      .then(result => setUserData(result))
      .catch(err => console.error("Error fetching user data:", err));
  }, []);

  const datos = userData.values;
  // Evitar renderizar hasta tener los datos necesarios de kobotoolbox
  if (!datos) return null;

  const handleClose = () => setShow(false);

  return (
    <MapContainer style={{ width: "100%", height: "90vh" }} center={[-31, -60.5]} zoom={7}>
      {/* Capa híbrida de Google */}
      <TileLayer
             url="https://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0/argenmap_oscuro@EPSG%3A3857@png/{z}/{x}/{-y}.png"
            attribution='&copy; <a href="https://ign-argentina.github.io/argenmap-web/">ING argentina</a> contributors'
            />

      <WMSTileLayer
        transparent='true'
        format="image/png"
        layers='ign:departamento'
        url='https://wms.ign.gob.ar/geoserver/wms?'
        CQL_FILTER="fdc='Servicio de Catastro e Información Territorial'"
      />

      {/* Tarjetas de conteo: activas (verde) y pausadas (roja) en la esquina superior derecha */}
      <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000 }}>
        <Card bg="success" text="white" className="mb-2" style={{ width: '10rem' }}>
          <Card.Body>
            <Card.Title style={{ fontSize: '16px' }}>Activos</Card.Title>
            <Card.Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {pluviometrosData.length}
            </Card.Text>
          </Card.Body>
        </Card>
        <Card bg="danger" text="white" style={{ width: '10rem' }}>
          <Card.Body>
            <Card.Title style={{ fontSize: '16px' }}>Pausados</Card.Title>
            <Card.Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {pausedData.length}
            </Card.Text>
          </Card.Body>
        </Card>
      </div>

      {/* Renderizado de marcadores para cada pluviómetro activo */}
      {pluviometrosData.map((feature) => (
        <Marker key={feature.id} position={[feature.Latitud, feature.Longitud]} icon={myIcon}>
          <Popup className="request-popup">
            <ModalHeader
              style={{
                borderRadius: "7px",
                justifyContent: 'center',
                width: '100%',
                fontSize: '28px',
                fontFamily: 'serif',
                fontWeight: 'bolder'
              }}
            >
              {feature.Lugar}
            </ModalHeader>
            {datos
              .filter((tsla) => tsla[1] === feature.Nombre)
              .slice(-1)
              .map((Element, index) => (
                <ModalBody key={index}>
                  <ModalTitle
                    style={{
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '14px',
                      padding: '5px',
                      fontFamily: 'serif'
                    }}
                  >
                    Último Registro de lluvias
                  </ModalTitle>
                  <ModalTitle
                    style={{
                      fontFamily: 'serif',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      width: '100%',
                      fontSize: '16px',
                      padding: '5px'
                    }}
                  >
                    {Element[3]} mm
                  </ModalTitle>
                  <ModalTitle
                    style={{
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '14px',
                      padding: '5px',
                      fontFamily: 'serif'
                    }}
                  >
                    Fecha {Element[2]}
                  </ModalTitle>
                </ModalBody>
              ))
            }
            <Button
              onClick={() => {
                setShow({
                  "Lugar": feature.Lugar,
                  "Nombre": feature.Nombre,
                  "Distrito": feature.nam, // Verifica que la propiedad exista
                  "Departamento": feature.Dep_nam, // Verifica que la propiedad exista
                  "data": datos.filter((tsla) => tsla[1] === feature.Nombre),
                  "show": true,
                });
              }}
              style={{
                width: '100%',
                padding: '0px',
                fontWeight: 'bold',
                color: '#69bef1',
                background: '#d0d0d0',
                borderColor: '#d0d0d0'
              }}
            >
              Más datos
            </Button>
          </Popup>
        </Marker>
      ))}
      <Modal show={show} onClose={handleClose} datos={datos} />
    </MapContainer>
  );
};

export default MapComp;
