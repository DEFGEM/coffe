export const INICIO_POR_ROL = {
  Admin: 'dashboard',
  Mesero: 'meseroDash',
  Cajero: 'cajaDash',
  Cocinero: 'cocinaDash',
};

const RUTAS_POR_ROL = {
  Admin: [
    'dashboard',
    'meseroDash', 'meseroRealizar', 'meseroPedidos', 'meseroMarketing',
    'cajaDash', 'cajaPedidos', 'cajaPago', 'cajaTicket', 'cajaCuentas', 'cajaCompras',
    'cocinaDash', 'cocinaPedidos', 'cocinaInventario', 'cocinaMenu',
  ],
  Mesero: ['meseroDash', 'meseroRealizar', 'meseroPedidos', 'meseroMarketing'],
  Cajero: ['cajaDash', 'cajaPedidos', 'cajaPago', 'cajaTicket', 'cajaCuentas', 'cajaCompras'],
  Cocinero: ['cocinaDash', 'cocinaPedidos', 'cocinaInventario', 'cocinaMenu'],
};

export const inicioPorRol = (rol) => INICIO_POR_ROL[rol] || 'dashboard';
export const puedeAcceder = (rol, pantalla) => (RUTAS_POR_ROL[rol] || []).includes(pantalla);
export const esAdmin = (usuario) => usuario?.rol === 'Admin';
