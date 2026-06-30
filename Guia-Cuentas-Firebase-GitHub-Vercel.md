# 🔑 Guía: crear las 3 cuentas (Firebase · GitHub · Vercel)

> **Objetivo:** dejar listo el "esqueleto en la nube" ANTES de programar. Son 3 servicios **gratis**. Te guío clic por clic. Hazlo con calma y, cuando termines cada bloque, marca el `[ ]` y avísame.
>
> 💡 **Usa el mismo correo de Google en los 3** (te sugiero `sinfiniity@gmail.com`) para que todo quede conectado y fácil.
>
> 🔒 **Seguridad:** la "config de Firebase" que te pediré al final NO es secreta (va en el código del navegador), así que me la puedes pasar sin problema. Lo que **nunca** se comparte son contraseñas ni códigos de verificación.

---

## 🟣 BLOQUE 1 — GitHub (donde vive el código)

GitHub guarda el código y lo conecta con Vercel para publicar la app.

- [ ] **1.1** Entra a 👉 https://github.com/signup
- [ ] **1.2** Regístrate con tu correo, crea un usuario y contraseña. Verifica el correo.
- [ ] **1.3** (Opcional ahora) Crear el repositorio: arriba a la derecha **"+" → New repository**.
  - **Name:** `dahia-app`
  - **Visibility:** **Private** (privado) 🔒
  - **NO** marques "Add a README" (lo dejamos vacío).
  - Botón **Create repository**.

➡️ **Cuando termines, dime tu usuario de GitHub.** *(Si te enredas con el repo, no importa: lo creamos juntos cuando haya código.)*

---https://github.com/dayanaceballosu-pixel/Dahia-App.git

## 🟠 BLOQUE 2 — Firebase (la base de datos + el login con Google)

Aquí viven los datos de Dahia y el inicio de sesión. Es lo **más importante** de esta guía.

### 2.1 Crear el proyecto
- [ ] Entra a 👉 https://console.firebase.google.com e inicia sesión con tu Google.
- [ ] Clic en **"Crear un proyecto"** (Add project).
- [ ] Nombre del proyecto: **`dahia-app`**. Continuar.
- [ ] Te preguntará por **Google Analytics**: puedes **desactivarlo** (no lo necesitamos). Crear proyecto. Espera a que cargue y dale **Continuar**.



### 2.2 Registrar la app web
- [ ] En la pantalla principal del proyecto, clic en el ícono **`</>`** (Web).
- [ ] Apodo de la app: **`Dahia App`**.
- [ ] **NO** marques "Firebase Hosting" (usaremos Vercel). Clic en **Registrar app**.
- [ ] Te mostrará un bloque de código con `const firebaseConfig = { ... }`. **⭐ Eso es lo que necesito.** Cópialo y guárdalo (o me lo pasas al final).

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBv0lJE4Lfx9Loql4bU5Y0xYMVYkDfil4w",
  authDomain: "dahia-app.firebaseapp.com",
  projectId: "dahia-app",
  storageBucket: "dahia-app.firebasestorage.app",
  messagingSenderId: "990861850151",
  appId: "1:990861850151:web:9994f728fcf355dbe1c002"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

### 2.3 Activar el login con Google
- [ ] Menú izquierdo → **Compilación (Build) → Authentication**.
- [ ] Botón **"Comenzar" (Get started)**.
- [ ] En la pestaña **Sign-in method**, elige **Google** → actívalo (Enable).
- [ ] Te pedirá un **correo de soporte**: elige tu Gmail. **Guardar**.

LISTO

### 2.4 Crear la base de datos (Firestore)
- [ ] Menú izquierdo → **Compilación (Build) → Firestore Database**.
- [ ] Botón **"Crear base de datos" (Create database)**.
- [ ] Elige **modo de producción** (Production mode). Siguiente.
- [ ] **Ubicación:** elige una cercana, por ejemplo **`us-east1`** o **`southamerica-east1`**. Habilitar.
  - *(No te preocupes por las "reglas de seguridad" ahora; yo las configuro luego con una de mis herramientas.)*

➡️ **Cuando termines este bloque, pásame el `firebaseConfig`** (el bloque de `apiKey`, `authDomain`, etc.).

---rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

## ⚫ BLOQUE 3 — Vercel (para publicar la app en internet)

Vercel toma el código de GitHub y lo pone online con un link, gratis.

- [ ] Entra a 👉 https://vercel.com/signup
- [ ] Elige **"Continue with GitHub"** (así quedan conectados solitos).
- [ ] Autoriza a Vercel a acceder a tu GitHub.
- [ ] Cuando te pregunte por un equipo/plan, elige el **Hobby (gratis)**.

➡️ Con esto basta por ahora. **La parte de "importar el repo y desplegar" la haremos juntos cuando ya tengamos el código** (tengo una herramienta que me ayuda con eso).

---Ni puedo porque no hay nada en main aun 

## ✅ Checklist final (para avisarme)

Cuando termines, mándame:
1. [ ] Tu **usuario de GitHub**.
2. [ ] El **`firebaseConfig`** de Firebase (el bloque de `apiKey`...).
3. [ ] Confirmación de que **Authentication con Google** quedó activado.
4. [ ] Confirmación de que **Firestore** quedó creado.
5. [ ] Confirmación de que entraste a **Vercel** con GitHub.

> Con eso, monto el proyecto y arrancamos a programar la versión final. 🌸
>
> **¿Te trabaste en algún paso?** Dime en cuál y te ayudo (o si prefieres, vamos haciéndolo en vivo, paso por paso, y tú me dices qué ves en pantalla).
