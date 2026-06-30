# 🌸 Cuestionario 03 — Estructura y Detalles Finos

> **Dónde estamos:** ya está clarísimo el QUÉ. Ahora afinamos el CÓMO funciona por dentro, para diseñar la fase 1 sin reprocesos. Después de este, sigue el **diseño visual** (te muestro pantallas) antes de programar. Aún no toco código de la app.
>
> **Cómo responder:** bajo cada `➡️`. En listas marca `[X]`. Si no sabes, "decide tú" y yo recomiendo (te dejo mi sugerencia marcada con ⭐).

---

## 0. Antes que nada: el gatito 🐱

Te mandé una **muestra real** (`Muestra-Gatito-Dahia.html`). Ábrela y juega con los botones.

**0.1 ¿Qué tal te pareció?**
- [ X ] 😍 Me encanta, vamos con ESE estilo (camino A)
- [ ] 🙂 Me gusta pero le falta — ajústalo (dime qué cambiarías)
- [ ] 😐 No me convence, mejor intentemos Lottie (camino C)
- [ ] Sin gato por ahora

➡️ (si le cambiarías algo, dímelo:)

--- ME ENCANTA DESDE CUANDO ERES BUENO PARA ESO JAJAJA Y QUIERO MAS ANIMACIONES MAS DEPENDIENDO DONDE VAYA NO JAJA QUE SIEMPRE ESTE COMO VIVO HACIENDO ALGO COMO ESCONDIENDOSE O ASI RECUERDAS EL CLIP DE WORD CUANDO TENIA ANIMACIONES LA MASCOTA ALGO ASI QUE UNO LO TOQUE Y HAGA ALGUNA ANIMACION DIVERTIDA

## 1. Aclaración importante: "trabajo" vs "categoría" 💼

> Detecté algo que quiero confirmar. Dijiste que la separación de trabajos se hace **con las categorías de ingreso** (Webcam, Tatuajes…), y que los **gastos NO se separan por trabajo**.
>
> Eso significa que la app podrá decir *"este mes ganaste: Webcam $X · Tatuajes $Y"*, pero **NO** podrá decir *"la ganancia neta del negocio de tatuajes fue $Z"* (porque los gastos no se atan a un trabajo).

**1.1 ¿Está bien así de simple por ahora (solo ver ingresos por categoría), o sí te interesaría a futuro medir la ganancia NETA de cada trabajo?**
- [ ] Así simple está perfecto (solo ingresos por categoría)
- [ ] Me interesa la ganancia neta por trabajo, pero más adelante
- [ ] Decide tú ⭐ (sugiero: simple ahora, dejar la puerta abierta para después)

➡️ LAS CATEGORIAS NO ESTAN ATADAS A INGRESOS O GASTOS ENTONCES SI ELLA QUIERE PONE ME INGRESARON 30.000 EN TATUAJES Y LUEGO PONE GASTE 10 MIL EN LA CATEGORIA TATUAJES ENTONCES EL BALANCE CUANDO ELLA QUIERA VER TATUAJES LE SALE DE $20.000 YA ESO QUE LO VEA POR SEMANAS O POR MESES NO IMPORTA YA EN EL APARTADO DE ESTEDASTICAS ELLA VE TODO PERO QUIERO QUE ENTIENDAS EL FUNCIONAMIENTO DE LAS CATEGORIAS

**1.2 Lo de "cuánto reinvertir en cada trabajo" entonces, ¿lo deduce ella mirando cuánto ganó de cada uno, o esperabas que la app le sugiriera algo?**

➡️ LO DEDUCE ELLA!!

---

## 2. Cómo es una CUENTA por dentro 💳

> Quiero saber qué guarda cada cuenta para diseñar el panel de configuración.

**2.1 Cuando ella crea una cuenta nueva, ¿qué quieres que pueda ponerle?** (marca)
- [ X ] Nombre (ej: "Nequi", "Efectivo") — *obligatorio*
- [ X ] Un emoji o ícono lindo 🐷💵🏦 DEL TECLADO DE ELLA OSEA QUE PUEDA PONER CUALQUIERA
- [ X ] Un color propio (dentro de la paleta) PERO SUGERIR UNO QUE NO TENGA POR DEFECTO ASI PUEDE SALTARLO SI QUIERE
- [ ] Saldo inicial (cuánta plata tiene hoy ahí) NO QUE HAGA EL MOVIMIENTO NORMAL
- [ ] Otra cosa:

➡️

**2.2 ¿Una cuenta puede quedar en NEGATIVO?** (Ej: gasta más de lo que hay)
- [ X ] Sí, que lo permita y lo muestre en rojo
- [ ] No, que le avise "no tienes suficiente en esta cuenta"
- [ ] Decide tú ⭐ (sugiero: avisar pero dejarla decidir)

➡️

**2.3 Si ya no usa una cuenta, ¿prefieres "archivarla" (se esconde pero guarda su historial) o "borrarla" del todo?**

➡️ ARCHIVARLA PARA QUE NO ROMPA LAS CUENTAS GENERALES

---

## 3. Transferencias y sacar efectivo 🔁

> Una transferencia mueve plata de una cuenta a otra. Sacar efectivo = pasar de "Banco" a "Efectivo". Esto **NO es ni gasto ni ingreso** (la plata total no cambia, solo se mueve de lugar).

**3.1 ¿De acuerdo en que las transferencias NO cuenten como gasto ni ingreso en los totales?** (es lo correcto contablemente)
- [X  ] Sí, correcto
- [ ] No, quiero que cuente de otra forma (explica)

➡️

**3.2 ¿La transferencia la imaginas como un tercer botón/opción junto a Gasto e Ingreso, con su propio color (ej: azul/morado pastel)?**

➡️ SI QUE SEAN LAS 3 OPCIONES INGRES GASTO O TRASNFERENCIA

---

## 4. Categorías: la base que sembramos 🏷️

> Ella las edita/borra/crea, pero arrancamos con una base linda para que no empiece de cero. Y cada categoría tendría su **emoji + color**.

**4.1 ¿Apruebas que cada categoría tenga su emoji y color automático?** (ej: 🍔 Comida, 🐾 Mascotas, 💅 Belleza)

➡️ SI AUNQUE PREFIERO QUE ELLA LAS CREE O QUE PAREZCA QUE ELLA LAS CREO NO LAS QUIERO EN EL CODIGO SI NO EN FIREBASE JUNTO CON LAS QUE ELLA CREE PARA QUE NO SE DIFERENCIEN Y TODO SE MANEJE POR ORDEN ALFABETICO

**4.2 Dime la BASE de categorías de GASTO con la que quieres que arranque** (las que quieras; ella luego ajusta). Si no, marco mi sugerencia:
- [ ] Comida 🍔 · Mercado 🛒 · Antojos 🍰 · Mascotas 🐾 · Belleza 💅 · Ropa 👗 · Transporte 🚕 · Arriendo/Servicios 🏠 · Salud 💊 · Gustos personales 🎁 · Otros ✨ ⭐

➡️ (o escribe tu propia lista)

**4.3 Base de categorías de INGRESO:**
- [ ] Webcam 💻 · Tatuajes 🖋️ · Propinas/Regalos 🎀 · Otros ✨ ⭐

➡️ SI PUES IGUAL COMO LAS PUEDE ELLA ELIMINAR SI NO LE GUSTAN ESAS ESTAN BIEN

---

## 5. El historial y "devolverse en el tiempo" ⏪

> Esto que pediste (guardar el saldo en que quedó la cuenta tras cada movimiento) es clave. Quiero entender bien cómo lo quieres usar.

**5.1 ¿Quieres poder EDITAR o BORRAR un movimiento ya hecho (ej: te equivocaste en el monto), y que la app recalcule los saldos solita?**
- [ X ] Sí, poder editar y borrar, que recalcule todo ⭐
- [ ] Solo borrar, no editar
- [ ] Que no se pueda tocar nada una vez guardado

➡️

**5.2 ¿Te imaginas una pantalla de "historial" donde ve todos los movimientos en orden (con su fecha, hora y saldo resultante), y pueda filtrar?** ¿Filtrar por qué? (cuenta, categoría, mes, tipo…)

➡️SI SI LA QUIERO HISTORIAL DE MOVIMIENTOS PERO CUIDADO CON LOS LLAMADOS A FIREBASE ESO TENLO PRESENTE EN TODA LA APP NO QUIERO DERROCHES YA CUANDO LLEVE MESES HACIENDO MOVIMIENTOS 

---

## 6. La navegación (la barra de abajo) 🧭

> Dijiste: botón "+" animado en el centro de la barra inferior. Necesito definir las demás pestañas. Te propongo 4 + el botón central:

```
[ 🏠 Inicio ]  [ 📜 Movimientos ]  ( ➕ )  [ 💳 Cuentas ]  [ ⚙️ Ajustes ]
```

**6.1 ¿Te sirve esa barra? ¿Quitarías o cambiarías alguna pestaña?**
- [ ] Me sirve tal cual ⭐
- [ ] Cambiaría algo:

➡️ LA DE CUENTAS QUE LLEVARIA??

**6.2 El "+" central, al tocarlo, ¿abre una pantalla/hoja para elegir Gasto / Ingreso / Transferencia?**
- [ X ] Sí, que pregunte primero qué tipo es
- [ ] Prefiero que abra directo en "Gasto" (lo más común) y ahí cambie a ingreso/transferencia
- [ ] Decide tú ⭐

➡️

---

## 7. La pantalla de Inicio 🏠

> Marcaste: saldo total + gatito + botón de registrar. Afinemos.

**7.1 El saldo total, ¿quieres un "ojito" para ocultarlo/mostrarlo?** (privacidad, por si alguien le ve la pantalla)
- [X  ] Sí, con ojito para ocultar ⭐
- [ ] No hace falta

➡️

**7.2 Además del saldo total y el gato, ¿qué más te gustaría ver en Inicio SIN saturar?** (marca máx 2)
- [ ] Mini-resumen del mes (ganado vs gastado)
- [ X ] Últimos 3-4 movimientos
- [ ] Acceso rápido a sus cuentas
- [X  ] Nada más, bien limpio ⭐
- [ ] Otra:

➡️

---

## 8. El tono y los textos 💬

> La app le va a "hablar". Quiero que suene a ella.

**8.1 ¿Cómo le habla la app?**
- [X  ] De tú, cariñoso y cercano (ej: "¡Hola Day! 🌸") ⭐
- [ ] Neutro y elegante (ej: "Buen día")
- [ ] Otra:

➡️

**8.2 ¿La llamamos "Dayana", "Day", un apodo, o que ella lo configure?**

➡️DAHIA

**8.3 Formato de la plata:** en Colombia normalmente `$1.250.000` (puntos de miles, sin decimales). ¿Así?
- [ ] Sí, `$1.250.000` sin decimales ⭐
- [ ] Con centavos
- [ ] Otra:

➡️ CON DECIMALES SIEMPRE DOS $1.250.000,00 LOS DECIMALES PUEDEN IR MAS PEQUEÑOS PARA QUE NO SATUREN LA VISTA

---

## 9. Modo oscuro 🌙

**9.1 El "modo oscuro rosadito" que marcaste, ¿lo quieres desde la versión 1, o lo dejamos para después?**
- [ X ] Desde la v1 (diseñamos claro y oscuro a la vez)
- [ ] Después, primero el claro ⭐
- [ ] Decide tú

➡️ NO QUIERO VERSIONES NI DEMOS NI COSAS PARA PROBAR TIENES QUE IR PROBANDO TODO DESDE CODIGO Y YA QUIERO LA VERSION FINAL COMPLETA, TAMBIEN ANTES DE INICIAR YA CON CODIGO QUIERO TENER LAS CUENTAS LISTAS LA DE FIREBASE LA DE GITHUB Y LA DE VERCEL TOCA QUE ME AYUDES

---

## 10. Primera vez que entra (onboarding) 👋

**10.1 La primera vez que Dayana abre la app (tras entrar con Google), ¿qué debería pasar?**
- [ X ] Un saludo lindo del gato + ayudarla a crear sus primeras cuentas y saldos ⭐
- [ ] Entrar directo y que ella explore sola
- [ ] Decide tú

➡️

---

### ✅ Cuando termines
Guarda y avísame. Con esto cierro la definición de la **fase 1** y el siguiente paso es **mostrarte el diseño** (paleta exacta de rosados + cristal, y bocetos de las pantallas principales) para que lo apruebes con los ojos antes de que yo programe nada. 🌸
