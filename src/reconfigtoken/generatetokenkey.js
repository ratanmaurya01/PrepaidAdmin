import React, { useState, useEffect } from 'react';
import { database } from '../firebase'; // Importing the Realtime Database instance
import firebase from 'firebase/compat/app'; // Import the Firebase app
import 'firebase/compat/firestore'; // Import Firestore
import CryptoJS from 'crypto-js';
import { auth } from '../adminLogin/firebase';

class Generatetoken {

    constructor() {

        this.crypto = {
            getKey: this.getKey.bind(this),
        };
        
    } 

     tokenKey(serverTime, type, phoneNumber, sr, pass, adkey) {

     console.log("tokenKey : ", serverTime, type, phoneNumber, sr, pass, adkey);
        const dateObj = new Date(serverTime);
        const year = dateObj.getFullYear().toString();
        const month = (dateObj.getMonth() + 1).toString(); // Adding 1 since months are zero-indexed
        const day = dateObj.getDate().toString();
        const hour = dateObj.getHours().toString().padStart(2, '0');;
        const minute = dateObj.getMinutes().toString();
        const typeHex = type;
        const srHex = parseInt(sr).toString(16).padStart(6, '0');
        const dayHex = (parseInt(day, 10)).toString(16).padStart(2, '0');
        // const dayHex = ('0' + (parseInt(day, 10)).toString(16)).slice(-2);
        //console.log('dayHex', dayHex);
        const hourHex = (parseInt(hour, 10)).toString(16).padStart(2, '0');
        const minuteHex = (parseInt(minute, 10)).toString(16).padStart(2, '0');
        const monthHex = (parseInt(month, 10)).toString(16).padStart(2, '0');
        const yearHex = (parseInt(year.toString().substring(2), 10)).toString(16).padStart(2, '0');
        const phhex = parseInt(phoneNumber.toString(), 10).toString(16).padStart(10, '0');
        const hextokenData = `${typeHex}${srHex}${dayHex}${monthHex}${yearHex}${hourHex}${minuteHex}${phhex}`;
        // console.log('hexalldata ', hextokenData);
        const part1 = hextokenData.substring(0, 32);
        const part2 = hextokenData.substring(32);
      //  console.log("part1", part1);
      //  console.log("part2", part2);


        const rechkey = this.getKey(phhex, srHex, pass);
      //   console.log('Rechkey', rechkey);
      
        let newKey = pass;

      const reConfigKey = this.alphanumericToHex(adkey); // Secret hex adkey


    //  console.log('ReconFigKey', reConfigKey);

        let aesKey;

        if (type === "04") {
            // Re-config case
           aesKey = this.alphanumericToHex(adkey);
        } else {
            // Config (New meter)
          aesKey = "30303030303030303030303030303030";
        }


        const data = "00000000000000" + "03" + srHex + phhex + rechkey + reConfigKey ;

       ////  console.log("RKKKKKKKKKKK", data);

       const  rechKey = this.encryptData(data, aesKey);

        const DATA = rechKey;

        let  CNFIG  = "434E464947";

        var formatData = '5657' + '35' + CNFIG + DATA;

        const CRC = this.checksum(formatData);
        
      //  console.log(" CRC DaTA " + CRC);
        formatData = formatData + CRC + '56'; //token is
       
    //  console.log("generateFormattedData: CRC " + formatData);

        return formatData;

    }
    
     checksum(stringBuilder) {

      //  console.log("checksum " + stringBuilder);
        let sum = 0;
        for (let i = 0; i < stringBuilder.length; i += 2) {
          sum += parseInt(stringBuilder.substring(i, i + 2), 16);
        }
        sum &= 255;
        return sum.toString(16).padStart(2, '0');
      }


      // Function to convert alphanumeric to hexadecimal
       alphanumericToHex(input) {
        let hexResult = '';
        for (let i = 0; i < input.length; i++) {
          let charCode = input.charCodeAt(i).toString(16);
          hexResult += charCode;
        }
        return hexResult;
      }
      // Function to encrypt data using CryptoJS AES
    
    
       encryptData(data, keyHex) {
        const key = CryptoJS.enc.Hex.parse(keyHex);
        const encrypted = CryptoJS.AES.encrypt(data, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });
        return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
      }
    
      // Function to get the encrypted key
       getKey(phhex, srHex, pass) {
        const data = phhex + srHex;
        console.log(srHex); // Add 0 myself
        let key = this.alphanumericToHex(pass);
    
         //console.log("Data:", data);
       //   console.log("Original Key11:", key);
    
        if (key.length > 32) {
    
          key = key.substring(0, 32);
        } else {
          while (key.length < 32) {
            key += '0';
          }
        }
        //  console.log("Processed Key:", key);
        const allData = data + data;
        const originalKey = this.encryptData(allData, key)
    
        // console.log("Original Key:", originalKey);
    
        return originalKey;
      }
    
       encryptData(data, key) {
        const keyBytes = CryptoJS.enc.Hex.parse(key);
        const sKeySpec = CryptoJS.enc.Hex.parse(data);
    
        const encrypted = CryptoJS.AES.encrypt(sKeySpec, keyBytes, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });
    
        return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
      }
    
    
  

    serverTimeFirebase = async () => {
        try {
            const timestampRef = firebase.database().ref('.info/serverTimeOffset');
            const snapshot = await timestampRef.once('value');
            const offset = snapshot.val() || 0;
            const serverTime = Date.now() + offset;
            const serverDate = new Date(serverTime);
            const year = serverDate.getFullYear();
            const month = serverDate.getMonth() + 1; // Months are zero-indexed
            const day = serverDate.getDate();
            const hours = serverDate.getHours();
            const minutes = serverDate.getMinutes();
            const seconds = serverDate.getSeconds();
            const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${'00'}`;
            //  console.log("Firebase Server Time111:", formattedTime);
            return formattedTime;
        } catch (error) {
            console.error('Error fetching Firebase server time:', error);
            return null;
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



    updatePassword (serverTime, type, phoneNumber, sr, newPass, adkey){
       // console.log("Update Password  : ", serverTime, type, phoneNumber, sr, newPass, adkey);
           const dateObj = new Date(serverTime);
           const year = dateObj.getFullYear().toString();
           const month = (dateObj.getMonth() + 1).toString(); // Adding 1 since months are zero-indexed
           const day = dateObj.getDate().toString();
           const hour = dateObj.getHours().toString().padStart(2, '0');;
           const minute = dateObj.getMinutes().toString();
           const typeHex = type;
           const srHex = parseInt(sr).toString(16).padStart(6, '0');
           const dayHex = (parseInt(day, 10)).toString(16).padStart(2, '0');
           // const dayHex = ('0' + (parseInt(day, 10)).toString(16)).slice(-2);
           //console.log('dayHex', dayHex);
           const hourHex = (parseInt(hour, 10)).toString(16).padStart(2, '0');
           const minuteHex = (parseInt(minute, 10)).toString(16).padStart(2, '0');
           const monthHex = (parseInt(month, 10)).toString(16).padStart(2, '0');
           const yearHex = (parseInt(year.toString().substring(2), 10)).toString(16).padStart(2, '0');
           const phhex = parseInt(phoneNumber.toString(), 10).toString(16).padStart(10, '0');
           const hextokenData = `${typeHex}${srHex}${dayHex}${monthHex}${yearHex}${hourHex}${minuteHex}${phhex}`;
        
           const rechkey = this.getKey(phhex, srHex, newPass);
        //   console.log('Rechkey', rechkey);
         
           let newKey = newPass;
   
         const reConfigKey = this.alphanumericToHex(adkey); // Secret hex adkey
   
   
        //  console.log('ReconFigKey', reConfigKey);
   
           let aesKey;
   
           if (type === "04") {
               // Re-config case
              aesKey = this.alphanumericToHex(adkey);
           } else {
               // Config (New meter)
             aesKey = "30303030303030303030303030303030";
           }
   
   
           const data = "00000000000000" + "03" + srHex + phhex + rechkey + reConfigKey ;
   
          ////  console.log("RKKKKKKKKKKK", data);
   
          const  rechKey = this.encryptData(data, aesKey);
   
           const DATA = rechKey;
   
           let  CNFIG  = "434E464947";
   
           var formatData = '5657' + '35' + CNFIG + DATA;
   
           const CRC = this.checksum(formatData);
           
         //  console.log(" CRC DaTA " + CRC);
           formatData = formatData + CRC + '56'; //token is
          
       //  console.log("generateFormattedData: CRC " + formatData);
   
           return formatData;
   
       }


    updatePhoneAndPassword (serverTime, type, phoneNumber, sr, newPass, adkey){

     // console.log("F1 Fecth data   : ", serverTime, type, phoneNumber, sr, newPass, adkey);
     
      const typeHex = type;
      const srHex = parseInt(sr).toString(16).padStart(6, '0');
    
      const phhex = parseInt(phoneNumber.toString(), 10).toString(16).padStart(10, '0');
    
      const rechkey = this.getKey(phhex, srHex, newPass);
    // console.log('Rechkey', rechkey);
    
      let newKey = newPass;

    const reConfigKey = this.alphanumericToHex(adkey); // Secret hex adkey

     // console.log('ReconFigKey', reConfigKey);

        let aesKey;

      if (type === "04") {
          // Re-config case
         aesKey = this.alphanumericToHex(adkey);
      } else {
          // Config (New meter)
        aesKey = "30303030303030303030303030303030";
      }

      // type = 04
      //  reConfigKey = new
      const data = "00000000000000" + "03" + srHex + phhex + rechkey + reConfigKey ;

     // console.log("RKKKKKKKKKKK", data);

     const  rechKey = this.encryptData(data, aesKey);

      const DATA = rechKey;

      let  CNFIG  = "434E464947";

      var formatData = '5657' + '35' + CNFIG + DATA;

      const CRC = this.checksum(formatData);
      
   //  console.log(" CRC DaTA " + CRC);
      formatData = formatData + CRC + '56'; //token is
     
  //  console.log("generateFormattedData: CRC " + formatData);

      return formatData;

    }
    

    
    isTransferToken (type, phoneNumber, sr, newPass, transeferKey, oldKey){

      // console.log("F1 Fecth data   : ",type, phoneNumber, sr, newPass, transeferKey, oldKey);
      // console.log("F2 Fecth data : ",oldKey);
      // console.log("F2 Fecth data : ",transeferKey);

      
       const typeHex = type;
       const srHex = parseInt(sr).toString(16).padStart(6, '0');
     
       const phhex = parseInt(phoneNumber.toString(), 10).toString(16).padStart(10, '0');
     
       const rechkey = this.getKey(phhex, srHex, newPass);
     // console.log('Rechkey', rechkey);
     
       let newKey = newPass;
 
     const reConfigKey = this.alphanumericToHex(transeferKey); // Secret hex adkey
 
      // console.log('ReconFigKey', reConfigKey);
 
         let aesKey;
 
       if (type === "04") {
           // Re-config case
          aesKey = this.alphanumericToHex(oldKey);
       } else {
           // Config (New meter)
         aesKey = "30303030303030303030303030303030";
       }
 
       // type = 04
       //  reConfigKey = new
       const data = "00000000000000" + "03" + srHex + phhex + rechkey + reConfigKey ;
 
      // console.log("RKKKKKKKKKKK", data);
 
      const  rechKey = this.encryptData(data, aesKey);
 
       const DATA = rechKey;
 
       let  CNFIG  = "434E464947";
 
       var formatData = '5657' + '35' + CNFIG + DATA;
 
       const CRC = this.checksum(formatData);
       
    //  console.log(" CRC DaTA " + CRC);
       formatData = formatData + CRC + '56'; //token is
      
   //  console.log("generateFormattedData: CRC " + formatData);
 
       return formatData;
 
     }

    }


export default Generatetoken