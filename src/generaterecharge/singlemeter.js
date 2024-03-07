
import React, { useState, useEffect, useRef } from 'react';
import { functions, httpsCallable } from '../adminLogin/firebase';
import { database } from '../firebase'; // Import the Realtime Database instance
import firebase from 'firebase/compat/app'; // Import the Firebase app (latest version)
import 'firebase/compat/database'; // Import the Realtime Database (latest version)
import { auth } from '../adminLogin/firebase';
import 'firebase/compat/firestore'; // Import Firestore
import CryptoJS from 'crypto-js';
import Phonesms from './phonesms';
import axios from 'axios';
import SendEmailOtp from './email';
import Message from '../message'
import Generatetoken from '../reconfigtoken/generatetokenkey';
import Pendingtoken from './pendingtoken';
import { validateAmount } from '../validation/validation';
import { useNavigate } from 'react-router-dom';
import CommonFuctions from '../commonfunction';
import { Modal, Button } from 'react-bootstrap';
import './generete.css'




let selectedTariff = '';
function Singlemeter() {



    const Sessionid = new CommonFuctions();

    let counter = 0;
    let ltime = 0;
    const [selectOptions, setSelectOptions] = useState([]);
    const [data, setData] = useState({});
    const [serialOptions, setSerialOptions] = useState([]);
    const [selectedGroupData, setSelectedGroupData] = useState([]);
    const [searchExecuted, setSearchExecuted] = useState(false);
    const [selectedMeter, setSelectedMeter] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [meterList, setMeterList] = useState([]);
    const [error, setError] = useState('');
    const [mergedArray, setMergedArray] = useState([]);
    const [numberPart, setNumberPart] = useState(null);
    const [selectedGroupName, setSelectedGroupName] = useState('');
    // const [selectedTariff, setSelectedTariff] = useState('');
    const [selectedSerial, setSelectedSerial] = useState('');
    const [user, setUser] = useState(null); // State to hold user information
    const [tokenCount, setTokenCount] = useState('');
    const [rechargeAmount, setRechargeAmount] = useState(''); // Add state for Recharge Amount
    const [balance, setBalance] = useState('');
    const [formattedTime, setFormattedTime] = useState('');
    const [tokenurl, setTokenUrl] = useState('');
    const [tariffError, setTariffError] = useState(null);
    const [amountError, setAmountError] = useState(null);
    const [selectedEmail, setSelectedEmail] = useState('');
    const [selectedPhone, setSelectedPhone] = useState('');
    const [password, setPassword] = useState('');




    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                // User is logged in
                setUser(authUser);
                //  console.log("Logged in user:", authUser.email);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const numberPart = emailParts[0];
                    setNumberPart(numberPart);
                    //   console.log("Number part:", numberPart); // Log the extracted number part
                    updateSessionActiveTime(numberPart);
                    SessionValidate(numberPart);
                    handleSearch(numberPart);
                    handleSearch1(numberPart);
                    tokenNumber(numberPart);
                    availableBalance(numberPart);
                    getAdminPassword(numberPart)
                    // sendOTP(numberPart);


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
            setPassword(fetchedPassword?.password);
            // console.log("Admin password : ", fetchedPassword?.password);


        });
    };


    const handleSearch = async (phoneNumber) => {
        const trimmedPhoneNumber = phoneNumber.trim();
        if (trimmedPhoneNumber !== '') {
            try {
                const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
                const snapshot = await dataRef.once('value');
                const newData = snapshot.val();
                setData(newData || {});
                const groupName = newData ? Object.keys(newData)[0] : '';
                setSelectedGroupName(groupName);
                //console.log("check groupane ", groupName);
                setSelectedGroupData(newData);
                // console.log("data groupaname", newData);
                // Extract select options based on received data
                if (newData) {
                    const options = Object.keys(newData).map(key => key.replace(/\s/g, '_'));
                    setSelectOptions(options);
                    //   console.log('setSelectOptions', options);
                }
                setSearchExecuted(true);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error (e.g., show an error message to the user)
            }
        }
    };


    const extractSerialNumbers = () => {
        const extractedSerials = Object.values(data).reduce((acc, item) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                const keys = Object.keys(item);
                const filteredKeys = keys.filter((key) => !isNaN(Number(key)));
                acc.push(
                    ...filteredKeys.map((serial) => {
                        const serialInfo = {
                            serial,
                            name: item[serial].name,
                            tariff: item[serial].tariff,
                            phoneNumber: item[serial].phone,
                            email: item[serial].email
                        };
                        //  console.log("Serial Info:", serialInfo); // Print tariff information
                        return serialInfo;
                    })
                );
            }
            return acc;
        }, []);
        setSerialOptions(extractedSerials);
        ///  console.log("setSerialOptions", extractedSerials);
    };


    useEffect(() => {
        extractSerialNumbers();

    }, [data]);


    useEffect(() => {
        extractSerialNumbers();
        handleSearch1(numberPart); // Pass the numberPart here
    }, [numberPart]); // Add numberPart to the dependency array




    useEffect(() => {
        // Merge two arrays when either serialOptions or meterList changes
        const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId, tariff: null }))];
        // Sort the merged array alphabetically based on serial numbers
        const sortedMerged = merged.slice().sort((a, b) => a.serial.localeCompare(b.serial));
        // Remove duplicate values
        const uniqueMerged = Array.from(new Set(sortedMerged.map(item => item.serial)))
            .map(serial => sortedMerged.find(item => item.serial === serial));
        setMergedArray(uniqueMerged);
    }, [serialOptions, meterList]);



    const handleSearch1 = async (numberPart) => {
        try {
            const phoneNumberValue = numberPart.trim(); // Retrieve phone number
            if (phoneNumberValue !== '') {
                setPhoneNumber(phoneNumberValue); // Update phoneNumber state
                const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumberValue}/meterList`).once('value');
                const fetchedMeterList = snapshot.val();
                //   console.log("meteltelsit ", fetchedMeterList);
                if (fetchedMeterList) {
                    const meterIds = Object.keys(fetchedMeterList);

                    Object.keys(fetchedMeterList).forEach(async (serialNumber) => {
                        await isTokenAvailable(serialNumber);
                    });

                    setMeterList(meterIds);
                    setError('');
                } else {
                    setMeterList([]);
                    setError('No meter list found for this admin phone');
                }
            }
        } catch (error) {
            //  console.error('Error fetching admin meter list:', error);
            setMeterList([]);
            setError('Error fetching admin meter list. Please try again.');
        }
    };


    const availableBalance = async (selectedSerial) => {
        try {
            // console.log(selectedSerial);
            const dataRef = await firebase.database().ref(`/adminRootReference/meterDetails/${selectedSerial}`);
            const snapshot = await dataRef.once('value');
            const newData = snapshot.val();

            if (newData && newData.kwhData) {
                const balance = newData.kwhData.balance;
                setBalance(balance);
                // console.log("Available Balance: ", balance);

            } else {
                //    console.log("kwhData not found in the received data");
            }

        } catch (error) {
            console.error("Error retrieving data:", error.message);
            // Handle the error as needed
        }
    };


    const tokenNumber = async (selectedSerial) => {
        try {
            const snapshot = await firebase.database().ref(`/adminRootReference/meterDetails/${selectedSerial}/`).once('value');

            if (snapshot.exists()) {
                const data = snapshot.val();

                // console.log("Full data:", data); // Log the entire data object

                if (data.rechargeToken != null) {
                    const tokenKeys = Object.keys(data.rechargeToken);

                    // Set the token count state
                    const tokenCount = parseInt(data.rechargeToken[tokenKeys[tokenKeys.length - 1]]);
                    //   console.log("my token count: ", tokenCount);
                    // Check if tokenCount is not null or undefined
                    if (!isNaN(tokenCount)) {
                        //   console.log("Token count: ", tokenCount + 1);
                        setTokenCount(tokenCount + 1);
                    } else {
                        console.log("Token count not available.");
                        // Set a default value of 1 if tokenCount is not available
                        setTokenCount(1);
                    }
                } else {
                    console.log("rechargeToken not available.");
                    // Set a default value of 1 if rechargeToken is not available
                    setTokenCount(1);
                }
            } else {
                ////////   console.log('Data not found for the selected serial number.');
                setTokenCount(1);
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };



    const formattedTokenCount =
        selectedSerial ? (tokenCount < 10 ? `0${tokenCount}` : String(tokenCount)) : '';
    // ...


    const handleGenerateClick = async () => {
        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await Sessionid.HandleValidatSessiontime(phoneNumber);
        if (storeSessionId === sessionId) {

            Sessionid.updateSessionTimeActiveUser(phoneNumber);



            if (!rechargeAmount) {
                setAmountError('Enter Recharge Amount.');
            }



            if (!selectedTariff) {
                setTariffError('Please provide Tariif Rate.');
            }

            else {



                try {
                    const ref = firebase.database().ref(`/adminRootReference/meterDetails/${selectedSerial}/rechargeRequestToken`);
                    const snapshot = await ref.once('value');
                    const fetchedMeterList = snapshot.val();
                    const isUsedValue = fetchedMeterList.isUsed;
                    if (isUsedValue === 'false') {

                        await ref.child('isUsed').set('true');

                        getnerateRechargeToken();

                        console.log("Token is now used.");
                    } else {

                        getnerateRechargeToken();

                        console.log("No pending Token.");
                    }
                } catch (error) {
                    console.log(error);
                }
            }

        } else {

            alert("You have been logged-out due to log-in from another device.");
            // console.log('you are logg out ');
            handleLogout();
        }


    }



    // const handleGenerateClick = async () => {
    //     //    const time = await serverTimeFirebase();
    //     //    console.log("my time ", time );
    //     // if (!selectedTariff) {
    //     //      setTariffError('Please provide Tariif Rate.');
    //     // }
    //     // // Check if rechargeAmount is null

    //     //    console.log("my time ", amount );

    //     // const usedAmount = rechargeAmount || amount;

    //     if (!rechargeAmount) {
    //         setAmountError('Enter  Recharge Amount.');
    //     }
    //     // else {

    //     //    // getnerateRechargeToken();
    //     //     //  sendOTP();

    //     // }   

    //     try {
    //         const snapshot = await firebase.database().ref(`/adminRootReference/meterDetails/${selectedSerial}/rechargeRequestToken`).once('value');
    //         const fetchedMeterList = snapshot.val();
    //       //  console.log(fetchedMeterList);
    //        //  console.log('check isUsed Valeus', fetchedMeterList.isUsed);
    //        //  console.log('check request Links', fetchedMeterList.requestLink);

    //           const isUsedValeu =  fetchedMeterList.isUsed; 
    //           const token =  fetchedMeterList.requestLink;
    //           if (isUsedValeu == 'false'){


    //             await snapshot.child('isUsed').set('true');


    //           }

    //           else{

    //               console.log("No pending Token ");
    //           }
    //     } catch(error) {
    //         console.log(error);

    //     }
    // }


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
            const formattedTimes = `${year}-${month}-${day} ${hours}:${minutes}:${'00'}`;

            // console.log("Firebase Server Time:", formattedTime);
            //   console.log("Firebase Server Timessss:", formattedTimes);

            setFormattedTime(formattedTimes);
            return formattedTimes;

        } catch (error) {
            console.error('Error fetching Firebase server time:', error);

            return null;

        }
    };

    function getLocalTime() {
        counter++;
        ltime = new Date().getTime();
        // console.log("My Time ", ltime);
        //  console.log(counter);
    }
    getLocalTime();

    const type = '01';
    const pass = password;

    const getnerateRechargeToken = async () => {
        const serverTime = await serverTimeFirebase();
        console.log("my time ", serverTime);

        //  console.log("timee", serverTime);
        //  console.log("token count", tokenCount.toString());
        //  console.log("rechargeAmount", rechargeAmount);
        //  console.log('hhhhhh', serverTime, type, numberPart, selectedSerial, pass, rechargeAmount, selectedTariff, tokenCount, balance);
        //  console.log("Available balance: " + balance);
        const rechargeAmount1 = parseFloat(rechargeAmount).toFixed(2);
        //   console.log('Recharge of the amount :', rechargeAmount1);
        const tokenCount1 = ('0' + (parseInt(tokenCount, 10))).slice(-2);
        //   console.log('my token Data is ' + tokenCount1);
        const dateObj = new Date(serverTime);
        const year = dateObj.getFullYear().toString();
        const month = (dateObj.getMonth() + 1).toString(); // Adding 1 since months are zero-indexed
        const day = dateObj.getDate().toString();
        const hour = dateObj.getHours().toString().padStart(2, '0');;
        const minute = dateObj.getMinutes().toString();
        const typeHex = '01';
        const srHex = parseInt(selectedSerial).toString(16).padStart(6, '0');
        const dayHex = (parseInt(day, 10)).toString(16).padStart(2, '0');
        // const dayHex = ('0' + (parseInt(day, 10)).toString(16)).slice(-2);
        //console.log('dayHex', dayHex);
        const hourHex = (parseInt(hour, 10)).toString(16).padStart(2, '0');
        const minuteHex = (parseInt(minute, 10)).toString(16).padStart(2, '0');
        const monthHex = (parseInt(month, 10)).toString(16).padStart(2, '0');
        const yearHex = (parseInt(year.toString().substring(2), 10)).toString(16).padStart(2, '0');
        const tknhex = parseInt(tokenCount.toString(), 10).toString(16).padStart(2, '0');
        // console.log("token data hex ", tknhex);
        const amhex = parseInt(rechargeAmount.toString(), 10).toString(16).padStart(4, '0');
        //  console.log("Amout data hex ", amhex);
        // Convert 'am' to a fixed decimal number with two decimal places,
        // then convert it to hexadecimal and ensure it retains two decimal places


        if (!selectedTariff.includes(".")) {

            selectedTariff = selectedTariff + ".00";

        }
        const tfhex = parseInt(selectedTariff.replace(".", ""), 10).toString(16).padStart(4, '0')
        // const tfhex = parseInt(tariffrate.replace(".", ""), 10).toString(16).padStart(4, '0');
        console.log("hex Tariff  ", tfhex);

        const phhex = parseInt(numberPart.toString(), 10).toString(16).padStart(10, '0');
        // console.log("typehex", typeHex, srHex, dayHex, monthHex, yearHex, hourHex, minuteHex, tknhex, amhex, tfhex, phhex);
        const hextokenData = `${typeHex}${srHex}${dayHex}${monthHex}${yearHex}${hourHex}${minuteHex}${tknhex}${amhex}${tfhex}${phhex}`;
        console.log('hexalldata ', hextokenData);
        console.log('trarrie token ', tfhex);
        const part1 = hextokenData.substring(0, 32);
        const part2 = hextokenData.substring(32);
        console.log("part1", part1);
        console.log("part2", part2);

        const key = getKey(phhex, srHex, password);
        //  console.log('key', key);
        const result = encryptData(part1, key);

        //  console.log("Main result", result);

        const data = result + part2;
        //  console.log('May data >', data);
        var formatData = '5657' + '18' + '52434D5452' + data;
        const CRC = checksum(formatData);
        // formatData = token for recharge (reachege toke to )
        formatData = formatData + CRC + '56'; //token is
        //   console.log("generateFormattedData: CRC " + formatData);
        const amount8 = parseInt(rechargeAmount.toString(), 10).toString(16).padStart(8, '0');
        // const tfhex4 = parseInt((tf / 100.0).toString(), 10).toString(16).padStart(4, '0');
        const tfhex4 = parseInt(selectedTariff.replace(".", ""), 10).toString(16).padStart(4, '0');
        // const tfHexadecimal = (tf / 100.0).toString(16).replace(/\.(.*)/, (_, decimal) => '.' + parseFloat(`0.${decimal}`).toFixed(2));
        ///  console.log("new define tarrif rate ", selectedTariff);
        const timehex = parseInt(ltime.toString(), 10).toString(16).padStart(12, '0');
        //   console.log("time hex vauesl", timehex);

        // const timehex = parseInt((printServerTimestamp()).toString(), 10).toString(16).padStart(12, '0');
        const totalData = `${amount8}${tfhex4}${timehex}FFFFFFFF`;

        //  console.log("new totaldata ", totalData);
        // console.log("new Server time ", ltime );
        // console.log ('total data: ', totalData);
        // console.log ('timestampehx : ', timehex);
        //   console.log('Single tarrif ', tfhex4);
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
        const finalUrls = `https://dk9936.github.io/re-tok-${tokenCount1}-${selectedSerial}-${formattedDate}-${formattedTime}/${formatData}${ulrData}`;
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

        uploadDate(
            selectedSerial,
            tokenCount,
            formatData,
            finalUrls,
            formattedDate3,
            formatData,
            mybalance,
            rechargeAmount1,
            selectedTariff,);

        console.log("finalUrls", finalUrls);

        setTokenUrl(finalUrls);
        sendOTP(finalUrls);
        handleSendMessage(finalUrls);



        return finalUrls;
    }

    const uploadDate = (
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
        let tk = (parseInt(tokenId)).toString();
        if (tk.length === 1) {
            tk = "0" + tk
        }
        const baseUrlMeterDetails = database.ref('/adminRootReference/meterDetails/');
        const tokensRef = baseUrlMeterDetails.child(selectedSerial).child('rechargeToken');

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

            tokensRef.child(`${ltime}-${tk}`).set({
                balance: "null",
                isEmergency: false,
                isOC: false,
                kwh: "null",
                phoneNumber: numberPart, //adminPhone.toString()
                link: finalUrls,
                rechargeAmount: formattedAm, //rechargeAmount.toString()
                rechargeToken: formatData, // finalUrls.toString()
                serialNumber: srNumber,
                tariffRate: tfRate,
                tokenGenerationTime: formattedDate3,
                tokenId: tk
            }).then(() => {
                console.log('Data Updated Successfully');
                alert('Data upload successful');
                // sendOTP();
                //  handleSendMessage ();


                //  window.location.reload(); // This line reloads the page
            }).catch((error) => {
                console.error('Error updating data:', error);
            });

            updateTokenCount(tk, srNumber);
        });

    };

    function updateTokenCount(token, selectedSerial) {
        const baseUrlMeterDetails = database.ref('/adminRootReference/meterDetails/');
        const tokensRef = baseUrlMeterDetails.child(selectedSerial).child('rechargeToken');

        tokensRef.update({
            tokenCount: token
        });

    }

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
        console.log("Data:", data);
        console.log("Original Key11:", key);
        if (key.length > 32) {
            key = key.substring(0, 32);
        } else {
            while (key.length < 32) {
                key += '0';
            }
        }
        console.log("Processed Key:", key);
        const allData = data + data;
        const originalKey = encryptData(allData, key)

        console.log("Original Key:", originalKey);

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
 
    const handleTariffChange = (e) => {
        //   setSelectedTariff(e.target.value);
        selectedTariff = e.target.value;
        // Reset tariff error when there is a change
        setTariffError(null);
    };



    // const handleInputChange = (e) => {
    //     // Remove any non-digit characters and leading zeros
    //     let sanitizedValue = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '');

    //         setRechargeAmount(sanitizedValue);


    // };




    const handleInputChange = (e) => {
        // Remove any non-digit characters and leading zeros

        setRechargeAmount('');

        let sanitizedValue = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '');

        const value = e.target.value;

        // Validate the value
        // const isValid = validateAmount(sanitizedValue);
        const isValid = validateAmount(value);

        if (isValid || sanitizedValue === '') {
            setRechargeAmount(sanitizedValue);
        } else {
            // Show error message
            // console.error('Invalid amount. Please enter a value between 1 and 50,000 without decimal digits (paise).');
        }

        // let sanitizedValue = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '') ;
        // setRechargeAmount(sanitizedValue);
    };


    const sendOTP = async (urls) => {

        console.log("Nmy Number  ", selectedPhone);
        console.log("check url ", urls);

        let part1 = (urls.substring(32, 53));
        let part2 = (urls.substring(54, 87));
        let part3 = (urls.substring(87, 117));
        let part4 = (urls.substring(117));

        console.log("part1", part1);
        console.log("part2", part2);
        console.log("part3", part3);
        console.log("part4", part4);

        let phoneNumber = selectedPhone;
        console.log(" mera phone number", phoneNumber);

        const otpCode = urls;
        console.log('Generated Token:', urls); // Log the OTP in the console
        const apiKey = 'Ar2Wnv0UdDJbGb4bre87vb1P5DbEhhv7FipucwNvE5R1PmqIvPjd3d4R9GLF'; // Replace with your Fast2SMS API key
        const message = '142210';
        const apiUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&sender_id=MAXMIJ&message=${message}&variables_values=${part1}|${part2}|${part3}|${part4}  &route=dlt&numbers=${phoneNumber}`;

        try {
            const response = await axios.get(apiUrl);
            console.log(response.data);
            console.log('Token  sent successfully!');

        } catch (error) {
            console.error('Error sending Token:', error);
            console.log('Failed to send Token. Please try again.');
        }


    }


    const handleSendMessage = async (urls) => {

        console.log("selected email  address", selectedEmail);
        console.log("check url ", urls);

        let result = Message(urls, selectedEmail);

        console.log("Signlemetere: Send url successfull ", result);

    }



    // const handleSendMessage = async (urls) => {
    //     console.log("selected email address", selectedEmail);
    //     console.log("check url ", urls);

    //     try {
    //         let result = await Message(urls, selectedEmail);
    //         console.log("Signlemetere: Send url successful ", result);
    //     } catch (error) {
    //         console.error("Signlemetere: Error sending url", error);
    //     }
    // }


    const [tokenStatus, setTokenStatus] = useState([]);

    const isTokenAvailable = async (serialNumber, index) => {
        try {
            const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${serialNumber}/reConfigToken`);
            const snapshot = await meterDetailsPath.once('value');
            const newData = snapshot.val();
            if (!newData) {
                // console.log(`Data not found for serial number ${serialNumber}`);
                return;
            }
            const isTransfer = newData.isTransfer;
            const token = newData.token;

            let status;
            if (isTransfer === 'false' && token !== 'null') {
                //  console.log('single *')
                status = "*";
            } else if (isTransfer === 'true' && token !== 'null') {
                // console.log('Double  *')
                status = "**";
            } else {
                status = "";
            }

            setTokenStatus(prevState => ({
                ...prevState,
                [serialNumber]: status
            }));
        } catch (e) {
            console.log('Error Fetching:', e);
        }
    };

    useEffect(() => {
        mergedArray.forEach(({ serial }, index) => {
            isTokenAvailable(serial, index);
        });
    }, [mergedArray]);




    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mytoken, setMyToken] = useState(null);
    const [loading, setLoading] = useState(false);

    const openModal = () => {
        setIsModalOpen(false);
    };

    const closeModal = () => {
        setRechargeAmount('');
        setSelectedSerial('');
        selectedTariff = ''; 
        setSelectedSerial('');
        setSelectedMeter('');
        setIsModalOpen(false);

    };

    const fetchDataFromFirebase = async (srNumber) => {
        const token = new Pendingtoken();
        //  console.log('select sr number :', srNumber);
        const mytoken = await token.viewPedingToken(srNumber);
        if (mytoken && mytoken.srNo === srNumber) {
    
            setMyToken(mytoken);
            setIsModalOpen(true);
            setRechargeAmount(mytoken.amount);
        } else {
            setRechargeAmount('');
            setLoading(false);
            ///alert('No token data available');
        }
    };


    const updateSessionActiveTime = (numberPart) => {
        Sessionid.updateSessionTimeActiveUser(numberPart);
    }

    const SessionValidate = async (numberPart) => {
        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await Sessionid.HandleValidatSessiontime(numberPart);
        if (storeSessionId === sessionId) {
            //   console.log('SessionId Match ');
        } else {
            alert("Cannot login. Another session is active. Please retry after sometime. ");
            //  console.log('you are logg out ');
            handleLogout();
        }
    };


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



    

    return (
        <>

             {/* First Row */}
      
      <div className='responsive'>
            <div className='container' >

                <div className='container w-50'>

                    <div>
                        <h3>  Generate Recharge Token for Single Meter  </h3>
                    </div>

                    <div className="row mb-3 ">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Select Meter Serial Number</label>
                            <select
                                className="form-select w-100"
                                value={selectedMeter}
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    const [selectedSerial, selectedName] = selectedValue.split(' - ');
                                    const selectedInfo = mergedArray.find(item => item.serial === selectedSerial);
                                    const selectedEmail = selectedInfo ? selectedInfo.email : 'N/A';
                                    const selectedPhone = selectedInfo ? selectedInfo.phoneNumber : 'N/A';

                                    if (selectedValue.includes('-')) {

                                        setSelectedMeter(selectedValue);

                                    } else {
                                        console.log('You selected only meter:', selectedValue.split(' - ')[0]);
                                        alert('Group details not available. Please Create a group. ', selectedValue);
                                        setSelectedMeter(selectedValue.split(' - ')[0]); // Set only the serial part without the name to the state
                                    }
                                    setSelectedGroupName(selectedGroupName);
                                    setSelectedEmail(selectedEmail);
                                    setSelectedPhone(selectedPhone);
                                    setSelectedSerial(selectedSerial);

                                    selectedTariff = selectedInfo?.tariff;
                                    setSelectedMeter(selectedValue);
                                    // Fetch and print tokens based on the selected serial number
                                    tokenNumber(selectedSerial);
                                    availableBalance(selectedSerial);
                                    fetchDataFromFirebase(selectedSerial)
                                }}
                            >
                                <option>Meter List </option>
                                {mergedArray.map(({ serial, name, }, index) => (
                                    <option key={index} value={name ? `${serial} - ${name}` : serial}>

                                        {serial} {tokenStatus[serial]}{name}
                                    </option>
                                ))}

                            </select>
                        </div>

                        {/* Second Input Field */}

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Tariif rate(as defined in consumer group) </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Tariif Rate"
                                value={selectedTariff || ''}
                                onChange={handleTariffChange}
                                readOnly
                                disabled
                            // Add necessary state and onChange handler
                            />
                            {tariffError && <div style={{ color: 'red' }}>{tariffError}</div>}
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label">Recharge Amount</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Recharge Amount"
                                value={rechargeAmount}
                                onChange={handleInputChange}


                            />
                            {amountError && <div style={{ color: 'red' }}>{amountError}</div>}
                            <span>Min. limit 1, max. limit 50,000, Decimal digit (Paise Notallowed )</span>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Token Number </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Token Number "
                                value={formattedTokenCount}
                                //  value={tokenCount}
                                onChange={(e) => setTokenCount(e.target.value)}
                                readOnly
                                disabled
                            // Add necessary state and onChange handler
                            />
                        </div>

                        <div className="col-md-12 text-center ">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleGenerateClick()}
                            >
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
                <div className='container w-50' style={{ marginLeft: '20%' }} >
                    <p>{tokenurl}</p>
                </div>

                {/* <p>{selectedEmail}</p>
                <p>{selectedPhone}</p> */}




            </div>


            </div>


            <Modal show={isModalOpen} onHide={closeModal} backdrop="static" style={{ position: 'fixed', top: '70%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Modal.Header closeButton>
                    <Modal.Title>Request Recharge Token</Modal.Title>
                </Modal.Header>
                <Modal.Body  className='bg-light'>
                    {isModalOpen && (
                        <>
                            <p>Meter Serial: {mytoken.srNo}</p>
                            <p>Payment Details: {mytoken.paymentMode}</p>
                            <p>Total KwH: {parseFloat(mytoken.kWh).toFixed(2)}</p>
                            <p>Available Balance: {parseFloat(mytoken.balance).toFixed(2)}</p>
                            <p>Recharge Amount: {parseFloat(mytoken.amount).toFixed(2)}</p>
                            <p>Time of Request: {mytoken.decryptedData.timeOfToken}</p>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <div className="d-flex justify-content-center w-100">
                        {/* <button className="btn btn-primary" onClick={() => handleEditButtonClick(clickedItem.serialNumber)}> Edit </button> */}

                        <button className="btn btn-primary" onClick={openModal} style={{ marginRight: '20px' }} > Proceed  </button>

                        <button className="btn btn-success" onClick={closeModal} > Cancle</button>
                    </div>

                </Modal.Footer>

            </Modal>




        </>
    )
}

export default Singlemeter