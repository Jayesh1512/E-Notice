// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

const firebaseConfig = {
    apiKey: "AIzaSyDU_DR9KlADiOQ6k-5Me89v2wEMLmLdNWk",
    authDomain: "enotice-4d7c2.firebaseapp.com",
    databaseURL: "https://enotice-4d7c2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "enotice-4d7c2",
    storageBucket: "enotice-4d7c2.appspot.com",
    messagingSenderId: "1028387194917",
    appId: "1:1028387194917:web:20148065e7b8f96a2417cc"
  };


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app); // Initialize storage

export { auth, database, storage }; // Export storage along with auth and database
