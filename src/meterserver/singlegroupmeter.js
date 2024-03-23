import React, { useEffect, useState } from 'react';
import Navbar from '../adminLogin/navbar';
import { auth } from '../adminLogin/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import '../meterdetailonserver/meterdetail.css';
import { database } from '../firebase';
import { Modal } from 'react-bootstrap';
import { MdOutlineEmail } from "react-icons/md";

import { useNavigate } from 'react-router-dom';
import CommonFuctions from '../commonfunction';



import {

    EmailIcon,
    InstapaperShareButton,
    FacebookIcon,
    WhatsappIcon,
    WorkplaceIcon,
    XIcon,
    FacebookShareButton,
    EmailShareButton,
    WhatsappShareButton,
    InstapaperIcon,
  
} from "react-share";

function Singlegroupmeter() {

    const SessionTime = new CommonFuctions();



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
    const [selectedSerialInfo, setSelectedSerialInfo] = useState(null);
    const [selectedSerialData, setSelectedSerialData] = useState(null);
    const [kwhData, setKwhData] = useState('');
    const [meterInfo, setMeterInfo] = useState(null);
    let [formettedtime, setFormerttedTime] = useState('');
    let [formettedtimeonmeter, setFormerttedTimeOnMeter] = useState('');
    let [rechargdata, setRechargData] = useState('');
    const [billData, setBillData] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [reconfig, setReconfig] = useState('');
    const [monthData, setMonthData] = useState('');
    const [updatetoken, setUpdateToken] = useState({});


    const handleOpenModal = () => {
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setReconfig([]);
        setBillData([]);
        setRechargData([]);
        setKwhData([]);
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
                // console.log("Logged in user:", authUser.email);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const numberPart = emailParts[0];
                    // console.log("Number part:", numberPart); // Log the extracted number part
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



    //     // Function to remove underscores from keys in an object
    // const removeUnderscores = (data) => {
    //     const modifiedData = {};
    //     for (const key in data) {
    //         if (Object.prototype.hasOwnProperty.call(data, key)) {
    //             const newKey = key.replace(/_/g, ' '); // Replace underscores with spaces
    //             modifiedData[newKey] = data[key];
    //         }
    //     }
    //     return modifiedData;
    // };

    // // The handleSearch function
    // const handleSearch = async (phoneNumber) => {
    //     const trimmedPhoneNumber = phoneNumber.trim();
    //     if (trimmedPhoneNumber !== '') {
    //         try {
    //             const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
    //             const snapshot = await dataRef.once('value');
    //             const newData = snapshot.val(); 
    //             setUpdateToken(newData);

    //             if (newData) {
    //                 const modifiedDataWithoutUnderscores = removeUnderscores(newData);
    //                 setSelectedGroupData(modifiedDataWithoutUnderscores);
    //                 setData(modifiedDataWithoutUnderscores || {});

    //                 const options = Object.keys(modifiedDataWithoutUnderscores).map(key => key.replace(/_/g, ' '));
    //                 setSelectOptions(options);
    //             }
    //             setSearchExecuted(true);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     }
    // };




    const handleSearch = async (phoneNumber) => {
        const trimmedPhoneNumber = phoneNumber.trim();
        if (trimmedPhoneNumber !== '') {
            try {
                const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
                const snapshot = await dataRef.once('value');
                const newData = snapshot.val();
                //  setData(newData || {});
                // setSelectedGroupData(newData);
                // console.log("data", newData);

                setUpdateToken(newData);

                const modifiedDataWithoutTime = excludeTimeProperty(newData);
                // console.log('Modified Data without Time:', modifiedDataWithoutTime);

                setSelectedGroupData(modifiedDataWithoutTime);
                setData(modifiedDataWithoutTime || {});

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




    const excludeTimeProperty = (data) => {
        const modifiedData = { ...data };
        delete modifiedData.time;
        return modifiedData;
    };


    const extractSerialNumbers = () => {

        const extractedSerials = Object.values(data).reduce((acc, item) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                const keys = Object.keys(item);
                const filteredKeys = keys.filter((key) => !isNaN(Number(key)));
                acc.push(...filteredKeys.map(serial => ({ serial, name: item[serial].name })));
            }
            // console.log("return data")
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


    useEffect(() => {
        extractSerialNumbers();

    }, []);


    useEffect(() => {
        // Merge two arrays when either serialOptions or meterList changes
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





    useEffect(() => {
        extractSerialNumbers();
    }, [updatetoken]);

    useEffect(() => {
        const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];
        setMergedArray(merged);
    }, [serialOptions, meterList]);


    const handleSearch1 = async (numberPart) => {
        try {
            const phoneNumberValue = numberPart.trim();
            if (phoneNumberValue !== '') {
                const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumberValue}/meterList`).once('value');
                const fetchedMeterList = snapshot.val();

                if (fetchedMeterList) {
                    setMeterList(Object.keys(fetchedMeterList));
                    Object.keys(fetchedMeterList).forEach(async (serialNumber) => {
                        await isTokenAvailable(serialNumber);
                    });

                }

            }
        } catch (error) {
            console.error('Error fetching admin meter list:', error);
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
                // console.log("Signle *");
                status = "*";
            } else if (isTransfer === 'true' && token !== 'null') {
                // console.log("Double  *");
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



    const [isLoader, setIsLoader] = useState(false);




    const handleSerialClick = async (serial, info) => {

        setIsLoader(true); // Set isLoading to true when fetching data

        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
        if (storeSessionId === sessionId) {


            SessionTime.updateSessionTimeActiveUser(phoneNumber);



            try {
                const groupName = Object.keys(data).find((group) => data[group][serial]);
                const info = mergedArray.find((item) => item.serial === serial);
                const tariff = data[groupName].tariff;
                const name = info.name;

                let newgroupName = groupName.replace(/ /g, "_");


                const serialDataRef = database.ref(`/adminRootReference/tenantDetails/${phoneNumber}/${newgroupName}/${serial}`);
                const snapshot = await serialDataRef.once('value');
                const serialData = snapshot.val();

                // Wait for both asynchronous functions to complete before updating the state
                await handleSerialClickData(serial);
                await handleMeterList(serial);
                await handleGenerateButton(serial);

                setSelectedSerialInfo({
                    serial: serial,
                    name: name,
                    groupName: groupName,
                    tariff: tariff
                    // Add other information as needed
                });

                setSelectedSerialData(serialData);

                handleOpenModal();
            } catch (error) {
                console.error('Error fetching serial data:', error);
                // Handle error (e.g., show an error message to the user)
            }

        } else {

            alert("You have been logged-out due to log-in from another device.");
            // console.log('you are logg out ');
            handleLogout();
        }

        setIsLoader(false);


    };



    const handleSerialClickData = async (serial) => {
        try {
            // Fetch data from meterDetails for the given serial
            const serialDataRef = database.ref(`/adminRootReference/meterDetails/${serial}`);
            const snapshot = await serialDataRef.once('value');
            const serialData = snapshot.val();
            // const monthData = serialData.billData;

            //  console.log("serilv number ", serialData.billData);
            const billDatatime = Object.keys(serialData.billData);
            //  console.log("bill datatime ", billDatatime[0]);

            //  console.log('aaaaaaaaaaaaaaaaa', serialData.billData);
            const billDataKeys = Object.keys(serialData.billData);
            // Logging the result
            console.log("First child key under billData:", billDataKeys[0]);
            // if (serialData && serialData.billData) {
            //     const billDataKeys = Object.keys(serialData.billData);

            if (billDataKeys.length > 0) {
                const firstChildKey = billDataKeys[0].split(' ')[1];

                const serialData = parseInt(firstChildKey); // Parse the input as an integer
                if (isNaN(serialData) || serialData < 0) {
                    console.error("Invalid timestamp");
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
                //    console.log("First child key under billData:", firstChildKey);
            } else {
                // console.log("No keys under billData.");
            }





            // console.log('meter server info:', serialData);
            // console.log("KwhDataaaaa", serialData.kwhData.balance);
            setKwhData(serialData.kwhData);

            //     const rechargdata = serialData.rechargeToken;

            //   //  console.log("rechargdata ", rechargdata);
            //     const dataArray = Object.entries(rechargdata);
            //     const reversedArray = dataArray.reverse();
            //     // Exclude the last element in the reversed array
            //     const excludedLastElementArray = reversedArray.slice(0, reversedArray.length - 0);

            //     // Convert the excluded last element array back to an object
            //     const reversedObject = Object.fromEntries(excludedLastElementArray);

            //    // console.log("Reversed recharg data values excluding the last element", reversedObject);

            //     // If you want to set the reversed data in your state
            //     setRechargData(reversedObject);

            const monthData = Object.entries(serialData.billData);
            // Use slice to exclude the first element (index 0)
            const updatedMonthData = monthData.slice(1);


            setMonthData(updatedMonthData);
            //  console.log("Updated Month Data ", updatedMonthData);
            //  console.log("eConfigToken Data ", reConfigtime);

            // Fetch and print the value of tokenGeneratedTime
            // const tokenGeneratedTime = reConfigtime.tokenGeneratedTime;
            // console.log("tokenGeneratedTime1111: ", tokenGeneratedTime);


            if (serialData && serialData.reConfigToken) {
                const reConfigtime = serialData.reConfigToken;


                //  console.log("tokenGeneratedTime111111111111111: ",serialData.reConfigToken.tokenUsedTime);


                const tokenGeneratedTime = reConfigtime.tokenUsedTime;
                console.log("tokenGeneratedTime: ", tokenGeneratedTime);
                const serialData1 = parseInt(tokenGeneratedTime); // Parse the input as an integer
                if (isNaN(serialData1) || serialData1 < 0) {
                    console.error("Invalid timestamp");
                } else {
                    const timestampDate = new Date(serialData1); // Use serialData1 instead of tokenGeneratedTime
                    if (isNaN(timestampDate.getTime())) {
                        console.error("Invalid date");
                    } else {
                        const year = timestampDate.getFullYear().toString().slice(2);
                        const month = ('0' + (timestampDate.getMonth() + 1)).slice(-2);
                        const day = ('0' + timestampDate.getDate()).slice(-2);
                        const hours = ('0' + timestampDate.getHours()).slice(-2);
                        const minutes = ('0' + timestampDate.getMinutes()).slice(-2);
                        const seconds = "00";
                        const formattedTime = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
                        // console.log("Formatted Time: ", formattedTime);
                        setReconfig(formattedTime);
                        // setFormattedTime(formattedTime);
                    }
                }
            } else {
                console.error("serialData or reConfigToken is undefined");
            }

            const updatedBillData = serialData.ocData;
            // Convert object keys to an array and reverse it
            const keysArray = Object.keys(updatedBillData).reverse();

            // Iterate over the reversed keys array
            keysArray.forEach((key) => {
                //  console.log(`Key: ${key}, Value:`, updatedBillData[key]);
            });

            // If you want to update the state with reversed data, you can create a reversed object
            const reversedBillData = keysArray.reduce((acc, key) => {
                acc[key] = updatedBillData[key];
                return acc;
            }, {});

            setBillData(reversedBillData);



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
            //  console.log('meter server info 111:', serialData1);


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
                    const formattedDate = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;

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
            const serialDataRef = database.ref(`/adminRootReference/meterDetails/${serial}`);
            const snapshot = await serialDataRef.once('value');
            const serialData = snapshot.val();

            if (!serialData || !serialData.rechargeToken) {
                console.error("Serial data or recharge token not available");
                return;
            }

            console.log("Generate recharge token ", serialData.rechargeToken);

            const rechargeData = serialData.rechargeToken;

            // Convert the object to an array of key-value pairs
            const dataArray = Object.entries(rechargeData);

            // Reverse the array
            const reversedArray = dataArray.reverse();

            // Exclude the last element in the reversed array
            // const excludedLastElementArray = reversedArray.slice(0, reversedArray.length - 1);
            const excludedLastElementArray = reversedArray.slice(0, reversedArray.length - 0);

            // Convert the excluded last element array back to an object
            const reversedObject = Object.fromEntries(excludedLastElementArray);

            // Set the reversed data in your state
            setRechargData(reversedObject);
        } catch (error) {
            console.error("Error fetching or processing data:", error.message);
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


            
              {isLoader ? (
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

             

                    <div style={{ marginLeft: '20%', marginTop: '10px' }}>
                        <div className='container'>
                            {/* {isLoading ? (
                        <div>Loading...</div>
                    ) : ( */}
                            <>
                                <div>





                                    <Modal show={modalIsOpen} onHide={handleCloseModal}    backdrop="static">
                                        <Modal.Header closeButton>
                                            <Modal.Title>Meter Details on server </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <div>

                                                {selectedSerialInfo && (
                                                    <div className="selected-serial-info">
                                                        {/* <h3>Selected Serial Information</h3>
                                                    <p>Serial: {selectedSerialInfo.serial}</p>
                                                    <p>Name: {selectedSerialInfo.name}</p>
                                                    <p>Group Name: {selectedSerialInfo.groupName}</p>
                                                    <p>Tariff: {selectedSerialInfo.tariff}</p> */}

                                                        {/* {(selectedSerialData &&
                                                        <div>

                                                            <p>Location: {selectedSerialData.location}</p>

                                                        </div>
                                                    )} */}


                                                        {
                                                            selectedSerialInfo.serial ? (
                                                                <div>
                                                                    <h4 style={{ color: 'DodgerBlue' }}>Meter Details</h4>
                                                                    <p>Serial: {selectedSerialInfo.serial || 'Not Available'}</p>
                                                                    <p>Available Balance (₹): {kwhData && kwhData.balance !== undefined ? kwhData.balance : 'Not Available'}</p>
                                                                    <p>TotalKwh (₹): {kwhData && kwhData.totalKwh !== undefined ? kwhData.totalKwh : 'Not Available'}</p>
                                                                    <p>Earth Tamper Kwh (₹): {kwhData && kwhData.tamperKwh !== undefined ? kwhData.tamperKwh : 'Not Available'}</p>
                                                                    <p>Configuration: {formettedtime || 'Not Available'}</p>
                                                                    <p>Last Re-Configuration: {reconfig || 'Not Available'}</p>
                                                                    <p>Current Tariff (₹): {selectedSerialData.tariff && selectedSerialData.tariff !== undefined ? selectedSerialData.tariff : 'Not Available'}</p>
                                                                    <p>Location: {selectedSerialData.location || 'Not Available'}</p>
                                                                    <p>Meter Data update to server: {formettedtimeonmeter || 'Not Available'}</p>

                                                                    {/* <p>TotalKwh: {kwhData.totalKwh ?? 'Not Available'}</p>
                                                           <p>Earth Tamper Kwh: {kwhData.tamperKwh ?? 'Not Available'}</p>
                                                           <p>Configuration: {formettedtime || 'Not Available'}</p>
                                                          <p>Last Re-Configuration: {reconfig || 'Not Available'}</p>
                                                           <p>Current Tariff (₹): {selectedSerialInfo.tariff ?? 'Not Available'}</p>
                                                          <p>Location: {selectedSerialData.location || 'Not Available'}</p>
                                                          <p>Meter Data update to server: {formettedtimeonmeter || 'Not Available'}</p> */}
                                                                </div>
                                                            ) : (
                                                                <p>not available</p>
                                                            )
                                                        }





                                                        <hr></hr>

                                                        {/* Display additional details from the fetched serial data */}

                                                        {selectedSerialData && (
                                                            <div>
                                                                <h4 style={{ color: 'DodgerBlue' }}> Present Consumer Details</h4>
                                                                {/* Display specific serial data properties in separate <p> tags */}
                                                                {/* <p>Name: {selectedSerialData.name}</p>
                                                            <p>Mobile: {selectedSerialData.phone}</p>
                                                            <p>Email: {selectedSerialData.email}</p>
                                                            <p>DOO: {selectedSerialData.doo}</p> */}
                                                                <label htmlFor="name">Name </label>
                                                                <input
                                                                    type="text"
                                                                    id="name"
                                                                    className='form-control'
                                                                    name="name"
                                                                    value={selectedSerialData.name}
                                                                    placeholder="Name"

                                                                />
                                                                <label htmlFor="mobile">Mobile Number  </label>
                                                                <input
                                                                    type="tel"
                                                                    id="mobile"
                                                                    className='form-control'
                                                                    name="mobile"
                                                                    value={selectedSerialData.phone}
                                                                    placeholder="Mobile"

                                                                />
                                                                <label htmlFor="email">Email </label>
                                                                <input
                                                                    type="email"
                                                                    id="email"
                                                                    className='form-control'
                                                                    name="email"
                                                                    value={selectedSerialData.email}
                                                                    placeholder="Email"

                                                                />
                                                                <label htmlFor="doo">Date of Occupancy  </label>
                                                                <input
                                                                    type="text"
                                                                    className='form-control'
                                                                    id="doo"
                                                                    name="doo"
                                                                    value={selectedSerialData.doo}
                                                                    placeholder="DOO"

                                                                />
                                                            </div>
                                                        )}

                                                        <hr></hr>

                                                        <div>
                                                            <h4 style={{ color: 'DodgerBlue' }}>Generated Recharge Token History (last 20 Tokens)</h4>
                                                            {Object.entries(rechargdata).length > 1 ? (
                                                                Object.entries(rechargdata).map(([timestamp, billDetails]) => (
                                                                    <div key={timestamp}>
                                                                        {/* Display specific serial data properties in separate <p> tags */}
                                                                        {timestamp !== 'tokenCount' && billDetails && (
                                                                            <>
                                                                                {/* <p>Timestamp: {timestamp}</p> */}

                                                                                {billDetails.tokenId === '00' && (
                                                                                    <p style={{ backgroundColor: 'green', color: 'white', width: '40%' }}>Emergency Recharge</p>
                                                                                )}
                                                                                <p>Token ID: {billDetails.tokenId && billDetails.tokenId !== undefined ? billDetails.tokenId : 'Not Available'}</p>
                                                                                <p>Generated Time: {billDetails.tokenGenerationTime && billDetails.tokenGenerationTime !== undefined ? billDetails.tokenGenerationTime : 'Not Available'}</p>
                                                                                <p>Amount: {billDetails.rechargeAmount && billDetails.rechargeAmount !== undefined ? billDetails.rechargeAmount : 'Not Available'}</p>
                                                                                <p>Tariff: {billDetails.tariffRate && billDetails.tariffRate !== undefined ? billDetails.tariffRate : 'Not Available'}</p>
                                                                                <p>Cumulative kwh: {billDetails.kwh && billDetails.kwh !== undefined ? billDetails.kwh : 'Not Available'}</p>
                                                                                <p>Balance at time of recharge: {billDetails.balance && billDetails.balance !== undefined ? billDetails.balance : 'Not Available'}</p>
                                                                                {/* <p>Link: {billDetails.link}</p> */}
                                                                               <div style={{display:'flex'}}>

                                                                                <p style={{margin :'10px', padding:'10px'}}>Share Via </p>

                                                                           
   
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

                                                                                <EmailShareButton style={{ margin: '10px' }}>
                                                                                    <img width="38" height="38"
                                                                                        src="https://icons8.com/icon/80361/phone"
                                                                                       // url={billDetails.link}
                                                                                        alt="Phone send "
                                                                                    />
                                                                                </EmailShareButton>

                                              


  
                                                                                </div>


                                                                            </>
                                                                        )}

                                                                        <hr></hr>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p>Not available</p>
                                                            )}
                                                        </div>
                                                        <hr></hr>




                                                        <div>
                                                            <h4 style={{ color: 'DodgerBlue' }}>Over Credit Token History (Last 20 Token)</h4>
                                                            {billData && Object.entries(billData).length > 0 ? (
                                                                Object.entries(billData).map(([timestamp, billDetails]) => (
                                                                    <div key={timestamp}>
                                                                        {/* Display specific serial data properties in separate <p> tags */}
                                                                        <p style={{ backgroundColor: 'green', color: 'white', width: '40%' }}>Over Credit Recharge</p>
                                                                        {/* <p>Timestamp: {timestamp}</p> */}
                                                                        <p>Token ID: OC</p>
                                                                        <p>Generated Time: {billDetails.tokenGenerationTime && billDetails.tokenGenerationTime !== undefined ? billDetails.tokenGenerationTime : 'Not Available'}</p>
                                                                        <p>Amount: {billDetails.rechargeAmount && billDetails.rechargeAmount !== undefined ? billDetails.rechargeAmount : 'Not Available'}</p>
                                                                        <p>tariff: {billDetails.tariffRate && billDetails.tariffRate !== undefined ? billDetails.tariffRate : 'Not Available'}</p>
                                                                        <p>Cumulative Kwh: {billDetails.kwh && billDetails.kwh !== undefined ? billDetails.kwh : 'Not Available'}</p>
                                                                        <p>Balance at the time of recharge: {billDetails.balance && billDetails.balance !== undefined ? billDetails.balance : 'Not Available'}</p>
                                                                        <hr></hr>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p>Not available</p>
                                                            )}
                                                        </div>



                                                        {/* <div>
                                                    <h4 style={{ color: 'DodgerBlue' }}>Billing History (Last 6 Months)</h4>
                                                    {monthData.length > 0 ? (
                                                        monthData.map(([key, value], index) => (
                                                            <p key={key}>
                                                                {value.billKwh !== '-' ? `${key.substring(1)}: ${value.billKwh} kWh` : null}
                                                                {value.billKwh !== '-' && value.billMd && value.billMd !== '-' ? ', ' : ''}
                                                                {value.billMd && value.billMd !== '-' ? `${value.billMd} Md` : null}
                                                            </p>
                                                        ))
                                                    ) : (
                                                        <p>Not available</p>
                                                    )}
                                                </div> */}



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






                                                        {/* <div>
                                                    <h4 style={{ color: 'DodgerBlue' }}>Billing History (Last 6 Months)</h4>
                                                    {monthData.length > 0 ? (
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Month</th>
                                                                    <th>Kwh</th>
                                                                    <th>MD</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {monthData.map(([key, value], index) => (
                                                                    <tr key={key}>
                                                                        <td>{value.billKwh !== '-' ? key.substring(1) : null}</td>
                                                                        <td>{value.billKwh !== '-' ? `${value.billKwh} kWh` : null}</td>
                                                                        <td>{value.billMd && value.billMd !== '-' ? `${value.billMd} Md` : null}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    ) : (
                                                        <p>Not available</p>
                                                    )}
                                                </div>  */}


                                                        {/* <hr></hr>
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

 */}







                                                        {/* <div>
                                                    <h4 style={{ color: 'DodgerBlue' }}>Billing History (Last 6 Month)</h4>

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
                                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{value.billKwh !== '-' ? key.substring(1) : null}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{value.billKwh !== '-' ? value.billKwh + " " : ''}</td>
                                                                    <td style={{ padding: '8px', textAlign: 'left' }}>{value.billMd !== '-' ? value.billMd + " " : ''}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>  */}




                                                    </div>


                                                )}



                                            </div>


                                        </Modal.Body>
                                    </Modal>



                                    <div>
                                        {extractGroupNames().length > 0 && (
                                            <h4 style={{ color: '#8B0000' }} >Group Meter</h4>
                                        )}

                                    </div>


                                    {extractGroupNames().map((groupName, groupIndex) => (
                                        <div key={groupIndex}>

                                            <h2>{groupName.replace(/_/g, ' ')}</h2>

                                            {/* Render items with names for each group */}
                                            <div className="rowContainer">
                                                {data[groupName] && Object.entries(data[groupName]).map(([serial, info], index) => (
                                                    serial !== 'tariff' && info && (
                                                        <div key={index} className='customBox' onClick={() => handleSerialClick(serial, info)}>
                                                            <p> {serial}  <span style={{ color: 'red' }}>{tokenStatus[serial]} </span> </p>
                                                            <p> {info.name}</p>
                                                            {/* <p> {groupName}</p> */}
                                                            {/* <p>Tariff: {data[groupName].tariff}</p> */}
                                                            {/* Display other information as needed */}
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                </div>

                            </>

                        </div>
                    </div>

        </>




    );
}

export default Singlegroupmeter;