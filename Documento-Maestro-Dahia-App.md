# 🌸 Dahia App — Documento Maestro

> **Una sola fuente de verdad.** Resume todo lo definido en los Cuestionarios 01–04. Si algo aquí no te cuadra, lo cambiamos antes de programar. Fecha de cierre de definición: 2026-06-30.

---

## 1. Qué es y para quién
App **PWA de finanzas personales** para **Dayana ("Dahia")** — webcam + tatuadora, dos fuentes de ingreso. Una sola usuaria. Debe sentirse **muy de ella**, dar gusto entrar, y mantener sus cuentas al día **sin saturarla de números**.

**Sensación objetivo:** propia, satisfactoria, viva, tierna. **Nunca:** sucia, caótica, con mil opciones, estresante.

**Plataforma:** PWA instalable, enfocada en **iPhone**. **Una sola moneda: COP.**

---

## 2. Identidad visual
- **Paleta:** rosado pastel + estética de **cristal (glassmorphism)**. Limpia, minimalista pero **viva**, con animaciones kawaii **equilibradas** (ni vacía ni recargada).
- **Modo claro y oscuro** (oscuro = "rosadita nocturna"), ambos desde la versión final.
- **Color por tipo de movimiento:** Gasto = **rojo** (en tonos de la app) · Ingreso = **verde** · Transferencia = **azul/morado pastel**.
- **Plata:** siempre 2 decimales → `$1.250.000,00`, con los **decimales más pequeños** para no saturar.
- **Tono de textos:** de tú, cariñoso. La app la llama **"Dahia"**.

---

## 3. El gato 🐱 (mascota viva)
- **Técnica:** vectorial (SVG/CSS) — camino A, confirmado. Los accesorios son **capas SVG** encima.
- **Nombre:** lo pone ella en el onboarding; lo cambia en Ajustes. *(Provisional en muestras: "Michi".)*
- **Presencia:** visible en casi todas las pantallas, con un **ajuste** para regular cuánto aparece.
- **Animaciones ociosas (rotando):** duerme 😴, persigue su colita, se asoma/esconde por un borde, bosteza y se estira, juega con estambre, parpadea.
- **Al tocarlo:** animación divertida al azar (salta, ronronea, corazones) **+** frasecita tierna.
- **Reacciona según contexto:** feliz con un ingreso, carita con un gasto grande, festeja un buen mes, y distinto **según la pantalla** (ej: sobre una alcancía en Cuentas).

---

## 4. Núcleo financiero (Fase 1)

### 4.1 Cuentas
- Lugares donde tiene plata (Nequi, Efectivo, etc.). **100% personalizables** por ella.
- Cada cuenta: **nombre** (obligatorio) · **emoji libre** (cualquiera del teclado) · **color** (se sugiere uno, puede saltarlo) · **saldo actual** (calculado).
- **Sin campo de saldo inicial**: el saldo de arranque se pone con un movimiento tipo **"Ajuste / Saldo inicial"** (cambia el saldo pero **no** cuenta como ingreso en estadísticas).
- Pueden quedar **en negativo** (se muestran en rojo).
- No se borran: se **archivan** (se esconden pero conservan su historial, sin romper las cuentas globales).

### 4.2 Movimientos
Tres tipos, elegidos al tocar el botón **➕** central (pregunta primero qué tipo es):
1. **Ingreso** (verde) · 2. **Gasto** (rojo) · 3. **Transferencia** (neutral — mueve plata entre cuentas, ej. sacar efectivo; **no** cuenta como ingreso ni gasto).

Cada movimiento guarda: **monto, cuenta, categoría, nota opcional, fecha + hora, y el saldo resultante de la cuenta** tras ese movimiento (para "devolverse en el tiempo" si hay un descuadre).
- Se pueden **editar y borrar**, y la app **recalcula** los saldos.

### 4.3 Categorías
- **Bolsas compartidas, NO atadas a gasto/ingreso.** Una misma categoría ("Tatuajes") acumula ingresos **y** gastos; su balance = ingresos − gastos.
- Cada una con **emoji + color**.
- **100% personalizables** (crear, editar, borrar). Se eligen desde un **desplegable con autocompletado** (no satura aunque haya muchas).
- Las categorías base que sembramos viven en **Firebase junto a las de ella, indistinguibles**, ordenadas **alfabéticamente**.
- **Base inicial de ejemplo** (ella la ajusta): Comida 🍔 · Mercado 🛒 · Antojos 🍰 · Mascotas 🐾 · Belleza 💅 · Ropa 👗 · Transporte 🚕 · Arriendo/Servicios 🏠 · Salud 💊 · Gustos personales 🎁 · Webcam 💻 · Tatuajes 🖋️ · Propinas/Regalos 🎀 · Otros ✨.

### 4.4 Estadísticas
Ver balances por **categoría** (cuánto entró/salió/neto) por **semana o mes**. De aquí ella deduce cuánto reinvertir en cada trabajo.

---

## 5. Gamificación 🪙
- **Moneda:** "**Michi-coins**".
- **Se ganan:** entrando cada día (**racha** que sube el premio) + por **registrar movimientos** (sin límite).
- **Racha exigente:** si falta un día, vuelve a **0**.
- **Tienda:** accesorios de cabeza, gafas/antifaces, bufandas/collares, **outfits completos**, **fondos/escenarios** y **skins del gato**. Puede llevar **varios a la vez** (arma su outfit).
- **Ítems especiales:** de **temporada** (navidad, halloween…) y **desbloqueables por logros** (ej: 30 días de racha → corona 👑).
- **100% gratis y cosmético** (nunca dinero real).
- **Futuro:** mini-juego estilo Pou para ganar más monedas.

---

## 6. Navegación y pantallas
**Barra inferior:** `🏠 Inicio · 📜 Movimientos · ➕ · 💳 Cuentas · ⚙️ Ajustes` (el ➕ es un botón animado, protagonista, en el centro).

- **🏠 Inicio:** saldo total (con **ojito** para ocultar) + gato protagonista + últimos 3-4 movimientos. Muy limpio.
- **📜 Movimientos:** historial completo con fecha, hora y saldo resultante; **filtros** (cuenta, categoría, mes, tipo). *Optimizado para no derrochar lecturas de Firebase aunque haya meses de datos.*
- **➕:** hoja para elegir Ingreso / Gasto / Transferencia y registrar rapidísimo.
- **💳 Cuentas:** lista de cuentas con emoji/color/saldo; tocar una → su historial + editar/archivar; crear cuenta; transferir.
- **⚙️ Ajustes:** nombre del gato, presencia del gato, modo claro/oscuro, categorías, cuentas archivadas, sesión, etc.
- **Onboarding (primera vez):** saludo del gato + ponerle nombre + ayudar a crear sus primeras cuentas.

---

## 7. Lo técnico
- **Stack propuesto:** PWA con **Vite + React + TypeScript**, **Firebase** (Authentication con **Google** + **Firestore** para datos), animaciones con **Framer Motion** + SVG/CSS, estilos con utilidades (Tailwind o CSS modules). *(Si prefieres otra cosa, dilo; si no, vamos con esto.)*
- **Login:** con **Google** (obligatorio, protege sus cuentas).
- **Datos en la nube:** Firestore (no pierde nada si cambia de teléfono). **Regla de oro: cuidar las lecturas/escrituras de Firebase en toda la app** (paginación, caché local, nada de derroches).
- **Despliegue:** GitHub → Vercel.
- **Versión final completa, no demos.** Se prueba todo desde código.

---

## 8. Para más adelante (no Fase 1)
Metas de ahorro · Presupuestos por categoría · Gastos/ingresos recurrentes · Deudas y préstamos · Recordatorios · Gráficas bonitas · Reporte mensual · Mini-juego de monedas · Bloqueo con clave/Face ID.

---

## 9. Plan de trabajo
1. ✅ Definición (Cuestionarios 01–04) — **hecho**.
2. 🔜 **Crear las 3 cuentas** (Firebase + GitHub + Vercel) — *guía aparte*.
3. 🎨 **Diseño visual** de las pantallas (paleta exacta + bocetos) para tu aprobación.
4. 💻 **Programar la versión final** y desplegar.

> Lo que falta por definir fino se resolverá ya con el diseño visual en mano (paso 3).
