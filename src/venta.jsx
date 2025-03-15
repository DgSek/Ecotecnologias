import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./DB/firebaseConfig";
import Swal from "sweetalert2"; // Importar SweetAlert2
import "./venta.css";

const Venta = () => {
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [clienteFrecuente, setClienteFrecuente] = useState("Sí");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [nombreCliente, setNombreCliente] = useState("");
    const [productoSeleccionado, setProductoSeleccionado] = useState("");
    const [cantidadProducto, setCantidadProducto] = useState(1);
    const [carrito, setCarrito] = useState([]);

    useEffect(() => {
        const obtenerClientes = async () => {
            const querySnapshot = await getDocs(collection(db, "clientes"));
            const clientesArray = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setClientes(clientesArray);
        };

        const obtenerProductos = async () => {
            const querySnapshot = await getDocs(collection(db, "inventario"));
            const productosArray = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProductos(productosArray);
        };

        obtenerClientes();
        obtenerProductos();
    }, []);

    const agregarProducto = () => {
        if (!productoSeleccionado || cantidadProducto < 1) return;

        const producto = productos.find((p) => p.id === productoSeleccionado);
        if (!producto) return;

        const productoExistente = carrito.find((p) => p.id === producto.id);

        if (productoExistente) {
            setCarrito(
                carrito.map((p) =>
                    p.id === producto.id ? { ...p, cantidad: p.cantidad + cantidadProducto } : p
                )
            );
        } else {
            setCarrito([...carrito, { ...producto, cantidad: cantidadProducto }]);
        }
    };

    const eliminarProducto = (id) => {
        setCarrito(carrito.filter((producto) => producto.id !== id));
    };

    const calcularTotal = () => {
        return carrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    };

    const registrarVenta = async () => {
        if (carrito.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Carrito vacío",
                text: "Debe agregar al menos un producto a la venta.",
            });
            return;
        }

        let clienteData = {};
        if (clienteFrecuente === "Sí" && clienteSeleccionado) {
            clienteData = {
                clienteFrecuente: true,
                nombre: clienteSeleccionado.nombre,
                rfc: clienteSeleccionado.rfc,
            };
        } else {
            clienteData = {
                clienteFrecuente: false,
                nombre: nombreCliente || "Cliente no frecuente",
                rfc: null,
            };
        }

        const nuevaVenta = {
            cliente: clienteData,
            productos: carrito.map((p) => ({
                id: p.id,
                nombre: p.nombre,
                cantidad: p.cantidad,
                precioUnitario: p.precio,
                subtotal: p.precio * p.cantidad,
            })),
            total: calcularTotal(),
            fecha: Timestamp.now(),
        };

        // 🔥 **Confirmación antes de registrar la venta**
        Swal.fire({
            title: "¿Registrar esta venta?",
            text: `Total a pagar: $${calcularTotal().toFixed(2)}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, registrar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await addDoc(collection(db, "ventas"), nuevaVenta);
                    Swal.fire({
                        icon: "success",
                        title: "Venta registrada con éxito",
                        showConfirmButton: false,
                        timer: 1500,
                    });

                    // Limpiar estado después de registrar la venta
                    setClienteSeleccionado(null);
                    setNombreCliente("");
                    setProductoSeleccionado("");
                    setCantidadProducto(1);
                    setCarrito([]);
                } catch (error) {
                    console.error("Error al registrar la venta:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Hubo un error al registrar la venta.",
                    });
                }
            }
        });
    };

    return (
        <div className="venta-container">
            <div className="venta-content">
                <div className="sidebar">
                    <div className="cliente-section">
                        <h3>¿Cliente Frecuente?</h3>
                        <select value={clienteFrecuente} onChange={(e) => setClienteFrecuente(e.target.value)}>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>

                        {clienteFrecuente === "Sí" ? (
                            <>
                                <h3>Cliente</h3>
                                <select
                                    value={clienteSeleccionado ? clienteSeleccionado.id : ""}
                                    onChange={(e) =>
                                        setClienteSeleccionado(clientes.find((c) => c.id === e.target.value))
                                    }
                                    disabled={carrito.length > 0}
                                >
                                    <option value="">Seleccionar Cliente</option>
                                    {clientes.map((cliente) => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.nombre} - {cliente.rfc}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <>
                                <h3>Nombre del Cliente</h3>
                                <input
                                    type="text"
                                    placeholder="Ingrese el nombre"
                                    value={nombreCliente}
                                    onChange={(e) => setNombreCliente(e.target.value)}
                                    disabled={carrito.length > 0}
                                />
                            </>
                        )}
                    </div>
                    <hr />
                    <div className="producto-section">
                        <h3>Agregar Productos</h3>
                        <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
                            <option value="">Seleccionar Producto</option>
                            {productos.map((producto) => (
                                <option key={producto.id} value={producto.id}>
                                    {producto.nombre} - ${producto.precio}
                                </option>
                            ))}
                        </select>

                        <div className="cantidad-container">
                            <button className="cantidad-btn" onClick={() => setCantidadProducto(Math.max(1, cantidadProducto - 1))}>−</button>
                            <input
                                type="number"
                                min="1"
                                value={cantidadProducto}
                                onChange={(e) => setCantidadProducto(Math.max(1, Number(e.target.value)))}
                                className="cantidad-input"
                            />
                            <button className="cantidad-btn" onClick={() => setCantidadProducto(cantidadProducto + 1)}>+</button>
                        </div>

                        <button className="agregar-producto-btn" onClick={agregarProducto}>
                            Agregar Producto
                        </button>
                    </div>
                </div>

                <div className="venta-detalle">
                    <h1>Punto de Venta</h1>
                    <div className="venta-tabla-container">
                        <table className="venta-tabla">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Subtotal</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {carrito.map((producto) => (
                                    <tr key={producto.id}>
                                        <td>{producto.nombre}</td>
                                        <td>{producto.cantidad}</td>
                                        <td>${producto.precio.toFixed(2)}</td>
                                        <td>${(producto.precio * producto.cantidad).toFixed(2)}</td>
                                        <td>
                                            <button
                                                className="eliminar-btn"
                                                onClick={() => eliminarProducto(producto.id)}
                                            >
                                                ❌
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {[...Array(10 - carrito.length)].map((_, index) => (
                                    <tr key={`empty-${index}`} className="empty-row">
                                        <td colSpan="5"></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <h2>Total: ${calcularTotal().toFixed(2)}</h2>
                    <button className="registrar-venta-btn" onClick={registrarVenta}>
                        Registrar Venta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Venta;
