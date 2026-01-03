// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9dd8ieISidxXX_1Mj9LBo2G4GedXatsI",
  authDomain: "ascend-habits-efcf5.firebaseapp.com",
  projectId: "ascend-habits-efcf5",
  storageBucket: "ascend-habits-efcf5.firebasestorage.app",
  messagingSenderId: "818175340174",
  appId: "1:818175340174:web:3cd9e2791a5a293fa723df",
  measurementId: "G-NW63CTMXVK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);