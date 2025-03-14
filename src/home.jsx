import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import reportIcon from "./assets/reporte.png";
import clientsIcon from "./assets/cliente.png";
import invoiceIcon from "./assets/reporte.png";
import salesIcon from "./assets/venta.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Menú Principal</h1>
      <div className="grid-container">
        {/* Reporte de Inventarios */}
        <div className="grid-item" onClick={() => navigate("/inventario")}>
          <img src={reportIcon} alt="Reporte de Inventarios" />
          <p>Reporte de Inventarios</p>
        </div>

        {/* Consulta de Clientes Frecuentes */}
        <div className="grid-item" onClick={() => navigate("/clientes")}>
          <img src={clientsIcon} alt="Clientes Frecuentes" />
          <p>Consulta de Clientes</p>
        </div>

        {/* Prefacturación */}
        <div className="grid-item" onClick={() => navigate("/prefactura")}>
          <img src={invoiceIcon} alt="Prefacturación" />
          <p>Prefacturación</p>
        </div>

        {/* Punto de Venta */}
        <div className="grid-item" onClick={() => navigate("/ventas")}>
          <img src={salesIcon} alt="Punto de Venta" />
          <p>Punto de Venta</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
