// Módulo Caja — Dashboard, Pedidos, Proceso de pago, Ticket, Cuentas y Compras
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { esDeHoy, fechaActual, useStore } from '../store';
import {
  Header, Banner, KpiFila, Tarjeta, TituloSec, Boton, Campo,
  Selector, ChipEstado, ModalCard, GraficaBarras, Pantalla, TabsModulo,
} from '../components/UI';

// ── Dashboard por módulo: Caja ──────────────────────────────
export function CajaDashboard() {
  const C = useColors();
  const cs = crearCs(C);
  const { ventas, gastos, pedidos, navegar } = useStore();
  const ingresos = ventas.filter(esDeHoy).reduce((s, v) => s + v.monto, 0);
  const egresos = gastos.filter(esDeHoy).reduce((s, g) => s + g.monto, 0);
  const pedidosHoy = pedidos.filter(esDeHoy);

  return (
    <Pantalla activa="cajaDash">
      <Header modulo="Módulo" titulo="Caja" subtitulo="Pagos, cuentas y ganancias" icono="💵" />
      <TabsModulo modulo="caja" />
      <Banner etiqueta="Ventas del día" valor={`$${ingresos.toLocaleString()}.00`} nota="Ingresos registrados en caja" icono="🧾" />
      <KpiFila datos={[
        { icono: '📋', valor: pedidosHoy.filter((p) => p.estado === 'pendiente').length, etiqueta: 'Pedidos' },
        { icono: '📈', valor: `$${(ingresos - egresos).toLocaleString()}`, etiqueta: 'Ganancia' },
        { icono: '📉', valor: `$${egresos.toLocaleString()}`, etiqueta: 'Gastos' },
      ]} />

      <TituloSec nota="Gestiona las funciones principales de caja">Accesos rápidos</TituloSec>
      <View style={cs.grid}>
        {[
          { i: '🧾', t: 'Pedidos', s: 'Recibir pedidos y revisar detalles', p: 'cajaPedidos' },
          { i: '💳', t: 'Cuentas', s: 'Gastos, ganancias y corte de caja', p: 'cajaCuentas' },
          { i: '🛒', t: 'Compras', s: 'Registrar insumos comprados', p: 'cajaCompras' },
          { i: '🖨️', t: 'Tickets', s: 'Historial de ventas y gastos', p: 'cajaTicket' },
        ].map((x) => (
          <Tarjeta key={x.p} style={cs.gridCard}>
            <View style={cs.iconoCard}><Text>{x.i}</Text></View>
            <Text style={cs.accTitulo}>{x.t}</Text>
            <Text style={cs.accSub}>{x.s}</Text>
            <Boton texto="Entrar" onPress={() => navegar(x.p)} style={{ marginTop: 10 }} />
          </Tarjeta>
        ))}
      </View>
    </Pantalla>
  );
}

// ── Interfaz: Caja (Pedidos) ────────────────────────────────
export function CajaPedidos() {
  const C = useColors();
  const cs = crearCs(C);
  const { pedidos, cambiarEstado, navegar } = useStore();
  const [detalle, setDetalle] = useState(null); // RF-03: Modal con información completa

  const pendientes = pedidos.filter((p) => p.estado === 'pendiente');
  const confirmados = pedidos.filter((p) => ['pagado', 'en_preparacion'].includes(p.estado));
  const listos = pedidos.filter((p) => p.estado === 'listo');

  const cancelar = (p) => {
    Alert.alert('Cancelar pedido', `¿Cancelar el pedido #${p.id} de la Mesa ${p.mesa}?`, [
      { text: 'No' },
      { text: 'Sí, cancelar', style: 'destructive',
        onPress: () => { cambiarEstado(p.id, 'cancelado');
          // RF-04: Alerta de cambio de estatus
          Alert.alert('Estatus actualizado', `El pedido #${p.id} fue cancelado correctamente.`); } },
    ]);
  };

  return (
    <Pantalla activa="cajaDash">
      <Header modulo="Caja" titulo="Pedidos" subtitulo="Ver detalles y confirmar pagos" icono="🧾" />
      <TabsModulo modulo="caja" activa="pedidos" />
      <Banner etiqueta="Pedidos recibidos" valor={`${pendientes.length} pendientes`} nota="Listos para confirmar o cancelar" icono="📥" />
      {/* RF-01: Tabla — recibidos, pendientes y listos */}
      <KpiFila datos={[
        { icono: '📥', valor: pendientes.length, etiqueta: 'Recibidos' },
        { icono: '✅', valor: confirmados.length, etiqueta: 'Confirmados' },
        { icono: '🔔', valor: listos.length, etiqueta: 'Listos' },
      ]} />

      <TituloSec nota="Confirma, revisa detalles o cancela el pedido">Pedidos recibidos</TituloSec>
      {pendientes.length === 0 && (
        <Tarjeta><Text style={{ color: C.textoSuave, fontSize: 13 }}>No hay pedidos pendientes por cobrar.</Text></Tarjeta>
      )}
      {pendientes.map((p) => (
        <Tarjeta key={p.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '800', color: C.texto }}>Pedido #{p.id}</Text>
            <ChipEstado estado={p.estado} />
          </View>
          <Text style={{ fontSize: 12, color: C.textoSuave, marginTop: 2 }}>Mesa {p.mesa} · {p.mesero}</Text>
          <Text style={{ fontWeight: '800', color: C.texto, marginVertical: 8 }}>Total: ${p.total.toFixed(2)}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Confirmar → proceso de pago */}
            <Boton texto="Confirmar" tipo="verde" style={{ flex: 1, paddingVertical: 9 }}
                   onPress={() => navegar('cajaPago', { pedidoId: p.id })} />
            <Boton texto="Ver detalles" tipo="claro" style={{ flex: 1, paddingVertical: 9 }} onPress={() => setDetalle(p)} />
            <Boton texto="Cancelar" tipo="rojo" style={{ flex: 1, paddingVertical: 9 }} onPress={() => cancelar(p)} />
          </View>
        </Tarjeta>
      ))}

      <TituloSec>En cocina y listos</TituloSec>
      {[...confirmados, ...listos].map((p) => (
        <Tarjeta key={p.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: '700', color: C.texto }}>Pedido #{p.id} · Mesa {p.mesa}</Text>
              <Text style={{ fontSize: 11.5, color: C.textoSuave }}>${p.total.toFixed(2)}</Text>
            </View>
            <ChipEstado estado={p.estado} />
          </View>
        </Tarjeta>
      ))}

      {/* RF-03: Modal con información completa del pedido */}
      <ModalCard visible={!!detalle} onCerrar={() => setDetalle(null)} titulo={`Detalle pedido #${detalle?.id ?? ''}`}>
        {detalle && (
          <View>
            <Text style={cs.modalLinea}>Mesa {detalle.mesa} · Atiende: {detalle.mesero} · {detalle.hora}</Text>
            <TituloSec>Productos</TituloSec>
            {detalle.items.map((i, idx) => (
              <View key={idx} style={cs.itemFila}>
                <Text style={{ color: C.texto, fontSize: 13 }}>{i.cantidad}x {i.producto}</Text>
                <Text style={{ color: C.texto, fontWeight: '700', fontSize: 13 }}>${(i.cantidad * i.precio).toFixed(2)}</Text>
              </View>
            ))}
            {detalle.observaciones ? (
              <Tarjeta style={{ backgroundColor: C.crema2, marginTop: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.texto }}>Observaciones</Text>
                <Text style={{ fontSize: 12.5, color: C.texto }}>{detalle.observaciones}</Text>
              </Tarjeta>
            ) : null}
            <Text style={{ fontWeight: '800', color: C.texto, marginTop: 10 }}>Subtotal: ${detalle.total.toFixed(2)}</Text>
          </View>
        )}
      </ModalCard>
    </Pantalla>
  );
}

// ── Interfaz: Caja (Proceso de pago) ────────────────────────
export function CajaPago({ params }) {
  const C = useColors();
  const cs = crearCs(C);
  const { pedidos, registrarPago, regresar, navegar } = useStore();
  const pedido = pedidos.find((p) => p.id === params.pedidoId);
  const [metodo, setMetodo] = useState(null);        // RF-04: Select método de pago
  const [recibido, setRecibido] = useState('');       // RF-01: cantidad recibida
  const [referencia, setReferencia] = useState('');   // RF-01: referencia de transferencia

  if (!pedido) return (
    <Pantalla activa="cajaDash"><Header modulo="Caja" titulo="Proceso de pago" /><TabsModulo modulo="caja" activa="pedidos" /><Tarjeta><Text style={{ color: C.texto }}>Pedido no encontrado.</Text></Tarjeta></Pantalla>
  );

  const confirmar = () => {
    if (!metodo) { Alert.alert('Pago rechazado', 'Selecciona el método de pago.'); return; }
    if (metodo === 'Efectivo') {
      const monto = parseFloat(recibido);
      // RF-03: Alerta de pago rechazado
      if (isNaN(monto) || monto < pedido.total) {
        Alert.alert('Pago rechazado', `La cantidad recibida es insuficiente. Total: $${pedido.total.toFixed(2)}.`);
        return;
      }
    }
    if (metodo === 'Transferencia' && !referencia.trim()) {
      Alert.alert('Pago rechazado', 'Ingresa la referencia de la transferencia.');
      return;
    }
    registrarPago(pedido.id, metodo.toLowerCase(), pedido.total);
    const cambio = metodo === 'Efectivo' ? (parseFloat(recibido) - pedido.total) : 0;
    // RF-03: Alerta de pago exitoso → genera ticket y envía a cocina
    Alert.alert('✅ Pago exitoso',
      `Pago de $${pedido.total.toFixed(2)} registrado.${cambio > 0 ? ` Cambio: $${cambio.toFixed(2)}.` : ''}\nEl pedido fue enviado a Cocina.`,
      [{ text: 'Generar ticket', onPress: () => navegar('cajaTicket', { ventaPedido: pedido.id }) }, { text: 'OK', onPress: regresar }]);
  };

  return (
    <Pantalla activa="cajaDash">
      <Header modulo="Caja" titulo="Detalle pedido" subtitulo="Ticket, pago y envío a cocina" icono="💳" />
      <TabsModulo modulo="caja" activa="pedidos" />
      <Banner etiqueta="Proceso de pedido" valor={`Pedido #${pedido.id}`} nota={`Mesa ${pedido.mesa} · Cliente en caja`} icono="🧾" />

      <Tarjeta>
        <Text style={cs.accTitulo}>Información del pedido</Text>
        {pedido.items.map((i, idx) => (
          <View key={idx} style={cs.itemFila}>
            <Text style={{ color: C.texto, fontSize: 13 }}>{i.cantidad}x {i.producto} <Text style={{ color: C.textoSuave, fontSize: 11 }}>(${i.precio.toFixed(2)} c/u)</Text></Text>
            <Text style={{ fontWeight: '700', color: C.texto, fontSize: 13 }}>${(i.cantidad * i.precio).toFixed(2)}</Text>
          </View>
        ))}
        {pedido.observaciones ? (
          <View style={{ backgroundColor: C.crema2, borderRadius: 10, padding: 10, marginTop: 8 }}>
            <Text style={{ fontSize: 11.5, fontWeight: '700', color: C.texto }}>Observaciones</Text>
            <Text style={{ fontSize: 12.5, color: C.texto }}>{pedido.observaciones}</Text>
          </View>
        ) : null}
        <Text style={{ fontWeight: '800', color: C.texto, marginTop: 10 }}>Total: ${pedido.total.toFixed(2)}</Text>
      </Tarjeta>

      <Tarjeta>
        {/* RF-04: Método de pago */}
        <Selector etiqueta="Método de pago" opciones={['Efectivo', 'Tarjeta', 'Transferencia']}
                  valor={metodo} onChange={setMetodo} />
        {/* RF-01: Inputs según método */}
        {metodo === 'Efectivo' && (
          <Campo etiqueta="Cantidad recibida" placeholder="$0.00" keyboardType="numeric"
                 value={recibido} onChangeText={setRecibido} />
        )}
        {metodo === 'Transferencia' && (
          <Campo etiqueta="Referencia de la transferencia" placeholder="Ej. 938201"
                 value={referencia} onChangeText={setReferencia} />
        )}
        {/* RF-02: Confirmar / cancelar pago */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Boton texto="Cancelar pago" tipo="claro" style={{ flex: 1 }} onPress={regresar} />
          <Boton texto="Confirmar pago" tipo="verde" style={{ flex: 1 }} onPress={confirmar} />
        </View>
      </Tarjeta>
    </Pantalla>
  );
}

// ── Interfaz: Caja (Ticket de compra) ───────────────────────
export function CajaTicket() {
  const C = useColors();
  const cs = crearCs(C);
  const { ventas, gastos } = useStore();
  const [correo, setCorreo] = useState(''); // RF-02: Input correo del cliente

  const imprimir = () => Alert.alert('🖨️ Imprimiendo', 'El ticket se envió a la impresora de caja.');
  const enviarCorreo = () => {
    if (!correo.includes('@')) { Alert.alert('Correo inválido', 'Ingresa un correo electrónico válido.'); return; }
    Alert.alert('✉️ Ticket enviado', `El ticket fue enviado a ${correo}.`);
    setCorreo('');
  };

  return (
    <Pantalla activa="cajaDash">
      <Header modulo="Caja" titulo="Ticket de compra" subtitulo="Impresión, envío e historial" icono="🖨️" />
      <TabsModulo modulo="caja" activa="pedidos" />
      <Tarjeta>
        <Text style={cs.accTitulo}>Última venta</Text>
        {ventas[0] ? (
          <Text style={{ fontSize: 13, color: C.texto, marginTop: 4 }}>
            Venta #{ventas[0].id} · Pedido #{ventas[0].pedido} · ${ventas[0].monto.toFixed(2)} · {ventas[0].metodo}
          </Text>
        ) : <Text style={{ color: C.textoSuave }}>Sin ventas registradas.</Text>}
        {/* RF-01: Botones imprimir / enviar por correo */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Boton texto="🖨️ Imprimir ticket" style={{ flex: 1 }} onPress={imprimir} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Campo etiqueta="Enviar por correo electrónico" placeholder="cliente@correo.com"
                 keyboardType="email-address" autoCapitalize="none" value={correo} onChangeText={setCorreo} />
          <Boton texto="✉️ Enviar ticket" tipo="claro" onPress={enviarCorreo} />
        </View>
      </Tarjeta>

      {/* RF-03: Tabla historial de ventas y gastos */}
      <TituloSec>Historial de ventas</TituloSec>
      <Tarjeta>
        {ventas.map((v) => (
          <View key={v.id} style={cs.itemFila}>
            <Text style={{ fontSize: 13, color: C.texto }}>#{v.id} · Pedido {v.pedido} · {v.metodo} · {v.hora}</Text>
            <Text style={{ fontWeight: '700', color: C.verde, fontSize: 13 }}>+${v.monto.toFixed(2)}</Text>
          </View>
        ))}
      </Tarjeta>
      <TituloSec>Historial de gastos</TituloSec>
      <Tarjeta>
        {gastos.map((g) => (
          <View key={g.id} style={cs.itemFila}>
            <Text style={{ fontSize: 13, color: C.texto }}>{g.descripcion} · {g.hora}</Text>
            <Text style={{ fontWeight: '700', color: C.rojo, fontSize: 13 }}>-${g.monto.toFixed(2)}</Text>
          </View>
        ))}
      </Tarjeta>
    </Pantalla>
  );
}

// ── Interfaz: Caja (Cuentas, gastos y ganancias) ────────────
export function CajaCuentas() {
  const C = useColors();
  const cs = crearCs(C);
  const { ventas, gastos, compras } = useStore();
  const ingresos = ventas.filter(esDeHoy).reduce((s, v) => s + v.monto, 0);
  const egresos = gastos.filter(esDeHoy).reduce((s, g) => s + g.monto, 0);
  const comprasTotal = compras.filter(esDeHoy).reduce((s, c) => s + c.costo, 0);
  const ganancia = ingresos - egresos;

  return (
    <Pantalla activa="cajaDash">
      <Header modulo="Caja" titulo="Cuentas" subtitulo="Gastos, ganancias y corte" icono="💳" />
      <TabsModulo modulo="caja" activa="cuentas" />
      {/* RF-04: Dashboard total financiero */}
      <Banner etiqueta="Ganancia estimada" valor={`$${ganancia.toLocaleString()}.00`} nota="Después de restar gastos del día" icono="📈" />
      <KpiFila datos={[
        { icono: '💵', valor: `$${ingresos.toLocaleString()}`, etiqueta: 'Ventas' },
        { icono: '📉', valor: `$${egresos.toLocaleString()}`, etiqueta: 'Gastos' },
        { icono: '✅', valor: `$${ganancia.toLocaleString()}`, etiqueta: 'Ganancia' },
      ]} />

      {/* RF-01: Gráficas de ingresos, gastos y ganancias */}
      <GraficaBarras titulo="Ingresos vs gastos vs ganancias" datos={[
        { etiqueta: 'Ingresos', valor: ingresos, color: C.verde, mostrar: `$${ingresos}` },
        { etiqueta: 'Gastos', valor: egresos, color: C.rojo, mostrar: `$${egresos}` },
        { etiqueta: 'Ganancia', valor: Math.max(ganancia, 0), color: C.cafe, mostrar: `$${ganancia}` },
      ]} />

      {/* RF-02: Tabla de movimientos financieros */}
      <TituloSec nota="Resumen financiero del módulo de caja">Información de cuentas</TituloSec>
      <Tarjeta>
        <View style={cs.itemFila}><Text style={cs.ctaTexto}>Ventas totales: <Text style={{ fontWeight: '800' }}>${ingresos.toFixed(2)}</Text></Text><Text style={[cs.tag, { backgroundColor: C.verdeFondo, color: C.verde }]}>Ingreso</Text></View>
        <View style={cs.itemFila}><Text style={cs.ctaTexto}>Gastos registrados: <Text style={{ fontWeight: '800' }}>${egresos.toFixed(2)}</Text></Text><Text style={[cs.tag, { backgroundColor: C.rojoFondo, color: C.rojo }]}>Gasto</Text></View>
        <View style={cs.itemFila}><Text style={cs.ctaTexto}>Compras de suministros: <Text style={{ fontWeight: '800' }}>${comprasTotal.toFixed(2)}</Text></Text><Text style={[cs.tag, { backgroundColor: C.ambarFondo, color: C.ambar }]}>Compra</Text></View>
        <View style={cs.itemFila}><Text style={cs.ctaTexto}>Total en caja: <Text style={{ fontWeight: '800' }}>${ganancia.toFixed(2)}</Text></Text><Text style={[cs.tag, { backgroundColor: C.azulFondo, color: C.azul }]}>Ganancia</Text></View>
      </Tarjeta>
    </Pantalla>
  );
}

// ── Interfaz: Caja (Compra de suministros) ──────────────────
export function CajaCompras() {
  const C = useColors();
  const cs = crearCs(C);
  const { compras, registrarCompra } = useStore();
  const [insumo, setInsumo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [fecha, setFecha] = useState(fechaActual);
  const gastoDia = compras.filter(esDeHoy).reduce((s, c) => s + c.costo, 0);

  const registrar = () => {
    const cant = parseFloat(cantidad), costo = parseFloat(precio);
    if (!insumo.trim() || isNaN(cant) || isNaN(costo)) {
      Alert.alert('Datos incompletos', 'Ingresa nombre del insumo, cantidad y precio.');
      return;
    }
    registrarCompra(insumo.trim(), cant, costo, fecha);
    Alert.alert('✅ Compra registrada', `${insumo} agregado al historial e inventario.`);
    setInsumo(''); setCantidad(''); setPrecio('');
  };

  return (
    <Pantalla activa="cajaDash">
      <Header modulo="Caja" titulo="Compras" subtitulo="Compra de suministros e insumos" icono="🛒" />
      <TabsModulo modulo="caja" activa="compras" />
      <Banner etiqueta="Gasto en suministros" valor={`$${gastoDia.toLocaleString()}.00`} nota="Compras registradas" icono="📦" />

      {/* RF-01: Inputs nombre, cantidad, precio y fecha */}
      <TituloSec nota="Registra los suministros comprados">Nueva compra</TituloSec>
      <Tarjeta>
        <Campo etiqueta="Nombre del insumo" placeholder="Ej. Café molido" value={insumo} onChangeText={setInsumo} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Campo etiqueta="Cantidad" placeholder="0" keyboardType="numeric" value={cantidad} onChangeText={setCantidad} /></View>
          <View style={{ flex: 1 }}><Campo etiqueta="Precio total ($)" placeholder="0.00" keyboardType="numeric" value={precio} onChangeText={setPrecio} /></View>
        </View>
        <Campo etiqueta="Fecha" placeholder="AAAA-MM-DD" value={fecha} onChangeText={setFecha} />
        {/* RF-02: Botón registrar compra */}
        <Boton texto="Registrar compra" onPress={registrar} />
      </Tarjeta>

      {/* RF-03: Tabla historial de compras */}
      <TituloSec>Historial de compras</TituloSec>
      <Tarjeta>
        {compras.map((c) => (
          <View key={c.id} style={cs.itemFila}>
            <Text style={{ fontSize: 13, color: C.texto, flex: 1 }}>{c.insumo} · {c.cantidad} {c.unidad} · {c.fecha}</Text>
            <Text style={{ fontWeight: '700', color: C.rojo, fontSize: 13 }}>-${c.costo.toFixed(2)}</Text>
          </View>
        ))}
      </Tarjeta>
    </Pantalla>
  );
}

const crearCs = (C) => StyleSheet.create({
  accTitulo: { fontWeight: '800', color: C.texto, fontSize: 14.5 },
  accSub: { fontSize: 12, color: C.textoSuave, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: '48%', minHeight: 178 },
  iconoCard: { width: 40, height: 40, borderRadius: 13, backgroundColor: C.crema2, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  itemFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.linea, gap: 8 },
  modalLinea: { fontSize: 12.5, color: C.textoSuave },
  ctaTexto: { fontSize: 13, color: C.texto, flex: 1 },
  tag: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, fontSize: 10.5, fontWeight: '700', overflow: 'hidden' },
});
