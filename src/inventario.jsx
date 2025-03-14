import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./DB/firebaseConfig";
import "./inventario.css";

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    cantidad: 0,
    categoria: "",
    precio: 0,
    fecha_ingreso: new Date().toISOString().split("T")[0], //fecha actual del sistema
  });

  useEffect(() => {
    const obtenerInventario = async () => {
      const querySnapshot = await getDocs(collection(db, "inventario"));
      const productosArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(productosArray);
    };

    obtenerInventario();
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    //convierte cantidad y precio a número y evitar valores negativos
    if (name === "cantidad" || name === "precio") {
      value = Number(value);
      if (value < 0) value = 0;
    }

    setNuevoProducto({
      ...nuevoProducto,
      [name]: value,
    });
  };

  const agregarProducto = async () => {
    if (!nuevoProducto.nombre || nuevoProducto.cantidad < 0 || nuevoProducto.precio < 0) {
      alert("Todos los campos son obligatorios y no pueden ser negativos.");
      return;
    }

    await addDoc(collection(db, "inventario"), nuevoProducto);
    setMostrarModal(false);
    window.location.reload();
  };

  const eliminarProducto = async (id) => {
    await deleteDoc(doc(db, "inventario", id));
    window.location.reload();
  };

  return (
    <div className="inventario-container">
      <h1>Gestión de Inventario</h1>
      <button className="agregar-btn" onClick={() => setMostrarModal(true)}>
        Agregar Producto
      </button>

      <table className="inventario-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Fecha Ingreso</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>{producto.descripcion}</td>
              <td>{producto.cantidad}</td>
              <td>{producto.categoria}</td>
              <td>${producto.precio.toFixed(2)}</td>
              <td>{producto.fecha_ingreso}</td>
              <td>
                <button className="editar-btn">Editar</button>
                <button className="eliminar-btn" onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para agregar producto */}
      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Agregar Producto</h2>
            <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
            <input type="text" name="descripcion" placeholder="Descripción" onChange={handleChange} />
            <input type="number" name="cantidad" min="0" placeholder="Cantidad" onChange={handleChange} required />
            <input type="text" name="categoria" placeholder="Categoría" onChange={handleChange} />
            <input type="number" name="precio" min="0" step="0.01" placeholder="Precio" onChange={handleChange} required />
            <button className="guardar-btn" onClick={agregarProducto}>Guardar</button>
            <button className="cerrar-btn" onClick={() => setMostrarModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
