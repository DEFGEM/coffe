import React, { createContext, useContext, useMemo, useState } from 'react';

export const LIGHT = {
  crema: '#fef4cd',
  degradado: ['#f8e7b5', '#fff5d8', '#fffdf8'],
  crema2: '#f8eddf',
  cafeOscuro: '#4a1f0c',
  cafe: '#78350f',
  cafeClaro: '#9a4b1a',
  linea: '#eadfd6',
  texto: '#4a1f0c',
  textoSuave: '#7d7975',
  blanco: '#f8f8f8',
  superficie: '#ffffff',
  verde: '#159447',
  verdeFondo: '#dcfce7',
  rojo: '#e52d35',
  rojoFondo: '#fee2e2',
  ambar: '#d58a08',
  ambarFondo: '#fef3c7',
  azul: '#4677c8',
  azulFondo: '#dbeafe',
  sombra: '#5b2a12',
  overlay: 'rgba(44, 23, 12, 0.52)',
  barra: 'rgba(255,255,255,0.97)',
};

export const DARK = {
  crema: '#1a130d',
  degradado: ['#1a130d', '#21170f', '#17110d'],
  crema2: '#2a2018',
  cafeOscuro: '#f6d5a9',
  cafe: '#bd6408',
  cafeClaro: '#e38a22',
  linea: '#45372c',
  texto: '#fff4dc',
  textoSuave: '#c0b4a7',
  blanco: '#251c16',
  superficie: '#30241c',
  verde: '#31b768',
  verdeFondo: '#183b28',
  rojo: '#ff6868',
  rojoFondo: '#482323',
  ambar: '#f2ad38',
  ambarFondo: '#47351d',
  azul: '#72a4ef',
  azulFondo: '#1d3150',
  sombra: '#000000',
  overlay: 'rgba(0,0,0,0.72)',
  barra: 'rgba(37,28,22,0.98)',
};

const ThemeContext = createContext({
  oscuro: false,
  colors: LIGHT,
  alternarTema: () => {},
});

export function ThemeProvider({ children }) {
  const [oscuro, setOscuro] = useState(false);
  const value = useMemo(() => ({
    oscuro,
    colors: oscuro ? DARK : LIGHT,
    alternarTema: () => setOscuro((actual) => !actual),
  }), [oscuro]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useTheme().colors;

export const estadoColor = (C, estado) => ({
  pendiente:      { fondo: C.ambarFondo, texto: C.ambar, etiqueta: 'Pendiente' },
  pagado:         { fondo: C.azulFondo,  texto: C.azul, etiqueta: 'Pagado' },
  en_preparacion: { fondo: C.ambarFondo, texto: C.ambar, etiqueta: 'En preparación' },
  listo:          { fondo: C.verdeFondo, texto: C.verde, etiqueta: 'Listo' },
  entregado:      { fondo: C.crema2,     texto: C.textoSuave, etiqueta: 'Entregado' },
  cancelado:      { fondo: C.rojoFondo,  texto: C.rojo, etiqueta: 'Cancelado' },
}[estado] || { fondo: C.ambarFondo, texto: C.ambar, etiqueta: 'Pendiente' });
