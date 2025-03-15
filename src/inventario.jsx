import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import Swal from "sweetalert2";
import { db, auth } from "./DB/firebaseConfig";
import "./inventario.css";

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null); // null si no se está editando
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    cantidad: 0,
    categoria: "",
    precio: 0,
    fecha_ingreso: new Date().toISOString().split("T")[0],
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
    if (name === "cantidad" || name === "precio") {
      value = Number(value);
      if (value < 0) value = 0;
    }
    setNuevoProducto({ ...nuevoProducto, [name]: value });
  };

  const handleAgregar = () => {
    setEditando(null);
    setNuevoProducto({
      nombre: "",
      descripcion: "",
      cantidad: 0,
      categoria: "",
      precio: 0,
      fecha_ingreso: new Date().toISOString().split("T")[0],
    });
    setMostrarModal(true);
  };

  const handleEditar = (producto) => {
    setEditando(producto.id);
    setNuevoProducto(producto); // Carga los datos en el formulario
    setMostrarModal(true);
  };

  const guardarProducto = async () => {
    if (!nuevoProducto.nombre || nuevoProducto.cantidad < 0 || nuevoProducto.precio < 0) {
      Swal.fire({
        title: "🚨 ¡Error!",
        text: "Todos los campos son obligatorios y no pueden ser negativos.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#d33",
        background: "#fff3cd",
        color: "#856404",
      });
      return;
    }

    try {
      if (editando) {
        // Editar producto
        const productoRef = doc(db, "inventario", editando);
        await updateDoc(productoRef, nuevoProducto);

        setProductos(
          productos.map((p) => (p.id === editando ? { id: editando, ...nuevoProducto } : p))
        );

        Swal.fire({
          title: "¡Actualizado!",
          text: `El producto "${nuevoProducto.nombre}" se ha actualizado correctamente.`,
          icon: "success",
          confirmButtonColor: "#28a745",
        });
      } else {
        // Agregar producto
        const docRef = await addDoc(collection(db, "inventario"), nuevoProducto);
        setProductos([...productos, { id: docRef.id, ...nuevoProducto }]);

        Swal.fire({
          title: "🎉 ¡Producto Agregado!",
          html: `<div style="font-size: 1.2rem; font-weight: bold;">
                   <span style="color: #28a745;">✔</span> <strong>${nuevoProducto.nombre}</strong> fue agregado con éxito.
                 </div>`,
          icon: "success",
          confirmButtonColor: "#28a745",
          background: "#eaffea",
          color: "#155724",
          timer: 2500,
        });
      }
    } catch (error) {
      console.error("Error al guardar producto:", error);
      Swal.fire("Error", "Ocurrió un error al guardar el producto.", "error");
    }

    setMostrarModal(false);
    setEditando(null);
    setNuevoProducto({
      nombre: "",
      descripcion: "",
      cantidad: 0,
      categoria: "",
      precio: 0,
      fecha_ingreso: new Date().toISOString().split("T")[0],
    });
  };

  const eliminarProducto = async (id) => {
    const user = auth.currentUser;
    if (!user) {
      Swal.fire({
        title: "⚠️ Error",
        text: "No hay un usuario autenticado.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    Swal.fire({
      title: "🔑 Autenticación Requerida",
      text: "Ingrese la contraseña del responsable para eliminar este producto.",
      input: "password",
      inputPlaceholder: "Contraseña",
      inputAttributes: { autocapitalize: "off" },
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      preConfirm: async (password) => {
        const credential = EmailAuthProvider.credential(user.email, password);
        try {
          await reauthenticateWithCredential(user, credential);
          return true;
        } catch (error) {
          Swal.showValidationMessage("⚠️ Contraseña incorrecta");
          return false;
        }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDoc(doc(db, "inventario", id));
        setProductos(productos.filter((producto) => producto.id !== id));
        Swal.fire({
          title: "✅ Eliminado",
          text: "El producto ha sido eliminado correctamente.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#28a745",
        });
      }
    });
  };

  return (
    <div className="inventario-container">
      <h1>Gestión de Inventario</h1>
      <button className="agregar-btn" onClick={handleAgregar}>
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
                <button className="editar-btn" onClick={() => handleEditar(producto)}>
                  Editar
                </button>
                <button className="eliminar-btn" onClick={() => eliminarProducto(producto.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editando ? "Editar Producto" : "Agregar Producto"}</h2>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={nuevoProducto.nombre}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="descripcion"
              placeholder="Descripción"
              value={nuevoProducto.descripcion}
              onChange={handleChange}
            />
            <input
              type="number"
              name="cantidad"
              min="0"
              placeholder="Cantidad"
              value={nuevoProducto.cantidad}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="categoria"
              placeholder="Categoría"
              value={nuevoProducto.categoria}
              onChange={handleChange}
            />
            <input
              type="number"
              name="precio"
              min="0"
              step="0.01"
              placeholder="Precio"
              value={nuevoProducto.precio}
              onChange={handleChange}
              required
            />

            <button className="guardar-btn" onClick={guardarProducto}>
              {editando ? "Actualizar" : "Guardar"}
            </button>
            <button
              className="cerrar-btn"
              onClick={() => {
                setMostrarModal(false);
                setEditando(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
