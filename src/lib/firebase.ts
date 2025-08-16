// firebase.js
import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmM8KBdpgFcvXmf8N8ldswgz_DIu6iJAs",
  authDomain: "blossomhabits-288e0.firebaseapp.com",
  projectId: "blossomhabits-288e0",
  storageBucket: "blossomhabits-288e0.appspot.com",
  messagingSenderId: "97415913932",
  appId: "1:97415913932:web:e95c85a9b42466e2273d69",
  measurementId: "G-0DE8CG4XNS"
};

const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export { db };