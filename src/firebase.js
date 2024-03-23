// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app"; // Use "compat" to maintain backward compatibility
import 'firebase/compat/database'; // Use "compat" for the Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {


  // apiKey: "AIzaSyB-BQNkiB40FZgsDlebchUiliDYtq6-nHo",
  // authDomain: "reacttesting-87b98.firebaseapp.com",
  // databaseURL: "https://reacttesting-87b98-default-rtdb.firebaseio.com",
  // projectId: "reacttesting-87b98",
  // storageBucket: "reacttesting-87b98.appspot.com",
  // messagingSenderId: "886469759672",
  // appId: "1:886469759672:web:3288b2d981bdf5fdc85a4d"

  
  apiKey: "AIzaSyA-V6fIpm5Jff8p-pN3vf67nTBBa-gJdJU",
  authDomain: "mij-prepaid-meter.firebaseapp.com",
  databaseURL: "https://mij-prepaid-meter-default-rtdb.firebaseio.com",
  projectId: "mij-prepaid-meter",
  storageBucket: "mij-prepaid-meter.appspot.com",
  messagingSenderId: "288843518536",
  appId: "1:288843518536:web:3be929c9b42871b366fe7d",
  measurementId: "G-9THQD38NGC"



};

// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);
const database = firebaseApp.database();

export { database, firebaseApp }; // Export the database and the firebaseApp object if needed
export default firebase; // Export the firebase object if needed


























































// // Import the functions you need from the SDKs you need
// import firebase from "firebase/app";
// import 'firebase/database';

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {

//     apiKey: "AIzaSyB-BQNkiB40FZgsDlebchUiliDYtq6-nHo",
//     authDomain: "reacttesting-87b98.firebaseapp.com",
//     databaseURL: "https://reacttesting-87b98-default-rtdb.firebaseio.com",
//     projectId: "reacttesting-87b98",
//     storageBucket: "reacttesting-87b98.appspot.com",
//     messagingSenderId: "886469759672",
//     appId: "1:886469759672:web:3288b2d981bdf5fdc85a4d"




// //   apiKey: "AIzaSyA-V6fIpm5Jff8p-pN3vf67nTBBa-gJdJU",
// // authDomain: "mij-prepaid-meter.firebaseapp.com",
// // databaseURL: "https://mij-prepaid-meter-default-rtdb.firebaseio.com",
// // projectId: "mij-prepaid-meter",
// // storageBucket: "mij-prepaid-meter.appspot.com",
// // messagingSenderId: "288843518536",
// // appId: "1:288843518536:web:3be929c9b42871b366fe7d",
// // measurementId: "G-9THQD38NGC"


// };

// // Initialize Firebase

// firebase.initializeApp(firebaseConfig);
// export const database = firebase.database();
// export default firebase
// // const app = initializeApp(firebaseConfig);

// // export const dataref = firebase.database();


// // export default firebase