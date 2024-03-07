import '../adminLogin/login.css';
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { auth } from '../adminLogin/firebase';
import { db } from '../adminLogin/firebase'; // Import your Firebase Firestore configuration
import adminprofile from '../Images/logo/adminprofile.png';
import './adminpage.css'
import Navbar from '../adminLogin/navbar';
import { ref, set, get, child, getDatabase, onValue } from 'firebase/database';
import { useNavigate, NavLink } from 'react-router-dom';
import Createtime from './createtime';
import { Modal, Button } from 'react-bootstrap';
import CommonFuctions from '../commonfunction';
import CheckNetwork from './checkconnection';
import firebase from '../firebase';

import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';

import { validatePhoneNumber, validateName, validateAddress, validateEmail } from '../validation/validation';


function Admindetail() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // State to hold user information
    const [loading, setLoading] = useState(true); // State to track loading status
    const [phoneNumber, setPhoneNumber] = useState(''); // State to hold phone number
    const [email, setEmail] = useState(''); // State to hold email
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNo2, setPhoneNo2] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [initialEmail, setInitialEmail] = useState('');
    const [originalPhoneNo2, setOriginalPhoneNo2] = useState('');
    const [error, setError] = useState('');
    const [phoneerror, setPhoneError] = useState('');
    const [errorAddres, setErrorAddress] = useState('');
    const [errorName, setErrorName] = useState('');
    const [emailError, setEmailError] = React.useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorMessage1, setErrorMessageemail] = useState('');
    const [erronphoneMessage, setErrorPhoneMessage] = useState('');
    const sessionTime = new CommonFuctions();
    const [onlineStatus, setOnlineStatus] = useState(null);
    const [password , setPassword] =useState('');
    const [key , setKey] =useState('');





    // useEffect(() => {
    //     const checkInter = async () => {
    //         const result = await sessionTime.isCheckInterNet();
    //         setOnlineStatus(result);

    //         // If no internet and already loading, automatically switch to show no internet after 5 seconds
    //         if (!result && loading) {
    //             setTimeout(() => {
    //                 setLoading(false);
    //             }, 5000); // 5 seconds
    //         }
    //         // If internet is poor, set a longer timeout before showing no internet
    //         else if (!result && !loading) {
    //             setTimeout(() => {
    //                 setLoading(false);
    //             }, 5000); // 5 seconds
    //         }
    //     };  
    //     // Call checkInter function initially
    //     checkInter();
    //     // Set up an interval to check internet status periodically
    //     const interval = setInterval(checkInter, 5000); // Check every 5 seconds

    //     // Clean up interval on component unmount
    //     return () => clearInterval(interval);
    // }, [loading]); // Include loading in dependencies array to listen for its changes



    // useEffect(() => {
    //     const checkInter = async () => {
    //         const result = await sessionTime.isCheckInterNet();
    //         setOnlineStatus(result);

    //       //   If no internet and already loading, automatically switch to show no internet after 5 seconds
    //         if (!result && loading) {
    //             setTimeout(() => {
    //                 setLoading(false);
    //             }, 5000); // 5 seconds
    //         }
    //     };

    //     // Call checkInter function initially
    //     checkInter();
    //     // Set up an interval to check internet status periodically
    //     const interval = setInterval(checkInter, 5000); // Check every 5 seconds

    //     // Clean up interval on component unmount
    //     return () => clearInterval(interval);
    // }, [loading]); // Include loading in dependencies array to listen for its changes






    // useEffect(() => {
    //     checkInter();
    //   }, []); // Empty dependency array ensures it runs only once when the component mounts


    // const checkInter = () => {
    //     const result = sessionTime.isCheckInterNet();
    //   //  console.log("Online status:", result)

    //     if (result )
    //     {

    //        alert('online');
    //        return;

    //     }
    //     else {

    //        alert('Ofline');
    //        return;


    //     }
    // }


    useEffect(() => {
        document.title = "Admin Details"; // Set the title when the component mounts

    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                // User is logged in
                setUser(authUser);
                //  console.log("Logged in user:", authUser.email);
                const emailParts = authUser.email.split('@'); // Split email by '@'
                if (emailParts.length === 2) {
                    const number = emailParts[0]; // Get the part before '@'
                    //  console.log("Extracted number:", number);
                    setPhoneNumber(number); // Set extracted number in state
                    fetchEmailFromFirebase(number);

                    //  updateSessionActiveTime(number);
                }
            } else {
                // No user is logged in, you can redirect to another page or handle accordingly
                setUser(null);
                // Example: Redirect to another page
                window.location.href = '/'; // Redirect to your login page
            }
        });

        return () => unsubscribe(); // Cleanup function for unmounting
    }, []);


    useEffect(() => {
        // Setting the initial loaded email value
        setInitialEmail(email);
    }, [email]);

    useEffect(() => {
        setOriginalPhoneNo2(phoneNo2);
    }, [phoneNo2]);

    // const handleEmailChange = (e) => {
    //     const value = e.target.value;
    //     setEmail(value);
    //     if (value != initialEmail) {
    //         setIsEmailEdited(true); // Set a flag to track email changes
    //     } else {
    //         setIsEmailEdited(false);
    //     }
    // };


    // const handleNameChange = (e) => {
    //     const value = e.target.value;
    //     setName(value);
    //     if (!value.trim()) {
    //         setNameError('Name is required');
    //     } else {
    //         setNameError('');
    //     }
    // };


    // const handleNameChange = (event) => {
    //     const newName = event.target.value;

    //     const alphaNumericRegex = /^[a-zA-Z0-9]*$/;
    //     const spaceRegex = /^\S*$/; // Regex to disallow spaces


    //     if (!alphaNumericRegex.test(newName)) {
    //         setErrorName('Special Charactor not Allowed');
    //         setNewName('');  // Clear the input field value
    //     } 
    //     else if (!spaceRegex.test(newName)) {
    //         setErrorName('Spaces not Allowed');
    //         setNewName('');  // Clear the input field value
    //     }  else {
    //         setErrorName('');
    //         setNewName(newName);
    //     }

    // };

    const handleNameChange = (event) => {
        setErrorMessage('');
        const newName = event.target.value;
        const validationError = validateName(newName); // Use validateName function 
        // if (newName.charAt(0) === ' ') {

        //     return;
        // }
        if (validationError) {
            setErrorName(validationError);
            //  setNewName(''); // Clear the input field value
        } else {
            setErrorName('');
            setNewName(newName);
        }

    };

    // const handleNameChange = (event) => {
    //     const newName =  event.target.value;
    //     setNewName(newName);
    // };


    const handleEmailChange = (event) => {
        setErrorMessageemail('');
        const value = event.target.value;
        if (value.charAt(0) === ' ') {

            return;
        }
        setNewEmail(value);

        const error = validateEmail(value);
        setEmailError(error || '');
    };

    // const handleEmailChange = (event) => {
    //     setNewEmail(event.target.value);
    // };

    // const handleAddressChange = (event) => {
    //   setNewAddress(event.target.value);
    // };


    const handleAddressChange = (event) => {
        const address = event.target.value;
        const addressError = validateAddress(address);

        if (addressError) {
            // Display the address error message
            setErrorAddress(addressError);
        } else {
            // Update the state with the valid address
            setNewAddress(address);
            setErrorAddress("");
        }
    };


    const handlePhoneChange = (event) => {
        setErrorPhoneMessage('');
        const value = event.target.value.replace(/\D/g, ''); // Remove non-digits

        // Check if the first character is '0'
        if (value.charAt(0) === '0') {
            // Display error message
            setPhoneError("Should not begin with zero.");
        }
        else if (newName.charAt(0) === ' ') {

            return;
        }
        else {
            // Clear error message if no longer applicable
            setPhoneError("");
            // Update state
            setNewPhone(value);
        }


    };


    //  Call function from firebase to read data 

    // const callCloudFunction = async (path) => {
    //     try {
    //         // Call the cloud function
    //         const readRtdb = firebase.functions().httpsCallable('readRtdb');

    //         // Provide any data required by the cloud function (if needed)
    //         const response = await readRtdb({ dbRef: path });

    //         // Handle the response
    //         //  console.log('fetch data from  firebase ',response.data);
    //         return response.data;
    //     } catch (error) {
    //         console.error('Error calling cloud function:', error);
    //     }
    // };



    const callCloudFunction = async (path) => {
        try {
            // Call the cloud function
            const readRtdb = firebase.functions().httpsCallable('readRtdb');
            
            // Promise that resolves after 5 seconds
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Timeout'));
                }, 5000); // 5 seconds
            });
            // Call the cloud function with the provided data and wait for either the function response or the timeout
            const response = await Promise.race([readRtdb({ dbRef: path }), timeoutPromise]);
            // Handle the response
            // console.log('fetch data from  firebase ',response.data);
            return response.data;
        } catch (error) {
            if (error.message === 'Timeout') {
               
            } else {
               alert('Poor internet connection! Please retry2.', error);
            }
        }
    };

    

    const fetchEmailFromFirebase = async (storedPhoneNumber) => {
        const result = sessionTime.isCheckInterNet();
        if (result) {
            try{
        const db = getDatabase();
        const adminRootReference = ref(db, `adminRootReference/adminDetails/${storedPhoneNumber}/adminProfile`);
        const path = adminRootReference.toString();
        const data = await callCloudFunction(path);
       // console.log('Friebase_data :', data);
        const parsedData = JSON.parse(data);
        // onValue(adminRootReference, (snapshot) => {
        //     const data = snapshot.val();
        if (parsedData) {
            //   console.log("Data from Firebase:", data);
            setNewName(parsedData.name === 'null' ? '' : parsedData.name || '');
            setName(parsedData.name === 'null' ? '' : parsedData.name || '');
            setEmail(parsedData.email || '');
            setNewEmail(parsedData.email || '');
            setPassword(parsedData.password || '');
            setKey(parsedData.key || '');
            setAddress(parsedData.address === 'null' ? '' : parsedData.address || '');
            setNewAddress(parsedData.address === 'null' ? '' : parsedData.address || '');
            setPhoneNo2(parsedData.phoneNo2 === 'null' ? '' : parsedData.phoneNo2 || '');
            setNewPhone(parsedData.phoneNo2 === 'null' ? '' : parsedData.phoneNo2 || '');
            // Set other state variables similarly for other fields
            setLoading(false); // Hide loader after data is fetched
            // Data not found in Firebase
        } else {
            //  console.log("Data not found in Firebase.");
            setLoading(false); // Hide loader
        }
    
    } catch (error) {
        console.error(error); // Log the error
      
        alert('Poor internet connection! Please retry.');
        setLoading(false); // Hide loader
    }
    // });
        // } else {
        //     console.log("Offline ");
           // setOnlineStatus(result);
      /// alert(" No internet connection ");
        }
     else {
        setOnlineStatus(result);
        // alert(" No internet connection ");
    }

    };



    const saveButtonClick = () => {
        console.log("Phone Number:", phoneNumber);
        console.log("Email:", email);
        console.log("name:", name);
        console.log("alternatephone :", phoneNo2);
        console.log("Address:", address);
        // Repeat this logic for other fields
        // enter input Fields value 

        console.log('NewName:', newName);
        console.log('NewEmail:', newEmail);
        console.log('NewMobile Number:', newPhone);

        if (newName != name || newAddress != address) {
            console.log("Name or address changed");

        } else if (phoneNo2 !== newPhone && email !== newEmail) {
            console.log("Phone and email changed");
        } else if (phoneNo2 !== newPhone) {
            console.log("Phone number changed");
        } else if (email !== newEmail) {
            console.log("Email changed");
        } else {
            console.log("No changes detected");
        }
    };


    // const callWriteRtdbFunction = async (data) => {

    //     console.log('alll DAta ', data);
    //     try {
    //         // Initialize the callable function
    //         const writeRtdb = firebase.functions().httpsCallable('writeRtdb');
    //         // Call the function with the provided data
    //         const response = await writeRtdb(data);
    //         // Log the response from the cloud function
    //         console.log(response.data);
    //         alert(' Data updated successfully! ');
    //         // Return the response data if needed
    //         return response.data;
    //     } catch (error) {
    //         // Handle errors
    //         console.error('Error calling writeRtdb function:', error);
    //         throw error;
    //     }
    // };




    // const callWriteRtdbFunction = async (data) => {
    //     try {
    //         // Initialize the callable function
    //         const writeRtdb = firebase.functions().httpsCallable('writeRtdb');
    //         // Call the function with the provided data
    //         const response = await writeRtdb(data);
    //         // Log the response from the cloud function
    //         console.log(response.data);
    //         alert(' Data updated successfully! ');
    //         // Return the response data if needed
    //         return response.data;
    //     } catch (error) {
    //         // Handle errors
    //         console.error('Error calling writeRtdb function:', error);
    //         // Schedule to display error alert after 5 seconds
    //         setTimeout(() => {
    //             if (error.message) {
    //                 alert('Failed to update data: ' + error.message);
    //             } else {
    //                 alert('Failed to update data.');
    //             }
    //         }, 5000); // 5000 milliseconds = 5 seconds
    //         throw error;
    //     }
    // };


    const callWriteRtdbFunction = async (data) => {
        try {
            // Initialize the callable function
            const writeRtdb = firebase.functions().httpsCallable('writeRtdb');
            // Promise that resolves after 5 seconds
            const timeoutPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject(new Error('Timeout'));
                }, 5000); // 5 seconds
            });
            // Call the function with the provided data
            const response = await Promise.race([writeRtdb(data), timeoutPromise]);
            // Log the response from the cloud function
            console.log(response.data);
            alert('Data updated successfully!');
            // Return the response data if needed
            return response.data;
        } catch (error) {
            console.error('Error calling writeRtdb function:', error);
            if (error.message === 'Timeout') {
                alert('Poor internet connection! Please retry1.');
            } else {
                // Handle other errors
                alert('Poor internet connection! Please retry3.');
                throw error;
            }
        }
    };

    const saveDataOnFirebase = async () => {

     updateSessionActiveTime();
    
        const adminProfilePath = `adminRootReference/adminDetails/${phoneNumber}/adminProfile`;

        const fullAdminProfilePath = `https://mij-prepaid-meter-default-rtdb.firebaseio.com/${adminProfilePath}`;
        try {
            const newData = {
                address: newAddress === '' ? 'null' : newAddress, // Retain the existing address
                email: newEmail || '', // Replace '' with a default value if needed
                key: key, // Retain the existing key
                name: newName === '' ? 'null' : newName, // Replace '' with a default value if needed
                password: password, // Retain the existing password
                phoneNo: phoneNumber || '', // Replace '' with a default value if needed
                phoneNo2: newPhone === '' ? 'null' : newPhone, // Replace '' with a default value if needed
                // Add other fields as needed
            };

            const dataToSend = {
                [fullAdminProfilePath]: newData // Wrap your data in an object with the appropriate path key
            };

            const resu = await callWriteRtdbFunction(dataToSend);
            console.log("write result", resu);

            /// alert('Data updated successfully!');
            window.location.reload();
        } catch (error) {
           alert('Failed to update data. Please try again4.');
        }
    };


    // const callWriteRtdbFunction = async (data) => {

    //     console.log('call function ' , data);


    //     try {
    //       // Initialize the callable function
    //       const writeRtdb = firebase.functions().httpsCallable('writeRtdb');
    //       // Call the function with the provided data
    //       const response = await writeRtdb({data : data });
    //       // Log the response from the cloud function
    //       console.log(response.data);
    //       // Return the response data if needed
    //       return response.data;
    //     } catch (error) {
    //       // Handle errors
    //       console.error('Error calling writeRtdb function:', error);
    //       throw error;
    //     }
    //   }



    // const saveDataOnFirebase = async () => {

    //     updateSessionActiveTime();

    //     const db = getDatabase();
    //     const adminProfilePath = `adminRootReference/adminDetails/${phoneNumber}/adminProfile`;
    //     try {
    //         // Fetch the existing data
    //         const snapshot = await get(ref(db, adminProfilePath));
    //         const existingData = snapshot.val();
    //        // console.log('Existing Data:', existingData); // Log existing data

    //         const existingKey = existingData.key;
    //         const existingPassword = existingData.password;
    //         // Prepare the updated data
    //         const newData = {


    //             address: newAddress.toString() === '' ? 'null' : newAddress, // Retain the existing address
    //             email: newEmail || '', // Replace '' with a default value if needed
    //             key: existingKey, // Retain the existing key
    //             name: newName === '' ? 'null' : newName, // Replace '' with a default value if needed
    //             password: existingPassword, // Retain the existing password
    //             phoneNo: phoneNumber || '', // Replace '' with a default value if needed
    //             phoneNo2: newPhone === '' ? 'null' : newPhone, // Replace '' with a default value if needed
    //             // Add other fields as needed

    //         };

    //           const dataToSend = {
    //             key1: `adminRootReference/adminDetails/${phoneNumber}/adminProfile` ,
    //             key2: {
    //               // Your nested data here
    //               nestedKey1: newData

    //             }
    //           };

    //         await callWriteRtdbFunction(dataToSend);

    //         alert('Data updated successfully!');
    //         window.location.reload();

    //     } catch (error) {
    //         // console.error('Error updating data:', error);
    //         console.log('Failed to update data. Please try again.');

    //     }
    // }

    const handlesaveButton = async () => {
        const result = sessionTime.isCheckInterNet();
        if (result) {


      //  console.log("save clicked")

        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await sessionTime.HandleValidatSessiontime(phoneNumber);
        if (storeSessionId === sessionId) {
       //  console.log('SessionId Match ');

        if (newPhone === phoneNumber) {
            // If phoneNo2 matches the extracted number, handle the error
            alert("Mobile number already exist..");
            // Handle error, show a message, or take appropriate action
            return;
        }
        if (newPhone.length < 10 && newPhone.length > 0) {

            setErrorPhoneMessage("Enter valid number.");
            return;
        }


        if (newName === "") {
            // Case 1: Name is empty
            //  alert("Please enter a name");
            setErrorMessage("Cannot be empty. ");
            return;
        } else {

        }
        if (newEmail === "") {
            setErrorMessageemail("Enter a valid email.");
            // alert("Please enter a email");
            return;
        }

        if (newName !== name) {
            // test name and email and phone and address
            if (newEmail != email) {
                if (newPhone != phoneNo2) {
                    if (newPhone !== '') {
                        if (newAddress != address) {
                            //     console.log("name email phone address changed");
                            navigate('/phoneemailotp', { state: { newName, newEmail, newPhone, newAddress } });
                        } else {
                            //  console.log("name email phone  changed");
                            navigate('/phoneemailotp', { state: { newName, newEmail, newPhone, newAddress } });
                        }
                    } else {
                        navigate('/emailsendotp', { state: { newName, newEmail, newPhone, newAddress } });
                    }

                }
                else if (newAddress != address) {
                    //   console.log("name email address changed");
                    navigate('/emailsendotp', { state: { newName, newEmail, newPhone, newAddress } });
                } else {
                    //  console.log("name email  changed");
                    navigate('/emailsendotp', { state: { newName, newEmail, newPhone, newAddress } });
                }
            }
            else if (newPhone != phoneNo2) {
                if (newPhone !== '') {
                    if (newAddress != address) {
                        //     console.log("name phone address changed");
                        navigate('/sendphoneotp', { state: { newName, newEmail, newPhone, newAddress } });
                    } else {
                        //   console.log(" name phone  changed");
                        navigate('/sendphoneotp', { state: { newName, newEmail, newPhone, newAddress } });
                    }
                } else {
                    saveDataOnFirebase();
                }
            }
            else if (newAddress != address) {
                //  console.log("name  address changed");
                saveDataOnFirebase();
            }
            else {
                //  console.log("name changed");
                saveDataOnFirebase();
            }
        }
        else if (newEmail != email) {
            if (newPhone != phoneNo2) {
                if (newPhone !== '') {
                    if (newAddress != address) {
                        //   console.log(" email phone  Address changed");
                        navigate('/phoneemailotp', { state: { newName, newEmail, newPhone, newAddress } });
                    }
                    else {
                        //  console.log(" email phone changed");
                        navigate('/phoneemailotp', { state: { newName, newEmail, newPhone, newAddress } });
                    }
                } else {
                    navigate('/emailsendotp', { state: { newName, newEmail, newPhone, newAddress } });

                }
            }
            else if (newAddress != address) {
                //   console.log(" email address changed");
                navigate('/emailsendotp', { state: { newName, newEmail, newPhone, newAddress } });
            }
            else {
                //  console.log(" email  changed");
                navigate('/emailsendotp', { state: { newName, newEmail, newPhone, newAddress } });
            }
        }
        else if (newPhone != phoneNo2) {
            if (newPhone !== '') {
                if (newAddress != address) {
                    //  console.log("phone  address changed");
                    navigate('/sendphoneotp', { state: { newName, newEmail, newPhone, newAddress } });
                } else {
                    //  console.log("phone   changed");
                    navigate('/sendphoneotp', { state: { newName, newEmail, newPhone, newAddress } });
                }
            } else {
                saveDataOnFirebase();
            }
        }

        else if (newAddress != address) {
            //  console.log("address changed");
            saveDataOnFirebase();


        }
        else {
            alert("No change in existing data.")
        }

        // else if (newName !== name || newAddress !== address) {
        //     // Case 3: Name or address changed
        //     console.log("Name or address changed");
        //     // saveDataOnFirebase();
        // } else if (newName !== name && newAddress !== address && newEmail !== email) {
        //     // Case 4: All three (name, address, and email) change
        //     navigate('/emailsendotp', { state: { newEmail } });}
        //     else if (newEmail !== email && newPhone !== phoneNo2) {
        //     // Case 5: Name or address and email and phone change
        //     navigate('/phoneemailotp', { state: { newPhone, newEmail } });
        // } else if (newName !== name || newAddress !== address || newEmail !== email) {
        //     // Case 6: Name or address and email change
        //     navigate('/emailsendotp', { state: { newEmail } });
        // } else if (newName !== name || newAddress !== address || newPhone !== phoneNo2) {
        //     // Case 7: Name or address and phone change
        //     navigate('/sendphoneotp', { state: { newPhone } });
        // } 
        // else {
        //     alert("No changes in existing data");
        //     console.log("No changes detected");

        // }


        } else {

            alert("You have been logged-out due to log-in from another device.");
            // console.log('you are logg out ');
            handleLogout();
        }



        } else {
            setOnlineStatus(result);
            // alert(" No internet connection ");
        }

    }




    const updateSessionActiveTime = () => {

        sessionTime.updateSessionTimeActiveUser(phoneNumber);
    }



    // const SessionValidate = async () => {
    //     const storeSessionId = localStorage.getItem('sessionId');
    //     const { sessionId } = await sessionTime.HandleValidatSessiontime(phoneNumber);
    //     if (storeSessionId === sessionId) {
    //         console.log('SessionId Match ');
    //     } else {
    //         alert("Cannot login. Another session is active. Please retry after sometime. ");
    //         console.log('you are logg out ');
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



    return (
        <>
            <Navbar />



            <>
                {onlineStatus !== null && onlineStatus === false ? (
                    <div style={{ textAlign: 'center', marginTop: '20%' }}>

                        <h3>No Internet Connection</h3>
                    </div>
                ) : (

                    <>
                        {loading ? (
                            <div style={{ textAlign: 'center', marginTop: '20%' }}>

                                <div class="spinner-border text-danger" role="status">
                                    <span class="sr-only"></span>
                                </div>
                            </div>


                        ) : (


                            <div className='containers' style={{ marginTop: '6%', marginBottom: '5px' }} >
                                <div style={{ marginTop: '1px' }} >
                                    <div style={{ marginTop: '1px' }} className='AdminPhoto'>
                                        <img
                                            // style={{ height: '20%', width: '20%', }}
                                            src={adminprofile}
                                            alt="adminprofile"
                                        />
                                    </div>

                                    <div className='style'>
                                        <p style={{ textAlign: 'center', marginBottom: '5px' }}> <Createtime /></p>
                                    </div>
                                </div>
                                <div className='formgroup'>
                                    <div style={{ marginBottom: '5px' }}>
                                        <label htmlFor="phoneNumber">Mobile Number</label>
                                        <div className="input-container1">
                                            <input
                                                type="text"
                                                className='form-control'
                                                value={phoneNumber ? `+91${phoneNumber}` : '+91'} // Concatenate with phoneNumber state if available, otherwise show +91
                                                onChange={(e) => setPhoneNumber(e.target.value.replace('+91', ''))} // To allow users to modify without +91
                                                placeholder="Mobile Number"
                                                readOnly
                                                disabled
                                            />

                                            <i class="fas fa-phone"></i>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '5px' }}>
                                        <label htmlFor="Name">Name</label>
                                        <div className="input-container1">
                                            <input
                                                type="text"
                                                className='form-control'
                                                placeholder="Name"
                                                value={newName !== null ? newName : name}
                                                onChange={handleNameChange}
                                                maxLength={20}

                                            />
                                            <i class="fa-solid fa-user"></i>
                                        </div>
                                        <span style={{ color: 'red' }}>{errorMessage}</span>

                                        <span style={{ color: 'red' }}>  {errorName && <p className="error-message">{errorName}</p>}</span>
                                    </div>
                                    <div style={{ marginBottom: '5px' }}>
                                        <label htmlFor="Name">E-mail</label>
                                        <div className='input-container1'>
                                            <input
                                                type="text"
                                                className='form-control'
                                                placeholder="email"
                                                value={newEmail !== null ? newEmail : email}
                                                onChange={handleEmailChange}
                                            />

                                            <i class="fa-solid fa-envelope"></i>
                                        </div>

                                        {emailError && (
                                            <div style={{ color: 'red' }}>{emailError}</div>
                                        )}

                                        <span style={{ color: 'red' }}>{errorMessage1}</span>

                                    </div>

                                    <div style={{ marginBottom: '5px' }}>
                                        <label htmlFor="alternatphonee">Alternate Mobile Number</label>
                                        <div className='input-container1'>
                                            <input
                                                type="text"
                                                // className='form-control'
                                                className={`form-control ${phoneerror ? 'is-invalid' : ''} `}
                                                placeholder="Alternate Mobile Number"
                                                value={newPhone !== null ? newPhone : phoneNo2}
                                                onChange={handlePhoneChange}
                                                maxLength={10}
                                            />
                                            <i class="fas fa-phone"></i>
                                        </div>
                                        {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
                                        {phoneerror && <p className="invalid-feedback">{phoneerror}</p>}
                                        <span style={{ color: 'red' }}>{erronphoneMessage}</span>
                                    </div>
                                    <div>
                                        <label htmlFor="Address">Address</label>
                                        <div className='input-container1' >
                                            <input
                                                type="text"
                                                className='form-control'
                                                placeholder="Address"
                                                value={newAddress !== null ? newAddress : address}
                                                onChange={handleAddressChange}
                                                maxLength={40}
                                            />
                                            <i class="fa-solid fa-address-card"></i>
                                        </div>

                                        {errorAddres && (
                                            <div style={{ color: 'red' }}>{errorAddres}</div>
                                        )}
                                    </div>
                                    <div className="d-grid col-5">
                                        <button className='btn btn-primary' onClick={handlesaveButton} >Save Details</button>
                                    </div>
                                </div>

                            </div>

                        )}


                    </>
                )}
            </>




        </>
    )
}

export default Admindetail