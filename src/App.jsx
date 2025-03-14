import { Routes, Route } from "react-router-dom";
import Home from "./home.jsx";
import Inventario from "./inventario.jsx";
import Login from "./login.jsx";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />  {}
      <Route path="/home" element={<Home />} />
      <Route path="/inventario" element={<Inventario />} />
    </Routes>
  );
}

export default App;
