import React, { useState, useEffect, useRef } from 'react';

import firebase from 'firebase/compat/app'; // Import the Firebase app (latest version)
import 'firebase/compat/database'; // Import the Realtime Database (latest version)
import 'firebase/compat/firestore'; // Import Firestore
import CryptoJS from 'crypto-js';

class Pendingtoken{

    constructor(){

    }



  async  viewPedingToken(srNumber){
        try {
            const snapshot = await firebase.database().ref(`/adminRootReference/meterDetails/${srNumber}/rechargeRequestToken`).once('value');
            const fetchedMeterList = snapshot.val();
          //  console.log(fetchedMeterList);
           //  console.log('check isUsed Valeus', fetchedMeterList.isUsed);
           //  console.log('check request Links', fetchedMeterList.requestLink);
              const isUsedValeu =  fetchedMeterList.isUsed; 
              const token =  fetchedMeterList.requestLink;

              if (isUsedValeu == 'false'){
             //    console.log('Pending Token ');
                return  this.generateToken(token);
                
               // return  this.generateToken(token);
              }

              else{

                  console.log("No pending Token ");
                  return null;

              }
             // this.decryptDataOfRequest(token); 

           // return fetchedMeterList;

        } catch(error) {
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

export default  Pendingtoken