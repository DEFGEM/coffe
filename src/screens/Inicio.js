// Login (RF: inputs, botón, alertas) y Dashboard general
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useColors } from '../theme';
import { useStore, USUARIOS } from '../store';
import { Header, Banner, KpiFila, Tarjeta, TituloSec, Boton, Campo, GraficaBarras, Pantalla, ChipEstado, FondoDegradado } from '../components/UI';

// ── LOGIN ───────────────────────────────────────────────────
export function LoginScreen() {
  const C = useColors();
  const ls = crearLs(C);
  const { setUsuario, irInicio } = useStore();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const ingresar = () => {
    // RF-03: Alertas — campos vacíos
    if (!correo.trim() || !password.trim()) {
      Alert.alert('Campos vacíos', 'Ingresa tu usuario y contraseña para continuar.');
      return;
    }
    const u = USUARIOS.find(
      (x) => x.email.toLowerCase() === correo.trim().toLowerCase()
          || x.nombre.toLowerCase() === correo.trim().toLowerCase()
    );
    // RF-03: usuario no registrado
    if (!u) { Alert.alert('Usuario no registrado', 'El usuario no existe en el sistema.'); return; }
    // RF-03: contraseña incorrecta
    if (u.password !== password) { Alert.alert('Error de acceso', 'Usuario o contraseña incorrecta.'); return; }

    setUsuario(u);
    // Identificar rol y redirigir al módulo correspondiente (Caso de uso 1)
    const destino = { Mesero: 'meseroDash', Cajero: 'cajaDash', Cocinero: 'cocinaDash' }[u.rol] || 'dashboard';
    irInicio(destino);
  };

  return (
    <View style={{ flex: 1 }}>
      <FondoDegradado />
      <ScrollView contentContainerStyle={ls.fondo} keyboardShouldPersistTaps="handled">
        <View style={ls.card}>
        <View style={ls.logo}><Text style={{ fontSize: 26 }}>☕</Text></View>
        <Text style={ls.titulo}>CoffeeAdmin</Text>
        <Text style={ls.sub}>Controla pedidos, caja e inventario</Text>

        {/* RF-01: Inputs */}
        <Campo placeholder="✉️  Correo o usuario" value={correo} onChangeText={setCorreo}
               autoCapitalize="none" keyboardType="email-address" />
        <Campo placeholder="🔒  Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

        {/* RF-02: Botón de inicio de sesión */}
        <Boton texto="Iniciar sesión  →" onPress={ingresar} />

        <Text style={ls.pie}>Acceso según rol: Mesero, Caja, Cocina o Admin</Text>
        <View style={ls.pieCard}>
          <Text style={ls.pieCardTitulo}>Tu cafetería de confianza</Text>
          <Text style={ls.pieCardSub}>Cálido y sencillo para pasar un buen rato</Text>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── DASHBOARD GENERAL ───────────────────────────────────────
export function DashboardScreen() {
  const C = useColors();
  const ls = crearLs(C);
  const { usuario, pedidos, ventas, gastos, inventario, irInicio } = useStore();
  const activos = pedidos.filter((p) => !['entregado', 'cancelado'].includes(p.estado));
  const ventasDia = ventas.reduce((s, v) => s + v.monto, 0);
  const stockBajo = inventario.filter((i) => i.stock <= i.minimo).length;

  const modulos = [
    { id: 'meseroDash', icono: '🛎️', titulo: 'Cliente / Mesero', sub: 'Levantar pedidos y revisar estado' },
    { id: 'cajaDash',   icono: '💵', titulo: 'Caja',             sub: 'Pagos, tickets, ventas y gastos' },
    { id: 'cocinaDash', icono: '👨‍🍳', titulo: 'Cocina',           sub: 'Pedidos, inventario y menú' },
    { id: 'cocinaInventario', icono: '📦', titulo: 'Inventario', sub: 'Existencias, insumos y stock bajo' },
  ];

  return (
    <Pantalla activa="dashboard">
      <Header titulo={`Bienvenido, ${usuario?.nombre ?? ''}`} subtitulo="Sistema de cafetería" />

      {/* RF-03: Paneles resumen */}
      <Banner etiqueta="Resumen del día" valor={`$${ventasDia.toLocaleString()}.00`}
              nota="Ventas registradas hoy" icono="🧾" />
      <KpiFila datos={[
        { icono: '📋', valor: pedidos.length, etiqueta: 'Pedidos' },
        { icono: '🔥', valor: activos.length, etiqueta: 'Activos' },
        { icono: '⚠️', valor: stockBajo, etiqueta: 'Stock bajo' },
      ]} />

      {/* RF-02: Botones a los módulos */}
      <TituloSec nota="Selecciona el área que deseas usar">Módulos principales</TituloSec>
      <View style={ls.modGrid}>
        {modulos.map((m) => (
          <Tarjeta key={m.id} style={ls.modCard}>
            <View style={ls.modIcono}><Text style={{ fontSize: 18 }}>{m.icono}</Text></View>
            <View style={{ flex: 1, marginTop: 8 }}>
              <Text style={{ fontWeight: '800', color: C.texto }}>{m.titulo}</Text>
              <Text style={{ fontSize: 11.5, lineHeight: 16, color: C.textoSuave, marginTop: 3 }}>{m.sub}</Text>
            </View>
            <Boton texto="Entrar" onPress={() => irInicio(m.id)} style={{ paddingVertical: 9, marginTop: 10 }} />
          </Tarjeta>
        ))}
      </View>

      <TituloSec>Actividad reciente</TituloSec>
      <Tarjeta>
        {activos.slice(0, 3).map((p) => (
          <View key={p.id} style={ls.actFila}>
            <Text style={{ flex: 1, color: C.texto, fontSize: 13 }}>
              Pedido #{p.id} · Mesa {p.mesa} · ${p.total}
            </Text>
            <ChipEstado estado={p.estado} />
          </View>
        ))}
        {gastos.slice(0, 1).map((g) => (
          <View key={g.id} style={ls.actFila}>
            <Text style={{ flex: 1, color: C.texto, fontSize: 13 }}>{g.descripcion}</Text>
            <Text style={{ color: C.rojo, fontWeight: '700', fontSize: 13 }}>-${g.monto}</Text>
          </View>
        ))}
      </Tarjeta>

      <GraficaBarras titulo="Ventas de la semana"
        datos={[
          { etiqueta: 'Lun', valor: 420 }, { etiqueta: 'Mar', valor: 510 },
          { etiqueta: 'Mié', valor: 360 }, { etiqueta: 'Jue', valor: 580 },
          { etiqueta: 'Vie', valor: 690 }, { etiqueta: 'Sáb', valor: 820 },
          { etiqueta: 'Dom', valor: 740 },
        ]} />
    </Pantalla>
  );
}

const crearLs = (C) => StyleSheet.create({
  fondo: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { paddingVertical: 24, alignItems: 'stretch', width: '100%', maxWidth: 440, alignSelf: 'center' },
  logo: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: C.cafe, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    shadowColor: C.sombra, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 7,
  },
  titulo: { fontSize: 24, fontWeight: '900', color: C.texto, textAlign: 'center' },
  sub: { fontSize: 12, color: C.textoSuave, textAlign: 'center', marginTop: 4, marginBottom: 26 },
  pie: { fontSize: 11, color: C.textoSuave, textAlign: 'center', marginTop: 14 },
  pieCard: { backgroundColor: C.crema2, borderRadius: 16, padding: 13, marginTop: 18, alignItems: 'center' },
  pieCardTitulo: { fontWeight: '800', color: C.texto, fontSize: 12.5 },
  pieCardSub: { color: C.textoSuave, fontSize: 11, marginTop: 2 },
  modGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  modCard: { width: '48%', minHeight: 182 },
  modIcono: { width: 42, height: 42, borderRadius: 13, backgroundColor: C.crema2, alignItems: 'center', justifyContent: 'center' },
  actFila: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.linea, gap: 8 },
});
