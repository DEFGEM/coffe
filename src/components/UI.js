import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, TextInput, ScrollView, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { estadoColor, useTheme } from '../theme';
import { useStore } from '../store';

const useUI = () => {
  const tema = useTheme();
  return { ...tema, s: useMemo(() => crearEstilos(tema.colors), [tema.colors]) };
};

export function Header({ modulo, titulo, subtitulo, icono = '☕' }) {
  const [abierto, setAbierto] = useState(false);
  const { irInicio, usuario, setUsuario, regresar, actual, puedeRegresar } = useStore();
  const { colors: C, oscuro, alternarTema, s } = useUI();
  const esRaiz = ['dashboard', 'meseroDash', 'cajaDash', 'cocinaDash'].includes(actual.pantalla);
  const ir = (pantalla) => { setAbierto(false); irInicio(pantalla); };

  return (
    <View style={s.header}>
      <View style={s.headerSuperior}>
        <TouchableOpacity onPress={() => setAbierto(true)} accessibilityLabel="Abrir menú" style={s.menuBoton}>
          <Text style={s.menuPuntos}>☰</Text>
        </TouchableOpacity>
        {!esRaiz && puedeRegresar
          ? <TouchableOpacity onPress={regresar} style={s.volverBtn}><Text style={s.volver}>‹ Volver</Text></TouchableOpacity>
          : <View />}
      </View>

      <View style={s.headerContenido}>
        <View style={{ flex: 1 }}>
          {modulo ? <Text style={s.headerModulo}>{modulo}</Text> : null}
          <Text style={s.headerTitulo}>{titulo}</Text>
          {subtitulo ? <Text style={s.headerSub}>{subtitulo}</Text> : null}
        </View>
        <View style={s.headerIcono}><Text style={{ fontSize: 20 }}>{icono}</Text></View>
      </View>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <TouchableOpacity style={s.menuFondo} activeOpacity={1} onPress={() => setAbierto(false)}>
          <TouchableOpacity activeOpacity={1} style={s.menuPanel}>
            <View style={s.menuMarca}>
              <View style={s.menuLogo}><Text>☕</Text></View>
              <View>
                <Text style={s.menuTitulo}>CoffeeAdmin</Text>
                <Text style={s.menuUsuario}>{usuario?.nombre} · {usuario?.rol}</Text>
              </View>
            </View>
            <MenuItem s={s} texto="🏠  Dashboard general" onPress={() => ir('dashboard')} />
            <MenuItem s={s} texto="🛎️  Cliente / Mesero" onPress={() => ir('meseroDash')} />
            <MenuItem s={s} texto="💵  Caja" onPress={() => ir('cajaDash')} />
            <MenuItem s={s} texto="👨‍🍳  Cocina" onPress={() => ir('cocinaDash')} />

            <View style={s.temaFila}>
              <View style={{ flex: 1 }}>
                <Text style={s.temaTitulo}>{oscuro ? '🌙 Modo oscuro' : '☀️ Modo claro'}</Text>
                <Text style={s.temaSub}>Cambiar apariencia de toda la app</Text>
              </View>
              <Switch
                value={oscuro}
                onValueChange={alternarTema}
                trackColor={{ false: C.linea, true: C.cafeClaro }}
                thumbColor={oscuro ? C.cafe : '#ffffff'}
              />
            </View>

            <View style={s.menuSep} />
            <MenuItem s={s} texto="Cerrar sesión  →" onPress={() => {
              setAbierto(false); setUsuario(null); irInicio('login');
            }} />
            <TouchableOpacity onPress={() => setAbierto(false)} style={s.menuCerrar}>
              <Text style={{ color: C.textoSuave }}>✕  Cerrar menú</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const MenuItem = ({ texto, onPress, s }) => (
  <TouchableOpacity style={s.menuItem} onPress={onPress}>
    <Text style={s.menuItemTexto}>{texto}</Text>
  </TouchableOpacity>
);

export function TabsModulo({ modulo, activa }) {
  const { irInicio } = useStore();
  const { s } = useUI();
  const grupos = {
    caja: [
      { id: 'pedidos', texto: 'Pedidos', ruta: 'cajaPedidos' },
      { id: 'cuentas', texto: 'Cuentas', ruta: 'cajaCuentas' },
      { id: 'compras', texto: 'Compras', ruta: 'cajaCompras' },
    ],
    cocina: [
      { id: 'pedidos', texto: 'Pedidos', ruta: 'cocinaPedidos' },
      { id: 'inventario', texto: 'Inventario', ruta: 'cocinaInventario' },
      { id: 'menu', texto: 'Menú', ruta: 'cocinaMenu' },
    ],
    mesero: [
      { id: 'realizar', texto: 'Realizar', ruta: 'meseroRealizar' },
      { id: 'pedidos', texto: 'Mis pedidos', ruta: 'meseroPedidos' },
      { id: 'marketing', texto: 'Marketing', ruta: 'meseroMarketing' },
    ],
  };

  return (
    <View style={s.tabs}>
      {grupos[modulo].map((tab) => (
        <TouchableOpacity key={tab.id} style={[s.tab, activa === tab.id && s.tabActiva]}
          onPress={() => irInicio(tab.ruta)}>
          <Text style={[s.tabTexto, activa === tab.id && s.tabTextoActivo]}>{tab.texto}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function Banner({ etiqueta, valor, nota, icono = '📊' }) {
  const { s } = useUI();
  return (
    <View style={s.banner}>
      <View style={{ flex: 1 }}>
        <Text style={s.bannerEtiqueta}>{etiqueta}</Text>
        <Text style={s.bannerValor}>{valor}</Text>
        {nota ? <Text style={s.bannerNota}>{nota}</Text> : null}
      </View>
      <View style={s.bannerIcono}><Text style={{ fontSize: 20 }}>{icono}</Text></View>
    </View>
  );
}

export function KpiFila({ datos }) {
  const { s } = useUI();
  return (
    <View style={s.kpiFila}>
      {datos.map((d, i) => (
        <View key={i} style={s.kpi}>
          <Text style={s.kpiIcono}>{d.icono}</Text>
          <Text style={s.kpiValor}>{d.valor}</Text>
          <Text style={s.kpiEtiqueta}>{d.etiqueta}</Text>
        </View>
      ))}
    </View>
  );
}

export function Tarjeta({ children, style }) {
  const { s } = useUI();
  return <View style={[s.tarjeta, style]}>{children}</View>;
}

export function TituloSec({ children, nota }) {
  const { s } = useUI();
  return (
    <View style={s.tituloContenedor}>
      <Text style={s.tituloSec}>{children}</Text>
      {nota ? <Text style={s.notaSec}>{nota}</Text> : null}
    </View>
  );
}

export function ChipEstado({ estado }) {
  const { colors: C, s } = useUI();
  const e = estadoColor(C, estado);
  return (
    <View style={[s.chip, { backgroundColor: e.fondo }]}>
      <Text style={[s.chipTexto, { color: e.texto }]}>{e.etiqueta}</Text>
    </View>
  );
}

export function Boton({ texto, onPress, tipo = 'cafe', style, deshabilitado }) {
  const { colors: C, s } = useUI();
  const fondos = { cafe: C.cafe, verde: C.verde, rojo: C.rojo, claro: C.superficie };
  const colores = { cafe: '#fff', verde: '#fff', rojo: '#fff', claro: C.texto };
  return (
    <TouchableOpacity onPress={onPress} disabled={deshabilitado}
      style={[s.boton, { backgroundColor: fondos[tipo], opacity: deshabilitado ? 0.5 : 1 },
        tipo === 'claro' && { borderWidth: 1, borderColor: C.linea }, style]}>
      <Text style={[s.botonTexto, { color: colores[tipo] }]}>{texto}</Text>
    </TouchableOpacity>
  );
}

export function Campo({ etiqueta, style, ...props }) {
  const { colors: C, s } = useUI();
  return (
    <View style={{ marginBottom: 12 }}>
      {etiqueta ? <Text style={s.campoEtiqueta}>{etiqueta}</Text> : null}
      <TextInput placeholderTextColor={C.textoSuave} style={[s.input, style]} {...props} />
    </View>
  );
}

export function Selector({ etiqueta, opciones, valor, onChange, deshabilitadas = [] }) {
  const { colors: C, s } = useUI();
  return (
    <View style={{ marginBottom: 12 }}>
      {etiqueta ? <Text style={s.campoEtiqueta}>{etiqueta}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {opciones.map((o) => {
          const bloqueada = deshabilitadas.includes(o);
          const activa = valor === o;
          return (
            <TouchableOpacity key={String(o)} disabled={bloqueada} onPress={() => onChange(o)}
              style={[s.opcion, activa && s.opcionActiva, bloqueada && s.opcionBloqueada]}>
              <Text style={[s.opcionTexto, activa && { color: '#fff' }, bloqueada && { color: C.rojo }]}>
                {String(o)}{bloqueada ? ' ⛔' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export function GraficaBarras({ titulo, datos, color }) {
  const { colors: C, s } = useUI();
  const max = Math.max(...datos.map((d) => d.valor), 1);
  return (
    <Tarjeta>
      {titulo ? <Text style={s.tituloSec}>{titulo}</Text> : null}
      <View style={s.grafica}>
        {datos.map((d, i) => (
          <View key={i} style={s.barraCol}>
            <Text style={s.barraValor}>{d.mostrar ?? d.valor}</Text>
            <View style={[s.barra, { height: 12 + (d.valor / max) * 78, backgroundColor: d.color || color || C.cafe }]} />
            <Text style={s.barraEtiqueta}>{d.etiqueta}</Text>
          </View>
        ))}
      </View>
    </Tarjeta>
  );
}

export function ModalCard({ visible, onCerrar, titulo, children }) {
  const { s } = useUI();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <View style={s.modalFondo}>
        <View style={s.modalCard}>
          <View style={s.modalCabecera}>
            <Text style={s.modalTitulo}>{titulo}</Text>
            <TouchableOpacity onPress={onCerrar}><Text style={s.modalCerrar}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 520 }}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function BarraInferior() {
  const { irInicio, actual } = useStore();
  const { s } = useUI();
  const pantalla = actual.pantalla;
  const grupo = pantalla.startsWith('caja') ? 'caja'
    : pantalla.startsWith('cocina') ? 'cocina'
      : pantalla.startsWith('mesero') ? 'mesero' : 'general';
  const items = {
    general: [
      { rutas: ['dashboard'], icono: '🏠', texto: 'Inicio', ruta: 'dashboard' },
      { rutas: ['meseroPedidos'], icono: '🧾', texto: 'Pedidos', ruta: 'meseroPedidos' },
      { rutas: ['cocinaInventario'], icono: '📦', texto: 'Stock', ruta: 'cocinaInventario' },
      { rutas: [], icono: '👤', texto: 'Perfil', ruta: 'dashboard' },
    ],
    caja: [
      { rutas: ['dashboard'], icono: '🏠', texto: 'Inicio', ruta: 'dashboard' },
      { rutas: ['cajaDash', 'cajaCuentas', 'cajaCompras'], icono: '💵', texto: 'Caja', ruta: 'cajaDash' },
      { rutas: ['cajaPedidos', 'cajaPago', 'cajaTicket'], icono: '🧾', texto: 'Pedidos', ruta: 'cajaPedidos' },
      { rutas: [], icono: '👤', texto: 'Perfil', ruta: 'cajaDash' },
    ],
    cocina: [
      { rutas: ['dashboard'], icono: '🏠', texto: 'Inicio', ruta: 'dashboard' },
      { rutas: ['cocinaDash', 'cocinaPedidos'], icono: '👨‍🍳', texto: 'Cocina', ruta: 'cocinaDash' },
      { rutas: ['cocinaInventario', 'cocinaMenu'], icono: '📦', texto: 'Stock', ruta: 'cocinaInventario' },
      { rutas: [], icono: '👤', texto: 'Perfil', ruta: 'cocinaDash' },
    ],
    mesero: [
      { rutas: ['dashboard'], icono: '🏠', texto: 'Inicio', ruta: 'dashboard' },
      { rutas: ['meseroDash', 'meseroRealizar', 'meseroPedidos'], icono: '📝', texto: 'Pedidos', ruta: 'meseroDash' },
      { rutas: ['meseroMarketing'], icono: '📣', texto: 'Promo', ruta: 'meseroMarketing' },
      { rutas: [], icono: '👤', texto: 'Perfil', ruta: 'meseroDash' },
    ],
  }[grupo];

  return (
    <View style={s.barraInf}>
      {items.map((it) => {
        const activa = it.rutas.includes(pantalla);
        return (
          <TouchableOpacity key={it.texto} style={s.barraItem} onPress={() => irInicio(it.ruta)}>
            <Text style={[s.barraIcono, !activa && { opacity: 0.5 }]}>{it.icono}</Text>
            <Text style={[s.barraTexto, activa && s.barraTextoActiva]}>{it.texto}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function FondoDegradado() {
  const { colors: C } = useUI();
  return (
    <LinearGradient
      colors={C.degradado}
      locations={[0, 0.48, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    />
  );
}

export function Pantalla({ children }) {
  return (
    <View style={{ flex: 1 }}>
      <FondoDegradado />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 112 }}>
        {children}
      </ScrollView>
      <BarraInferior />
    </View>
  );
}

const crearEstilos = (C) => StyleSheet.create({
  header: { marginBottom: 14 },
  headerSuperior: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 10 },
  volverBtn: { paddingVertical: 4, paddingRight: 10 },
  volver: { color: C.cafeClaro, fontSize: 13, fontWeight: '700' },
  menuBoton: { paddingVertical: 5, paddingRight: 8 },
  menuPuntos: { fontSize: 24, lineHeight: 25, color: C.texto, fontWeight: '900' },
  headerContenido: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerIcono: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: C.cafe,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.sombra, shadowOpacity: 0.28, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 7,
  },
  headerModulo: { color: C.cafe, fontSize: 12, fontWeight: '800', marginBottom: 2 },
  headerTitulo: { fontSize: 27, lineHeight: 31, fontWeight: '900', color: C.texto },
  headerSub: { color: C.textoSuave, fontSize: 12.5, marginTop: 3 },

  menuFondo: { flex: 1, backgroundColor: C.overlay, alignItems: 'flex-start' },
  menuPanel: { width: 292, height: '100%', backgroundColor: C.blanco, padding: 22, paddingTop: 52 },
  menuMarca: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  menuLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.cafe, alignItems: 'center', justifyContent: 'center' },
  menuTitulo: { fontSize: 18, fontWeight: '900', color: C.texto },
  menuUsuario: { color: C.textoSuave, fontSize: 12 },
  menuItem: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.linea },
  menuItemTexto: { fontSize: 14.5, color: C.texto, fontWeight: '700' },
  temaFila: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, padding: 12, borderRadius: 15, backgroundColor: C.crema2 },
  temaTitulo: { color: C.texto, fontWeight: '800', fontSize: 13 },
  temaSub: { color: C.textoSuave, fontSize: 10.5, marginTop: 2 },
  menuSep: { height: 12 },
  menuCerrar: { marginTop: 18 },

  tabs: {
    flexDirection: 'row', backgroundColor: C.superficie, borderRadius: 18, padding: 5, marginBottom: 16,
    shadowColor: C.sombra, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 14 },
  tabActiva: { backgroundColor: C.cafe },
  tabTexto: { color: C.textoSuave, fontWeight: '700', fontSize: 12 },
  tabTextoActivo: { color: '#fff' },

  banner: {
    backgroundColor: C.cafe, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    shadowColor: C.sombra, shadowOpacity: 0.16, shadowRadius: 9, shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  bannerEtiqueta: { color: '#f3d7c1', fontSize: 12.5 },
  bannerValor: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 3 },
  bannerNota: { color: '#ebcdb7', fontSize: 11, marginTop: 4 },
  bannerIcono: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },

  kpiFila: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  kpi: {
    flex: 1, minHeight: 88, backgroundColor: C.superficie, borderRadius: 18, padding: 12, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.sombra, shadowOpacity: 0.09, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  kpiIcono: { fontSize: 14 },
  kpiValor: { fontSize: 18, fontWeight: '900', color: C.texto, marginTop: 3 },
  kpiEtiqueta: { fontSize: 10.5, color: C.textoSuave, marginTop: 2, textAlign: 'center' },

  tarjeta: {
    backgroundColor: C.superficie, borderRadius: 18, padding: 14, marginBottom: 12,
    shadowColor: C.sombra, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  tituloContenedor: { marginTop: 18, marginBottom: 10 },
  tituloSec: { fontSize: 18, fontWeight: '900', color: C.texto },
  notaSec: { fontSize: 11.5, color: C.textoSuave, marginTop: 3 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  chipTexto: { fontSize: 10.5, fontWeight: '800' },
  boton: { borderRadius: 12, paddingVertical: 11, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  botonTexto: { fontWeight: '800', fontSize: 13 },
  campoEtiqueta: { fontSize: 12.5, fontWeight: '800', color: C.texto, marginBottom: 6 },
  input: {
    backgroundColor: C.superficie, borderWidth: 1, borderColor: C.linea, borderRadius: 12,
    paddingHorizontal: 13, paddingVertical: 11, color: C.texto, fontSize: 14,
  },
  opcion: { borderWidth: 1, borderColor: C.linea, backgroundColor: C.superficie, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  opcionActiva: { backgroundColor: C.cafe, borderColor: C.cafe },
  opcionBloqueada: { backgroundColor: C.rojoFondo, borderColor: C.rojoFondo },
  opcionTexto: { fontSize: 12.5, color: C.texto, fontWeight: '700' },
  grafica: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, minHeight: 120 },
  barraCol: { alignItems: 'center', flex: 1 },
  barra: { width: 18, borderRadius: 6 },
  barraValor: { fontSize: 9, color: C.textoSuave, marginBottom: 3 },
  barraEtiqueta: { fontSize: 10, color: C.textoSuave, marginTop: 4 },
  modalFondo: { flex: 1, backgroundColor: C.overlay, justifyContent: 'center', padding: 18 },
  modalCard: { backgroundColor: C.blanco, borderRadius: 24, padding: 18 },
  modalCabecera: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  modalTitulo: { fontSize: 18, fontWeight: '900', color: C.texto },
  modalCerrar: { color: C.textoSuave, fontSize: 17 },

  barraInf: {
    position: 'absolute', bottom: 12, left: 20, right: 20, flexDirection: 'row', backgroundColor: C.barra,
    borderRadius: 24, paddingVertical: 9, paddingBottom: 11,
    shadowColor: C.sombra, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 8,
  },
  barraItem: { flex: 1, alignItems: 'center', gap: 2 },
  barraIcono: { fontSize: 16 },
  barraTexto: { fontSize: 10, color: C.textoSuave, fontWeight: '600' },
  barraTextoActiva: { color: C.cafe, fontWeight: '900' },
});
