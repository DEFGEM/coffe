// Módulo Cocina — Dashboard, Pedidos, Inventario y Gestión del menú
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { useStore } from '../store';
import {
  Header, Banner, KpiFila, Tarjeta, TituloSec, Boton, Campo,
  Selector, ChipEstado, ModalCard, Pantalla, TabsModulo,
} from '../components/UI';

const CATEGORIAS = ['Bebidas calientes', 'Bebidas frías', 'Panadería', 'Combos', 'Promociones'];

// ── Dashboard por módulo: Cocina ────────────────────────────
export function CocinaDashboard() {
  const C = useColors();
  const ks = crearKs(C);
  const { pedidos, inventario, navegar } = useStore();
  const pagados = pedidos.filter((p) => p.estado === 'pagado').length;
  const enPrep = pedidos.filter((p) => p.estado === 'en_preparacion').length;
  const listos = pedidos.filter((p) => p.estado === 'listo').length;
  const stockBajo = inventario.filter((i) => i.stock <= i.minimo).length;

  return (
    <Pantalla activa="cocinaDash">
      <Header modulo="Módulo" titulo="Cocina" subtitulo="Dashboard general de cocina" icono="👨‍🍳" />
      <TabsModulo modulo="cocina" />
      <Banner etiqueta="Actividad de cocina" valor={`${pagados + enPrep + listos} pedidos`}
              nota="Pedidos atendidos durante el día" icono="🔥" />
      <KpiFila datos={[
        { icono: '⏳', valor: pagados, etiqueta: 'Pendientes' },
        { icono: '🍳', valor: enPrep, etiqueta: 'Preparación' },
        { icono: '✅', valor: listos, etiqueta: 'Listos' },
      ]} />

      <TituloSec nota="Gestiona las áreas principales de cocina">Accesos rápidos</TituloSec>
      <View style={ks.grid}>
        {[
          { i: '📋', t: 'Pedidos', s: 'Ver pedidos pendientes y actualizar estado', p: 'cocinaPedidos' },
          { i: '📦', t: 'Inventario', s: `Revisar insumos · ${stockBajo} con stock bajo`, p: 'cocinaInventario' },
          { i: '🍽️', t: 'Gestión del menú', s: 'Agregar, editar y eliminar productos', p: 'cocinaMenu' },
        ].map((x) => (
          <Tarjeta key={x.p} style={ks.gridCard}>
            <View style={ks.iconoCard}><Text>{x.i}</Text></View>
            <Text style={ks.accTitulo}>{x.t}</Text>
            <Text style={ks.accSub}>{x.s}</Text>
            <Boton texto="Entrar" onPress={() => navegar(x.p)} style={{ marginTop: 10 }} />
          </Tarjeta>
        ))}
      </View>
    </Pantalla>
  );
}

// ── Interfaz: Cocina (Pedidos) ──────────────────────────────
export function CocinaPedidos() {
  const C = useColors();
  const ks = crearKs(C);
  const { pedidos, cambiarEstado, marcarListo } = useStore();
  const pagados = pedidos.filter((p) => p.estado === 'pagado');
  const enPrep = pedidos.filter((p) => p.estado === 'en_preparacion');
  const listos = pedidos.filter((p) => p.estado === 'listo');

  const preparar = (p) => {
    cambiarEstado(p.id, 'en_preparacion');
    // RF-02: Alerta de tiempo de espera
    Alert.alert('🍳 En preparación', `Pedido #${p.id} en preparación. Tiempo estimado: 10 min.`);
  };
  const listo = (p) => {
    marcarListo(p.id); // descuenta inventario (Caso de uso 4)
    // RF-02: Aviso al mesero cuando esté listo
    Alert.alert('🔔 Pedido listo', `Pedido #${p.id} marcado como Listo.\nSe notificó al mesero y se descontó el inventario.`);
  };

  const TarjetaPedido = ({ p, accion, textoBoton, tipo }) => (
    <Tarjeta>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '800', color: C.texto }}>Pedido #{p.id}</Text>
        <ChipEstado estado={p.estado} />
      </View>
      <Text style={{ fontSize: 12, color: C.textoSuave, marginTop: 2 }}>
        Mesa {p.mesa} · {p.items.map((i) => `${i.cantidad} ${i.producto.toLowerCase()}`).join(' · ')}
      </Text>
      {p.observaciones ? (
        <Text style={{ fontSize: 11.5, color: C.ambar, marginTop: 4 }}>📝 {p.observaciones}</Text>
      ) : null}
      {accion ? <Boton texto={textoBoton} tipo={tipo} style={{ marginTop: 10, paddingVertical: 9 }} onPress={() => accion(p)} /> : null}
    </Tarjeta>
  );

  return (
    <Pantalla activa="cocinaDash">
      <Header modulo="Cocina" titulo="Pedidos" subtitulo="Control de pedidos" icono="🍳" />
      <TabsModulo modulo="cocina" activa="pedidos" />
      <Banner etiqueta="Pedidos en cocina" valor={`${pagados.length + enPrep.length} activos`}
              nota={`${pagados.length} pendientes · ${enPrep.length} en preparación`} icono="🔥" />
      {/* RF-03: Tabla — pendientes, en preparación y listos */}
      <KpiFila datos={[
        { icono: '⏳', valor: pagados.length, etiqueta: 'Pendientes' },
        { icono: '🍳', valor: enPrep.length, etiqueta: 'Preparación' },
        { icono: '✅', valor: listos.length, etiqueta: 'Listos' },
      ]} />

      <TituloSec nota="Actualiza el estado de cada pedido">Pedidos recientes</TituloSec>
      {pagados.length + enPrep.length === 0 && (
        <Tarjeta><Text style={{ color: C.textoSuave, fontSize: 13 }}>No hay pedidos pagados en espera.</Text></Tarjeta>
      )}
      {/* RF-01: Botones cambiar estatus "En preparación" y "Listo" */}
      {pagados.map((p) => <TarjetaPedido key={p.id} p={p} accion={preparar} textoBoton="Preparar" tipo="cafe" />)}
      {enPrep.map((p) => <TarjetaPedido key={p.id} p={p} accion={listo} textoBoton="Marcar listo" tipo="verde" />)}
      {listos.length > 0 && <TituloSec>Listos para entregar</TituloSec>}
      {listos.map((p) => <TarjetaPedido key={p.id} p={p} />)}
    </Pantalla>
  );
}

// ── Interfaz: Cocina (Inventario / suministros) ─────────────
export function CocinaInventario() {
  const C = useColors();
  const ks = crearKs(C);
  const { inventario } = useStore();
  const [busqueda, setBusqueda] = useState('');
  const bajos = inventario.filter((i) => i.stock <= i.minimo);
  const filtrados = inventario.filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <Pantalla activa="cocinaDash">
      <Header modulo="Cocina" titulo="Inventario" subtitulo="Control de insumos y existencias" icono="📦" />
      <TabsModulo modulo="cocina" activa="inventario" />
      <Banner etiqueta="Estado del inventario" valor={`${inventario.length} insumos`}
              nota={`${bajos.length} productos con stock bajo`} icono="⚠️" />
      <KpiFila datos={[
        { icono: '✅', valor: inventario.length - bajos.length, etiqueta: 'Normales' },
        { icono: '⚠️', valor: bajos.length, etiqueta: 'Stock bajo' },
        { icono: '🛒', valor: 2, etiqueta: 'Compras' },
      ]} />

      <Tarjeta>
        <Campo placeholder="🔍  Buscar insumo…" value={busqueda} onChangeText={setBusqueda} />
      </Tarjeta>

      <TituloSec nota="Revisa cantidades disponibles">Insumos principales</TituloSec>
      {filtrados.map((i) => {
        const bajo = i.stock <= i.minimo;
        return (
          <Tarjeta key={i.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontWeight: '700', color: C.texto }}>{i.nombre}</Text>
                <Text style={{ fontSize: 11.5, color: C.textoSuave }}>
                  {i.stock} {i.unidad} disponibles · Mín. {i.minimo} {i.unidad}
                </Text>
              </View>
              <View style={[ks.tagStock, { backgroundColor: bajo ? C.rojoFondo : C.verdeFondo }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: bajo ? '#b03030' : '#1d7c4c' }}>
                  {bajo ? 'Bajo' : 'Normal'}
                </Text>
              </View>
            </View>
          </Tarjeta>
        );
      })}
    </Pantalla>
  );
}

// ── Interfaz: Cocina (Gestión del menú) ─────────────────────
export function CocinaMenu() {
  const C = useColors();
  const ks = crearKs(C);
  const { menu, agregarPlatillo, editarPlatillo, eliminarPlatillo } = useStore();
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState(''); // RF-04: textarea
  const [categoria, setCategoria] = useState(null);    // RF-05: select categoría

  const abrirNuevo = () => { setEditando(null); setNombre(''); setPrecio(''); setDescripcion(''); setCategoria(null); setModal(true); };
  const abrirEditar = (m) => { setEditando(m); setNombre(m.nombre); setPrecio(String(m.precio)); setDescripcion(m.descripcion); setCategoria(m.categoria); setModal(true); };

  const guardar = () => {
    const p = parseFloat(precio);
    if (!nombre.trim() || isNaN(p) || !categoria) {
      Alert.alert('Datos incompletos', 'Ingresa nombre, precio y categoría del platillo.');
      return;
    }
    if (editando) {
      editarPlatillo(editando.id, { nombre: nombre.trim(), precio: p, descripcion, categoria });
      Alert.alert('✅ Platillo editado', `«${nombre}» se actualizó exitosamente en el menú.`);
    } else {
      agregarPlatillo({ nombre: nombre.trim(), precio: p, descripcion, categoria });
      Alert.alert('✅ Platillo registrado', `«${nombre}» se agregó exitosamente al menú.`);
    }
    setModal(false);
  };

  const eliminar = (m) => {
    Alert.alert('Eliminar platillo', `¿Eliminar «${m.nombre}» del menú?`, [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive',
        onPress: () => { eliminarPlatillo(m.id);
          // RF-02: Alerta de eliminación exitosa
          Alert.alert('Platillo eliminado', `«${m.nombre}» se eliminó exitosamente del menú.`); } },
    ]);
  };

  return (
    <Pantalla activa="cocinaDash">
      <Header modulo="Cocina" titulo="Gestión menú" subtitulo="Agregar, editar y eliminar productos" icono="🍽️" />
      <TabsModulo modulo="cocina" activa="menu" />
      <Banner etiqueta="Menú disponible" valor={`${menu.length} productos`}
              nota={`${menu.length} platillos · ${menu.filter((m) => m.categoria === 'Combos').length} combos`} icono="📒" />

      {/* RF-01: Botones agregar */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Boton texto="＋ Agregar platillo" tipo="verde" style={{ flex: 1 }} onPress={abrirNuevo} />
        <Boton texto="⭐ Agregar promoción" tipo="claro" style={{ flex: 1 }}
               onPress={() => { setCategoria('Promociones'); abrirNuevo(); setCategoria('Promociones'); }} />
      </View>

      {/* RF-03 (tabla): Menú actual */}
      <TituloSec nota="Productos disponibles para pedidos">Menú actual</TituloSec>
      {menu.map((m) => (
        <Tarjeta key={m.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 18 }}>{m.icono}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: C.texto }}>{m.nombre}</Text>
              <Text style={{ fontSize: 11.5, color: C.textoSuave }}>{m.categoria} · ${m.precio.toFixed(2)}</Text>
              {m.descripcion ? <Text style={{ fontSize: 11, color: C.textoSuave }}>{m.descripcion}</Text> : null}
            </View>
          </View>
          {/* RF-01: editar / eliminar */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Boton texto="Editar" tipo="claro" style={{ flex: 1, paddingVertical: 8 }} onPress={() => abrirEditar(m)} />
            <Boton texto="Eliminar" tipo="rojo" style={{ flex: 1, paddingVertical: 8 }} onPress={() => eliminar(m)} />
          </View>
        </Tarjeta>
      ))}

      {/* Formulario en modal: RF-03 inputs, RF-04 textarea, RF-05 select */}
      <ModalCard visible={modal} onCerrar={() => setModal(false)}
                 titulo={editando ? 'Editar platillo' : 'Agregar platillo'}>
        <Campo etiqueta="Nombre del producto" placeholder="Ej. Capuchino" value={nombre} onChangeText={setNombre} />
        <Campo etiqueta="Precio ($)" placeholder="0.00" keyboardType="numeric" value={precio} onChangeText={setPrecio} />
        <Campo etiqueta="Descripción del platillo" placeholder="Ingredientes o presentación…"
               value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3}
               style={{ backgroundColor: C.superficie, borderWidth: 1, borderColor: C.linea, borderRadius: 10, padding: 12, minHeight: 64, textAlignVertical: 'top', color: C.texto }} />
        <Selector etiqueta="Seleccionar la categoría del platillo" opciones={CATEGORIAS}
                  valor={categoria} onChange={setCategoria} />
        <Campo etiqueta="Imagen (URL o nombre de archivo)" placeholder="Opcional · Formatos: JPG, PNG" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Boton texto="Cancelar" tipo="claro" style={{ flex: 1 }} onPress={() => setModal(false)} />
          <Boton texto={editando ? 'Guardar cambios' : 'Registrar'} style={{ flex: 1 }} onPress={guardar} />
        </View>
      </ModalCard>
    </Pantalla>
  );
}

const crearKs = (C) => StyleSheet.create({
  accTitulo: { fontWeight: '800', color: C.texto, fontSize: 14.5 },
  accSub: { fontSize: 12, color: C.textoSuave, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: '48%', minHeight: 178 },
  iconoCard: { width: 40, height: 40, borderRadius: 13, backgroundColor: C.crema2, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  tagStock: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
});
