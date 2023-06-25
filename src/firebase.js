import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDgjowl4xQYVMWDZwfD66sell6ImR7q1A0",
  authDomain: "webchatapp-d92eb.firebaseapp.com",
  projectId: "webchatapp-d92eb",
  storageBucket: "webchatapp-d92eb.appspot.com",
  messagingSenderId: "1080376292845",
  appId: "1:1080376292845:web:cac5ffb731df4e4141e3e4",
  measurementId: "G-N2J2V71HDY",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export const uploadPictureFirebase = async (photoURL, user, fileDirectory) => {
  try {
    const storageRef = firebaseApp.storage().ref();
    const fileRef = storageRef.child(
      `images/USER_ID_${user.uid}/${fileDirectory}/${fileDirectory}_${user.uid}_image.png`
    );
    await fileRef.put(photoURL);
    const downloadURL = await fileRef.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.alert(error);
    return null;
  }
};

export { db, auth, storage, firebaseApp };
