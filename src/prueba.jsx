import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./DB/firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

const Prueba = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [idEditar, setIdEditar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerUsuarios = async () => {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const datos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(datos);
    };
    obtenerUsuarios();
  }, []);

  const agregarUsuario = async () => {
    if (nombre.trim() === "") return;
    await addDoc(collection(db, "usuarios"), { nombre });
    setNombre("");
    window.location.reload();
  };

  const actualizarUsuario = async (id) => {
    const usuarioRef = doc(db, "usuarios", id);
    await updateDoc(usuarioRef, { nombre: nuevoNombre });
    setIdEditar(null);
    setNuevoNombre("");
    window.location.reload();
  };

  const eliminarUsuario = async (id) => {
    await deleteDoc(doc(db, "usuarios", id));
    window.location.reload();
  };

  return (
    <div>
      <h2>CRUD en Firebase Firestore</h2>
      <button onClick={() => navigate("/menu")}>Ir al Menú</button>
      <button onClick={() => navigate("/mapa-mesas")}>Ir a Mapa de Mesas</button>
      
      {/* Nuevo botón para la Vista de Administrador */}
      <button onClick={() => navigate("/mesero")}>
        Vista de mesero
      </button>

      <br /><br />

      <input
        type="text"
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button onClick={agregarUsuario}>Agregar Usuario</button>

      <ul>
        {usuarios.map((usuario) => (
          <li key={usuario.id}>
            {idEditar === usuario.id ? (
              <>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                />
                <button onClick={() => actualizarUsuario(usuario.id)}>Guardar</button>
              </>
            ) : (
              <>
                {usuario.nombre}
                <button onClick={() => { 
                  setIdEditar(usuario.id); 
                  setNuevoNombre(usuario.nombre); 
                }}>
                  Editar
                </button>
                <button onClick={() => eliminarUsuario(usuario.id)}>Eliminar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Prueba;
