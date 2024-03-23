import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import Navbar from '../adminLogin/navbar';
import Login from '../adminLogin/login';
import { auth } from '../adminLogin/firebase';
import { Modal , Button} from 'react-bootstrap';
import Servermeter from './servermeter';
import Ungroup from './ungroup';
import '../consucss.css';
import { useNavigate } from 'react-router-dom';
import CommonFuctions from '../commonfunction';


import {

    FacebookIcon,
    WhatsappIcon,
    FacebookShareButton,
    EmailShareButton,
    WhatsappShareButton,

} from "react-share";

const Groupmeter = () => {
    const SessionTime = new CommonFuctions();
    const [data, setData] = useState({});
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSerial, setSelectedSerial] = useState(null);
    const [showAllData, setShowAllData] = useState(false);
    const [groupDetails, setGroupDetails] = useState(null);
    const [user, setUser] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedSerialData, setSelectedSerialData] = useState(null);
    const [kwhData, setKwhData] = useState('');
    let [formettedtime, setFormerttedTime] = useState('');
    let [formettedtimeonmeter, setFormerttedTimeOnMeter] = useState('');
    let [rechargdata, setRechargData] = useState('');
    const [billData, setBillData] = useState({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [activeComponent, setActiveComponent] = useState('servermeter');
    const [monthData, setMonthData] = useState('');
    const [reconfig, setReconfig] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalMessage, setModalMessage] = useState('');


    
    const [onlineStatus, setOnlineStatus] = useState(null);



 useEffect(() => {
        const checkInter = async () => {
            const result = await SessionTime.isCheckInterNet();
            setOnlineStatus(result);
            //  If no internet and already loading, automatically switch to show no internet after 5 seconds
            if (!result && loading) {
                setTimeout(() => {
                    setLoading(false);
                }, 5000); // 5 seconds
            }
        };
        // Call checkInter function initially
        checkInter();
        // Set up an interval to check internet status periodically
        const interval = setInterval(checkInter, 5000); // Check every 5 seconds
        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, [loading]); // Include loading in dependencies array to listen for its changes





    useEffect(() => {
        document.title = "Meter Details On Server "; // Set the title when the component mounts

    }, []);

    const handleOpenModal = () => {
        setModalIsOpen(true);
    };

    const handleCloseModal = () => {
        setReconfig('');
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
                setUser(authUser);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const numberPart = emailParts[0];
                    // console.log("User Login Number ", numberPart)
                    setPhoneNumber(numberPart);
                    handleSearch(numberPart);
                    SessionValidate(numberPart);
                    SessionUpdate(numberPart);
                    setLoading(false);
                

                }
            } else {
                setUser(null);
                window.location.href = '/';
            }
        });

        return () => unsubscribe();
    }, []);



    const handleSearch = async (numberPart) => {

        const status = await SessionTime.checkInternetConnection(); // Call the function
        //  setShowChecker(status);
        if (status === 'Poor connection.') {
            setIsDialogOpen(true);
            setModalMessage('No/Poor Internet connection. Cannot access server.');
            setLoading(false);
            /// alert('No/Poor Internet connection , Please retry.'); // Display the "Poor connection" message in an alert
            return;
            //  alert('No/Poor Internet connection , Please retry. ftech data from firebase '); // Display the "Poor connection" message in an alert
            //  return;
        }

        try {
            if (numberPart === undefined || numberPart === null) {
                return;
            }

            const dataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}`);
            dataRef.once('value', (snapshot) => {
                const newData = snapshot.val();
                // console.log("all data :", newData);
                if (newData !== null) {
                    setData(newData || {});
                    setShowAllData(true);
                    setLoading(false);
                } else {
                    //  console.log('Data not found for the provided number part.');
                    setData({});
                    setShowAllData(false);
                }
            });

        } catch (e) {

            console.log('errer fetching :', e);
        };

    }


    // Function to remove underscores from keys in an object
    const removeUnderscores = (data) => {
        const modifiedData = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const newKey = key.replace(/_/g, ' '); // Remove underscores
                modifiedData[newKey] = data[key];
            }
        }
        return modifiedData;
    };

    // const handleSearch = (numberPart) => {
    //     try {
    //         const dataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}`);
    //         dataRef.once('value', (snapshot) => {
    //             const newData = snapshot.val();
    //          //   console.log("all data :", newData);
    //             if (newData !== null) {
    //                 const modifiedDataWithoutUnderscores = removeUnderscores(newData);
    //                 setData(modifiedDataWithoutUnderscores || {});
    //                 setShowAllData(true);
    //             } else {
    //               //  console.log('Data not found for the provided number part.');
    //                 setData({});
    //                 setShowAllData(false);
    //             }
    //         });
    //     } catch (e) {
    //         console.log('error fetching:', e);
    //     }
    // };

    // Your existing useEffect or any other code



    const handleGroupClick = async (group) => {

        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
        if (storeSessionId === sessionId) {

            SessionTime.updateSessionTimeActiveUser(phoneNumber);

            setActiveComponent(null);
            setSelectedGroup(group);
            setSelectedSerial(null);
            setGroupDetails(data[group]);

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
            const meterdatetime = serialData.billData;
            const meterdate = Object.keys(serialData.billData);

            //  console.log("First child key under billData:", meterdate[0]);
            if (meterdate.length > 0) {
                const firstChildKey = meterdate[0].split(' ')[1];

                const serialData = parseInt(firstChildKey); // Parse the input as an integer
                if (isNaN(serialData) || serialData < 0) {
                    //  console.error("Invalid timestamp");
                } else {
                    const timestampDate = new Date(serialData);

                    if (isNaN(timestampDate.getTime())) {
                        //  console.error("Invalid date");
                    } else {
                        const year = timestampDate.getFullYear().toString().slice(2);
                        const month = ('0' + (timestampDate.getMonth() + 1)).slice(-2);
                        const day = ('0' + timestampDate.getDate()).slice(-2);
                        const hours = ('0' + timestampDate.getHours()).slice(-2);
                        const minutes = ('0' + timestampDate.getMinutes()).slice(-2);
                        const seconds = "00";
                        const formattedDate = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}.`;
                        //  console.log("Formatted Time: ", formattedDate);
                        setFormerttedTimeOnMeter(formattedDate);
                    }
                }
                // Logging the result
                //    console.log("First child key under billData:", firstChildKey);
            } else {
                // console.log("No keys under billData.");
            }

            console.log('meter server info:', serialData.kwhData);
            console.log("KwhDataaaaa", serialData.kwhData.balance);
            setKwhData(serialData.kwhData);

            const monthData = Object.entries(serialData.billData);
            const updatedMonthData = monthData.slice(1);
            setMonthData(updatedMonthData);
            //  console.log("Updated Month Data ", updatedMonthData);

            const rechargdata = serialData.rechargeToken;
            const dataArray = Object.entries(rechargdata);
            const reversedArray = dataArray.reverse();
            const excludedLastElementArray = reversedArray.slice(0, reversedArray.length - 0);

            const reversedObject = Object.fromEntries(excludedLastElementArray);

            setRechargData(reversedObject);

            const updatedBillData = serialData.ocData;

            // Convert object keys to an array and reverse it
            const keysArray = Object.keys(updatedBillData).reverse();

            // Iterate over the reversed keys array
            keysArray.forEach((key) => {
                // console.log(`Key: ${key}, Value:`, updatedBillData[key]);
            });

            // If you want to update the state with reversed data, you can create a reversed object
            const reversedBillData = keysArray.reduce((acc, key) => {
                acc[key] = updatedBillData[key];
                return acc;
            }, {});

            // Assuming setBillData is a function to update the state
            setBillData(reversedBillData);


            // Last Re-Configuration date and time 

            console.log("check reconsfiguration time ");

            // const reConfigtime = serialData.reConfigToken;
            // console.log("tokenGeneratedTime111111111111111: ", serialData.reConfigToken);
            // const tokenGeneratedTime = reConfigtime.tokenUsedTime;            ;
            //  console.log("tokenGeneratedTime: ", tokenGeneratedTime);
            // const serialData1 = parseInt(tokenGeneratedTime); // Parse the input as an integer
            // if (isNaN(serialData1) || serialData1 < 0) {
            //     //  console.error("Invalid timestamp");
            // } else {
            //     const timestampDate = new Date(serialData1); // Use serialData1 instead of tokenGeneratedTime
            //     if (isNaN(timestampDate.getTime())) {
            //         //    console.error("Invalid date");
            //     } else {
            //         const year = timestampDate.getFullYear().toString().slice(2);
            //         const month = ('0' + (timestampDate.getMonth() + 1)).slice(-2);
            //         const day = ('0' + timestampDate.getDate()).slice(-2);
            //         const hours = ('0' + timestampDate.getHours()).slice(-2);
            //         const minutes = ('0' + timestampDate.getMinutes()).slice(-2);
            //         const seconds = "00";
            //         const formattedTime = `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
            //           console.log("Formatted Time: ", formattedTime);
            //         setReconfig(formattedTime);
            //         // setFormattedTime(formattedTime);
            //     }
            // }

        } catch (error) {
            console.error('Error fetching serial data:', error);
        }
    };

    const handleMeterList = async (serial) => {
        console.log('phone number from meterDetails ', phoneNumber);
        try {

            const serialDataRef = database.ref(`/adminRootReference/adminDetails/${phoneNumber}/meterList/${serial}`);
            const snapshot = await serialDataRef.once('value');
            const serialData1 = snapshot.val();
            // console.log('meter server info 111:', serialData1);

            // console.log('meter server info',);
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

                    //console.log("Formatted Time: ", formattedDate);

                    setFormerttedTime(formattedDate);
                }
            }

        } catch (error) {
            console.error('Error fetching meter data:', error);
            // Handle error (e.g., show an error message to the user)
        }
    }

    const handleSerialClick = async (serial, group) => {


        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
        if (storeSessionId === sessionId) {
            SessionTime.updateSessionTimeActiveUser(phoneNumber);
            let newgroupName = group.replace(/ /g, "_");

            try {
                const serialDataRef = database.ref(`/adminRootReference/tenantDetails/${phoneNumber}/${newgroupName}/${serial}`);
                const snapshot = await serialDataRef.once('value');
                const serialData = snapshot.val();


                await handleSerialClickData(serial);
                handleMeterList(serial);

                // Update the state with the selected serial's information
                setSelectedSerialData(serialData);
                handleGenerateButton(serial);

                handleReconfigureData(serial);

                handleOpenModal();

                setShowAllData(true);


            } catch (error) {
                console.error('Error fetching serial data:', error);
                // Handle error (e.g., show an error message to the user)
            }

        } else {

            alert("You have been logged-out due to log-in from another device.");
            // console.log('you are logg ou.t ');
            handleLogout();
        }



    };


    const handleReconfigureData = async (serial) => {
        try {
            // Fetch data from meterDetails for the given serial
            const serialDataRef = database.ref(`/adminRootReference/meterDetails/${serial}`);
            const snapshot = await serialDataRef.once('value');
            const serialData = snapshot.val();

            // const reconfigdata = serialData.reConfigToken
            // console.log("reconfig All fields ", rechargdata);

            const reconfigdata = serialData.reConfigToken

            const reconfigData = reconfigdata.tokenUsedTime
            //  console.log("reconfig date and time ", reconfigdata.tokenUsedTime);


            const serialData1 = parseInt(reconfigData); // Parse the input as an integer
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
                    //  console.log("Formatted Time for recofige: ", formattedTime);
                    setReconfig(formattedTime);
                    // setFormattedTime(formattedTime);
                }
            }


        } catch (err) {
            // Handle errors here
            console.error("Error fetching data:", err);
        }
    };


    const handleGenerateButton = async (serial) => {

        console.log('selectecd serial v', serial);
        try {
            const serialDataRef = database.ref(`/adminRootReference/meterDetails/${serial}`);
            const snapshot = await serialDataRef.once('value');
            const serialData = snapshot.val();
            //   console.log("Serial data: " + serialData);
            if (!serialData || !serialData.rechargeToken) {
                //   console.error("Serial data or recharge token not available");
                return;
            }

            //  console.log("Generate recharge token ", serialData.rechargeToken);

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

    const handleButtonClick = async (component) => {

        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
        if (storeSessionId === sessionId) {

            setActiveComponent(component);

            setSelectedGroup(null);
            // if (component === 'ungroup') {
            //     setShowAllData(false); // Hide the open data when ungroup is clicked
            // } else {
            //     setShowAllData(true); // Show the open data for other components
            // }

        } else {

            alert("You have been logged-out due to log-in from another device.");
            // console.log('you are logg out ');
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


    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const closeDialog = () => {
      setIsDialogOpen(false);
    //   window.location.reload(); // This will reload the page
  
    };
  


    return (
        <>
            <Navbar />

    
{onlineStatus !== null && onlineStatus === false ? (
                    <div style={{ textAlign: 'center', marginTop: '20%' }}>
                        {/* No Internet Connection */}
                        <h3>No Internet Connection</h3>
                    </div>
                ) : (
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



            <div>
                <div>
                    <div style={{ margin: '0', }} >
                        <div style={{ display: 'flex' }}>


                            <div style={{ marginLeft: '1%', marginTop: '5%', flex: 1 }}  >
                                {activeComponent === 'ungroup' && <Ungroup />}
                                {activeComponent === 'servermeter' && <Servermeter />}
                            </div>


                            {/* <div className='sidebar h-auto' style={{ marginTop: '5%', width: '20%' }}>
                                <h6 onClick={() => handleButtonClick('servermeter')}>Home </h6>
                                <hr></hr>

                                <h6 onClick={() => handleButtonClick('ungroup')}>Ungroup Meter</h6>
                               
                            </div> */}
                            {/* {showAllData && ( */}
                            <div className='sidebar ' style={{ position: 'fixed', width: '20%' }}>
                                <div >
                                    <h6 style={{ cursor: 'pointer' }} onClick={() => handleButtonClick('servermeter')}>Home </h6>
                                    <hr></hr>

                                    <h6 style={{ cursor: 'pointer' }} onClick={() => handleButtonClick('ungroup')}>Ungroup Meter</h6>

                                </div>
                                <hr></hr>
                                <h6 style={{ color: '#8B0000', }} >Group Meter</h6>
                                <hr></hr>
                                <div style={{}} >

                                    {/* {Object.keys(data)
                                        .filter((key) => key !== 'time' && key !== 'tarrif')
                                        .map((key) => (
                                            <p key={key} onClick={() => handleGroupClick(key)}>
                                                <img
                                                    src="https://img.icons8.com/fluency/100/user-group-man-woman.png"
                                                    style={{ width: '50px', height: '50px', marginRight: '20px' }}
                                                    alt="User Group Icon"
                                                />
                                                {key}
                                            </p>
                                        ))} */}
                                    {Object.keys(data)
                                        .filter((key) => key !== 'time' && key !== 'tarrif')
                                        .map((key) => {
                                            const formattedKey = key.replace(/_/g, ' '); // Replace all underscores globally
                                            return (
                                                <p key={key} onClick={() => handleGroupClick(key)}>
                                                    <img
                                                        src="https://img.icons8.com/fluency/100/user-group-man-woman.png"
                                                        style={{ width: '50px', height: '50px', marginRight: '20px' }}
                                                        alt="User Group Icon"
                                                    />
                                                    {formattedKey}
                                                </p>
                                            );
                                        })}

                                </div>
                            </div>


                        </div>



                        <div className='content' style={{ width: '95%', marginLeft: '15%' }}>
                            <div className='container'>
                                <div>
                                    {selectedGroup && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            {Object.keys(data[selectedGroup] || {})
                                                .filter(serial => serial !== 'tariff')
                                                .map((serial) => (
                                                    <p
                                                        style={{
                                                            margin: '10px',
                                                            width: '25%',
                                                            height: '50%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                                            padding: '10px',
                                                            borderRadius: '5px',
                                                            backgroundColor: '#FFFFFF',
                                                        }}
                                                        key={serial}
                                                        onClick={() => handleSerialClick(serial, selectedGroup)}
                                                    >
                                                        <span>{serial}</span>
                                                        <span>{data[selectedGroup][serial].name}</span>
                                                        {/* <span>{selectedGroup}</span> */}

                                                    </p>

                                                ))}


                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* )} */}



                        <Modal show={modalIsOpen} onHide={handleCloseModal} backdrop="static">
                            <Modal.Header closeButton>
                                <Modal.Title>Meter Detials on server </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <div >
                                    {/* {(selectedSerialData && showAllData) && (

                                        <div>
                                            <h4>All Serial Data</h4>

                                            <p>Location: {selectedSerialData.location}</p>

                                           
                                        </div>

                                    )} */}

                                    {/* Display additional details from the fetched serial data */}

                                    {
                                        selectedSerialData ? (
                                            <div>
                                                <h4>Meter Details</h4>

                                                <p>Serial :{selectedSerialData.serial && selectedSerialData.serial !== undefined ? selectedSerialData.serial : 'Not Available'}</p>
                                                <p>Available Balance (₹): {kwhData && kwhData.balance !== undefined ? kwhData.balance : 'Not Available'}</p>
                                                <p>TotalKwh (₹): {kwhData && kwhData.totalKwh !== undefined ? kwhData.totalKwh : 'Not Available'}</p>
                                                <p>Earth Tamper Kwh (₹): {kwhData && kwhData.tamperKwh !== undefined ? kwhData.tamperKwh : 'Not Available'}</p>
                                                {/* <p>Total Kwh: {kwhData.totalKwh && kwhData.totalKwh !== undefined ? kwhData.totalKwh : 'Not Available'}</p>
                                                <p>Earth TamperKwh: {kwhData.tamperKwh && kwhData.tamperKwh !== undefined ? kwhData.tamperKwh : 'Not Available'}</p>  */}
                                                <p>Configuration: {formettedtime && formettedtime !== undefined ? formettedtime : 'Not Available'}</p>

                                                <p>Last Re-Configuration:{reconfig || 'Not Available'}</p>

                                                <p>Current Tariff (₹): {selectedSerialData.tariff && selectedSerialData.tariff !== undefined ? selectedSerialData.tariff : 'Not Available'}</p>
                                                <p>Location: {selectedSerialData.location && selectedSerialData.location !== undefined ? selectedSerialData.location : 'Not Available'}</p>
                                                <p>Meter Data update to server :{formettedtimeonmeter || 'Not Available'}</p>
                                            </div>
                                        ) : (
                                            <p>KwhData not available</p>
                                        )
                                    }

                                    {/* {
                                        kwhData ? (
                                            <div>
                                                <h4 style={{ color: 'DodgerBlue' }}>Meter Details</h4>
                                                <p>Serial: {selectedSerialData.serial}</p>
                                                <p>Available Balance (₹): {kwhData && kwhData.balance !== undefined ? kwhData.balance : 'Not Available'}</p>
                                                <p>TotalKwh (₹): {kwhData && kwhData.totalKwh !== undefined ? kwhData.totalKwh : 'Not Available'}</p>
                                                <p>Earth Tamper Kwh (₹): {kwhData && kwhData.tamperKwh !== undefined ? kwhData.tamperKwh : 'Not Available'}</p>
                                                <p>Configuration: {formettedtime || 'Not Available'}</p>
                                              
                                                <p>Location: {selectedSerialData.location || 'Not Available'}</p>
                                                <p>Meter Data update to server: {formettedtimeonmeter || 'Not Available'}</p>



                                            </div>
                                        ) : (
                                            <p>not available</p>
                                        )
                                    } */}






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
                                                            {billDetails.tokenId === '00' && (
                                                                <p style={{ backgroundColor: 'green', color: 'white', width: '40%' }}>Emergency Recharge</p>
                                                            )}
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

                                    <hr></hr>

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







                                    {/* 
                                        {monthData.map(([key, value], index) => (
                                            <p key={key}>
                                                {value.billKwh !== '-' ? `${key.substring(1)}: ${value.billKwh} kWh` : null}
                                                {value.billKwh !== '-' && value.billMd && value.billMd !== '-' ? ', ' : ''}
                                                {value.billMd && value.billMd !== '-' ? `${value.billMd} Md` : null}
                                            </p>
                                        ))} */}









                                </div>



                            </Modal.Body>
                        </Modal>

                    </div>
                </div>
            </div >

     </>
                )}


            <Modal show={isDialogOpen} onHide={closeDialog} backdrop="static" style={{ marginTop: '3%' }}>
                {/* <Modal.Header closeButton>
      </Modal.Header>  */}
                <Modal.Body>
                    <p> {modalMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={closeDialog}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Groupmeter;
