import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // ✅ Importar BrowserRouter
import "./index.css";
import Prueba from "./prueba.jsx";  

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>  {/* ✅ Envolver con BrowserRouter */}
      <Prueba />
    </BrowserRouter>
  </StrictMode>
);
