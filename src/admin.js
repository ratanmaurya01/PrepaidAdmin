import React, { useState, useEffect } from 'react';
import { database } from './firebase'; // Importing the Realtime Database instance
import firebase from 'firebase/compat/app'; // Import the Firebase app
import 'firebase/compat/firestore'; // Import Firestore
import CryptoJS from 'crypto-js';
import Navbar from './adminLogin/navbar';
import { auth } from './adminLogin/firebase';
import Message from './message'
import axios from 'axios';
import { unlink } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import CommonFuctions from './commonfunction';
import { Modal, Button } from 'react-bootstrap';
import { ref, set, get, child, getDatabase, onValue } from 'firebase/database';

import './style.css';


const rechargeTokes = [];
const userEmails = [];
const uniqueUserEmails = [];
const userPhones = [];
function Adin() {

  const Sessionid = new CommonFuctions();



  //let globalBalance;

  let counter = 0;
  let ltime = 0;

  const navigate = useNavigate();

  const [phoneInput, setPhoneInput] = useState('');
  const [meterIdInput, setMeterIdInput] = useState('');
  const [rechargeRequestTokens, setRechargeRequestTokens] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [user, setUser] = useState(null); // State to hold user information
  const [groupData, setGroupData] = useState([]);
  const [numberPart, setNumberPart] = useState('');
  const [password, setPassword] = useState('');

  const [emails, setEmails] = useState([]);
  const [urls, setUrls] = useState([]);

  const [onlineStatus, setOnlineStatus] = useState(null);


  let number = '';

  // if (!user) {
  //   // If there's no logged-in user, don't render the Consumer component
  //   return null;
  // }

  const baseUrlMeterDetails = database.ref('/adminRootReference/meterDetails/');
  const rechargeRequestTokenRef = database.ref('/adminRootReference/meterDetails/rechargeRequestToken');


  function getLocalTime() {
    counter++;
    ltime = new Date().getTime();
    // console.log("My Time ", ltime);
    //  console.log(counter);
  }
  getLocalTime();

  const pendingTokens = async () => {
    //   setLoading(true);
    // const status = await Sessionid.checkInternetConnection(); // Call the function

    // if (status === 'Poor connection.') {
    //   setIsDialogOpen(true);
    //   setModalMessage('No/Poor Internet connection. Cannot access server.');

    //   setLoading(false);

    //   return;

    // }

    getGroupdetail();
    // console.log("My loog Number is ");
    // console.log("My Number ", number);


    // if (!number.trim()) {
    //   alert('Please Enter a Valid Phone Number.');
    //   return;
    // }
    try {
      const meters = await getAdminMeterList();
      const promises = meters.map(async (meter) => {
        return baseUrlMeterDetails
          .child(meter)
          .child('rechargeRequestToken')
          .once('value')
          .then((snapshot) => {
            if (snapshot.val()['isUsed'] === 'false') {
              return snapshot.val()['requestLink'];
            }
            return null;
          })
          .catch((error) => {
            //  console.log(error);
            return null;
          });
      });

      const tokenResults = await Promise.all(promises);
      const filteredTokens = tokenResults.filter((token) => token !== null);
      setTokens(filteredTokens);

      // console.log('Filtered Tokens:', filteredTokens);
    } catch (error) {
      // console.log(error);
    }

  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {

      if (authUser) {
        setUser(authUser);
        //  console.log("Logged-in user email:", authUser.email);

        // Extract numberPart from the logged-in user's email
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];
          //  console.log("Number part:", numberPart);
          setPhoneInput(numberPart);
          setNumberPart(numberPart);
          getAdminPassword(numberPart);
          number = numberPart;
          pendingTokens();
          setLoading(false);

        }
      } else {
        setUser(null);
        window.location.href = '/'; // Redirect to your login page
      }
    });

    return () => unsubscribe(); // Cleanup function for unmounting
  }, []);


  const getAdminPassword = (numberPart) => {
    const passwordRef = database.ref(`/adminRootReference/adminDetails/${numberPart}/adminProfile`);

    passwordRef.once('value', (snapshot) => {
      const fetchedPassword = snapshot.val();

      // console.log("Admin key : ", fetchedPassword?.key)
      setPassword(fetchedPassword?.password);
      //  console.log("Admin password : ", fetchedPassword?.password);


    });
  };

  //// Get Trarrif

  // get tarrif data of meter
  // ... (previous code)

  // get tarrif data of meter
  const getTarrifData = async (meter, phone) => {
    try {

      // console.log("My log Number is1111 ", phone);
      // console.log("tariff rate phone number ", phoneInput);
      const urlForTarrif = database.ref(`adminRootReference/tenantDetails/${phoneInput}`);
      const snap = await urlForTarrif.once('value');

      if (snap.exists()) {
        const data = snap.val();
        // console.log('fejfneifueofiew  alll tariff rate data ', data);
        const keyToFind = meter;

        for (const key in data) {
          if (data[key][keyToFind] && data[key][keyToFind].tariff) {
            const tariffValue = data[key][keyToFind].tariff;
            //   console.log('my tariff rate', tariffValue);

            return tariffValue;
          }
        }

        //  console.log(`No tariff found for key ${keyToFind}.`);
      } else {
        // console.log("Snapshot doesn't exist or has no data.");
      }
    } catch (error) {
      console.error('Error fetching tariff data:', error);
    }
  }


  const serverTimeFirebase = async () => {
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
      // console.log("Firebase Server Time:", formattedTime);
      return formattedTime;
    } catch (error) {
      console.error('Error fetching Firebase server time:', error);
      return null;
    }
  };


  // // Define the serverTimeFirebase function
  // const serverTimeFirebase = async () => {
  // try {
  // const timestampRef = firebase.database().ref('timestamp');
  // const snapshot = await timestampRef.once('value');
  // if (!snapshot.exists()) {
  // await timestampRef.set({ time: firebase.database.ServerValue.TIMESTAMP });
  // }

  // return new Promise((resolve, reject) => {
  // timestampRef.once('value', (snapshot) => {
  // const serverTimestamp = snapshot.val().time;
  // const serverDate = new Date(serverTimestamp);

  // const year = serverDate.getFullYear();
  // const month = serverDate.getMonth() + 1; // Months are zero-indexed
  // const day = serverDate.getDate();
  // const hours = serverDate.getHours();
  // const minutes = serverDate.getMinutes();
  // const seconds = serverDate.getSeconds();

  // const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  // console.log("Firebase Server Time:", formattedTime);

  // resolve(formattedTime);
  // }, (error) => {
  // console.error('Error fetching Firebase server time:', error);
  // reject(error);
  // });
  // });
  // } catch (error) {
  // console.error('Error fetching Firebase server time:', error);
  // return null;
  // }
  // }

  // // Call the function and handle the resolved promise
  // serverTimeFirebase()
  // .then((time) => {
  // console.log("Formatted Time:", time);
  // // You can use 'time' here or perform any other actions
  // })
  // .catch((error) => {
  // console.error('Error occurred:', error);
  // // Handle error scenarios if needed
  // });

  //get Token 2

  //// const getToken2=(type,phone, serial,password,amount, tarrif, timestamp,tokonid)=>{
  // }

  // const getTokenid = async (meter) => {
  //   try {
  //     const ref = database.ref(`/adminRootReference/meterDetails/${meter}/rechargeToken`);
  //     const snapshot = await ref.once('value');

  //     if (snapshot.exists()) {
  //       // Convert snapshot to an array of child snapshots
  //       const childSnapshots = [];
  //       snapshot.forEach(childSnapshot => {
  //         childSnapshots.push(childSnapshot);
  //       });

  //       // Sort child snapshots by key
  //       childSnapshots.sort((a, b) => {
  //         return a.key.localeCompare(b.key);
  //       });

  //       // Get the last child snapshot
  //       const lastChildSnapshot = childSnapshots[childSnapshots.length - 1];

  //       // Extract the last token count
  //       const lastTokenCount = lastChildSnapshot.val().tokenCount ;
  //       console.log(`Last token count:`, lastTokenCount);
  //       return lastTokenCount;
  //     } else {
  //       console.log(`No data found.`);
  //       return '00';
  //     }
  //   } catch (error) {
  //     console.error('Error counting children:', error);
  //     return '00';
  //   }
  // };

  //Get token id

  const getTokenid = async (meter,) => {
    try {
      const ref = database.ref(`/adminRootReference/meterDetails/${meter}/rechargeToken`);
      const snapshot = await ref.once('value');

      if (snapshot.exists()) {
        let lastChildSnapshotValue;

        snapshot.forEach(childSnapshot => {
          lastChildSnapshotValue = childSnapshot.val();
        });

        //  console.log('Value of the last child snapshot:', lastChildSnapshotValue);
        return lastChildSnapshotValue;
      } else {

        // console.log('No data found.');
        return "00"; // You can modify the return value as needed
      }
    } catch (error) {
      console.error('Error getting the last child snapshot:', error);
      return null; // You can modify the return value as needed
    }
  };
  ///// Get New Urls
  // token generate

  const getnerateRechargeToken = async (serverTime, type, phone, sr, pass, am, balance, tf, tknid) => {

    const storeSessionId = localStorage.getItem('sessionId');
    try {
      const { sessionId } = await Sessionid.HandleValidatSessiontime(numberPart);
      if (storeSessionId === sessionId) {




        // console.log('hhhhhh', serverTime, type, phone, sr, pass, am, balance, tf, tknid);
        // console.log("Available balance: " + balance);
        const formattedAm = parseFloat(am).toFixed(2);
        //  console.log('Recharge of the amount :', formattedAm);
        const toknid = ('0' + (parseInt(tknid, 10) + 1)).slice(-2);
        //  console.log('my token Data is ' + toknid);
        const dateObj = new Date(serverTime);
        const year = dateObj.getFullYear().toString();
        const month = (dateObj.getMonth() + 1).toString(); // Adding 1 since months are zero-indexed
        const day = dateObj.getDate().toString();
        const hour = dateObj.getHours().toString().padStart(2, '0');;
        const minute = dateObj.getMinutes().toString();
        const typeHex = '01';
        const srHex = parseInt(sr).toString(16).padStart(6, '0');
        const dayHex = (parseInt(day, 10)).toString(16).padStart(2, '0');
        // const dayHex = ('0' + (parseInt(day, 10)).toString(16)).slice(-2);
        //console.log('dayHex', dayHex);
        const hourHex = (parseInt(hour, 10)).toString(16).padStart(2, '0');
        const minuteHex = (parseInt(minute, 10)).toString(16).padStart(2, '0');
        const monthHex = (parseInt(month, 10)).toString(16).padStart(2, '0');
        const yearHex = (parseInt(year.toString().substring(2), 10)).toString(16).padStart(2, '0');
        const tknhex = parseInt(toknid.toString(), 10).toString(16).padStart(2, '0');
        // console.log("token data hex ", tknhex);
        const amhex = parseInt(formattedAm.toString(), 10).toString(16).padStart(4, '0');
        // console.log("Amout data hex ", amhex);
        // Convert 'am' to a fixed decimal number with two decimal places,
        // then convert it to hexadecimal and ensure it retains two decimal places
        const tfhex = parseInt(tf.replace(".", ""), 10).toString(16).padStart(4, '0');
        const phhex = parseInt(numberPart.toString(), 10).toString(16).padStart(10, '0');
        // console.log("typehex", typeHex, srHex, dayHex, monthHex, yearHex, hourHex, minuteHex, tknhex, amhex, tfhex, phhex);
        const hextokenData = `${typeHex}${srHex}${dayHex}${monthHex}${yearHex}${hourHex}${minuteHex}${tknhex}${amhex}${tfhex}${phhex}`;
        ///// console.log('hexalldata ', hextokenData);
        // console.log('trarrie token ', tfhex);
        const part1 = hextokenData.substring(0, 32);
        const part2 = hextokenData.substring(32);
        //  console.log("part1", part1);
        /////  console.log("part2", part2);
        const key = getKey(phhex, srHex, password);
        //  console.log('key', key);
        const result = encryptData(part1, key);

        // console.log("Main result", result);

        const data = result + part2;
        // console.log('May data >', data);
        var formatData = '5657' + '18' + '52434D5452' + data;
        const CRC = checksum(formatData);
        // formatData = token for recharge (reachege toke to )
        formatData = formatData + CRC + '56'; //token is
        // console.log("generateFormattedData: CRC " + formatData);
        const amount8 = parseInt(am.toString(), 10).toString(16).padStart(8, '0');
        // const tfhex4 = parseInt((tf / 100.0).toString(), 10).toString(16).padStart(4, '0');

        if (!tf.includes(".")) {
          tf = tf + ".00";
        }
        const tfhex4 = parseInt(tf.replace(".", ""), 10).toString(16).padStart(4, '0');

        const timehex = parseInt(ltime.toString(), 10).toString(16).padStart(12, '0');

        const totalData = `${amount8}${tfhex4}${timehex}FFFFFFFF`;

        const dateObj1 = new Date(serverTime);
        const year1 = dateObj1.getFullYear().toString().slice(-2);
        const month1 = (dateObj1.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 since months are zero-indexed
        const day1 = dateObj1.getDate().toString().padStart(2, '0');
        const formattedDate = `${day1}${month1}${year1}`;
        // console.log('naw date of time ',formattedDate);
        const minutes = minute.toString().substring(0, 1);
        //console.log("fornatedd Time ", formattedDate)
        const formattedTime = `${hour}${minutes}`;

        //console.log('checktime11111111111',formattedTime);
        const ulrData = encryptData(totalData, '6D783230313139390000000000000000');
        //  console.log('UrlsData: ', ulrData);
        const finalUrls = `https://dk9936.github.io/re-tok-${toknid}-${sr}-${formattedDate}-${formattedTime}/${formatData}${ulrData}`;
        // Construct the formatted date string in dd-mm-yy hh:mm:ss format
        // console.log(formattedDate1);
        const date = new Date(serverTime);
        // Extract year, month, day, hours, minutes, and seconds
        const year3 = date.getFullYear().toString().slice(-2); // Extract last 2 digits of the year
        const month3 = ('0' + (date.getMonth() + 1)).slice(-2); // Adding leading zero if month is a single digit
        const day3 = ('0' + date.getDate()).slice(-2); // Adding leading zero if day is a single digit
        const hours3 = ('0' + date.getHours()).slice(-2); // Adding leading zero if hours is a single digit
        const minutes3 = ('0' + date.getMinutes()).slice(-2); // Adding leading zero if minutes is a single digit
        const seconds3 = ('0' + date.getSeconds()).slice(-2); // Adding leading zero if seconds is a single digit

        // Construct the formatted date string in dd-mm-yy hh:mm:ss format
        const formattedDate3 = `${day3}-${month3}-${year3}, ${hours3}:${minutes3}:${seconds3}`;
        // eslint-disable-next-line
        let mybalance = Number(balance).toFixed(2);
        //  console.log('myAvailable', mybalance);
        // eslint-disable-next-line
        uploadDate(sr,
          tknid,
          formatData,
          finalUrls,
          formattedDate3,
          formatData,
          mybalance,
          formattedAm,
          tf,);

        // console.log("finalUrls", finalUrls);
        //sendPhoneMessage(finalUrls);
        handleSendEmailMessage(finalUrls);
        getPhoneNumberFromGroupName(finalUrls);

        return finalUrls;


      } else {

        alert("You have been logged-out due to log-in from another device.");
        // console.log('you are logg out ');
        //  handleLogout();
      }

    } catch (error) {

      setLoading(false);
      setIsDialogOpen(true)
      const errorMessage = `2Response not recieved  from server-S. Please check if transaction completed successfully, else retry.. (${error}). `;
      setModalMessage(errorMessage);

    }


  }

  // Assuming you've initialized Firebase with appropriate config

  // Get a reference to the Firebase database

  // Call the function to print the current date, time, and
  function checksum(stringBuilder) {
    let sum = 0;
    for (let i = 0; i < stringBuilder.length; i += 2) {
      sum += parseInt(stringBuilder.substring(i, i + 2), 16);
    }
    sum &= 255;
    return sum.toString(16).padStart(2, '0');
  }
  // Function to convert alphanumeric to hexadecimal
  function alphanumericToHex(input) {
    let hexResult = '';
    for (let i = 0; i < input.length; i++) {
      let charCode = input.charCodeAt(i).toString(16);
      hexResult += charCode;
    }
    return hexResult;
  }
  // Function to encrypt data using CryptoJS AES


  function encryptData(data, keyHex) {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
  }

  // Function to get the encrypted key
  function getKey(phonehex, srHex, password) {
    const data = phonehex + srHex;
    console.log(srHex); // Add 0 myself
    let key = alphanumericToHex(password);

    // console.log("Data:", data);
    // console.log("Original Key11:", key);

    if (key.length > 32) {

      key = key.substring(0, 32);
    } else {
      while (key.length < 32) {
        key += '0';
      }
    }

    //  console.log("Processed Key:", key);
    const allData = data + data;
    const originalKey = encryptData(allData, key)

    // console.log("Original Key:", originalKey);

    return originalKey;
  }

  function encryptData(data, key) {
    const keyBytes = CryptoJS.enc.Hex.parse(key);
    const sKeySpec = CryptoJS.enc.Hex.parse(data);

    const encrypted = CryptoJS.AES.encrypt(sKeySpec, keyBytes, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    });

    return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
  }




  function textToHex(text) {
    let hex = '';
    for (let i = 0; i < text.length; i++) {
      let charHex = text.charCodeAt(i).toString(16); // Convert character to hexadecimal
      hex += ('00' + charHex).slice(-2); // Add leading zeroes if necessary and concatenate
    }
    return hex;
  }
  const token2 = () => {

  }
  // this function is used to get token from request link
  const getToken = (link) => {
    const parsedURL = new URL(link);
    // console.log("Check Link URL: " + parsedURL);
    const tokenAndPaymentMode = parsedURL.pathname.split('/').pop();
    const token = tokenAndPaymentMode.substring(0, 64);
    return token;
  }
  // this function is used to get paymentmode from link
  const getPaymentMode = (link) => {
    const parsedURL = new URL(link);
    const tokenAndPaymentMode = parsedURL.pathname.split('/').pop();
    const paymentMode = tokenAndPaymentMode.substring(64);
    return paymentMode;
  }


  // const getTime = (link) => {
  //   const parsedURL = new URL(link);
  //    console.log ("Check Link URL for time : " + parsedURL);
  //   const gettime  = parsedURL.pathname.split('/').pop();
  //   const token = gettime .substring(0, 64);
  //   return token;
  // }

  // this function is used to get decrypted hex

  const decryptDataOfRequest = (token) => {
    // console.log("my Token: " + token);
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

  const getValueFromHex = (hexValue) => {

  }


  const [modalMessage, setModalMessage] = useState('');
  const [modalMessage1, setModalMessage1] = useState('');



  const generatetokenData = async () => {

    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');

    if (selectedCheckboxes.length === 0) {

      setIsDialogOpen(true);
      setModalMessage('Please select at least one token before Generating.')

      // alert('Please select at least one token before Generating.');
      return; // Stop execution if no checkboxes are selected
    }



    setLoading(true);
    const status = await Sessionid.checkInternetConnection(); // Call the function
    if (status === 'Poor connection.') {
      setIsDialogOpen(true);
      setModalMessage('No/Poor Internet connection. Cannot access server.');
      setLoading(false);

      return;

    }

    const result = Sessionid.isCheckInterNet();
    if (result) {

      const storeSessionId = localStorage.getItem('sessionId');

      try {
        const { sessionId } = await Sessionid.HandleValidatSessiontime(numberPart);
        if (storeSessionId === sessionId) {

          Sessionid.updateSessionTimeActiveUser(numberPart);

          let globalBalance;
          getLocalTime();
          // console.log("hett", tokens);
          // check if selcted checkbox is Null
          // checl all select checkbox
          const selectedTokens = tokens.filter((link, index) => {
            const checkbox = document.getElementById(`checkbox_${index}`);
            return checkbox.checked === true; // Check if the checkbox is checked
          });
          // console.log('hgjhqwgjw', selectedTokens);

          // Proceed with generating token data for unused tokens

          await Promise.all(selectedTokens.map(async (link, index) => {
            const checkbox = document.getElementById(`checkbox_${index}`);
            const decryptedData = decryptDataOfRequest(getToken(link));
            // my Custom date and time 
            const reqtimeof = decryptedData['timehexdata '];
            const srNo = decryptedData['srNo'];
            const amount = decryptedData['amount'];
            const paymentMode = getPaymentMode(link);

            const kWh = decryptedData['kWh'];
            const balance = decryptedData['balance'];
            try {
              const tarrifDataResult = await getTarrifData(srNo, number);
              const tokenIdResult = await getTokenid(srNo);
              const time = await serverTimeFirebase(); // Wait for the server time
              //  console.log("tokenId", tokenIdResult);
              const myurls = getnerateRechargeToken(time, '01', number, srNo, password, amount, balance, tarrifDataResult, tokenIdResult);
              //  console.log("Results:");

              // Push myurls into the array
              // console.log("Dinesh: url-> ", myurls);

              const isDuplicate = rechargeTokes.includes(myurls);

              if (!isDuplicate) {
                rechargeTokes.push(myurls);

              }


              // Print each element of the array one by one
              // for (let i = 0; i < dataStructureArray.length; i++) {
              // const emailaddress=  window.emailsAndLinks.emails[0];

              //   console.log("Email address, ",emailaddress);
              //   console.log("Results of the urlds:", dataStructureArray[i]);

              //   window.emailsAndLinks.links.push(dataStructureArray[i]);

              // }

              // await Message(emails, myurls );

              globalBalance = balance;

              return {
                srNo: srNo,
                reqtime: reqtimeof,
                amount: amount,
                paymentMode: paymentMode,
                kWh: kWh,
                balance: balance,
                time: time, // Include the formatted time

              };
            } catch (error) {
              // console.error("Error generating recharge token:", error);
              return null; // Handle error scenario as needed
            }
          }));

          ///   Sessionid.updateSessionTimeActiveUser(numberPart);

          // try {
          //   Sessionid.updateSessionTimeActiveUser(numberPart);
          // } catch (error) {

          //   setLoading(false);
          //   setIsDialogOpen(true);
          //   // const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry. `;
          //   const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry.`;
          //   setModalMessage(errorMessage);

          // }


          //   Update on 18-03-2024


          // setIsDialogOpenSavedata(true);
          // setModalMessage1('Data save successfully');
          // setLoading(false);

          // Sessionid.updateSessionTimeActiveUser(numberPart);

          //  alert('data save successfully');
          /// window.location.reload(); // This line reloads the page

          sendToken();

          const selectedSRNumbers = selectedTokens.map((token) =>
            decryptDataOfRequest(getToken(token))['srNo']
          );
          // console.log("Selected SR Numbers:", selectedSRNumbers);
          // Update the 'isUsed' value to 'true' in the real-time database for selected SR numbers where 'isUsed' is currently false
          // Array to store already used SR numbers
          const alreadyUsedSRNumbers = [];
          // Create promises for each SR number update
          const updatePromises = selectedSRNumbers.map((srNumber) => {
            return database
              .ref(`/adminRootReference/meterDetails/${srNumber}/rechargeRequestToken`)
              .once('value')
              .then((snapshot) => {
                const isUsedValue = snapshot.val()?.isUsed;
                if (isUsedValue === true) {
                  //   console.log(`isUsed value is already true for ${srNumber}`);
                  alreadyUsedSRNumbers.push(srNumber); // Store already used SR numbers
                  // No need to update isUsed here, as it's already true
                } else {
                  return database

                    .ref(`/adminRootReference/meterDetails/${srNumber}/rechargeRequestToken`)
                    .update({ isUsed: true })
                    .then(() => {
                      //  console.log(`isUsed value updated to true for ${srNumber}`);
                      // Perform any additional actions after updating the database
                    })
                    .catch((error) => {
                      console.error(`Error updating isUsed for ${srNumber}:`, error);
                    });
                }
              })
              .catch((error) => {
                console.error(`Error fetching isUsed value for ${srNumber}:`, error);
              });
          });
          // Wait for all promises to resolve
          await Promise.all(updatePromises);
          // Show messages or perform actions for already used SR numbers
          alreadyUsedSRNumbers.forEach((srNumber) => {
            alert(`isUsed value is already true for ${srNumber}`);
            // Perform any other actions or UI updates related to already used SR numbers
          });

          selectedCheckboxes.forEach((checkbox) => {
            checkbox.checked = false;
          });

          // selectedCheckboxes.forEach((checkbox) => {
          //   const checkboxParent = checkbox.parentElement;
          //   checkboxParent.remove();
          // });
          // save values in firebase database



        } else {

          alert("You have been logged-out due to log-in from another device.");
          // console.log('you are logg out ');
          handleLogout();
        }
      } catch (error) {

        setLoading(false);
        setIsDialogOpen(true);
        // const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry. `;
        const errorMessage = `1Response not recieved  from server-S. (${error}). Please check if transaction completed successfully , else retry.`;
        setModalMessage(errorMessage);

      }

    } else {
      setOnlineStatus(result);
    }


  };


  // eslint-disable-next-line


  const uploadDate = async (

    srNumber,
    tokenId,
    token,
    finalUrls,
    formattedDate3,
    formatData,
    mybalance,
    formattedAm,
    tfRate,
  ) => {
    let tk = (parseInt(tokenId) + 1).toString();
    if (tk.length === 1) {
      tk = "0" + tk
    }
    const baseUrlMeterDetails = database.ref('/adminRootReference/meterDetails/');
    const tokensRef = baseUrlMeterDetails.child(srNumber).child('rechargeToken');

    const db = getDatabase();
    const adminRootReference = ref(db, `/adminRootReference/meterDetails/${srNumber}/rechargeToken/${ltime}-${tk}`);

    const fullAdminProfilePath = adminRootReference.toString();

    // tokensRef.once('value', (snapshot) => {
    //   let tokenCount = snapshot.numChildren();
    //   if (tokenCount >= 20) {
    //     // Fetch the oldest child
    //     tokensRef.orderByKey().limitToFirst(1).once('value', (oldestSnapshot) => {
    //       oldestSnapshot.forEach((childSnapshot) => {
    //         // Remove the oldest child
    //         tokensRef.child(childSnapshot.key).remove().then(() => {
    //           console.log('Oldest Data Removed');
    //         }).catch((error) => {
    //           console.error('Error removing oldest data:', error);
    //         });
    //       });
    //     });
    //   }

    //   tokensRef.child(`${ltime}-${tk}`).set({
    //     balance: "null",
    //     isEmergency: false,
    //     isOC: false,
    //     kwh: "null",
    //     phoneNumber: number, //adminPhone.toString()
    //     link: finalUrls,
    //     rechargeAmount: formattedAm, //rechargeAmount.toString()
    //     rechargeToken: formatData, // finalUrls.toString()
    //     serialNumber: srNumber,
    //     tariffRate: tfRate,
    //     tokenGenerationTime: formattedDate3,
    //     tokenId: tk
    //   }).then(() => {
    //     // console.log('Data Updated Successfully');

    //     // sendMessage();
    //     //  handleSendEmailMessage();
    //     // sendPhoneMessage();

    //     // alert('Data upload successful');


    //     // window.location.reload(); // This line reloads the page
    //   }).catch((error) => {
    //     console.error('Error updating data:', error);
    //   });

    //   updateTokenCount(tk, srNumber);
    // });

    tokensRef.once('value', (snapshot) => {
      let tokenCount = snapshot.numChildren();
      if (tokenCount >= 20) {
        // Fetch the oldest child
        tokensRef.orderByKey().limitToFirst(1).once('value', (oldestSnapshot) => {
          oldestSnapshot.forEach((childSnapshot) => {
            // Remove the oldest child
            tokensRef.child(childSnapshot.key).remove().then(() => {
              console.log('Oldest Data Removed');
            }).catch((error) => {
              console.error('Error removing oldest data:', error);
            });
          });
        });
      }
    });


    const saveTariffRate = {
      balance: "null",
      isEmergency: false,
      isOC: false,
      kwh: "null",
      phoneNumber: number, //adminPhone.toString()
      link: finalUrls,
      rechargeAmount: formattedAm, //rechargeAmount.toString()
      rechargeToken: formatData, // finalUrls.toString()
      serialNumber: srNumber,
      tariffRate: tfRate,
      tokenGenerationTime: formattedDate3,
      tokenId: tk
    };

    const dataToSend = {
      [fullAdminProfilePath]: saveTariffRate,
    };

    try {
      const result = await Sessionid.callWriteRtdbFunction(dataToSend);
      console.log('Data:', result);

      // setisModalOpenModelalert(true);
      // setLoading(false);

      setIsDialogOpenSavedata(true);
      setModalMessage1('Data save successfully');
      setLoading(false);


    } catch (error) {
      setLoading(false);
      setIsDialogOpen(true);
      const errorMessage = `Response not received from server-A. Please check if the transaction completed successfully, else retry. (${error}).`;
      setModalMessage(errorMessage);
    }

    updateTokenCount(tk, srNumber);

  };

  function updateTokenCount(token, srNumber) {
    const baseUrlMeterDetails = database.ref('/adminRootReference/meterDetails/');
    const tokensRef = baseUrlMeterDetails.child(srNumber).child('rechargeToken');

    tokensRef.update({
      tokenCount: token
    });
  }


  // const uploadDate = (
  //   srNumber,
  //   tokenId,
  //   token,
  //   finalUrls,
  //   formattedDate3,
  //   formatData,
  //   mybalance,
  //   formattedAm,
  //   tfRate,
  // ) => {
  //   let tk = (parseInt(tokenId) + 1).toString();
  //   if (tk.length === 1) {
  //     tk = "0" + tk
  //   }
  //   const baseUrlMeterDetails = database.ref('/adminRootReference/meterDetails/'); // Replace with your actual reference
  //   baseUrlMeterDetails
  //     .child(srNumber)
  //     .child('rechargeToken')
  //     .child(`${ltime}-${tk}`)
  //     .set({
  //       balance: "null",
  //       isEmergency: false,
  //       isOC: false,
  //       kwh: "null",
  //       phoneNumber: phoneInput, //adminPhone.toString()
  //       link: finalUrls,
  //       rechargeAmount: formattedAm, //rechargeAmount.toString()
  //       rechargeToken: formatData, // finalUrls.toString()
  //       serialNumber: srNumber,
  //       tariffRate: tfRate,
  //       tokenGenerationTime: formattedDate3,
  //       tokenId: tk
  //     })

  //     .then(() => {
  //       console.log('Data Updated Successfully');
  //       alert('Data upload successful');

  //     })
  //     .catch((error) => {
  //       console.error('Error updating data:', error);
  //     });


  //   updateTokenCount(tk, srNumber);
  // };
  // // Function to display the popup


  // function updateTokenCount(token, srNumber) {
  //   baseUrlMeterDetails
  //     .child(srNumber)
  //     .child('rechargeToken')
  //     .update({
  //       tokenCount: token
  //     })
  // }

  const getMeterDetails = async (meterId) => {
    try {
      const snapshot = await baseUrlMeterDetails.child(meterId).child('rechargeRequestToken').once('value');
      const isUsed = snapshot.val()['isUsed'];
      const token = snapshot.val()['requestLink'];

      console.log("My result", isUsed);
      console.log("My result", token);

    } catch (error) {
      console.error('Error fetching meter details:', error);
    }
  };

  const getAdminMeterList = async () => {
    try {
      const snapshot = await database.ref(`/adminRootReference/adminDetails/${number}/meterList`).once('value');
      const meterList = snapshot.val();
      if (meterList) {
        const meterIds = Object.keys(meterList);
        //  console.log('Admin Meter List:', meterIds);
        return meterIds;
      } else {
        console.log('No meter list found for this admin phone');
        return [];
      }
    } catch (error) {
      console.error('Error fetching admin meter list:', error);
      return [];
    }
  };



  // const getGroupdetail = async () => {
  //   try {
  //     const snapshot = await database.ref(`/adminRootReference/tenantDetails/${number}/`).once('value');
  //     const srnumber = snapshot.val(); // Assuming srnumber is the value you want to print
  //     console.log("sr number for cheking ", srnumber); // Print the srnumber directly


  //     if (srnumber) {
  //       // Recursive function to print keys and values
  //       const printKeysAndValues = (obj, prefix = '') => {
  //         Object.entries(obj).forEach(([key, value]) => {
  //           const fullKey = prefix ? `${prefix}.${key}` : key;

  //           if (typeof value === 'object') {
  //             // If the value is an object, recursively call the function
  //             printKeysAndValues(value, fullKey);
  //           } else {
  //             // Print the full key and value
  //             console.log('all data ',`${fullKey}: ${value}`);
  //           }
  //         });
  //       };

  //       // Iterate through the top-level keys
  //       Object.keys(srnumber).forEach((groupName) => {
  //         console.log('groupname ',`${groupName}:`);

  //         // Call the printKeysAndValues function with the nested srnumber
  //         printKeysAndValues(srnumber[groupName]);
  //         console.log(); // Add a line break for clarity
  //       });

  //     } else {
  //       console.log("No data found");
  //     }


  //   } catch (error) {
  //     console.error('Error fetching admin meter list:', error);
  //     return [];
  //   }
  // };



  const getGroupdetail = async () => {
    try {
      const snapshot = await database.ref(`/adminRootReference/tenantDetails/${number}/`).once('value');
      const srnumber = snapshot.val();

      //  console.log("Group data ", srnumber);

      setGroupData(srnumber);

      // console.log('groupname  data ', groupData);

    } catch (error) {
      console.error('Error fetching admin meter list:', error);
    }
  };



  // function getGroupAndTariff(serialNumber) {
  //   for (const groupName in groupData) {
  //     const group = groupData[groupName];

  //     if (group.hasOwnProperty(serialNumber)) {
  //       return {
  //         groupName: groupName,
  //         tariff: group.tariff,
  //         name: group[serialNumber].name,
  //         phone: group[serialNumber].phone,
  //         email: group[serialNumber].email

  //       };
  //     }
  //   }

  //   return null; // Serial number not found
  // }


  // remove underscore from group name
  function getGroupAndTariff(serialNumber) {
    for (const groupName in groupData) {
      const group = groupData[groupName];

      if (group.hasOwnProperty(serialNumber)) {
        const groupNameWithoutUnderscore = groupName.replace('_', ' ');

        return {
          groupName: groupNameWithoutUnderscore,
          tariff: group.tariff,
          name: group[serialNumber].name,
          phone: group[serialNumber].phone,
          email: group[serialNumber].email,
          location: group[serialNumber].location
        };
      }
    }
  }



  const getRechargeRequestTokens = async (meterId) => {
    try {
      const snapshot = await rechargeRequestTokenRef.child(meterId).once('value');
      const token = snapshot.val();
      if (token) {
        setRechargeRequestTokens(prevTokens => [...prevTokens, token]); // Append token to the existing tokens array
        console.log('Recharge Request Token:', token);
      } else {
        console.log('No recharge request token found for this meter');
      }
    } catch (error) {
      console.error('Error fetching recharge request token:', error);
    }
  };

  const handleSearchMeter = () => {
    getMeterDetails(meterIdInput);
    getRechargeRequestTokens(meterIdInput);
    // setShowGenerateButton(true); // Show the generate button after fetching meter details
  };

  // const handleSearchMeter = () => {
  // getMeterDetails(meterIdInput);
  // getRechargeRequestTokens(meterIdInput);
  // };

  const handleSearchAdminMeterList = () => {
    getAdminMeterList();
    getGroupdetail();

  };

  // const handlePhoneInputChange = (event) => {
  // const enteredNumber = event.target.value;
  // setPhoneInput(enteredNumber);
  // };

  const handlePhoneInputChange = (event) => {
    setPhoneInput(event.target.value);
  };

  const handleMeterIdInputChange = (event) => {
    setMeterIdInput(event.target.value);
  };

  const handleSelectAllChange = (event) => {
    const isChecked = event.target.checked;
    setSelectAllChecked(isChecked);

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });

  };


  const sendPhoneMessage = async (urls) => {

    // console.log("Check URL for send phone token:", urls);

    tokens.forEach((link, index) => {
      const checkbox = document.getElementById(`checkbox_${index}`);

      if (checkbox && checkbox.checked) {
        const srNo = decryptDataOfRequest(getToken(link))['srNo'];
        const groupAndTariff = getGroupAndTariff(srNo);
        if (groupAndTariff) {
          // console.log(`Phone for sent request token via Phone: ${groupAndTariff.phone}`);
          window.emailsAndLinks.phoneNumbers.push(groupAndTariff.phone);

          // console.log("Check URL for send phone token:", urls);
          let part1 = (urls.substring(32, 53));
          let part2 = (urls.substring(54, 87));
          let part3 = (urls.substring(87, 117));
          let part4 = (urls.substring(117));

          let phoneNumber = groupAndTariff.phone;
          // console.log(" mera phone number", phoneNumber);

          const otpCode = urls;
          // console.log('Generated Token:', urls); // Log the OTP in the console
          const apiKey = 'Ar2Wnv0UdDJbGb4bre87vb1P5DbEhhv7FipucwNvE5R1PmqIvPjd3d4R9GLF'; // Replace with your Fast2SMS API key
          const message = '142210';
          const apiUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&sender_id=MAXMIJ&message=${message}&variables_values=${part1}|${part2}|${part3}|${part4}  &route=dlt&numbers=${phoneNumber}`;

          try {
            const response = axios.get(apiUrl);
            // console.log(response.data);
            //  console.log('Token  sent successfully!');

          } catch (error) {
            console.error('Error sending Token:', error);
            console.log('Failed to send Token. Please try again.');
          }

        } else {
          console.log(`Group information not found for Serial Number ${srNo}`);
        }
      }
    });
  };

  const getPhoneNumberFromGroupName = async (urls) => {
    // Assuming 'tokens' is defined somewhere
    tokens.forEach((link, index) => {
      const checkbox = document.getElementById(`checkbox_${index}`);

      if (checkbox && checkbox.checked) {
        try {
          const srNo = decryptDataOfRequest(getToken(link))['srNo'];
          const groupAndTariff = getGroupAndTariff(srNo);

          if (groupAndTariff && groupAndTariff.phone) {

            const isDuplicate = userPhones.includes(groupAndTariff.phone);

            userPhones.push(groupAndTariff.phone);

            // if (!isDuplicate) {
            //   userPhones.push(groupAndTariff.phone);

            // }

            //  window.emailsAndLinks.phoneNumbers.push(groupAndTariff.phone);
            //  console.log(`Phone for sent request token via Phone: ${groupAndTariff.phone}`);

          } else {
            console.error('Phone number not available for the selected token.');
          }
        } catch (error) {
          console.error('Error processing token:', error.message);
        }
      }
    });
  };




  // Declare the global object outside the component
  // Declare the global object outside the component
  // window.emailsAndLinks = {
  //   emails: [],
  //   links: [],
  // };

  // const handleSendEmailMessage = async (urls) => {
  //   for (let index = 0; index < tokens.length; index++) {
  //     const link = tokens[index];
  //     const checkbox = document.getElementById(`checkbox_${index}`);

  //     if (checkbox && checkbox.checked) {
  //       const srNo = decryptDataOfRequest(getToken(link))['srNo'];
  //       const groupAndTariff = getGroupAndTariff(srNo);

  //       if (groupAndTariff) {
  //         try {
  //           console.log(`Check email from selected: ${groupAndTariff.email}`);
  //           window.emailsAndLinks.emails.push(groupAndTariff.email);

  //           console.log(`Check link from selected: ${link}`);
  //           window.emailsAndLinks.links.push(link);

  //           await Message(urls, groupAndTariff.email);
  //           console.log('Email sent successfully');
  //         } catch (error) {
  //           console.error('Error sending email:', error);
  //         }
  //       } else {
  //         console.log(`Group information not found for Serial Number ${srNo}`);
  //       }
  //     }
  //   }

  //   // Remove duplicates by converting to a Set and then back to an array
  //   const uniqueEmails = [...new Set(window.emailsAndLinks.emails)];
  //   const uniqueLinks = [...new Set(window.emailsAndLinks.links)];

  //   console.log('Check emails:', uniqueEmails);
  //   console.log('Check links:', uniqueLinks);

  //   // You may want to set React state here if needed
  //   // setEmails(uniqueEmails);
  //   // setLinks(uniqueLinks);
  // };

  window.emailsAndLinks = {
    emails: [],
    phoneNumbers: [],
    links: [],

  };


  const handleSendEmailMessage = async (urls) => {
    /// console.log("Check urls  :", urls);
    tokens.forEach(async (link, index) => {
      const checkbox = document.getElementById(`checkbox_${index}`);
      if (checkbox && checkbox.checked) {

        const srNo = decryptDataOfRequest(getToken(link))['srNo'];
        const groupAndTariff = getGroupAndTariff(srNo);

        if (groupAndTariff) {
          try {
            // Assuming Message is an asynchronous function that sends an email
            //  console.log(`check email from selected  : ${groupAndTariff.email}`);
            setEmails(groupAndTariff.email);
            window.emailsAndLinks.emails.push(groupAndTariff.email);

            const isDuplicate = userEmails.includes(groupAndTariff.email);

            userEmails.push(groupAndTariff.email);

            // if (!isDuplicate) {
            //   userEmails.push(groupAndTariff.email);

            // }

            // window.emailsAndLinks.links.push(link);

            // let result = await Message(urls , groupAndTariff.email);
            // console.log('Email sent successfully:', result);
          } catch (error) {
            console.error('Error sending email:', error);
          }
        } else {
          // console.log(`Group information not found for Serial Number ${srNo}`);
        }
      }
    });
    // console.log('check email from dkn', window.emailsAndLinks.emails);

    // console.log('check email from dkn', window.emailsAndLinks.links);


    const emails = window.emailsAndLinks.emails;
    const sendurls = window.emailsAndLinks.links;
    const newPhoneNumber = window.emailsAndLinks.phoneNumbers;


    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      // console.log('ulrls path max ', sendurls);

      // await Message(sendurls[i], email);

    }

    //   console.log("send message for phone numbe  dkn : ",newPhoneNumber[i]);


    //   console.log("Check URL for send phone token:", urls);
    //   let part1 = (sendurls[i].substring(32, 53));
    //   let part2 = (sendurls[i].substring(54, 87));
    //   let part3 = (sendurls[i].substring(87, 117));
    //   let part4 = (sendurls[i].substring(117));

    // //  let phoneNumber = groupAndTariff.phone;
    //   // console.log(" mera phone number", phoneNumber);

    //   const otpCode = urls;
    //   // console.log('Generated Token:', urls); // Log the OTP in the console
    //   const apiKey = 'Ar2Wnv0UdDJbGb4bre87vb1P5DbEhhv7FipucwNvE5R1PmqIvPjd3d4R9GLF'; // Replace with your Fast2SMS API key
    //   const message = '142210';
    //   const apiUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&sender_id=MAXMIJ&message=${message}&variables_values=${part1}|${part2}|${part3}|${part4}  &route=dlt&numbers=${newPhoneNumber[i]}`;

    //   try {
    //     const response = axios.get(apiUrl);
    //     // console.log(response.data);
    //     console.log('Token  sent successfully!');

    //   } catch (error) {
    //     console.error('Error sending Token:', error);
    //     console.log('Failed to send Token. Please try again.');
    //   }




    // }



  };



  const sendToken = async () => {
    //  console.log("Hello world ");
    let reverseEmails = userEmails.reverse();
    let reversePhones = userPhones.reverse();

    for (let i = rechargeTokes.length - 1; i >= 0; i--) {
      // console.log("Dinesh : token ", rechargeTokes[i]);
      // console.log("Dinesh : phone  ", userPhones[i]);
      // console.log("Dinesh : Email ", reverseEmails[i]);


      await Message(rechargeTokes[i], reverseEmails[i]);

      let rechargeTokenes = rechargeTokes[i];

      if (rechargeTokenes && typeof rechargeTokenes === 'string') {
        let part1 = rechargeTokenes.substring(32, 53);
        let part2 = rechargeTokenes.substring(54, 87);
        let part3 = rechargeTokenes.substring(87, 117);
        let part4 = rechargeTokenes.substring(117);

        let phoneNumber = reversePhones[i];
        // console.log("Mera phone number", phoneNumber);

        const otpCode = urls;
        // console.log('Generated Token:', urls); // Log the OTP in the console
        const apiKey = 'Ar2Wnv0UdDJbGb4bre87vb1P5DbEhhv7FipucwNvE5R1PmqIvPjd3d4R9GLF'; // Replace with your Fast2SMS API key
        const message = '142210';
        const apiUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&sender_id=MAXMIJ&message=${message}&variables_values=${part1}|${part2}|${part3}|${part4}  &route=dlt&numbers=${phoneNumber}`;

        try {
          const response = await axios.get(apiUrl);
          // console.log(response.data);
          //  console.log('Token sent successfully!');
        } catch (error) {
          console.error('Error sending Token:', error);
          console.log('Failed to send Token. Please try again.');
        }
      } else {
        console.error('Invalid recharge token:', rechargeTokenes);
      }
    }
  };



  //   const updateSessionActiveTime = (numberPart) => {
  //     Sessionid.updateSessionTimeActiveUser(numberPart);
  // }

  // const SessionValidate = async (numberPart) => {
  //     const storeSessionId = localStorage.getItem('sessionId');
  //     const { sessionId } = await Sessionid.HandleValidatSessiontime(numberPart);
  //     if (storeSessionId === sessionId) {
  //         //   console.log('SessionId Match ');
  //     } else {
  //         alert("Cannot login. Another session is active. Please retry after sometime. ");
  //         //  console.log('you are logg out ');
  //         handleLogout();
  //     }
  // };


  const history = useNavigate();
  const handleLogout = () => {
    auth.signOut().then(() => {
      // Redirect to login page after successful logout
      history('/'); // Change '/login' to your login page route
    }).catch((error) => {
      // Handle any errors during logout
      console.error('Error logging out:', error.message);
    })

  }



  const [loading, setLoading] = useState(true);

  const [isDialogOpenSavedata, setIsDialogOpenSavedata] = useState(false);

  const closeDialogSavedata = () => {
    setIsDialogOpenSavedata(false);
   // window.location.reload(); // This will reload the page
  };

  //No inter connection 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const closeDialog = () => {
    setLoading(false);
    setIsDialogOpen(false);

     const result = Sessionid.isCheckInterNet();
     if (result) {
         
      navigate('/')
        
     }
     else
     {

      window.location.reload();

     }

   // window.location.reload(); // This will reload the page
  };


  const handleClick = () => {
    console.log("You clicked me!");
    // Go back to the previous page
    navigate('/admin');
  };



  return (
    <>
      {/* <Navbar /> */}



      {/* {onlineStatus !== null && onlineStatus === false ? (
        <div style={{ textAlign: 'center', marginTop: '20%' }}>

          <h3>No Internet Connection</h3>
        </div>
      ) : ( */}

        <>


          {loading ? (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: '9999'
            }}>
              <div className="spinner-border text-danger" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : null}

          <div style={{ marginLeft: '15%', }}>

            <div>
              <div>
                <div style={{ marginLeft: '2%', }} onClick={handleClick}>
                  <h5>Back</h5>
                </div>
                <div>
                  {tokens.length > 0 ? (
                    <h2 className='Token_available'>Pending Request(s)</h2>
                  ) : (
                    <h2 className='Token_available'>No Pending Request</h2>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                  <div>
                    {tokens.length > 0 && (
                      <div className="flex-container_for_checkbox">
                        <input

                          type="checkbox"
                          id="selectAll"
                          // checked={selectAllChecked}
                          onChange={handleSelectAllChange}
                          className='checkbox'
                          disabled={loading}
                        />
                        <label className='label' htmlFor="selectAll">Select All</label>
                      </div>
                    )}
                  </div>

                  {tokens.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <button className="btn btn-primary" disabled={loading} onClick={() => generatetokenData()}>Generate Token for selected meter(s)</button>
                    </div>
                  )}


                </div>



                <div style={{ alignItems: 'center', }}>
                  {
                    tokens.map((link, index) => (
                      <div key={index} style={{ marginBottom: '20px' }}>

                        {/* {groupData && (
                         <div>
                           {Object.keys(groupData).map(key => (
                            <div key={key}>
                               <p>Group Name ({key}): {groupData.groupName}</p>
                                  <p>Serial Number ({key}): {groupData.serialNumber}</p>
                                  <p>Tariff ({key}): {groupData.tariff}</p>
                                    {/* Add more fields as needed */}
                        {/* </div>
                           ))}
                          </div>
                          )} */}

                        {/* Checkbox and Meter Serial */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                          <input
                            type="checkbox"
                            id={`checkbox_${index}`}
                            className='checkbox'
                            disabled={loading}
                          />
                          <div style={{ paddingLeft: '20px', margin: '5px' }}>
                            <div >
                              <div className='group_container'>
                                <div style={{ marginLeft: '3px' }}>
                                  <img
                                    className='Image'
                                    src="https://img.icons8.com/3d-fluency/94/group--v4.png"
                                    style={{ width: '45px', height: '45px', cursor: 'pointer' }}
                                    alt="User Group Icon"
                                  />
                                </div>

                                <div style={{ marginLeft: '8px' }}>

                                  <p className='group_para_groupname'>Group Name: {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).groupName.replace(/_/g, ' ')}</p>
                                  <p className='group_para_tariff'>Tariff Rate: ₹ {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).tariff}</p>

                                </div>
                              </div>
                            </div>



                            {/* {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']) && (
                          <p>Tariff: {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).tariff}</p> 

                          )} */}

                            <div style={{ margin: '20px', marginLeft: '0' }}>

                              {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']) ? (
                                <div style={{ display: 'flex', }} >
                                  {/* <p>Group Name: {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).groupName}</p> */}
                                  {/* <p>Tariff: {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).tariff}</p> */}

                                  <div className='meter_serial_number'>
                                    <p style={{ color: 'black', }}  > Meter Serial:{decryptDataOfRequest(getToken(link))['srNo']}  </p>
                                    {/* <p className='name2'> {decryptDataOfRequest(getToken(link))['srNo']}</p> */}
                                  </div>
                                  {/* <div className='paragraphDivesion'> 
                            <p className='name'>Name: {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).name}</p>
                              </div> */}

                                  <div className='paragraphDivesion'>
                                    <p className='name'>Name: </p>
                                    <p className='name2'> {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).name} </p>
                                  </div>

                                  <div className='paragraphDivesion'>
                                    <p className='name'>Location:  </p>
                                    <p className='name2'>{getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).location}</p>
                                  </div>

                                  {/* <p style={{padding:'10px'}}>Group Name: {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).groupName}</p> */}

                                  <div className='paragraphDivesion'>
                                    <p className='name'>Phone:  </p>
                                    <p className='name2'> {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).phone}</p>

                                  </div>
                                  {/*  <p>Email : {getGroupAndTariff(decryptDataOfRequest(getToken(link))['srNo']).email}</p> */}
                                  <div className='paragraphDivesion'>
                                    <p className='name'>Req Time :  </p>
                                    <p className='name2'>{decryptDataOfRequest(getToken(link))['timeOfToken']}</p>
                                  </div>

                                </div>
                              ) : (
                                <p>Group information not found for Serial Number</p>
                              )}
                            </div>
                          </div>


                        </div>

                        {/* Input Fields in Rows of Four */}
                        <div style={{ marginTop: '-4%' }}>
                          <div style={{ display: 'flex', margin: '10px', flexDirection: 'row', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '10px', width: '100%' }}>
                              <div style={{ flex: '1', margin: '10px' }}>
                                <label style={{ marginBottom: '5px' }}>Recharge amount</label>
                                <input
                                  type='text'
                                  // value={decryptDataOfRequest(getToken(link))['amount']}

                                  value={parseFloat(decryptDataOfRequest(getToken(link))['amount']).toFixed(2)}

                                  className='form-control'
                                  readOnly
                                  placeholder="Amount"
                                  disabled
                                />
                              </div>
                              <div style={{ flex: '1', margin: '10px' }}>
                                <label style={{ marginBottom: '5px' }}>Payment details</label>
                                <input
                                  type='text'
                                  value={getPaymentMode(link)}
                                  className='form-control'
                                  readOnly
                                  placeholder="Payment Mode"
                                  disabled
                                />
                              </div>
                              <div style={{ flex: '1', margin: '10px' }}>
                                <label style={{ marginBottom: '5px' }}>Total kWh at time of request</label>
                                <input
                                  type='text'

                                  value={parseFloat(decryptDataOfRequest(getToken(link))['kWh']).toFixed(2)}

                                  // value={decryptDataOfRequest(getToken(link))['kWh']}
                                  className='form-control'
                                  readOnly
                                  disabled

                                  placeholder="kWm"
                                />
                              </div>
                              <div style={{ flex: '1', margin: '10px' }}>
                                <label style={{ marginBottom: '5px', width: '110%', display: 'flex' }}>Available balance at time request</label>
                                <input
                                  type='text'
                                  // value={decryptDataOfRequest(getToken(link))['balance']}
                                  value={parseFloat(decryptDataOfRequest(getToken(link))['balance']).toFixed(2)}
                                  placeholder="Available Balance"
                                  className='form-control'
                                  readOnly
                                  disabled
                                />
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                  {/* < div style={{ textAlign: 'center', padding: '20px' }}>
                <button className="btn btn-primary" onClick={() => generatetokenData()}>Generate</button>
              </div> */}
                  {tokens.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <button className="btn btn-primary" disabled={loading} onClick={() => generatetokenData()}>Generate Token for selected meter (s)</button>
                    </div>
                  )}

                </div>



              </div>
            </div>

          </div >



        </>

      {/* )} */}


      <Modal show={isDialogOpenSavedata} onHide={closeDialogSavedata} backdrop="static" style={{ marginTop: '3%' }}>

        <Modal.Body>
          <p> {modalMessage1}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDialogSavedata}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>



      <Modal show={isDialogOpen} onHide={closeDialog} backdrop="static" style={{ marginTop: '3%' }}>

        <Modal.Body>
          <p> {modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDialog}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>



      {/* <Modal show={isDialogOpenResponse} onHide={closeDialogResponse} backdrop="static" style={{ marginTop: '3%' }}>

<Modal.Body>
  <p> {modalMessageResponse}</p>
</Modal.Body>
<Modal.Footer>
  <Button variant="primary" onClick={closeDialogResponse}>
    Close
  </Button>
</Modal.Footer>
</Modal> */}



    </>

  );
}

export default Adin;