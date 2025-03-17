import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import Swal from "sweetalert2";
import { app, db, auth } from "./DB/firebaseConfig";
import "./inventario.css";

// Instancia secundaria para autenticar al responsable
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// Utiliza app.options en lugar de firebaseConfig
const secondaryApp = initializeApp(app.options, "secondary");
const secondaryAuth = getAuth(secondaryApp);

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null); // null si no se está editando

  // Iniciamos cantidad y precio como cadenas vacías, no como 0
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    cantidad: "",
    categoria: "",
    precio: "",
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

  // Manejador para cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Guardamos tal cual la cadena en el estado (sin forzar a número).
    setNuevoProducto({ ...nuevoProducto, [name]: value });
  };

  const handleAgregar = () => {
    setEditando(null);
    // Reseteamos los campos a cadenas vacías
    setNuevoProducto({
      nombre: "",
      descripcion: "",
      cantidad: "",
      categoria: "",
      precio: "",
      fecha_ingreso: new Date().toISOString().split("T")[0],
    });
    setMostrarModal(true);
  };

  const handleEditar = (producto) => {
    setEditando(producto.id);
    // Convertimos cantidad y precio a cadena para que no aparezca "0"
    setNuevoProducto({
      ...producto,
      cantidad: String(producto.cantidad ?? ""),
      precio: String(producto.precio ?? ""),
    });
    setMostrarModal(true);
  };

  const guardarProducto = async () => {
    // Parseamos cantidad y precio para validar
    const parsedCantidad = parseFloat(nuevoProducto.cantidad);
    const parsedPrecio = parseFloat(nuevoProducto.precio);

    // Validamos que no estén vacíos y que sean >= 0
    if (
      !nuevoProducto.nombre ||
      isNaN(parsedCantidad) ||
      isNaN(parsedPrecio) ||
      parsedCantidad < 0 ||
      parsedPrecio < 0
    ) {
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
      // Preparamos el objeto a guardar con cantidad y precio numéricos
      const productoAguardar = {
        ...nuevoProducto,
        cantidad: parsedCantidad,
        precio: parsedPrecio,
      };

      if (editando) {
        // Editar producto
        const productoRef = doc(db, "inventario", editando);
        await updateDoc(productoRef, productoAguardar);

        setProductos(
          productos.map((p) =>
            p.id === editando ? { id: editando, ...productoAguardar } : p
          )
        );

        Swal.fire({
          title: "¡Actualizado!",
          text: `El producto "${nuevoProducto.nombre}" se ha actualizado correctamente.`,
          icon: "success",
          confirmButtonColor: "#28a745",
        });
      } else {
        // Agregar producto
        const docRef = await addDoc(collection(db, "inventario"), productoAguardar);
        setProductos([...productos, { id: docRef.id, ...productoAguardar }]);

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

    // Cerrar modal y reset
    setMostrarModal(false);
    setEditando(null);
    setNuevoProducto({
      nombre: "",
      descripcion: "",
      cantidad: "",
      categoria: "",
      precio: "",
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
        try {
          // Autentica con la instancia secundaria usando el email del responsable
          await signInWithEmailAndPassword(secondaryAuth, "responsable@ecotec.com", password);
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
