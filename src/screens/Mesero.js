// Módulo Cliente / Mesero — Dashboard, Realizar pedido y Mis pedidos
import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { useStore } from '../store';
import {
  Header, Banner, KpiFila, Tarjeta, TituloSec, Boton, Campo,
  Selector, ChipEstado, Pantalla, TabsModulo,
} from '../components/UI';

// ── Dashboard por módulo: Cliente/Mesero ────────────────────
export function MeseroDashboard() {
  const C = useColors();
  const ms = crearMs(C);
  const { pedidos, navegar, usuario } = useStore();
  const hoy = pedidos.length;
  const enCurso = pedidos.filter((p) => ['pendiente', 'pagado', 'en_preparacion'].includes(p.estado)).length;
  const listos = pedidos.filter((p) => p.estado === 'listo').length;
  const entregados = pedidos.filter((p) => p.estado === 'entregado').length;

  return (
    <Pantalla activa="meseroDash">
      <Header modulo="Módulo" titulo="Cliente / Mesero" subtitulo="Pedidos, mesas y atención al cliente" icono="🛎️" />
      <TabsModulo modulo="mesero" />
      <Banner etiqueta="Pedidos levantados" valor={`${hoy} pedidos`} nota="Pedidos registrados durante el día" icono="📋" />
      {/* RF: Cards de pedidos */}
      <KpiFila datos={[
        { icono: '⏳', valor: enCurso, etiqueta: 'En curso' },
        { icono: '🔔', valor: listos, etiqueta: 'Listos' },
        { icono: '✅', valor: entregados, etiqueta: 'Entregados' },
      ]} />

      <TituloSec nota="Gestiona pedidos y atención al cliente">Accesos rápidos</TituloSec>
      <View style={ms.grid}>
        <Tarjeta style={ms.gridCard}>
          <View style={ms.iconoCard}><Text>📝</Text></View>
          <Text style={ms.accTitulo}>Realizar pedido</Text>
          <Text style={ms.accSub}>Selecciona mesa, productos y cantidades</Text>
          <Boton texto="Entrar" onPress={() => navegar('meseroRealizar')} style={{ marginTop: 10 }} />
        </Tarjeta>
        <Tarjeta style={ms.gridCard}>
          <View style={ms.iconoCard}><Text>📦</Text></View>
          <Text style={ms.accTitulo}>Mis pedidos</Text>
          <Text style={ms.accSub}>Revisa avance y entrega al cliente</Text>
          <Boton texto="Ver" onPress={() => navegar('meseroPedidos')} style={{ marginTop: 10 }} />
        </Tarjeta>
        <Tarjeta style={ms.gridCard}>
          <View style={ms.iconoCard}><Text>📣</Text></View>
          <Text style={ms.accTitulo}>Marketing</Text>
          <Text style={ms.accSub}>Consulta promociones para sugerir</Text>
          <Boton texto="Sugerir" onPress={() => navegar('meseroMarketing')} style={{ marginTop: 10 }} />
        </Tarjeta>
      </View>
      {usuario?.rol === 'Mesero' || usuario?.rol === 'Admin' ? null : (
        <Text style={ms.nota}>Sesión actual: {usuario?.rol}</Text>
      )}
    </Pantalla>
  );
}

// ── Interfaz: Cliente/Mesero (Realizar pedido) ──────────────
export function MeseroRealizar() {
  const C = useColors();
  const ms = crearMs(C);
  const { menu, mesas, mesasOcupadas, crearPedido, usuario, regresar, navegar } = useStore();
  const [mesa, setMesa] = useState(null);
  const [cantidades, setCantidades] = useState({});      // RF-02: Input cantidad
  const [observaciones, setObservaciones] = useState(''); // RF-03: Textarea

  const cambiar = (id, delta) =>
    setCantidades((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + delta) }));

  const items = menu
    .filter((m) => m.disponible && (cantidades[m.id] || 0) > 0)
    .map((m) => ({ producto: m.nombre, cantidad: cantidades[m.id], precio: m.precio }));
  const total = items.reduce((s, i) => s + i.cantidad * i.precio, 0);

  const seleccionarMesa = (m) => {
    // RF-05: Alerta mesa ocupada
    if (mesasOcupadas.includes(m)) {
      Alert.alert('Mesa ocupada', `La Mesa ${m} ya tiene un pedido activo. Elige otra mesa.`);
      return;
    }
    setMesa(m);
  };

  const enviar = () => {
    if (!mesa) { Alert.alert('Falta la mesa', 'Selecciona una mesa para el pedido.'); return; }
    if (items.length === 0) { Alert.alert('Pedido vacío', 'Agrega al menos un producto del menú.'); return; }
    const id = crearPedido(mesa, items, observaciones, usuario?.nombre ?? 'Mesero');
    // RF-05: Alerta pedido enviado correctamente (el pedido pasa a Caja)
    Alert.alert('✅ Pedido enviado', `Pedido #${id} guardado y enviado a Caja.`, [
      { text: 'Ver mis pedidos', onPress: () => navegar('meseroPedidos') },
      { text: 'OK' },
    ]);
    setMesa(null); setCantidades({}); setObservaciones('');
  };

  return (
    <Pantalla activa="meseroDash">
      <Header modulo="Cliente / Mesero" titulo="Realizar pedido" subtitulo="Selecciona mesa, productos y confirma" icono="📝" />
      <TabsModulo modulo="mesero" activa="realizar" />
      {mesa ? <Banner etiqueta="Nuevo pedido" valor={`Mesa ${mesa}`} nota="Pedido listo para confirmar" icono="🪑" /> : null}

      {/* RF-01: Select de mesas disponibles */}
      <Tarjeta>
        <Selector etiqueta="Selecciona una mesa (elige dónde se levantará el pedido)"
          opciones={mesas.map((m) => `Mesa ${m}`)}
          valor={mesa ? `Mesa ${mesa}` : null}
          deshabilitadas={mesasOcupadas.map((m) => `Mesa ${m}`)}
          onChange={(v) => seleccionarMesa(parseInt(v.replace('Mesa ', ''), 10))} />
      </Tarjeta>

      {/* RF-01: Lista del menú + RF-02: cantidades */}
      <TituloSec nota="Selecciona productos del menú">Agregar productos</TituloSec>
      {menu.filter((m) => m.disponible).map((m) => (
        <Tarjeta key={m.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 18 }}>{m.icono}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: C.texto }}>{m.nombre}</Text>
              <Text style={{ fontSize: 11.5, color: C.textoSuave }}>${m.precio.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={ms.btnCant} onPress={() => cambiar(m.id, -1)}><Text style={ms.btnCantTxt}>−</Text></TouchableOpacity>
            <Text style={ms.cantidad}>{cantidades[m.id] || 0}</Text>
            <TouchableOpacity style={[ms.btnCant, { backgroundColor: C.cafe }]} onPress={() => cambiar(m.id, 1)}>
              <Text style={[ms.btnCantTxt, { color: '#fff' }]}>＋</Text>
            </TouchableOpacity>
          </View>
        </Tarjeta>
      ))}

      {/* RF-03: Observaciones del pedido */}
      <Tarjeta>
        <Campo etiqueta="Observaciones" placeholder="Ej. Sin azúcar en un café. Pan dulce para llevar."
          value={observaciones} onChangeText={setObservaciones} multiline numberOfLines={3}
          style={{ backgroundColor: C.superficie, borderWidth: 1, borderColor: C.linea, borderRadius: 10, padding: 12, minHeight: 70, textAlignVertical: 'top', color: C.texto }} />
        <Text style={{ fontWeight: '800', color: C.texto, marginBottom: 10 }}>Total: ${total.toFixed(2)}</Text>
        {/* RF-04: Botones enviar / cancelar */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Boton texto="Cancelar" tipo="claro" style={{ flex: 1 }} onPress={regresar} />
          <Boton texto="Enviar pedido" tipo="verde" style={{ flex: 1 }} onPress={enviar} />
        </View>
      </Tarjeta>
    </Pantalla>
  );
}

// ── Interfaz: Cliente/Mesero (Mis pedidos) ──────────────────
export function MeseroPedidos() {
  const C = useColors();
  const ms = crearMs(C);
  const { pedidos, cambiarEstado } = useStore();

  const entregar = (p) => {
    // RF-04: Alertas — pedido listo para entregar / entregado
    if (p.estado !== 'listo') {
      Alert.alert('Aún no está listo', `El pedido #${p.id} sigue ${p.estado === 'en_preparacion' ? 'en preparación' : 'en proceso'}.`);
      return;
    }
    cambiarEstado(p.id, 'entregado');
    Alert.alert('✅ Pedido entregado', `El pedido #${p.id} fue servido al cliente y marcado como entregado.`);
  };

  const activos = pedidos.filter((p) => p.estado !== 'cancelado');

  return (
    <Pantalla activa="meseroDash">
      <Header modulo="Cliente / Mesero" titulo="Mis pedidos" subtitulo="Pedidos asignados al mesero" icono="📦" />
      <TabsModulo modulo="mesero" activa="pedidos" />
      <Banner etiqueta="Estatus del pedido"
        valor={`${activos.filter((p) => p.estado !== 'entregado').length} activos`}
        nota="Pedidos asignados durante el día" icono="🛎️" />

      {/* RF-01: Tabla de pedidos con estatus / RF-03: Etiqueta de estatus */}
      {activos.map((p) => (
        <Tarjeta key={p.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: '800', color: C.texto }}>Pedido #{p.id}</Text>
            <ChipEstado estado={p.estado} />
          </View>
          <Text style={{ fontSize: 12, color: C.textoSuave, marginTop: 3 }}>
            Mesa {p.mesa} · {p.items.map((i) => `${i.cantidad}x ${i.producto}`).join(', ')}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontWeight: '800', color: C.texto }}>${p.total.toFixed(2)}</Text>
            {/* RF-02: Botón cambiar estatus (entregar) */}
            {p.estado === 'listo'
              ? <Boton texto="Entregar" tipo="verde" style={{ paddingVertical: 8 }} onPress={() => entregar(p)} />
              : p.estado === 'entregado'
                ? <Text style={{ fontSize: 12, color: C.textoSuave }}>Servido al cliente ✓</Text>
                : <Boton texto="Ver avance" tipo="claro" style={{ paddingVertical: 8 }} onPress={() => entregar(p)} />}
          </View>
        </Tarjeta>
      ))}
    </Pantalla>
  );
}

// ── Interfaz: Cliente/Mesero (Marketing) ───────────────────
export function MeseroMarketing() {
  const C = useColors();
  const ms = crearMs(C);
  const promociones = [
    { id: 1, nombre: 'Combo desayuno', detalle: 'Café americano + pan dulce', precio: 55, etiqueta: 'Activa', ahorro: 15 },
    { id: 2, nombre: '2×1 Frappé', detalle: 'Disponible de 3:00 PM a 5:00 PM', precio: 45, etiqueta: 'Horario', ahorro: 45 },
    { id: 3, nombre: 'Café + croissant', detalle: 'Promoción especial del día', precio: 62, etiqueta: 'Activa', ahorro: 13 },
  ];

  const sugerir = (promo) => Alert.alert('📣 Promoción sugerida', `Se sugirió “${promo.nombre}” al cliente.`);

  return (
    <Pantalla activa="meseroDash">
      <Header modulo="Cliente / Mesero" titulo="Marketing" subtitulo="Promociones y sugerencias al cliente" icono="📣" />
      <TabsModulo modulo="mesero" activa="marketing" />
      <Banner etiqueta="Promoción activa" valor="Combo desayuno" nota="Café + pan dulce por $55.00" icono="⭐" />
      <KpiFila datos={[
        { icono: '📣', valor: 4, etiqueta: 'Promos' },
        { icono: '☕', valor: 18, etiqueta: 'Vendidas' },
        { icono: '⭐', valor: '92%', etiqueta: 'Aceptación' },
      ]} />

      <TituloSec nota="Ofrece promociones al levantar pedidos">Promociones para sugerir</TituloSec>
      {promociones.map((promo) => (
        <Tarjeta key={promo.id} style={promo.id === 1 ? { backgroundColor: C.ambarFondo } : null}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={ms.accTitulo}>{promo.nombre}</Text>
              <Text style={ms.accSub}>{promo.detalle}</Text>
            </View>
            <View style={[ms.promoChip, { backgroundColor: promo.etiqueta === 'Activa' ? C.verdeFondo : C.ambarFondo }]}>
              <Text style={{ color: promo.etiqueta === 'Activa' ? C.verde : C.ambar, fontSize: 10, fontWeight: '800' }}>{promo.etiqueta}</Text>
            </View>
          </View>
          <View style={ms.promoPrecio}>
            <Text style={{ color: C.textoSuave, fontSize: 11 }}>Precio promoción</Text>
            <Text style={{ color: C.texto, fontWeight: '900' }}>${promo.precio.toFixed(2)}</Text>
          </View>
          <Text style={{ color: C.verde, fontSize: 11, fontWeight: '700', marginBottom: 9 }}>Ahorro estimado: ${promo.ahorro}.00</Text>
          <Boton texto="Sugerir al cliente" onPress={() => sugerir(promo)} />
        </Tarjeta>
      ))}
    </Pantalla>
  );
}

const crearMs = (C) => StyleSheet.create({
  accTitulo: { fontWeight: '800', color: C.texto, fontSize: 14.5 },
  accSub: { fontSize: 12, color: C.textoSuave, marginTop: 2 },
  nota: { fontSize: 11, color: C.textoSuave, textAlign: 'center', marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: '48%', minHeight: 178 },
  iconoCard: { width: 40, height: 40, borderRadius: 13, backgroundColor: C.crema2, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  btnCant: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.crema2, alignItems: 'center', justifyContent: 'center' },
  btnCantTxt: { fontSize: 16, fontWeight: '800', color: C.texto },
  cantidad: { width: 26, textAlign: 'center', fontWeight: '800', color: C.texto },
  promoChip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  promoPrecio: { backgroundColor: C.crema2, borderRadius: 10, padding: 10, marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' },
});
