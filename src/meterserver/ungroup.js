import React, { useEffect, useState } from 'react';
import Navbar from '../adminLogin/navbar';
import { auth } from '../adminLogin/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import '../meterdetailonserver/meterdetail.css';
import { database } from '../firebase';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CommonFuctions from '../commonfunction';


import {

  FacebookIcon,
  WhatsappIcon,
  FacebookShareButton,
  EmailShareButton,
  WhatsappShareButton,

} from "react-share";


 

function Ungroup() {
  const [data, setData] = useState({});
  const [meterList, setMeterList] = useState([]);
  const [error, setError] = useState('');
  const [serialOptions, setSerialOptions] = useState([]);
  const [selectOptions, setSelectOptions] = useState([]);
  const [selectedGroupData, setSelectedGroupData] = useState([]);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mergedArray, setMergedArray] = useState([]);
  const [user, setUser] = useState(null); // State to hold user information
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSerial, setSelectedSerial] = useState(null);
  let [formettedtime, setFormerttedTime] = useState('');
  let [formettedtimeonmeter, setFormerttedTimeOnMeter] = useState('');
  let [rechargdata, setRechargData] = useState('');
  const [billData, setBillData] = useState({});
  const [kwhData, setKwhData] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [reconfig, setReconfig] = useState('');
  const [monthData, setMonthData] = useState('');


  const SessionTime = new CommonFuctions();



  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {

    setBillData([]);
    setKwhData([]);
    setRechargData([]);
    setFormerttedTime([]);
    setFormerttedTimeOnMeter('');
    setMonthData([]);
    setModalIsOpen(false);

  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is logged in
        setUser(authUser);
        //  console.log("Logged in user:", authUser.email);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];
          //  console.log("Number part:", numberPart); // Log the extracted number part
          setPhoneNumber(numberPart);
          handleSearch(numberPart);
          handleSearch1(numberPart);
          SessionValidate(numberPart);
          SessionUpdate(numberPart);


        }
      } else {
        setUser(null);
        window.location.href = '/'; // Redirect to your login page
      }
    });
    return () => {
      setIsLoading(false);
      unsubscribe(); // Cleanup function for unmounting
    };
  }, []);


  const handleSearch = async (phoneNumber) => {
    const trimmedPhoneNumber = phoneNumber.trim();
    if (trimmedPhoneNumber !== '') {
      try {
        const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
        const snapshot = await dataRef.once('value');
        const newData = snapshot.val();
        setData(newData || {});
        setSelectedGroupData(newData);
        //   console.log("data", newData);

        // Extract select options based on received data
        if (newData) {
          const options = Object.keys(newData).map(key => key.replace(/\s/g, '_'));
          setSelectOptions(options);
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
        acc.push(...filteredKeys.map(serial => ({ serial, name: item[serial].name })));
      }
      //  console.log("return data")
      return acc;
    }, []);
    setSerialOptions(extractedSerials);
  }
  useEffect(() => {
    extractSerialNumbers();
  }, [data]);

  const extractGroupNames = () => {
    if (data) {
      const groupNames = Object.keys(data).filter(key => key !== 'tariff');
      return groupNames;
    }
    return [];
  };

  useEffect(() => {
    // console.log('Group Names:', extractGroupNames());
  }, [data]);




  const handleSearch1 = async (numberPart) => {
    try {
      if (numberPart === undefined || numberPart === null) {
        return;
      }

      const phoneNumberValue = numberPart.trim(); // Retrieve phone number
      if (phoneNumberValue !== '') {
        setPhoneNumber(phoneNumberValue); // Update phoneNumber state
        const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumberValue}/meterList`).once('value');
        const fetchedMeterList = snapshot.val();
        //console.log("meteltelsit ", fetchedMeterList);
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
      console.error('Error fetching admin meter list:', error);
      setMeterList([]);
      setError('Error fetching admin meter list. Please try again.');
    }
  };


  useEffect(() => {
    extractSerialNumbers();
    handleSearch1();
  }, []);


  useEffect(() => {

    const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];
    setMergedArray(merged);
  }, [serialOptions, meterList]);

  useEffect(() => {
    const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];

    const uniqueSerialsMap = new Map();

    merged.forEach(item => {
      if (item.name) {
        // If a serial number already exists in the map, skip adding it (as we only want unique serials with names)
        if (!uniqueSerialsMap.has(item.serial)) {
          uniqueSerialsMap.set(item.serial, item.name); // Store serial number with its name
        }
      } else {
        // If no name is available, check for duplicates and store only one entry
        if (!uniqueSerialsMap.has(item.serial)) {
          uniqueSerialsMap.set(item.serial, null); // Store serial number without a name
        }
      }
    });
    const uniqueSerialsArray = Array.from(uniqueSerialsMap).map(([serial, name]) => ({ serial, name }));
    uniqueSerialsArray.sort((a, b) => a.serial.localeCompare(b.serial));

    setMergedArray(uniqueSerialsArray);
  }, [serialOptions, meterList]);



  const groupMergedArrayByNames = () => {
    const groupedMeters = {};

    mergedArray.forEach(({ serial, name }) => {
      if (name) {
        if (!groupedMeters[name]) {
          groupedMeters[name] = [];
        }
        groupedMeters[name].push(serial);
      }
    });

    return groupedMeters;
  };
  const groupedMeters = groupMergedArrayByNames();


  const handleSerialClick = async (serial) => {

    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
    if (storeSessionId === sessionId) {

      SessionTime.updateSessionTimeActiveUser(phoneNumber);



      setRechargData('');
      console.log("Selected Serial:", serial);

      handleSerialClickData(serial);
      handleMeterList(serial);
      handleGenerateButton(serial);

      setSelectedSerial(serial);
      handleOpenModal();



    } else {

      alert("You have been logged-out due to log-in from another device.");
      // console.log('you are logg out ');
      handleLogout();
    }



  };




  const handleSerialClickData = async (serial) => {
    try {
      // Fetch data from meterDetails for the given serial
      const serialDataRef = database.ref(`/adminRootReference/meterDetails/${serial}`);
      const snapshot = await serialDataRef.once('value');
      const serialData = snapshot.val();
      const billData = serialData.ocData;

      /// console.log("bill data values ", billData);
      // const rechargdata = serialData.rechargeToken;

      // console.log("recharg data values", rechargdata);

      // setRechargData(rechargdata)

      const updatedBillData = serialData.ocData;

      // console.log("bill data values ", updatedBillData);

      setBillData(updatedBillData);



      const monthData = Object.entries(serialData.billData);
      // Use slice to exclude the first element (index 0)
      const updatedMonthData = monthData.slice(1);

      setMonthData(updatedMonthData);

      const reConfigtime = serialData.reConfigToken;

      // console.log("tokenGeneratedTime111111111111111: ",serialData.reConfigToken.tokenUsedTime);
      const tokenGeneratedTime = reConfigtime.tokenUsedTime;
      console.log("tokenGeneratedTime112111: ", tokenGeneratedTime);
      const serialData1 = parseInt(tokenGeneratedTime); // Parse the input as an integer
      if (isNaN(serialData1) || serialData1 < 0) {
        //  console.error("Invalid timestamp");
      } else {
        const timestampDate = new Date(serialData1); // Use serialData1 instead of tokenGeneratedTime
        if (isNaN(timestampDate.getTime())) {
          //    console.error("Invalid date");
        } else {
          const year = timestampDate.getFullYear().toString().slice(2);
          const month = ('0' + (timestampDate.getMonth() + 1)).slice(-2);
          const day = ('0' + timestampDate.getDate()).slice(-2);
          const hours = ('0' + timestampDate.getHours()).slice(-2);
          const minutes = ('0' + timestampDate.getMinutes()).slice(-2);
          const seconds = "00";
          const formattedTime = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
          console.log("Formatted Time: ", formattedTime);
          setReconfig(formattedTime);
          // setFormattedTime(formattedTime);
        }
      }


      // for (const timestamp in billData) {
      // console.log(timestamp);
      // const billDetails = billData[timestamp];
      // for (const property in billDetails) {
      // console.log(`${property}: ${billDetails[property]}`);
      // }
      // console.log(); // Add an empty line for better readability
      // }
      const billDataKeys = Object.keys(serialData.billData);
      // Logging the result
      // console.log("First child key under billData:", billDataKeys[0]);
      if (serialData && serialData.billData) {
        const billDataKeys = Object.keys(serialData.billData);

        if (billDataKeys.length > 0) {
          const firstChildKey = billDataKeys[0].split(' ')[1];
          const serialData = parseInt(firstChildKey); // Parse the input as an integer
          if (isNaN(serialData) || serialData < 0) {
            // console.error("Invalid timestamp");
          } else {
            const timestampDate = new Date(serialData);

            if (isNaN(timestampDate.getTime())) {
              console.error("Invalid date");
            } else {
              const year = timestampDate.getFullYear().toString().slice(2);
              const month = ('0' + (timestampDate.getMonth() + 1)).slice(-2);
              const day = ('0' + timestampDate.getDate()).slice(-2);
              const hours = ('0' + timestampDate.getHours()).slice(-2);
              const minutes = ('0' + timestampDate.getMinutes()).slice(-2);
              const seconds = "00";
              const formattedDate = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}.`;
              console.log("Formatted Time: ", formattedDate);
              setFormerttedTimeOnMeter(formattedDate);
            }
          }
          // Logging the result
          console.log("First child key under billData:", firstChildKey);
        } else {
          // console.log("No keys under billData.");
        }
      } else {
        // console.log("Either serialData or billData is undefined.");
      }
      // console.log('meter server info:', serialData);
      // console.log("KwhData", serialData.kwhData);
      setKwhData(serialData.kwhData);
    } catch (error) {
      console.error('Error fetching serial data:', error);
    }
  };



  const handleMeterList = async (serial) => {
    // console.log('phone number from meterDetails ', phoneNumber);
    try {

      const serialDataRef = database.ref(`/adminRootReference/adminDetails/${phoneNumber}/meterList/${serial}`);
      const snapshot = await serialDataRef.once('value');
      const serialData1 = snapshot.val();
      // console.log('meter server info 111:', serialData1);


      const serialData = parseInt(serialData1); // Parse the input as an integer
      if (isNaN(serialData) || serialData < 0) {
        // console.error("Invalid timestamp");
      } else {
        const timestampDate = new Date(serialData);

        if (isNaN(timestampDate.getTime())) {
          // console.error("Invalid date");
        } else {
          const year = timestampDate.getFullYear().toString().slice(2);
          const month = ('0' + (timestampDate.getMonth() + 1)).slice(-2);
          const day = ('0' + timestampDate.getDate()).slice(-2);
          const hours = ('0' + timestampDate.getHours()).slice(-2);
          const minutes = ('0' + timestampDate.getMinutes()).slice(-2);
          const seconds = "00";
          const formattedDate = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}.`;

          // console.log("Formatted Time: ", formattedDate);

          setFormerttedTime(formattedDate);
        }
      }

    } catch (error) {
      console.error('Error fetching meter data:', error);
      // Handle error (e.g., show an error message to the user)
    }
  }



  const handleGenerateButton = async (serial) => {
    try {
      // Ensure that serial is a string
      if (typeof serial !== 'string') {
        console.error("Invalid serial value. It must be a string.");
        return;
      }

      const serialDataRef = database.ref(`/adminRootReference/meterDetails/${serial}`);
      const snapshot = await serialDataRef.once('value');
      const serialData = snapshot.val();
      console.log("Serial data1111 ", serialData);


      console.log("Serial data rechargr  ", serialData.rechargeToken);


      if (!serialData || serialData.rechargeToken === undefined) {
        console.error("Serial data or recharge token not available111111");
        return;
      }
      console.log("Generate recharge token ", serialData.rechargeToken);
      const rechargeData = serialData.rechargeToken;
      // Convert the object to an array of key-value pairs
      const dataArray = Object.entries(rechargeData);
      // Reverse the array
      const reversedArray = dataArray.reverse();

      // Exclude the last element in the reversed array
      const excludedLastElementArray = reversedArray.slice(0, reversedArray.length - 0);

      // Convert the excluded last element array back to an object
      const reversedObject = Object.fromEntries(excludedLastElementArray);

      // Set the reversed data in your state
      setRechargData(reversedObject);
    } catch (error) {
      console.error("Error fetching or processing data:", error.message);
    }
  };



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
        status = "*";
      } else if (isTransfer === 'true' && token !== 'null') {
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
  const SessionValidate = async (numberPart) => {

    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await SessionTime.HandleValidatSessiontime(numberPart);
    // console.log("Received session ID from server: ", sessionId);

    if (storeSessionId === sessionId) {
      //  console.log('SessionId Match ', sessionId);
      return;
    } else {
      //  console.log('SessionId Mismatch');
      alert("Cannot login. Another session is active. Please retry after sometime. ");
      // console.log('you are logged out ');
      handleLogout();
    }

  };
  const SessionUpdate = (numberPart) => {
    SessionTime.updateSessionTimeActiveUser(numberPart);
  }







  return (


    <>

      <div style={{ marginLeft: '20%' }} >
        <div className='container'>
          {isLoading ? (
            <div>Loading...</div>
          ) : (

            <>

              <Modal show={modalIsOpen} onHide={handleCloseModal}    backdrop="static">
                <Modal.Header closeButton>
                  <Modal.Title>Meter Detials on server </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div>
                    {
                      selectedSerial ? ( // If selectedSerialInfo.serial is truthy
                        <div>
                          <h4 style={{ color: 'DodgerBlue' }}>Meter Details</h4>
                          <p>Serial: {selectedSerial || 'Not Available'}</p>
                          <p>Available Balance (₹): {kwhData && kwhData.balance !== undefined ? kwhData.balance : 'Not Available'}</p>
                          <p>TotalKwh (₹): {kwhData && kwhData.totalKwh !== undefined ? kwhData.totalKwh : 'Not Available'}</p>
                          <p>Earth Tamper Kwh (₹): {kwhData && kwhData.tamperKwh !== undefined ? kwhData.tamperKwh : 'Not Available'}</p>
                          <p>Configuration: {formettedtime && formettedtime !== undefined ? formettedtime : 'Not Available'}</p>
                          <p>Last Re-Configuration: {reconfig || 'Not Available'}</p>
                          <p>Current Tariff (₹) : {selectedSerial.tariffRate || 'Not Available'} </p>
                          <p>Location: {selectedSerial.location || 'Not Available'}</p>
                          <p>Meter Data update to server: {formettedtimeonmeter && formettedtimeonmeter !== undefined ? formettedtimeonmeter : 'Not Available'}</p>
                        </div>
                      ) : (
                        <p>not available</p> // If selectedSerialInfo.serial is falsy
                      )
                    }


                    {/* {kwhData ? (
                      <div>
                        <h4>Meter Details</h4>
                        <p>Selected Serial: {selectedSerial}</p>
                 
                        <p>Balance: {kwhData.balance}</p>
                        <p>TotalKwh: {kwhData.totalKwh}</p>
                        <p>Earth TamperKwh: {kwhData.tamperKwh}</p>
                        <p>Configuration: {formettedtime}</p>
                        <p>Last Re-Configuration: {reconfig}</p>
                        <p>Tariff (₹) : 00</p>
                        <p>Location : Not Available</p>
                        <p>Meter Data update to server : {formettedtimeonmeter}</p>
                      </div>
                    ) : (
                      <div>
                        <h4>Meter Details</h4>
                        <p>Selected Serial: {selectedSerial}</p>
                        <p>Balance: Not Available</p>
                        <p>TotalKwh: Not Available</p>
                        <p>Earth TamperKwh: Not Available</p>
                        <p>Configuration: Not Available   {formettedtime}</p>
                        <p>Last Re-Configuration: Not Available</p>
                        <p>Last Re-Configuration: {reconfig || 'Not Available'}</p>
                        <p>Location: Not Available</p>
                        <p>Meter Data update to server: Not Available {formettedtimeonmeter}</p>
                      </div>
                    )} */}

                    <hr />

                    <div>
                      <h4 style={{ color: 'DodgerBlue' }}> Present Consumer Details</h4>
                      <p> Not Available</p>
                    </div>

                    <hr />

                    {/* 
                    <div>
                      <h4 style={{ color: 'DodgerBlue' }}>Generated Recharge Token History (last 20 Tokens)</h4>
                      {Object.entries(rechargdata).length > 1 ? (
                        Object.entries(rechargdata).map(([timestamp, billDetails]) => (
                          <div key={timestamp}>
                            {timestamp !== 'tokenCount' && billDetails && (
                              <>      
                                <p>Token ID: {billDetails.tokenId}</p>
                                <p>Generated Time : {billDetails.tokenGenerationTime}</p>
                                <p>Amount : {billDetails.rechargeAmount}</p>
                                <p>tariff: {billDetails.tariffRate}</p>
                                <p>Cumulative Kwh: {billDetails.Kwh}</p>
                                <p>Balance at time of recharge: {billDetails.balance}</p>

                                <FacebookShareButton url={billDetails.link}>
                                  <FacebookIcon size={35} round={true} url={billDetails.link} />

                                </FacebookShareButton>


                                <EmailShareButton url={billDetails.link}>
                                  <EmailIcon size={35} round={true} url={billDetails.link} />

                                </EmailShareButton>


                              </>
                            )}

                            <hr></hr>
                          </div>
                        ))
                      ) : (
                        <p>Not available</p>
                      )}
                    </div> */}




                    <div>
                      <h4 style={{ color: 'DodgerBlue' }}>Generated Recharge Token History (last 20 Tokens)</h4>
                      {rechargdata ? (
                        Object.entries(rechargdata).map(([timestamp, billDetails]) => (

                          timestamp !== "tokenCount" && (
                            <div key={timestamp}>


                              {billDetails.tokenId === '00' && (
                                <p style={{ backgroundColor: 'green', color: 'white', width: '40%' }}>Emergency Recharge</p>
                              )}
                              <p>Token ID: {billDetails.tokenId}</p>
                              <p>Generated Time : {billDetails.tokenGenerationTime}</p>
                              <p>Amount : {billDetails.rechargeAmount}</p>
                              <p>tariff: {billDetails.tariffRate}</p>
                              <p>Cumulative Kwh: {billDetails.kwh}</p>
                              <p>Balance at the time of recharge: {billDetails.balance}</p>

                              <p>Share Token Link </p>

                              <FacebookShareButton style={{ margin: '10px' }} url={billDetails.link}>
                                <FacebookIcon size={35} round={true} url={billDetails.link} />
                              </FacebookShareButton>

                              <EmailShareButton style={{ margin: '10px' }} url={billDetails.link}>
                                <img width="38" height="38"
                                  src="https://img.icons8.com/fluency/48/gmail-new.png"
                                  url={billDetails.link}
                                  alt="gmail-new"
                                />
                              </EmailShareButton>

                              <WhatsappShareButton style={{ margin: '10px' }} url={billDetails.link}>
                                <WhatsappIcon size={35} round={true} url={billDetails.link} />
                              </WhatsappShareButton>

                              <hr></hr>
                            </div>

                          )
                        ))
                      ) : (
                        <p>Not available</p>
                      )}
                    </div>



                    {/* 
                    <div>
                      <h4 style={{ color: 'DodgerBlue' }}>Generated Recharge Token History (last 20 Tokens)</h4>
                      {Object.entries(rechargdata).length > 1 ? (
                        Object.entries(rechargdata).map(([timestamp, billDetails]) => (
                          <div key={timestamp}>
                          
                            {timestamp !== 'tokenCount' && billDetails && (
                              <>
                            
                                <p>Token ID: {billDetails.tokenId && billDetails.tokenId !== undefined ? billDetails.tokenId : 'Not Available'}</p>
                                <p>Generated Time: {billDetails.tokenGenerationTime && billDetails.tokenGenerationTime !== undefined ? billDetails.tokenGenerationTime : 'Not Available'}</p>
                                <p>Amount: {billDetails.rechargeAmount && billDetails.rechargeAmount !== undefined ? billDetails.rechargeAmount : 'Not Available'}</p>
                                <p>Tariff: {billDetails.tariffRate && billDetails.tariffRate !== undefined ? billDetails.tariffRate : 'Not Available'}</p>
                                <p>Cumulative Kwh: {billDetails.kwh && billDetails.kwh !== undefined ? billDetails.kwh : 'Not Available'}</p>
                                <p>Balance at time of recharge: {billDetails.balance && billDetails.balance !== undefined ? billDetails.balance : 'Not Available'}</p>
                             

                                <FacebookShareButton style={{ margin: '10px' }} url={billDetails.link}>
                                  <FacebookIcon size={35} round={true} url={billDetails.link} />
                                </FacebookShareButton>

                                <EmailShareButton style={{ margin: '10px' }} url={billDetails.link}>
                                  <img width="38" height="38"
                                    src="https://img.icons8.com/fluency/48/gmail-new.png"
                                    url={billDetails.link}
                                    alt="gmail-new"
                                  />
                                </EmailShareButton>

                                <WhatsappShareButton style={{ margin: '10px' }} url={billDetails.link}>
                                  <WhatsappIcon size={35} round={true} url={billDetails.link} />
                                </WhatsappShareButton>

                              </>
                            )}

                            <hr></hr>
                          </div>
                        ))
                      ) : (
                        <p>Not available</p>
                      )}
                    </div>
 */}



                    <hr></hr>

                    <div>
                      <h4 style={{ color: 'DodgerBlue' }}>Over Credit Token History (last 20 Tokens)</h4>
                      {billData ? (
                        Object.entries(billData).map(([timestamp, billDetails]) => (
                          <div key={timestamp}>
                            {/* Display specific serial data properties in separate <p> tags */}
                            <h5 style={{ backgroundColor: 'pink', color: 'black' }}>Over Credit Recharge</h5>
                            <p>Timestamp: {timestamp}</p>
                            <p>Token ID: {billDetails.tokenId}</p>
                            <p>Generated Time: {billDetails.tokenGenerationTime}</p>
                            <p>Amount: {billDetails.rechargeAmount}</p>
                            <p>tariff: {billDetails.tariffRate}</p>
                            <p>Cumulative Kwh: {billDetails.Kwh}</p>
                            <p>Balance at the time of recharge: {billDetails.balance}</p>
                          </div>
                        ))
                      ) : (
                        <p>Not available</p>
                      )}
                      <hr></hr>
                      <div>
                        <div>
                          <h4 style={{ color: 'DodgerBlue' }}>Billing History (Last 6 Months)</h4>
                          {monthData.length > 0 ? (
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid #ddd', background: '#f2f2f2' }}>
                                  <th style={{ padding: '8px', textAlign: 'left' }}>Month</th>
                                  <th style={{ padding: '8px', textAlign: 'left' }}>Consumed Kwh</th>
                                  <th style={{ padding: '8px', textAlign: 'left' }}>MD (Kw)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {monthData.map(([key, value], index) => (
                                  <tr key={key} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '8px', textAlign: 'left' }}>{value.billKwh !== '-' ? key.substring(1) : null} </td>
                                    <td style={{ padding: '8px', textAlign: 'left' }}>{value.billKwh !== '-' ? `${value.billKwh} ` : null}</td>
                                    <td style={{ padding: '8px', textAlign: 'left' }}>{value.billMd && value.billMd !== '-' ? `${value.billMd} ` : null}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>Not available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>


                </Modal.Body>
              </Modal>


              {/*       
 <div>
          {mergedArray.some(({ name }) => !name) ? (
            <h4 style={{ color: '#8B0000' }}>Add Details</h4>
          ) : (
            <>
              <h4> Add Details</h4>
              <h6 style={{color:'blue'}}> Note : Details of all consumer are available you can edit of details.</h6>
            </>
          )}
        </div>
              <h2 style={{ marginTop: '5%' }}>Ungroup Meter </h2> */}



              <div>
                {mergedArray.some(({ name }) => !name) ? (
                  <h4 style={{ color: '#8B0000' }}>Ungroup Meter</h4>
                ) : (
                  <>
                    <h4> Add Details</h4>
                    <h4 style={{ color: '#8B0000' }}>Note : Ungroup Meter is not available </h4>
                  </>
                )}
              </div>
            
            
                {/* <div>
                  {mergedArray.some(({ name }) => name) && (
                     <>
                               <h4 style={{ color: '#8B0000' }}>Ungroup Meter1</h4>
                               <h6 style={{ color: 'blue' }}>Note : Details of all consumer are available.</h6>
                     </>
                  )}
                </div> */}


                <div className="rowContainer">
                  {/* Render items without names */}
                  {mergedArray.map(({ serial, name }, index) => (
                    !name && (
                      <div key={index}
                        className='customBox'

                        onClick={() => handleSerialClick(serial)} >
                        <p>{serial} <span style={{ color: 'red' }}> {tokenStatus[serial]}</span></p>

                      </div>
                    )
                  ))}
                </div>

              </>
          )}
            </div>
        </div>
      </>

      );
}

      export default Ungroup;
