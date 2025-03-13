// Importar las funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCyldi4fvwcQUwTTvRJ_OgnVEUV9cSuLcw",
  authDomain: "ecotecnologias-b04a9.firebaseapp.com",
  projectId: "ecotecnologias-b04a9",
  storageBucket: "ecotecnologias-b04a9.appspot.com",  // ✅ Corregido
  messagingSenderId: "172438962595",
  appId: "1:172438962595:web:da9e125d089216bdf01a16"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
const db = getFirestore(app);    // Base de datos Firestore
const auth = getAuth(app);       // Autenticación
const storage = getStorage(app); // Almacenamiento de archivos

// Exportar las instancias para usarlas en otros archivos
export { app, db, auth, storage };
