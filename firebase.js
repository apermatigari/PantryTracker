import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
 apiKey: "AIzaSyBh0M8UFSarIVfwxLpNyFv4YOkp-TZg3_A",
 authDomain: "pantrytracker-ba01f.firebaseapp.com",
 projectId: "pantrytracker-ba01f",
 storageBucket: "pantrytracker-ba01f.appspot.com",
 messagingSenderId: "719856500155",
 appId: "1:719856500155:web:39dad1d7ad7e7e73b7989e"
 };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };