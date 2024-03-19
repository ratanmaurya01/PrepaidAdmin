import React, { useState } from 'react';  
// Importing the Realtime Database instance
import firebase from 'firebase/compat/app'; // Import the Firebase app
import 'firebase/compat/firestore'; // Import Firestore
import CryptoJS from 'crypto-js';
import { database } from './firebase';
import { ref, set, get, child, getDatabase, onValue } from 'firebase/database';


let counter = 0;
let ltime = 0;

 

class CommonFuctions {
  constructor() {

  }


  // this function is used for checking is there any memter serial exist in group 

  isAnyMeterExist(path) {
    return path.once('value')
      .then(snapshot => {
        let childCount = 0;

        snapshot.forEach(childSnapshot => {
          const childKey = childSnapshot.key;

          // Exclude the child with the name "tariff"
          if (childKey !== 'tariff') {
            childCount++;
          }
        });

        console.log('Number of children (excluding "tariff"): ', childCount);

        return childCount;
      })
      .catch(error => {
        console.error('Error fetching data:', error);

        return -1;
      });


  }

  // this function is use to delete data from firebase  

  deleteFirebaseReference(path) {

    return path.once('value')
      .then(snapshot => {
        // Check if groupName has no children
        if (!snapshot.exists() || !snapshot.hasChildren()) {
          // Remove the groupName node
          return path.remove();
        } else {
          // groupName has children, do something else or log a message
          console.log('has children, not removed');
          return Promise.resolve(); // Resolve the promise without removing
        }
      })
      .then(() => {
        console.log('Removed');
      })
      .catch(error => {
        console.error('Error:', error);
        return Promise.reject(error);
      });
  }

  /// Call function from firebase to read data from firebase function........... 

  callCloudFunction = async (path) => {
    try {
      // Call the cloud function
      const readRtdb = firebase.functions().httpsCallable('readRtdb');
      // Provide any data required by the cloud function (if needed)
      const response = await readRtdb({ dbRef: path });
      // Handle the response
      ///   console.log('fetch data from  firebase ',response.data);
      return response.data;
    } catch (error) {
    
     // console.error('Error calling cloud function: when call session data', error);
      throw  error;
    }
  };

  
  // Read data from firebase function (fetch data from firebase function)

  // callCloudFunction = async (path) => {
  //   try {
  //     // Call the cloud function
  //     const readRtdb = firebase.functions().httpsCallable('readRtdb');
  //     // Provide any data required by the cloud function (if needed)
  //     const responsePromise = readRtdb({ dbRef: path });
  //     // Create a promise that rejects after 5 seconds
  //     const timeoutPromise = new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         reject(new Error('Timeout'));
  //       }, 5000); // 5000 milliseconds = 5 seconds
  //     });
  //     // Race between the response promise and the timeout promise
  //     const response = await Promise.race([responsePromise, timeoutPromise]);
  //     // Handle the response
  //    // console.log('fetch data from  firebase for seesion id ', response.data);
  //     return response.data;
  //   } catch (error) {

  //     console.error('Unable to connect server .S please retry . :',
  //       error);
  //     return error;
  //   }
  // };



  callWriteRtdbFunction = async (data) => {
    try {
      const writeRtdb = firebase.functions().httpsCallable('writeRtdb');
      const response = await writeRtdb(data);
      //  console.log('session data', response.data);
      // alert(' Data updated successfully! ');
      // Return the response data if needed
      return response.data;
    } catch (error) {
      
      //return error;
      
     throw error;
    }
  };

  // callWriteRtdbFunction = async (data) => {
  //   try {
  //     // Initialize the callable function
  //     const writeRtdb = firebase.functions().httpsCallable('writeRtdb');
  //     // Promise that resolves after 5 seconds
  //     const timeoutPromise = new Promise((resolve, reject) => {
  //       setTimeout(() => {
  //         reject(new Error('Timeout'));
  //       }, 5000); // 5 seconds
  //     });
  //     // Call the function with the provided data
  //     const response = await Promise.race([writeRtdb(data), timeoutPromise]);
  //     // Log the response from the cloud function
  //     //   console.log(response.data);
  //     //   console.log('Data updated successfully!');

  //     return response.data;
  //   } catch (error) {
  //     console.error('Error calling writeRtdb function:', error);
  //     if (error.message === 'Timeout') {

  //       console.error('Transaction complete :::::', error);
  //     } else {
  //       // Handle other errors
  //       console.error(` Poor internet connection! Please retry3. ${error}`);
  //       throw error;
  //     }
  //   }
  // }


  async HandleValidatSessiontime(adminPhoneNumber) {
   // console.log('function call ');
    try{
    const db = getDatabase(); // Assuming getDatabase is defined elsewhere
    // Session validation process
    const adminRootReference = ref(db, `adminRootReference/adminDetails/${adminPhoneNumber}/sessionData`);
  
      const adminProfilePath = `adminRootReference/adminDetails/${adminPhoneNumber}/sessionData`;
      const fullAdminProfilePath = `https://mij-prepaid-meter-default-rtdb.firebaseio.com/${adminProfilePath}`;
      const path = fullAdminProfilePath.toString();
      const data = await this.callCloudFunction(path);
      const parsedData = JSON.parse(data);
      //  console.log('Last active time ',data.lastActive);
      return { lastActive: parsedData.lastActive, sessionId: parsedData.sessionId }; // Return the lastActive and sessionId values as an object
    }
    catch (error) {
       //  console.error('response s ', error);
     // return error; // Return the error instead of throwing it
      throw error;
    }
  }

  // async  HandleValidatSessiontime(adminPhoneNumber) {
  //   const db = getDatabase(); // Assuming getDatabase is defined elsewhere
  //   const adminRootReference = ref(db, `adminRootReference/adminDetails/${adminPhoneNumber}/sessionData`);
  //   // Assuming onValue and ref are functions provided by Firebase Realtime Database
  //   try {
  //     const snapshot = await get(adminRootReference); // Wait for the data snapshot
  //     const data = snapshot.val(); // Get the value from the snapshot
  //     // Do something with data 
  //   //  console.log('Last active time ',data.lastActive);
  //   return {lastActive: data.lastActive, sessionId: data.sessionId}; // Return the lastActive and sessionId values as an object


  //   } catch (error) {
  //     // Handle error
  //     console.error(error);
  //     throw error; // Rethrow the error

  //   }
  // }


  async updateSessionTimeInLogIn(PhoneNumber) {
    const db = getDatabase(); // Assuming getDatabase is defined elsewhere
    const adminRootReference = ref(db, `adminRootReference/adminDetails/${PhoneNumber}/sessionData`);
    const serverTimestamp = await this.fireabseServerTimestamp();
    const path = adminRootReference.toString();
    const data = await this.callCloudFunction(path);
    const parsedData = JSON.parse(data);
    //  console.log('sessio time ', parsedData);
    const newData = {
      lastActive: serverTimestamp.toString(),
      sessionId: serverTimestamp.toString(),
      time: parsedData.time,
    };
    const dataToSend = {
      [path]: newData // Wrap your data in an object with the appropriate path key
    };

    const result = await this.callWriteRtdbFunction(dataToSend);
    // console.log("logg in session id update :", result);

    return serverTimestamp;


    // try {
    //   //  const currentTime = Date.now();
    //     const snapshot = await get(adminRootReference);
    //     const existingSessionData = snapshot.val();
    //     if (existingSessionData) { // Check if sessionData exists
    //         // Update the `lastActive` field in the existing sessionData
    //         await set(adminRootReference, {
    //             ...existingSessionData,
    //             lastActive: serverTimestamp.toString(),
    //             sessionId: serverTimestamp.toString(),
    //         });
    //       //  console.log("Last Active time updated: ", serverTimestamp);
    //         return serverTimestamp; // Return updated time
    //     } else {
    //      //   console.log("Session data not found for phone number: ", PhoneNumber);
    //         return null; // Return null if session data not found
    //     }
    // } catch (error) {
    //     console.error(error);
    //     throw error; // Rethrow the error
    // }
  }


  async updateSessionTimeActiveUser(PhoneNumber) {
    try{
    const db = getDatabase(); // Assuming getDatabase is defined elsewhere
    const adminRootReference = ref(db, `adminRootReference/adminDetails/${PhoneNumber}/sessionData`);
    const serverTimestamp = await this.fireabseServerTimestamp();
    const path = adminRootReference.toString();
    const data = await this.callCloudFunction(path);
    const parsedData = JSON.parse(data);
    //  console.log('sessio time ', parsedData);
    const newData = {
      lastActive: serverTimestamp.toString(),
      sessionId: parsedData.sessionId,
      time: serverTimestamp.toString(),
    };
    const dataToSend = {
      [path]: newData // Wrap your data in an object with the appropriate path key
    }; 
    await this.callWriteRtdbFunction(dataToSend);
  }
  catch (error) {
  //  console.error("Error in Session id update or not ", error);
     // Handle the error further if needed
    return error;
  }



  }





    // const serverTimestamp = await this.fireabseServerTimestamp(); 



    // try {
    //   //  const currentTime = Date.now();
    //     const snapshot = await get(adminRootReference);
    //     const existingSessionData = snapshot.val();
    //     if (existingSessionData) { // Check if sessionData exists
    //         // Update the `lastActive` field in the existing sessionData
    //         await set(adminRootReference, {
    //             ...existingSessionData,
    //             lastActive: serverTimestamp.toString(),
    //             time: serverTimestamp.toString(),
    //         });
    //      //   console.log("Last Active time updated: ", serverTimestamp);
    //         return serverTimestamp; // Return updated time
    //     } else {
    //       //  console.log("Session data not found for phone number: ", PhoneNumber);
    //         return null; // Return null if session data not found
    //     }
    // } catch (error) {
    //     console.error(error);
    //     throw error; // Rethrow the error
    // }
  




  fireabseServerTimestamp = async () => {
    try {
      const timestampRef = firebase.database().ref('.info/serverTimeOffset');
      const snapshot = await timestampRef.once('value');
      const serverTimeOffset = snapshot.val() || 0; // Get the offset value, or default to 0
      // Calculate the current server timestamp by adding the offset to the local timestamp
      const serverTimestamp = Date.now() + serverTimeOffset;

      // console.log('Firebase Server Timestamp:', serverTimestamp);
      return serverTimestamp; // Return the server timestamp if needed
    } catch (error) {
      //  console.error('Error fetching Firebase server time:', error);

      return null;
    }
  };



  isCheckInterNet = () => {
    return navigator.onLine;
  }



  // utils/internetChecker.js
  //     checkInternetConnection = async () => {
  //   try {
  //     // Simulate a request to check internet connectivity
  //     const response = await fetch('https://www.google.com', { mode: 'no-cors' });
  //     if (!response.ok) {
  //       return 'no-internet';
  //     } else {
  //       const startTime = new Date().getTime();
  //       await fetch('https://www.google.com', { mode: 'no-cors' });
  //       const endTime = new Date().getTime();
  //       const latency = endTime - startTime;

  //       if (latency > 3000) {
  //         return 'poor-internet';
  //       } else {
  //         return 'internet-available';
  //       }
  //     }
  //   } catch (error) {
  //     return 'no-internet';
  //   }
  // };

  checkInternetConnection = async () => {
    let responseReceived = false;
    try {
      if (!navigator.onLine) {
        //  console.log('No internet connection.');
        return 'No internet connection.';
      }
      //  console.log('Checking internet connection...');
      const response = await Promise.race([
        fetch('https://www.google.com', { mode: 'no-cors' }),
        new Promise(resolve => setTimeout(resolve, 5000)) // Timeout after 5 seconds
      ]);
      if (!response.ok) {
        // console.log('No internet connection.');
        return 'No internet connection.';
      } else {
        // console.log('Internet is available');
        responseReceived = true;
        return 'Internet is available';
      }
    } catch (error) {
      // console.error('Error occurred while checking internet connection:', error.message);
      if (!responseReceived) {
        //  console.log('No/Poor Internet connection , Please retry.'); // If no response is received within 5 seconds
        return 'Poor connection.';
      }
      return 'No internet connection....';
    }
  };









}

export default CommonFuctions;