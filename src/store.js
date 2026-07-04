// Estado global de la app (datos simulados en memoria).
// En la integración final, estas operaciones consumirán la API FastAPI + PostgreSQL.
import React, { createContext, useContext, useState } from 'react';

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

// ── Datos simulados ─────────────────────────────────────────
export const USUARIOS = [
  { id: 1, nombre: 'Fer',    email: 'fer@coffeeadmin.com',    password: 'admin123',  rol: 'Admin' },
  { id: 2, nombre: 'Mesero', email: 'mesero@coffeeadmin.com', password: 'mesero1',   rol: 'Mesero' },
  { id: 3, nombre: 'Caja',   email: 'caja@coffeeadmin.com',   password: 'caja1',     rol: 'Cajero' },
  { id: 4, nombre: 'Cocina', email: 'cocina@coffeeadmin.com', password: 'cocina1',   rol: 'Cocinero' },
];

const MENU_INICIAL = [
  { id: 1, nombre: 'Café americano', precio: 35, categoria: 'Bebidas calientes', icono: '☕', descripcion: 'Bebida caliente · 12oz', disponible: true },
  { id: 2, nombre: 'Latte',          precio: 45, categoria: 'Bebidas calientes', icono: '🥛', descripcion: 'Espresso con leche vaporizada', disponible: true },
  { id: 3, nombre: 'Frappé',         precio: 55, categoria: 'Bebidas frías',     icono: '🧋', descripcion: 'Bebida fría con hielo frappé', disponible: true },
  { id: 4, nombre: 'Pan dulce',      precio: 25, categoria: 'Panadería',         icono: '🥐', descripcion: 'Pieza de panadería del día', disponible: true },
  { id: 5, nombre: 'Combo desayuno', precio: 55, categoria: 'Combos',            icono: '🍳', descripcion: 'Café americano + pan dulce', disponible: true },
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
    estado: 'pendiente', total: 140, hora: '10:15' },
  { id: 15, mesa: 3, mesero: 'Mesero',
    items: [{ producto: 'Café americano', cantidad: 2, precio: 35 }, { producto: 'Pan dulce', cantidad: 1, precio: 25 }],
    observaciones: '', estado: 'pagado', total: 95, hora: '10:02' },
  { id: 16, mesa: 1, mesero: 'Mesero',
    items: [{ producto: 'Latte', cantidad: 1, precio: 45 }, { producto: 'Frappé', cantidad: 2, precio: 55 }],
    observaciones: '', estado: 'en_preparacion', total: 155, hora: '09:48' },
];

const VENTAS_INICIALES = [
  { id: 101, pedido: 12, monto: 185, metodo: 'efectivo',      hora: '09:30' },
  { id: 102, pedido: 13, monto: 120, metodo: 'tarjeta',       hora: '09:55' },
  { id: 103, pedido: 14, monto: 90,  metodo: 'transferencia', hora: '10:05' },
];

const GASTOS_INICIALES = [
  { id: 1, descripcion: 'Compra de insumos', monto: 450, hora: '09:15' },
  { id: 2, descripcion: 'Pago de servicio',  monto: 530, hora: 'Ayer'  },
];

const COMPRAS_INICIALES = [
  { id: 1, insumo: 'Café molido', cantidad: 5, unidad: 'kg',     costo: 380, fecha: '2026-06-09' },
  { id: 2, insumo: 'Leche',       cantidad: 12, unidad: 'litros', costo: 312, fecha: '2026-06-08' },
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
  const [mesas] = useState([1, 2, 3, 4, 5, 6]);

  // Navegación simple por pila (sin dependencias externas)
  const [pila, setPila] = useState([{ pantalla: 'login', params: {} }]);
  const actual = pila[pila.length - 1];
  const navegar = (pantalla, params = {}) => setPila((p) => [...p, { pantalla, params }]);
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
    setPedidos((p) => [{ id, mesa, mesero, items, observaciones, estado: 'pendiente', total, hora: hora() }, ...p]);
    return id;
  };

  const cambiarEstado = (id, estado) =>
    setPedidos((p) => p.map((x) => (x.id === id ? { ...x, estado } : x)));

  const registrarPago = (pedidoId, metodo, monto) => {
    const id = Math.max(0, ...ventas.map((v) => v.id)) + 1;
    setVentas((v) => [{ id, pedido: pedidoId, monto, metodo, hora: hora() }, ...v]);
    cambiarEstado(pedidoId, 'pagado'); // pasa a cocina
  };

  // Al marcar "listo", cocina descuenta inventario (simulación)
  const marcarListo = (pedidoId) => {
    cambiarEstado(pedidoId, 'listo');
    setInventario((inv) =>
      inv.map((i) => ({ ...i, stock: Math.max(0, i.stock - (i.nombre === 'Café molido' ? 0.2 : 0)) }))
    );
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
    setGastos((g) => [{ id: Math.max(0, ...g.map((x) => x.id)) + 1, descripcion: `Compra: ${insumo}`, monto: costo, hora: hora() }, ...g]);
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
    mesas, mesasOcupadas,
    actual, navegar, regresar, irInicio, puedeRegresar: pila.length > 1,
  };
  return <StoreContext.Provider value={valor}>{children}</StoreContext.Provider>;
}
