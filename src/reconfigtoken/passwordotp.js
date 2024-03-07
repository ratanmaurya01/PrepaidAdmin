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
        if (mobileOTP === storedPhoneOTP && emailOTP === storedEmailOTP) {
            // console.log('Admin phone number ', phoneNumber);
            //   console.log('new Phone  ',);


            await handleUpdateAdminPassword();
            await handleUpdateCommonPassword();

            await handleUpdatePasswordInFirebase();

            await handlePhoneSerialList();


        } else {
            // OTPs do not match, set error messages or handle accordingly
            if (mobileOTP !== storedPhoneOTP) {
                setMobileOTPError('Invalid mobile OTP');
            }
            if (emailOTP !== storedEmailOTP) {
                setEmailOTPError('Invalid email OTP');
            }
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
            await set(ref(db, adminProfilePath), adminData);
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
            await update(ref(db, adminProfilePath), {
                password: newPassword // Replace with the new password value
            });

            console.log('Password updated successfully');
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
    }



    const generateToken = async () => {

        try {

            const mytime = await mainFunction.fireabseServerTimestamp();
            // console.log("It Is ServerTiem ", mytime);


            let type = '04';
            //  console.log("servertime",allSerialNo.length);

            for (let i = 0; i < allSerialNo.length; i++) {
                const updatePassword = mainFunction.updatePassword(mytime, type, phoneNumber, allSerialNo[i], newPassword, adminKey);

                console.log("Token Hex for reconfig :  ", updatePassword);

                await updateMeterDetailsOnFirebase(allSerialNo[i], updatePassword, mytime);

            }

        } catch (error) {
            console.error("Error fetching server time:", error);
        }
    };




    const updateMeterDetailsOnFirebase = async (serialNumber, token, serverTime) => {
        //  console.log("servertime ", serverTime);

        try {
            const meterDetailsPath = `adminRootReference/meterDetails/${serialNumber}/reConfigToken`;

            await firebase.database().ref(meterDetailsPath).update({
                isTransfer: "false",
                token: token,
                tokenGeneratedTime: serverTime,
                tokenUsedTime: 'null',
                transferPhoneNumber: 'null',

            });

            console.log(`Updated reConfigToken for meter`);
        } catch (error) {
            console.error('Error updating reConfigToken fields:', error);
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
        setMobileOTP(e.target.value);
        setMobileOTPError('');
    };

    const handleEmailOTPChange = (e) => {
        setEmailOTP(e.target.value);
        setEmailOTPError('');
    };

    const handleSubmitClick = async (e) => {

    
        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
        if (storeSessionId === sessionId) {
    
          SessionUpdate();

        e.preventDefault(); // Prevent default form submission
        handleOnSubmit(); // Call the submit function

   
    } else {
        alert("You have been logged-out due to log-in from another device.");
        // console.log('you are logg out ');
        handleLogout();
      }



    };




    const SessionUpdate = () => {
        SessionTime.updateSessionTimeActiveUser(phoneNumber);
      }




    return (
        <>   

<div>

<Navbar />

</div>

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
                            placeholder="Enter Mobile OTP"
                            value={mobileOTP}
                            onChange={handleMobileOTPChange}
                        />
                        {mobileOTPError && <p className="error">{mobileOTPError}</p>}
                    </div>
                    <div>
                        <label htmlFor="emailOTP">Enter E-mail OTP</label>
                        <input
                            type="text"
                            className='form-control'
                            placeholder="Enter E-mail OTP"
                            value={emailOTP}
                            onChange={handleEmailOTPChange}
                        />
                        {emailOTPError && <p className="error">{emailOTPError}</p>}
                    </div>
                    <div className='d-grid col-4'>
                        <button type="submit" className='btn btn-primary' onClick={handleSubmitClick}>
                            VERIFY
                        </button>
                    </div>


                </div>
            </div>


        </>
    )
}

export default Passwordotp