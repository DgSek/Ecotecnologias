import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./DB/firebaseConfig";
import Swal from "sweetalert2";
import "./clientes.css";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
    rfc: "",
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    const querySnapshot = await getDocs(collection(db, "clientes"));
    const clientesArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClientes(clientesArray);
  };

  const handleChange = (e) => {
    setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });
  };

  const agregarCliente = async () => {
    if (!nuevoCliente.nombre || !nuevoCliente.telefono || !nuevoCliente.correo || !nuevoCliente.direccion || !nuevoCliente.rfc) {
      Swal.fire("Error", "Todos los campos son obligatorios.", "error");
      return;
    }

    if (editando) {
      const clienteRef = doc(db, "clientes", editando);
      await updateDoc(clienteRef, nuevoCliente);
      Swal.fire("Actualizado", "Cliente actualizado correctamente", "success");
    } else {
      await addDoc(collection(db, "clientes"), nuevoCliente);
      Swal.fire({
        title: "Cliente agregado",
        text: "Se ha agregado un nuevo cliente exitosamente.",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    setMostrarModal(false);
    setNuevoCliente({ nombre: "", telefono: "", correo: "", direccion: "", rfc: "" });
    setEditando(null);
    obtenerClientes();
  };

  const eliminarCliente = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar cliente?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
    });

    if (confirmacion.isConfirmed) {
      await deleteDoc(doc(db, "clientes", id));
      Swal.fire("Eliminado", "El cliente ha sido eliminado", "success");
      obtenerClientes();
    }
  };

  return (
    <div className="clientes-container">
      <h1>Clientes Frecuentes</h1>
      <button className="agregar-btn" onClick={() => setMostrarModal(true)}>
        Agregar Cliente
      </button>

      <table className="clientes-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>RFC</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nombre}</td>
              <td>{cliente.rfc}</td>
              <td>{cliente.telefono}</td>
              <td>{cliente.correo}</td>
              <td>{cliente.direccion}</td>
              <td>
                <button className="editar-btn" onClick={() => {
                  setNuevoCliente(cliente);
                  setEditando(cliente.id);
                  setMostrarModal(true);
                }}>
                  Editar
                </button>
                <button className="eliminar-btn" onClick={() => eliminarCliente(cliente.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editando ? "Editar Cliente" : "Agregar Cliente"}</h2>
            <input type="text" name="nombre" placeholder="Nombre" value={nuevoCliente.nombre} onChange={handleChange} required />
            <input type="text" name="rfc" placeholder="RFC" value={nuevoCliente.rfc} onChange={handleChange} required />
            <input type="text" name="telefono" placeholder="Teléfono" value={nuevoCliente.telefono} onChange={handleChange} required />
            <input type="email" name="correo" placeholder="Correo" value={nuevoCliente.correo} onChange={handleChange} required />
            <input type="text" name="direccion" placeholder="Dirección" value={nuevoCliente.direccion} onChange={handleChange} required />
            <button className="guardar-btn" onClick={agregarCliente}>
              {editando ? "Actualizar" : "Guardar"}
            </button>
            <button className="cerrar-btn" onClick={() => {
              setMostrarModal(false);
              setEditando(null);
            }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
