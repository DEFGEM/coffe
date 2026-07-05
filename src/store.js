// Estado global de la app (datos simulados en memoria).
// En la integración final, estas operaciones consumirán la API FastAPI + PostgreSQL.
import React, { createContext, useContext, useState } from 'react';

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export const fechaActual = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const esDeHoy = (registro) => registro?.fecha === fechaActual();
const fechaHaceDias = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ── Datos simulados ─────────────────────────────────────────
export const USUARIOS = [
  { id: 1, nombre: 'Fer',    email: 'fer@coffeeadmin.com',    password: 'admin123',  rol: 'Admin' },
  { id: 2, nombre: 'Mesero', email: 'mesero@coffeeadmin.com', password: 'mesero1',   rol: 'Mesero' },
  { id: 3, nombre: 'Caja',   email: 'caja@coffeeadmin.com',   password: 'caja1',     rol: 'Cajero' },
  { id: 4, nombre: 'Cocina', email: 'cocina@coffeeadmin.com', password: 'cocina1',   rol: 'Cocinero' },
];

const MENU_INICIAL = [
  { id: 1, nombre: 'Café americano', precio: 35, categoria: 'Bebidas calientes', icono: '☕', descripcion: 'Bebida caliente · 12oz', disponible: true, insumos: { 'Café molido': 0.018, 'Azúcar': 0.01 } },
  { id: 2, nombre: 'Latte',          precio: 45, categoria: 'Bebidas calientes', icono: '🥛', descripcion: 'Espresso con leche vaporizada', disponible: true, insumos: { 'Café molido': 0.018, 'Leche': 0.25 } },
  { id: 3, nombre: 'Frappé',         precio: 55, categoria: 'Bebidas frías',     icono: '🧋', descripcion: 'Bebida fría con hielo frappé', disponible: true, insumos: { 'Café molido': 0.015, 'Leche': 0.2, 'Azúcar': 0.02, 'Hielo': 0.2 } },
  { id: 4, nombre: 'Pan dulce',      precio: 25, categoria: 'Panadería',         icono: '🥐', descripcion: 'Pieza de panadería del día', disponible: true, insumos: { 'Pan dulce': 1 } },
  { id: 5, nombre: 'Combo desayuno', precio: 55, categoria: 'Combos',            icono: '🍳', descripcion: 'Café americano + pan dulce', disponible: true, insumos: { 'Café molido': 0.018, 'Azúcar': 0.01, 'Pan dulce': 1 } },
];

const INVENTARIO_INICIAL = [
  { id: 1, nombre: 'Café molido',  stock: 5,   unidad: 'kg',     minimo: 3 },
  { id: 2, nombre: 'Leche',        stock: 2,   unidad: 'litros', minimo: 3 },
  { id: 3, nombre: 'Azúcar',       stock: 8,   unidad: 'kg',     minimo: 2 },
  { id: 4, nombre: 'Pan dulce',    stock: 14,  unidad: 'piezas', minimo: 6 },
  { id: 5, nombre: 'Hielo',        stock: 1,   unidad: 'bolsas', minimo: 2 },
];

const PEDIDOS_INICIALES = [
  { id: 24, mesa: 5, mesero: 'Fer',
    items: [{ producto: 'Café americano', cantidad: 2, precio: 35 }, { producto: 'Latte', cantidad: 1, precio: 45 }, { producto: 'Pan dulce', cantidad: 1, precio: 25 }],
    observaciones: 'Sin azúcar en un café. Pan dulce para llevar.',
    estado: 'pendiente', total: 140, hora: '10:15', fecha: fechaActual() },
  { id: 15, mesa: 3, mesero: 'Mesero',
    items: [{ producto: 'Café americano', cantidad: 2, precio: 35 }, { producto: 'Pan dulce', cantidad: 1, precio: 25 }],
    observaciones: '', estado: 'pagado', total: 95, hora: '10:02', fecha: fechaActual() },
  { id: 16, mesa: 1, mesero: 'Mesero',
    items: [{ producto: 'Latte', cantidad: 1, precio: 45 }, { producto: 'Frappé', cantidad: 2, precio: 55 }],
    observaciones: '', estado: 'en_preparacion', total: 155, hora: '09:48', fecha: fechaActual() },
];

const VENTAS_INICIALES = [
  { id: 101, pedido: 12, monto: 185, metodo: 'efectivo',      hora: '09:30', fecha: fechaActual() },
  { id: 102, pedido: 13, monto: 120, metodo: 'tarjeta',       hora: '09:55', fecha: fechaActual() },
  { id: 103, pedido: 14, monto: 90,  metodo: 'transferencia', hora: '10:05', fecha: fechaActual() },
];

const GASTOS_INICIALES = [
  { id: 1, descripcion: 'Compra de insumos', monto: 450, hora: '09:15', fecha: fechaActual() },
  { id: 2, descripcion: 'Pago de servicio',  monto: 530, hora: 'Ayer', fecha: fechaHaceDias(1) },
];

const COMPRAS_INICIALES = [
  { id: 1, insumo: 'Café molido', cantidad: 5, unidad: 'kg',     costo: 380, fecha: fechaActual() },
  { id: 2, insumo: 'Leche',       cantidad: 12, unidad: 'litros', costo: 312, fecha: fechaHaceDias(1) },
];

const PROMOCIONES_INICIALES = [
  { id: 1, nombre: 'Combo desayuno', detalle: 'Café americano + pan dulce', precio: 55, etiqueta: 'Activa', ahorro: 5, productoId: 5, sugeridas: 20, vendidas: 18 },
  { id: 2, nombre: '2×1 Frappé', detalle: 'Disponible de 3:00 PM a 5:00 PM', precio: 55, etiqueta: 'Horario', ahorro: 55, productoId: 3, cantidad: 2, sugeridas: 10, vendidas: 7 },
];

const hora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// ── Provider ────────────────────────────────────────────────
export function StoreProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [menu, setMenu] = useState(MENU_INICIAL);
  const [inventario, setInventario] = useState(INVENTARIO_INICIAL);
  const [pedidos, setPedidos] = useState(PEDIDOS_INICIALES);
  const [ventas, setVentas] = useState(VENTAS_INICIALES);
  const [gastos, setGastos] = useState(GASTOS_INICIALES);
  const [compras, setCompras] = useState(COMPRAS_INICIALES);
  const [promociones, setPromociones] = useState(PROMOCIONES_INICIALES);
  const [promocionSugerida, setPromocionSugerida] = useState(null);
  const [mesas] = useState([1, 2, 3, 4, 5, 6]);

  // Navegación simple por pila (sin dependencias externas)
  const [pila, setPila] = useState([{ pantalla: 'login', params: {} }]);
  const actual = pila[pila.length - 1];
  const navegar = (pantalla, params = {}) => setPila((p) => [...p, { pantalla, params }]);
  const reemplazar = (pantalla, params = {}) =>
    setPila((p) => [...p.slice(0, -1), { pantalla, params }]);
  const regresar = () => setPila((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const irInicio = (pantalla, params = {}) => setPila([{ pantalla, params }]);

  // Mesas ocupadas: tienen un pedido activo (no entregado/cancelado)
  const mesasOcupadas = pedidos
    .filter((p) => !['entregado', 'cancelado'].includes(p.estado))
    .map((p) => p.mesa);

  // ── Operaciones de pedidos ──
  const crearPedido = (mesa, items, observaciones, mesero) => {
    const total = items.reduce((s, i) => s + i.cantidad * i.precio, 0);
    const id = Math.max(0, ...pedidos.map((p) => p.id)) + 1;
    setPedidos((p) => [{ id, mesa, mesero, items, observaciones, estado: 'pendiente', total, hora: hora(), fecha: fechaActual() }, ...p]);
    return id;
  };

  const cambiarEstado = (id, estado) =>
    setPedidos((p) => p.map((x) => (x.id === id ? { ...x, estado } : x)));

  const registrarPago = (pedidoId, metodo, monto) => {
    const id = Math.max(0, ...ventas.map((v) => v.id)) + 1;
    setVentas((v) => [{ id, pedido: pedidoId, monto, metodo, hora: hora(), fecha: fechaActual() }, ...v]);
    cambiarEstado(pedidoId, 'pagado'); // pasa a cocina
  };

  // Al marcar "listo", cocina descuenta inventario (simulación)
  const marcarListo = (pedidoId) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido || pedido.estado === 'listo' || pedido.estado === 'entregado') return;
    const consumo = {};
    pedido.items.forEach((item) => {
      const producto = menu.find((m) => m.nombre === item.producto);
      Object.entries(producto?.insumos || {}).forEach(([insumo, cantidad]) => {
        consumo[insumo] = (consumo[insumo] || 0) + cantidad * item.cantidad;
      });
    });
    cambiarEstado(pedidoId, 'listo');
    setInventario((inv) =>
      inv.map((i) => ({
        ...i,
        stock: Math.max(0, Number((i.stock - (consumo[i.nombre] || 0)).toFixed(3))),
      }))
    );
  };

  const sugerirPromocion = (id) => {
    const promocion = promociones.find((p) => p.id === id);
    if (!promocion) return;
    setPromociones((lista) => lista.map((p) => p.id === id ? { ...p, sugeridas: p.sugeridas + 1 } : p));
    setPromocionSugerida(promocion);
  };
  const aplicarPromocionSugerida = () => {
    if (!promocionSugerida) return;
    setPromociones((lista) => lista.map((p) =>
      p.id === promocionSugerida.id ? { ...p, vendidas: p.vendidas + 1 } : p));
    setPromocionSugerida(null);
  };

  // ── Menú (cocina) ──
  const agregarPlatillo = (datos) => {
    const id = Math.max(0, ...menu.map((m) => m.id)) + 1;
    setMenu((m) => [...m, { id, icono: '🍽️', disponible: true, ...datos }]);
  };
  const editarPlatillo = (id, datos) =>
    setMenu((m) => m.map((x) => (x.id === id ? { ...x, ...datos } : x)));
  const eliminarPlatillo = (id) => setMenu((m) => m.filter((x) => x.id !== id));

  // ── Compras de suministros (caja) ──
  const registrarCompra = (insumo, cantidad, costo, fecha) => {
    const id = Math.max(0, ...compras.map((c) => c.id)) + 1;
    setCompras((c) => [{ id, insumo, cantidad, unidad: 'unidades', costo, fecha }, ...c]);
    setGastos((g) => [{ id: Math.max(0, ...g.map((x) => x.id)) + 1, descripcion: `Compra: ${insumo}`, monto: costo, hora: hora(), fecha }, ...g]);
    setInventario((inv) => {
      const existe = inv.find((i) => i.nombre.toLowerCase() === insumo.toLowerCase());
      if (existe) return inv.map((i) => (i.id === existe.id ? { ...i, stock: i.stock + cantidad } : i));
      return [...inv, { id: Math.max(0, ...inv.map((i) => i.id)) + 1, nombre: insumo, stock: cantidad, unidad: 'unidades', minimo: 2 }];
    });
  };

  const valor = {
    usuario, setUsuario,
    menu, agregarPlatillo, editarPlatillo, eliminarPlatillo,
    inventario, pedidos, crearPedido, cambiarEstado, registrarPago, marcarListo,
    ventas, gastos, compras, registrarCompra,
    promociones, promocionSugerida, sugerirPromocion, aplicarPromocionSugerida,
    mesas, mesasOcupadas,
    actual, navegar, reemplazar, regresar, irInicio, puedeRegresar: pila.length > 1,
  };
  return <StoreContext.Provider value={valor}>{children}</StoreContext.Provider>;
}
