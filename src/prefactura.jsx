import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, Timestamp, deleteDoc, doc } from "firebase/firestore";
import Swal from "sweetalert2";
import { db } from "./DB/firebaseConfig";
import "./prefactura.css";

const Prefactura = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  useEffect(() => {
    const obtenerVentas = async () => {
      const querySnapshot = await getDocs(collection(db, "ventas"));
      const ventasArray = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((venta) => venta.cliente.clienteFrecuente); // Solo clientes frecuentes
      setVentas(ventasArray);
    };

    const obtenerClientes = async () => {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientesArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(clientesArray);
    };

    obtenerVentas();
    obtenerClientes();
  }, []);

  const seleccionarVenta = (venta) => {
    setVentaSeleccionada(ventaSeleccionada?.id === venta.id ? null : venta);
  };

  const generarPrefactura = async () => {
    if (!ventaSeleccionada) {
      Swal.fire("Error", "Selecciona una venta primero", "error");
      return;
    }

    const cliente = clientes.find((c) => c.nombre === ventaSeleccionada.cliente.nombre);
    if (!cliente) {
      Swal.fire("Error", "No se encontraron los datos del cliente", "error");
      return;
    }

    Swal.fire({
      title: "Generar Pre-Factura",
      html: `
        <div style="text-align: left; font-size: 1rem; color: #333;">
          <p><strong>Fecha:</strong> ${new Date(ventaSeleccionada.fecha.seconds * 1000).toLocaleDateString()}</p>
          <p><strong>Cliente:</strong> ${cliente.nombre}</p>
          <p><strong>RFC:</strong> ${cliente.rfc}</p>
          <p><strong>Correo:</strong> ${cliente.correo}</p>
          <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
          <p><strong>Dirección:</strong> ${cliente.direccion}</p>
          <p><strong>Productos:</strong></p>
          <ul style="margin-left: 20px;">
            ${ventaSeleccionada.productos.map(p => `<li>${p.nombre} (x${p.cantidad}) - $${(p.precioUnitario * p.cantidad).toFixed(2)}</li>`).join('')}
          </ul>
          <p><strong>Total:</strong> $${ventaSeleccionada.total.toFixed(2)}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Generar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      background: "#fff",
      customClass: {
        popup: "prefactura-popup",
        title: "prefactura-popup-title",
        confirmButton: "prefactura-confirm-btn",
        cancelButton: "prefactura-cancel-btn",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const nuevaPrefactura = {
          cliente_id: cliente.id,
          cliente_nombre: cliente.nombre,
          correo: cliente.correo,
          telefono: cliente.telefono,
          direccion: cliente.direccion,
          rfc: cliente.rfc,
          estatus: "",
          fecha_generacion: Timestamp.now(),
          productos: ventaSeleccionada.productos,
          total: ventaSeleccionada.total,
        };

        await addDoc(collection(db, "prefactura"), nuevaPrefactura);
        await deleteDoc(doc(db, "ventas", ventaSeleccionada.id));

        // Actualizar tabla eliminando la venta facturada
        setVentas(ventas.filter((v) => v.id !== ventaSeleccionada.id));

        Swal.fire("Pre-factura enviada a contabilidad", "Se ha registrado correctamente.", "success");
      }
    });
  };

  return (
    <div className="prefactura-container">
      <h1>Pre-Facturación</h1>
      <div className="tabla-container">
        <table className="prefactura-tabla">
          <thead>
            <tr>
              <th>Factura</th>
              <th>Cliente</th>
              <th>Descripción</th>
              <th>Total</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ventas.length > 0 ? (
              ventas.map((venta) => (
                <tr
                  key={venta.id}
                  className={ventaSeleccionada?.id === venta.id ? "fila-seleccionada" : ""}
                  onClick={() => seleccionarVenta(venta)}
                >
                  <td className="factura-icon">✅</td>
                  <td>{venta.cliente.nombre}</td>
                  <td>
                    <ul className="descripcion-lista">
                      {venta.productos.map((producto, index) => (
                        <li key={index}>
                          {producto.nombre} (x{producto.cantidad})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${venta.total.toFixed(2)}</td>
                  <td>{new Date(venta.fecha.seconds * 1000).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay ventas registradas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button className="generar-factura-btn" onClick={generarPrefactura}>
        Generar Factura
      </button>
    </div>
  );
};

export default Prefactura;
