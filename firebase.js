// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADt9cpTEPpGGwiUmW-jpTxjocQqqMv8R8",
  authDomain: "pokemon-showdown-api-storage.firebaseapp.com",
  databaseURL: "https://pokemon-showdown-api-storage-default-rtdb.firebaseio.com",
  projectId: "pokemon-showdown-api-storage",
  storageBucket: "pokemon-showdown-api-storage.firebasestorage.app",
  messagingSenderId: "1021843952884",
  appId: "1:1021843952884:web:b8098288aca5b613ae7aa1",
  measurementId: "G-RX4CLYD1B2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);