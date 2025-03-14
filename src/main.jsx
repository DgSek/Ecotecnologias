import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // ✅ Router para manejar rutas
import "./index.css";
import App from "./App.jsx";  // ✅ Importar App.jsx para manejar rutas

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App /> {/* ✅ Ahora App.jsx maneja las rutas */}
    </BrowserRouter>
  </StrictMode>
);
