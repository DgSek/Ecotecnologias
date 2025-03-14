import { Routes, Route } from "react-router-dom";
import Login from "./login.jsx";
import Home from "./home.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />  {/* ✅ Login es la pantalla inicial */}
      <Route path="/home" element={<Home />} /> {/* ✅ Home después de iniciar sesión */}
    </Routes>
  );
}

export default App;
