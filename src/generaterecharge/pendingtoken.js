import React, { useState, useEffect, useRef } from 'react';

import firebase from 'firebase/compat/app'; // Import the Firebase app (latest version)
import 'firebase/compat/database'; // Import the Realtime Database (latest version)
import 'firebase/compat/firestore'; // Import Firestore
import CryptoJS from 'crypto-js';
import { ref, set, get, child, getDatabase, onValue } from 'firebase/database';


class Pendingtoken {

  constructor() {

  }


  // callCloudFunction = async (path) => {
  //   try {
  //     // Call the cloud function
  //     const readRtdb = firebase.functions().httpsCallable('readRtdb');
  //     // Provide any data required by the cloud function (if needed)
  //     const response = await readRtdb({ dbRef: path });
  //     // Handle the response
  //     ///   console.log('fetch data from  firebase ',response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error calling cloud function:', error);
  //     alert(`'Error calling cloud function:', ${error}`);
  //     return;
  //   }
  // };


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
      console.error('Error fetching Firebase server time:', error);
      return null;
    }
  };


  async fetchLastReachergeTime(srNumber) {
    const db = getDatabase(); // Assuming getDatabase is defined elsewhere
    const adminRootReference = ref(db, `adminRootReference/meterDetails/${srNumber}/rechargeToken`);
    const path = adminRootReference.toString();
    const data = await this.callCloudFunction(path);
    const parsedData = JSON.parse(data);
    const keys = Object.keys(parsedData);
    // Exclude keys "time" and "tokenCount" from consideration
    const filteredKeys = keys.filter(key => key !== 'time' && key !== 'tokenCount');
    // Get the last key from the filtered keys array
    const lastKey = filteredKeys[filteredKeys.length - 1];

    // console.log('RechargeAmount :',parsedData[lastKey].rechargeAmount);
    // Print the last key
    const trimmedKey = lastKey.split("-")[0];
    /// console.log('last TimeStamp :' , trimmedKey);
    const lastTimestamp = parseInt(trimmedKey);
    const currentTimestamp = await this.fireabseServerTimestamp();
  

    const differenceInSeconds = (currentTimestamp - lastTimestamp) / 1000;

   
    const within1Minut = differenceInSeconds <= 60;


    // if (differenceInSeconds < 60) {
    //   console.log("You are within one minute.");
    // } else {
    //   console.log("You are out of one minute.");
    // }

    // Calculate the difference in milliseconds
    const difference = currentTimestamp - lastTimestamp;
    // Convert milliseconds to hours
    const hoursDifference = difference / (1000 * 60 * 60);
    // Check if within 24 hours

   const within24Hours = hoursDifference <= 24;

    return {
      rechargeAmount: parsedData[lastKey].rechargeAmount,
      tariffRate: parsedData[lastKey].tariffRate,
      tokenGenerationTime: parsedData[lastKey].tokenGenerationTime,
      within24Hours: within24Hours,
      within1Minut: within1Minut,
     
    };

    // if (hoursDifference <= 24) {
    //     console.log('Last recharge within 24 hours.');

    // } else {
    //     console.log('Last recharge is more than 24 hours ago.');   
    // }

  }

  async viewPedingToken(srNumber) {
    try {
      const snapshot = await firebase.database().ref(`/adminRootReference/meterDetails/${srNumber}/rechargeRequestToken`).once('value');
      const fetchedMeterList = snapshot.val();

      if (!fetchedMeterList || !fetchedMeterList.isUsed) {
        //  console.log("isUsed value not found or invalid");
        return null; // or handle the case where isUsed value is missing or invalid
      }

      //  console.log(fetchedMeterList);
      //  console.log('check isUsed Valeus', fetchedMeterList.isUsed);
      //  console.log('check request Links', fetchedMeterList.requestLink);
      const isUsedValeu = fetchedMeterList.isUsed;
      const token = fetchedMeterList.requestLink;
      if (isUsedValeu == 'false') {
        //    console.log('Pending Token ');
        return this.generateToken(token);
        // return  this.generateToken(token);
      }
      else {

        //console.log("No pending Token ");
        return null;
      }
      // this.decryptDataOfRequest(token); 

      // return fetchedMeterList;

    } catch (error) {
      console.log(error);
      return null; // Return null when there's an error
    }

  }

  decryptDataOfRequest = (token) => {
    //   console.log("my Token: " + token);
    const ciphertext = CryptoJS.enc.Hex.parse(token);
    const key = CryptoJS.enc.Hex.parse('6D783230313139390000000000000000');
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }
    );

    const decryptedHex = decrypted.toString(CryptoJS.enc.Hex);

    const hexToSignedInt = (hex) => {
      const value = parseInt(hex, 16);
      const maxInt = Math.pow(2, hex.length * 4 - 1);
      return value > maxInt ? value - maxInt * 2 : value;
    };

    const decryptedData = {
      srNo: parseInt(decryptedHex.substring(0, 6).toLowerCase(), 16).toString(),
      balance: (hexToSignedInt(decryptedHex.substring(6, 14).toLowerCase(), 16) / 100.0).toString(),
      kWh: (parseInt(decryptedHex.substring(14, 22).toLowerCase(), 16) / 100.0).toString(),
      amount: parseInt(decryptedHex.substring(22, 30).toLowerCase(), 16).toString(),
      // timeOfToken : parseInt(decryptedHex.substring(30, 42).toLowerCase(), 16).toString(),
      timeOfToken: convertTimestampToTime(parseInt(decryptedHex.substring(30, 42).toLowerCase(), 16)),

      timestamp: token.substring(64),

    };



    return decryptedData;

    function convertTimestampToTime(timestamp) {
      const date = new Date(timestamp);

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(2);

      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = '00';

      return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
      //  return date.toLocaleString(); // Adjust the format as per your requirement
    }

  }

  async generateToken(token) {
    const decryptedData = this.decryptDataOfRequest(this.getToken(token));
    // console.log('dddd', decryptedData);

    const srNo = decryptedData['srNo'];
    const amount = decryptedData['amount'];
    const kWh = decryptedData['kWh'];
    const balance = decryptedData['balance'];
    const paymentMode = this.getPaymentMode(token); // Get paymentMode from token

    // console.log('encrypted Data ', srNo, amount, kWh, balance);

    return {
      decryptedData: decryptedData,
      srNo: srNo,
      amount: amount,
      kWh: kWh,
      balance: balance,
      paymentMode: paymentMode,
    };
  }

  getToken = (link) => {
    const parsedURL = new URL(link);
    // console.log("Check Link URL: " + parsedURL);
    const tokenAndPaymentMode = parsedURL.pathname.split('/').pop();
    const token = tokenAndPaymentMode.substring(0, 64);
    return token;
  }
  // this function is used to get paymentmode from link
  getPaymentMode = (link) => {
    const parsedURL = new URL(link);
    const tokenAndPaymentMode = parsedURL.pathname.split('/').pop();
    const paymentMode = tokenAndPaymentMode.substring(64);
    return paymentMode;

  }

}

export default Pendingtoken