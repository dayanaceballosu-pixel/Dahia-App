# 🌸 Cuestionario 02 — El Corazón: Las Cuentas

> **Dónde estamos:** ya tenemos el rumbo. Dahia App = PWA limpia, rosada pastel con estética de cristal, kawaii pero funcional, para que **Dayana** lleve sus cuentas (webcam + tatuajes) sin saturarse.
>
> **Qué busca este cuestionario:** afinar **cómo debe funcionar el módulo de cuentas** por dentro, para que cuando lo construyamos quede como ella lo necesita y no toque rehacerlo. Sigo sin tocar código. 🙂
>
> **Cómo responder:** escribe bajo cada `➡️`. En las listas con `[ ]`, marca con una `X` lo que aplique (`[X]`). Si no sabes algo, escribe "no sé" o "decide tú" y yo te recomiendo.

---

## 1. Las cuentas reales de Dayana 💳

> Una "cuenta" es cualquier lugar donde ella tiene plata: efectivo, banco, una billetera digital, etc. La app mostrará el saldo de cada una.

**1.1 ¿Qué cuentas/lugares de plata maneja ella en la vida real?** (Suéltalas todas, aunque no estés 100% seguro. Ej: Efectivo, Nequi, Daviplata, Bancolombia, cuenta de ahorros, una cuenta en dólares de la página de webcam, PayPal, cripto/USDT, etc.)

➡️ Prefiero que quede personalizable que ella coloque las cuentas que quiera y el sistema igual funcione y que las configure desde el perfil o un panel de configuracion no se

**1.2 ¿Maneja dólares (USD) además de pesos?** (Muchas modelos webcam cobran en dólares o tokens. Esto es importante porque cambia bastante cómo se construye la app.)
- [ ] Solo pesos colombianos (COP)
- [ ] Pesos **y** dólares (las dos monedas conviviendo)
- [ ] Otra / no sé

➡️ Por ahora solo pesos colombianos

**1.3 Si maneja dólares: cuando pasa de USD a COP (cuando le consignan o cambia), ¿quieres que la app maneje la conversión, o lo registra ella a mano cada vez?**

➡️

---

## 2. Separar los dos trabajos 💼💗

> Tú dijiste que quiere saber **cuánto gana de cada trabajo** (webcam vs. tatuajes) para saber cuánto reinvertir. Hay varias formas de lograrlo:

**2.1 ¿Cómo te imaginas que se vea esa separación?** (Marca la que más te suene)
- [ X ] Cada ingreso se **etiqueta** con el trabajo (webcam / tatuajes / otro) y la app suma por trabajo
- [ ] Dos "bolsillos" o secciones separadas, una para cada trabajo
- [ ] Un resumen tipo "este mes: Webcam $X · Tatuajes $Y"
- [ ] No sé, muéstrame cuál se ve mejor

➡️ Si es lo que te dije de categorias digamos si es un gasto ella puede poner (Mascostas, Comida, Gustos personales etc..) y Si es Ingreso puede poner (Webcam, Tatuajes, Etc..) Muy personalizable para que ella ponga y borre las categorias que quiera

**2.2 ¿Los gastos también se separan por trabajo?** (Ej: insumos de tatuaje, luces/ring para webcam = reinversión de ese trabajo. Esto le diría la ganancia REAL de cada uno.)
- [ ] Sí, gastos también etiquetados por trabajo (así ve ganancia neta de cada uno)
- [ ] No, solo me interesa separar los **ingresos** por trabajo
- [ ] No sé

➡️NO, eso ella lo elige cuando cree sus propias categorias

**2.3 ¿Hay un tercer tipo de ingreso/trabajo que debamos contemplar, o solo esos dos por ahora?**

➡️ Que ella lo pueda configurar

---

## 3. Cómo registra el día a día ✍️

> Recuerda: ella abriría la app **cada vez que hace un gasto**. Entonces registrar tiene que ser **rapidísimo y rico de usar**.

**3.1 Cuando registra un gasto, ¿qué es lo MÍNIMO que querés pedirle para que no sea tedioso?** (Marca lo imprescindible)
- [ X ] Monto ($)
- [ X ] De qué cuenta salió
- [ X ] Categoría (comida, etc.)
- [ X ] Para qué trabajo (si aplica)
- [X  ] Una notica corta (opcional)
- [ ] Fecha (o asumimos "hoy" automáticamente)


➡️  La fecha y hora debe quedar guardada en cada movimiento asi como en algun lado en cuanto queda la cuenta despues de ese movimiento asi si hay un descuadre se puede devolver uno en el tiempo

**3.2 ¿Te gustaría que registrar se sienta "premiado"?** (Ej: el gatito reacciona, una animación linda, un confeti suave al guardar.) ¿Qué tanto?

➡️ Aun no me has dicho como hariamos eso hasta donde se no puedes crear gatos kawais animados

---

## 4. Las categorías 🏷️

> Las categorías le dicen **en qué entra y en qué sale** la plata. Te propongo un punto de partida; tú ajustas.

**4.1 Categorías de GASTO — marca las que sí, tacha las que no, agrega las que falten:**
- [ ] Comida / Mercado
- [ ] Antojos / Salidas
- [ ] Arriendo / Servicios
- [ ] Transporte
- [ ] Belleza / Cuidado personal
- [ ] Ropa
- [ ] Salud
- [ ] Insumos tatuaje (reinversión)
- [ ] Equipo/Setup webcam (reinversión)
- [ ] Deudas / Préstamos
- [ ] Ahorro
- [ ] Otros

➡️ (agrega aquí las que falten) No ella elije si es un gasto o un ingreso y ya luego elije la categoria que quiera, pero la pantalla si debe ser totalmente diferente en colores para que no se equivoque si es un gasto de color rojo (con los tonos de la app) y si es un ingreso en tono verde todo el apartado de movimientos 

**4.2 Categorías de INGRESO — ¿cuáles aplican?**
- [ ] Webcam
- [ ] Tatuajes
- [ ] Propinas / Regalos
- [ ] Préstamo recibido
- [ ] Otros

➡️ leer punto anterior ella modifica las categorias a su gusto nosotros solo creamos la base

**4.3 ¿Quieres que ella pueda crear/editar sus propias categorías, o prefieres dejarlas fijas y bonitas para que no se desordene?**

➡️ Exactamente que queden en una lista desplegable y se autorellenen al escribir asi si son muchas no saturan la pantalla

---

## 5. La pantalla principal (lo primero que ve) 🏠

> Ella dijo: "satisfactorio, sin muchos números que saturen de primeras". Entonces la pantalla de inicio es clave.

**5.1 Cuando abre la app, ¿qué es lo PRIMERO que querés que vea?** (Marca 1 o 2, máximo)
- [ X ] Su saldo total (toda su plata junta)
- [ ] Sus cuentas con el saldo de cada una
- [ ] Cuánto lleva ganado/gastado este mes
- [ ] El balance de cada trabajo (webcam vs tatuajes)
- [ X ] El gatito saludándola + un botón grande para registrar
- [ ] Otra cosa:

➡️

**5.2 El botón de "registrar gasto/ingreso", ¿lo imaginas como el protagonista de la pantalla (botón grande, centrado, imposible de no ver)?**

➡️ Lo imagino mas como en la mitad de la barra de pestañas inferior como un mas animado bien bonito

---

## 6. El gatito 🐱 (cómo lograr que se vea BIEN)

> Te preocupaba "no saber cómo hacer que el gatito se vea bien". Te explico las opciones reales, de menos a más esfuerzo, para que elijas el camino:

- **A) Gatito vectorial animado (SVG/CSS):** lo dibujamos como vector dentro de la app. Puede parpadear, mover la colita, reaccionar al guardar. Muy fluido, liviano, súper kawaii, y se ve consistente. *(Mi recomendación para empezar.)*
- **B) Gatito ilustrado con IA:** generamos un set de poses/expresiones con IA (tengo skills para eso) y las usamos como imágenes. Se ve más "ilustración bonita", pero las animaciones son más limitadas (cambia de pose, no se mueve fluido).
- **C) Animación tipo Lottie:** animación profesional muy fluida (la del estilo de apps grandes). La más vistosa, pero la más laboriosa de producir/ajustar.
- **D) Sin gatito por ahora:** arrancamos limpísimas sin mascota y lo agregamos cuando las cuentas ya funcionen.

**6.1 ¿Qué camino te late para el gatito?**
- [x ] A — Vectorial animado (recomendado)
- [ ] B — Ilustrado con IA
- [ x ] C — Lottie profesional
- [ ] D — Sin gatito por ahora, después
- [ ] Decide tú

➡️ Intenta A pero hasta donde se no eres bueno para eso y si el gato no se ve lindo de verdad y se ve mas como un mamaracho prefiero la C y si no pues sin gato 

**6.2 ¿Qué debería hacer el gatito?** (Marca lo que te guste)
- [ X ] Saludar al abrir la app
- [ X ] Reaccionar contento al registrar un ingreso
- [ X] Poner carita cuando hay un gasto grande
- [ X] Felicitar cuando va bien en el mes
- [ ] Solo estar ahí quietico y lindo, sin molestar
- [ ] Otra:

➡️

---

## 7. Lo que PODRÍA llegar después 🔮 (solo para que lo veas venir)

> No es para ahora — es para que sepas **todo lo que el módulo de finanzas puede crecer** y vayas marcando qué te interesa para más adelante. Así construyo la base de hoy pensando en que mañana quepa esto sin romper nada.

Marca con `X` lo que te gustaría tener **algún día** (sin compromiso):
- [ ] Metas de ahorro (ej: "ahorrar para X", con barrita de progreso)
- [ ] Presupuestos por categoría (ej: "máx $X en antojos este mes")
- [ X] Gastos/ingresos recurrentes (arriendo, suscripciones que se repiten solas)
- [ X] Deudas y préstamos (a quién le debe / quién le debe)
- [ X] Recordatorios (ej: "cobra el tatuaje del viernes")
- [ X] Gráficas bonitas (en qué se va la plata, evolución del mes)
- [ X] Reporte mensual ("este mes ganaste X, gastaste Y")
- [ ] Respaldo en la nube (que no pierda los datos si cambia de teléfono)
Esto es importante lo vamos a conectar a firebase antes de cualquier cosa
- [ ] Bloqueo con clave / Face ID (privacidad)
- [ X ] Modo oscuro (versión nocturna rosadita)
- [ ] Otra:

➡️

---

## 8. Detalle técnico (rápido, para no equivocarme) 🛠️

**8.1 ¿Los datos deben guardarse en la nube (que pueda entrar desde cualquier lado y no perderlos), o por ahora basta con que vivan en su teléfono?**
> *(Sugerencia: como es PWA en iPhone y la privacidad importa, lo más seguro es nube con login. Pero tú decides.)*

➡️En firebase con login mediante cuenta de google aparte toca configurar vercel y github para que lo tengas presente 

**8.2 ¿Quieres que tenga inicio de sesión (ej: con Google) para proteger sus cuentas, o que entre directo sin clave?**

➡️Con google

---

### ✅ Cuando termines
Guarda y avísame. Con esto ya tendré **todo para diseñar el plan visual y funcional** de la fase 1. El siguiente paso después de este cuestionario sería mostrarte **cómo se vería** (bocetos / referencias de estilo) antes de programar — para que la estética te enamore primero. 🌸
