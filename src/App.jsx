import { Routes, Route } from "react-router-dom";
import Home from "./home.jsx";
import Inventario from "./inventario.jsx";
import Login from "./login.jsx";
import Clientes from "./clientes.jsx";
import Prefactura from "./prefactura.jsx";
import Venta from "./venta.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/prefactura" element={<Prefactura />} />
      <Route path="/ventas" element={<Venta />} />
    </Routes>
  );
}

export default App;
