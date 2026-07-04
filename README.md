# CoffeeAdmin — Aplicación Móvil (React Native + Expo)

App móvil del sistema de administración de cafetería (Entrega 1er Parcial,
Programación Móvil, Grupo S-203, UPQ), desarrollada con **React Native + Expo**
según el diseño arquitectónico del documento. Sin dependencias externas de
navegación ni gráficas: todo está implementado con componentes propios.

## Ejecución

```bash
npm install
npx expo start
```

Escanea el código QR con **Expo Go** (Android/iOS) o presiona `w` para verla
en el navegador.

## Credenciales de prueba (redirección por rol — Caso de uso 1)

| Usuario | Contraseña | Rol | Pantalla inicial |
|---|---|---|---|
| fer@coffeeadmin.com (o `Fer`) | admin123 | Admin | Dashboard general |
| mesero@coffeeadmin.com | mesero1 | Mesero | Módulo Cliente/Mesero |
| caja@coffeeadmin.com | caja1 | Cajero | Módulo Caja |
| cocina@coffeeadmin.com | cocina1 | Cocinero | Módulo Cocina |

## Flujo completo del pedido (Casos de uso 2, 3 y 4)

1. **Mesero → Realizar pedido**: selecciona mesa (alerta si está ocupada),
   productos con cantidades, observaciones → *Enviar pedido* (estado **pendiente**, llega a Caja).
2. **Caja → Pedidos**: confirma o cancela; *Confirmar* abre el **Proceso de pago**
   (método efectivo/tarjeta/transferencia, cantidad recibida o referencia,
   alertas de pago exitoso/rechazado) → estado **pagado**, se envía a Cocina y se puede generar el ticket.
3. **Cocina → Pedidos**: *Preparar* (**en preparación**) → *Marcar listo*
   (**listo**, descuenta inventario y notifica al mesero).
4. **Mesero → Mis pedidos**: *Entregar* → estado **entregado** (libera la mesa).

## Interfaces implementadas (requerimientos funcionales)

| Interfaz | Requerimientos cubiertos |
|---|---|
| **Login** | Inputs, botón de inicio, alertas (campos vacíos, no registrado, contraseña incorrecta) |
| **Dashboard general** | Menú hamburguesa, botones a módulos, paneles resumen, gráfica de ventas, actividad reciente |
| **Dashboard por módulo** | Tablas resumen, cards de pedidos/ventas/ganancias, gráficas y botones por módulo |
| **Cliente/Mesero (Realizar pedido)** | Select de mesas y menú, input de cantidad, textarea de observaciones, enviar/cancelar, alertas de mesa ocupada y pedido enviado |
| **Cliente/Mesero (Mis pedidos)** | Tabla de pedidos con estatus, etiqueta de estatus, cambiar estatus (entregar), alertas de listo/entregado |
| **Cliente/Mesero (Marketing)** | Promociones activas, métricas de aceptación y sugerencias al cliente |
| **Caja (Pedidos)** | Tabla recibidos/confirmados/listos, cambiar estatus, modal con información completa, alertas |
| **Caja (Proceso de pago)** | Select método de pago, inputs de cantidad recibida y referencia, confirmar/cancelar, alertas de pago exitoso/rechazado |
| **Caja (Ticket de compra)** | Imprimir y enviar por correo (input de correo), historial de ventas y gastos |
| **Caja (Cuentas, gastos y ganancias)** | Gráficas de ingresos/gastos/ganancias, tabla de movimientos, dashboard financiero |
| **Caja (Compra de suministros)** | Inputs nombre/cantidad/precio/fecha, registrar compra (suma a inventario y gastos), historial |
| **Cocina (Pedidos)** | Cambiar estatus "En preparación"/"Listo", alertas de tiempo y aviso al mesero, tabla por estado, descuento de inventario |
| **Cocina (Inventario)** | Lista de insumos, búsqueda, alertas de stock bajo |
| **Cocina (Gestión del menú)** | Agregar/editar/eliminar platillos, inputs nombre/precio/imagen, textarea descripción, select categoría, alertas |

RNF cubiertos: diseño responsivo para celulares, menú hamburguesa, temas claro
y oscuro con selector global, modo vertical y horizontal (`orientation:
default`), navegación organizada con barra inferior, pestañas por módulo y
sesión con protección de pantallas por login.

## Estructura

```
coffeeadmin_movil/
├── App.js                # Provider + router de pantallas y protección por sesión
├── app.json / package.json / babel.config.js
└── src/
    ├── theme.js          # Paleta crema/café (mockups CoffeeAdmin)
    ├── store.js          # Estado global: pedidos, menú, inventario, ventas (simulado)
    ├── components/UI.js  # Header con hamburguesa, banners, KPIs, gráficas, modales, barra inferior
    └── screens/
        ├── Inicio.js     # Login + Dashboard general
        ├── Mesero.js     # Dashboard, Realizar pedido, Mis pedidos, Marketing
        ├── Caja.js       # Dashboard, Pedidos, Pago, Ticket, Cuentas, Compras
        └── Cocina.js     # Dashboard, Pedidos, Inventario, Gestión del menú
```

## Nota de integración

Los datos viven en `src/store.js` (memoria). En la integración final, cada
operación (`crearPedido`, `registrarPago`, `marcarListo`, etc.) se sustituirá
por llamadas `fetch` a la **API FastAPI** conectada a **PostgreSQL**, con
autenticación JWT, manteniendo las mismas pantallas.
# coffe
