import React, { useEffect, useState } from 'react';
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import { Await, useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, update, serverTimestamp } from 'firebase/database';
import { getAuth, updatePassword, updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat/app'; // Import the Firebase app
import 'firebase/compat/firestore';
import Generatetoken from './generatetokenkey';
import CommonFuctions from '../commonfunction';
import Navbar from '../adminLogin/navbar';

import { Modal, Button } from 'react-bootstrap';



const allSerialNo = [];

function Passwordotp() {

    const SessionTime = new CommonFuctions();

    const navigate = useNavigate();
    const history = useNavigate();
    const [user, setUser] = useState(null);
    const [mobileOTP, setMobileOTP] = useState('');
    const [emailOTP, setEmailOTP] = useState('');
    const maxLength = 6; // Assuming OTP length is 6
    const [mobileOTPError, setMobileOTPError] = useState('');
    const [emailOTPError, setEmailOTPError] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [timeStamp, setTimeStamp] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { enteredPasswordModal } = location.state || {};
    const mainFunction = new Generatetoken();

    //  let newPassword = '12341234';

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                // User is logged in
                setUser(authUser);
                //  console.log("Logged in user:", authUser.email);
                const emailParts = authUser.email.split('@'); // Split email by '@'
                if (emailParts.length === 2) {
                    const number = emailParts[0]; // Get the part before '@'
                    //    console.log("Extracted number:", number);
                    setPhoneNumber(number);
                    getAdminPassword(number);

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


    //  console.log('  New Password ', enteredPasswordModal);

    const handleOnSubmit = async () => {

        const storedPhoneOTP = localStorage.getItem('otp'); // Get stored phone OTP
        const storedEmailOTP = localStorage.getItem('emailOTP'); // Get stored email OTP

        if (mobileOTP !== storedPhoneOTP) {
            setMobileOTPError('Invalid mobile OTP');
        } else if (emailOTP !== storedEmailOTP) {
            setEmailOTPError('Invalid email OTP');
        } else {
            // Both OTPs are valid, proceed with the submission
            // You can also reset any existing errors here, if needed
            setMobileOTPError('');
            setEmailOTPError('');

            // Proceed with the submission
        }

        if (mobileOTP === storedPhoneOTP && emailOTP === storedEmailOTP) {
            // console.log('Admin phone number ', phoneNumber);
            //   console.log('new Phone  ',);

            setLoading(true);
            const status = await SessionTime.checkInternetConnection(); // Call the function
            if (status === 'Poor connection.') {
                setIsDialogOpen(true);
                setModalMessage('No/Poor Internet connection , Please retry.');
                setLoading(false);
                // alert('No/Poor Internet connection , Please retry.'); // Display the "Poor connection" message in an alert
                return;
            }

            // console.log('Validate  OTP : ');

            const storeSessionId = localStorage.getItem('sessionId');
            try {
                const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
                if (storeSessionId === sessionId) {

                    /// console.log('Validate session id ');
                    await handleUpdateAdminPassword();
                    await handleUpdateCommonPassword();
                    //  await handleUpdatePasswordInFirebase();
                    await handlePhoneSerialList();

                } else {
                    alert("You have been logged-out due to log-in from another device.");
                    /// console.log('you are logg out ');
                    handleLogout();
                }

            } catch (error) {
                setLoading(false);
                setIsDialogOpenResponse(true);
                const errorMessage = `Response not recieved  from server-S. Please check if transaction completed successfully, else retry. (${error}).`;
                setModalMessageResponse(errorMessage);


            }



        } else {
            // OTPs do not match, set error messages or handle accordingly
            // if (mobileOTP !== storedPhoneOTP) {
            //     setMobileOTPError('Invalid mobile OTP');
            // }
            // if (emailOTP !== storedEmailOTP) {
            //     setEmailOTPError('Invalid email OTP');
            // }
        }



    };

    // old phone number and new Password

    const getAdminPassword = (numberPart) => {
        const passwordRef = database.ref(`/adminRootReference/adminDetails/${numberPart}/adminProfile`);
        passwordRef.once('value', (snapshot) => {
            const fetchedPassword = snapshot.val();
            setAdminKey(fetchedPassword?.key);
            setOldPassword(fetchedPassword?.password);
            // console.log("Admin key : ", fetchedPassword?.password)
            setLoading(false);

        });
    };


    // update Admin  New Password on Firebase 
    const handleUpdateAdminPassword = async () => {
        const db = getDatabase();
        const adminProfilePath = `adminRootReference/adminDetails/${phoneNumber}/adminProfile`;
        try {

            const snapshot = await get(ref(db, adminProfilePath));
            const adminData = snapshot.val(); // Extracting the current data
            adminData.password = newPassword;
            // You can update other fields similarly
            // Write the updated data back to the database
            ///  await set(ref(db, adminProfilePath), adminData);
        } catch (error) {
            console.error('Error updating admin details:', error);
            // Handle the error as needed
        }
    };


    // Update Common AdminPhoneList Password 

    const handleUpdateCommonPassword = async () => {
        const db = getDatabase();
        const adminProfilePath = `common/adminPhoneList/${phoneNumber}/`;

        try {
            // Update the password field
            // await update(ref(db, adminProfilePath), {
            //     password: newPassword // Replace with the new password value
            // });

            console.log('Stage 1 ');
        } catch (error) {
            console.error('Error updating password:', error);
            // Handle the error as needed
        }
    };

    // Update Password on Firebase Authentication 

    let newPassword = enteredPasswordModal;

    const handleUpdatePasswordInFirebase = () => {
        const authInstance = getAuth();
        const user = authInstance.currentUser;

        if (user) {
            const credential = EmailAuthProvider.credential(
                user.email,
                oldPassword
            );
            reauthenticateWithCredential(user, credential)
                .then(() => {
                    // User reauthenticated successfully, now update password
                    return updatePassword(user, newPassword)
                        .then(() => {
                            console.log("Password updated successfully");
                            //   handleLogout();
                        })
                        .catch((error) => {
                            console.error("Error updating password: ", error.message);
                        });
                })
                .catch((error) => {
                    console.error("Error reauthenticating user: ", error.message);
                });
        }
    };

    const handlePhoneSerialList = async () => {

        const storeSessionId = localStorage.getItem('sessionId');

        console.log('Phone List not ok');

        try {
            const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
            if (storeSessionId === sessionId) {

                console.log('Phone Lit ok ');

                //    console.log("Admin Log in Phone number  for handlePhoneSerialList ", phoneNumber);
                try {
                    const newAdinDetialspath = database.ref(`adminRootReference/adminDetails/${phoneNumber}/meterList`);
                    const snapshot = await newAdinDetialspath.once('value');
                    const serialData = snapshot.val();
                    //  console.log('phone related serial  ', Object.keys(serialData));
                    const keys = Object.keys(serialData);
                    const isDuplicate = allSerialNo.includes(keys);
                    // console.log('Seria0l: valye ');
                    for (let i = 0; i < keys.length; i++) {
                        //  console.log('Serial: valye ', keys[i]);
                        allSerialNo.push(keys[i]);
                    }
                    // console.log('Serial: valye ', allSerialNo.length);  
                    generateToken();
                    // console.log('phone related serial1111:  ', keys);
                    // console.log('phone related serial1111:  ', typeof keys);
                    return keys;
                } catch (error) {
                    console.error("Error fetching serial data:", error.message);
                }


            } else {
                //   alert("You have been logged-out due to log-in from another device.");
                /// console.log('you are logg out ');
                //  handleLogout();
            }

        } catch (error) {
            setLoading(false);
            setIsDialogOpenResponse(true);
            const errorMessage = `Response not recieved  from server-S. Please check if transaction completed successfully, else retry. (${error}).`;
            setModalMessageResponse(errorMessage);

        }

    }

    const generateToken = async () => {
        console.log('Generated  token start ');
        const storeSessionId = localStorage.getItem('sessionId');
        try {
            const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
            if (storeSessionId === sessionId) {

                const mytime = await mainFunction.fireabseServerTimestamp();
                // console.log("It Is ServerTiem ", mytime);
                let type = '04';
                //  console.log("servertime",allSerialNo.length);
                for (let i = 0; i < allSerialNo.length; i++) {
                    const updatePassword = mainFunction.updatePassword(mytime, type, phoneNumber, allSerialNo[i], newPassword, adminKey);
                    console.log("Token Hex for reconfig :  ", updatePassword);
                    await updateMeterDetailsOnFirebase(allSerialNo[i], updatePassword, mytime);
                }

            } else {
                //  alert("You have been logged-out due to log-in from another device.");
                /// console.log('you are logg out ');
                //  handleLogout();
            }

        } catch (error) {
            setLoading(false);
            setIsDialogOpenResponse(true);
            const errorMessage = `Response not recieved  from server-S. Please check if transaction completed successfully, else retry. (${error}).`;
            setModalMessageResponse(errorMessage);


        }


    };

    const updateMeterDetailsOnFirebase = async (serialNumber, token, serverTime) => {


        console.log('token path ');

        const storeSessionId = localStorage.getItem('sessionId');
        try {
            const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
            if (storeSessionId === sessionId) {

                console.log('  session validation ok  ');

                //  console.log("servertime ", serverTime);

                //  const meterDetailsPath = `adminRootReference/meterDetails/${serialNumber}/reConfigToken`;
                const tariffRef = firebase.database().ref(`adminRootReference/meterDetails/${serialNumber}/reConfigToken`);
                const saveTariffReference = tariffRef.toString();


                //  Update Password in Common Folder 

                const db = getDatabase();
                const PasswordRef = firebase.database().ref(`common/adminPhoneList/${phoneNumber}/`);
                const savePasswordReference = PasswordRef.toString();
                // Update the password field
                const password = {
                    password: newPassword // Replace with the new password value
                };


                // Update Admin Paswword in AdminDetials Folder 
                const AdminPassword = firebase.database().ref(`adminRootReference/adminDetails/${phoneNumber}/adminProfile/`);
                const saveAdminPasswordReference = AdminPassword.toString();
                const adminProfilePath = `adminRootReference/adminDetails/${phoneNumber}/adminProfile`;
                const snapshot = await get(ref(db, adminProfilePath));
                const adminData = snapshot.val(); // Extracting the current data
                adminData.password = newPassword;
                const Adiminpassword = {
                    password: newPassword // Replace with the new password value
                };

                const data = {
                    isTransfer: "false",
                    token: token,
                    tokenGeneratedTime: serverTime,
                    tokenUsedTime: 'null',
                    transferPhoneNumber: 'null',
                };
         
                console.log('token updatd in path ');

                const dataToSend = {
                    [saveTariffReference]: data,
                    [savePasswordReference]: password,
                    [saveAdminPasswordReference]: adminData
                };

                try {

                    const result = await SessionTime.callWriteRtdbFunction(dataToSend);
                    handleUpdatePasswordInFirebase();
                    // console.log('Update Succesffullyyy ');
                    setLoading(false);
                    setLoading(false);
                    setIsDialogOpenLogout(true);
                    const errorMessage = ` Password hase been change . You Logout `;
                    setModalMessageLogout(errorMessage);

                } catch (error) {

                    setLoading(false);
                    setIsDialogOpenResponse(true);
                    const errorMessage = `Response not recieved  from server-A. Please check if transaction completed successfully, else retry. (${error}).`;
                    setModalMessageResponse(errorMessage);
                }
            } else {
                alert("You have been logged-out due to log-in from another device.");
                /// console.log('you are logg out ');
                handleLogout();
            }


        } catch (error) {
            setLoading(false);
            setIsDialogOpenResponse(true);
            const errorMessage = `Response not recieved  from server-S. Please check if transaction completed successfully, else retry. (${error}).`;
            setModalMessageResponse(errorMessage);


        }





    };


    const handleLogout = () => {
        auth.signOut().then(() => {
            // Redirect to login page after successful logout
            history('/'); // Change '/login' to your login page route
        }).catch((error) => {
            // Handle any errors during logout
            console.error('Error logging out:', error.message);
        })

    }


    const handleMobileOTPChange = (e) => {
        const input = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
        setMobileOTP(input);
        setMobileOTPError('');
    };

    const handleEmailOTPChange = (e) => {
        const input = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
        setEmailOTP(input);
        setEmailOTPError('');
    };

    const handleSubmitClick = async (e) => {
        if (mobileOTP === '') {
            setMobileOTPError('Invalid mobile OTP');
            return;
        }
        if (emailOTP === '') {
            setMobileOTPError('Invalid mobile OTP');
            return;
        }

        // const storeSessionId = localStorage.getItem('sessionId');
        // const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
        // if (storeSessionId === sessionId) {

        SessionUpdate();
        e.preventDefault(); // Prevent default form submission
        handleOnSubmit(); // Call the submit function
        // } else {
        //     alert("You have been logged-out due to log-in from another device.");
        //     // console.log('you are logg out ');
        //     handleLogout();
        //   }
    };


    const SessionUpdate = () => {
        SessionTime.updateSessionTimeActiveUser(phoneNumber);
    }

    const [modalMessage, setModalMessage] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const closeDialog = () => {
        setIsDialogOpen(false);
        // window.location.reload(); // This will reload the page
    };

    const [modalMessageResponse, setModalMessageResponse] = useState('');
    const [isDialogOpenResponse, setIsDialogOpenResponse] = useState(false);

    const closeDialogResponse = () => {
        setIsDialogOpenResponse(false);
       // window.location.reload(); // This will reload the page
    };

    const [modalMessageLogout, setModalMessageLogout] = useState('');
    const [isDialogOpenLogout, setIsDialogOpenLogout] = useState(false);

    const closeDialogLogout = () => {
        setIsDialogOpenLogout(false);
        handleLogout();

    };




    return (
        <>

            <div>

                <Navbar />

            </div>

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


            <div className='containers'>
                <div className='formgroup'>
                    <div>
                        <div>
                            <h3>Enter OTP</h3>

                        </div>
                        <label htmlFor="mobileOTP">Enter Mobile OTP</label>
                        <input
                            type="text"
                            className='form-control'
                            placeholder=" Mobile OTP"
                            value={mobileOTP}
                            onChange={handleMobileOTPChange}
                            maxLength={6}
                        />
                        {mobileOTPError && <p style={{ color: 'red' }} className="error">{mobileOTPError}</p>}
                    </div>
                    <div>
                        <label htmlFor="emailOTP">Enter E-mail OTP</label>
                        <input
                            type="text"
                            className='form-control'
                            placeholder=" E-mail OTP"
                            value={emailOTP}
                            onChange={handleEmailOTPChange}
                            maxLength={6}
                        />
                        {emailOTPError && <p style={{ color: 'red' }} className="error">{emailOTPError}</p>}
                    </div>
                    <div className='d-grid col-4'>
                        <button type="submit" className='btn btn-primary' onClick={handleSubmitClick}>
                            VERIFY
                        </button>
                    </div>


                </div>
            </div>


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


            <Modal show={isDialogOpenResponse} onHide={closeDialogResponse} backdrop="static" style={{ marginTop: '3%' }}>
                {/* <Modal.Header closeButton>
      </Modal.Header>  */}
                <Modal.Body>
                    <p style={{ color: 'red' }}> {modalMessageResponse}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={closeDialogResponse}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


            <Modal show={isDialogOpenLogout} onHide={closeDialogLogout} backdrop="static" style={{ marginTop: '3%' }}>
                {/* <Modal.Header closeButton>
      </Modal.Header>  */}
                <Modal.Body>
                    <p style={{ color: 'red' }}> {modalMessageLogout}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={closeDialogLogout}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>



        </>
    )
}

export default Passwordotp