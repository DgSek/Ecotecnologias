import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./DB/firebaseConfig";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formType, setFormType] = useState(""); // "login" o "register"
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Convertimos a minúsculas para evitar problemas de mayúsculas/minúsculas
      if (user && user.email.toLowerCase() === "almacen@ecotec.com") {
        navigate("/inventario");
      } else {
        navigate("/home");
      }
    } catch (error) {
      setError("Correo o contraseña incorrectos.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      setError("Error al registrar usuario.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Sección Izquierda - Botones para cambiar el formulario */}
        <div className="login-left">
          <h2>Bienvenido</h2>
          <p>Seleccione una opción:</p>
          <button onClick={() => setFormType("login")}>Iniciar Sesión</button>
          <button onClick={() => setFormType("register")}>Registrarse</button>
          <h3>olvide mi contraseña</h3>
        </div>

        {/* Sección Derecha - Logo y Formulario Dinámico */}
        <div className="login-right">
          <img src="/muñoz_ecotec_resp_blue.png" alt="Logo" className="logo" />

          {formType === "login" && (
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Iniciar Sesión</button>
            </form>
          )}

          {formType === "register" && (
            <form onSubmit={handleRegister}>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Registrarse</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
