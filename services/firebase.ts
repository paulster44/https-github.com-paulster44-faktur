
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOn1R510aCPrdJ7m6CfIjwFzG3742bigg",
  authDomain: "gen-lang-client-0127201789.firebaseapp.com",
  projectId: "gen-lang-client-0127201789",
  storageBucket: "gen-lang-client-0127201789.firebasestorage.app",
  messagingSenderId: "269791574917",
  appId: "1:269791574917:web:f7761d949e92b04db2e2ec",
  measurementId: "G-WX5PV8FV4M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
