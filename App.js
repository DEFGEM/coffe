// CoffeeAdmin — Aplicación móvil (React Native + Expo)
// Entrega 1er Parcial · Programación Móvil · Grupo S-203 · UPQ
import React from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';
import { StoreProvider, useStore } from './src/store';
import { ThemeProvider, useTheme } from './src/theme';
import { LoginScreen, DashboardScreen } from './src/screens/Inicio';
import { MeseroDashboard, MeseroRealizar, MeseroPedidos, MeseroMarketing } from './src/screens/Mesero';
import { CajaDashboard, CajaPedidos, CajaPago, CajaTicket, CajaCuentas, CajaCompras } from './src/screens/Caja';
import { CocinaDashboard, CocinaPedidos, CocinaInventario, CocinaMenu } from './src/screens/Cocina';

const PANTALLAS = {
  login: LoginScreen,
  dashboard: DashboardScreen,
  meseroDash: MeseroDashboard,
  meseroRealizar: MeseroRealizar,
  meseroPedidos: MeseroPedidos,
  meseroMarketing: MeseroMarketing,
  cajaDash: CajaDashboard,
  cajaPedidos: CajaPedidos,
  cajaPago: CajaPago,
  cajaTicket: CajaTicket,
  cajaCuentas: CajaCuentas,
  cajaCompras: CajaCompras,
  cocinaDash: CocinaDashboard,
  cocinaPedidos: CocinaPedidos,
  cocinaInventario: CocinaInventario,
  cocinaMenu: CocinaMenu,
};

function Router() {
  const { actual, usuario } = useStore();
  // Protección de rutas: sin sesión, siempre Login (RNF-05 / RNF-13)
  const Pantalla = !usuario ? LoginScreen : (PANTALLAS[actual.pantalla] || DashboardScreen);
  return <Pantalla params={actual.params} />;
}

function Aplicacion() {
  const { colors: C, oscuro } = useTheme();
  return (
    <StoreProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.crema, paddingTop: Platform.OS === 'android' ? 28 : 0 }}>
        <StatusBar barStyle={oscuro ? 'light-content' : 'dark-content'} backgroundColor={C.crema} />
        <Router />
      </SafeAreaView>
    </StoreProvider>
  );
}

export default function App() {
  return <ThemeProvider><Aplicacion /></ThemeProvider>;
}
