import React, { useEffect, useState } from 'react'

import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import { Await, useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, update, serverTimestamp } from 'firebase/database';
import { getAuth, EmailAuthProvider, updateProfile, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';

//import { getAuth, updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import firebase from 'firebase/compat/app'; // Import the Firebase app
import 'firebase/compat/firestore';
import Generatetoken from './generatetokenkey';

import Navbar from '../adminLogin/navbar';

import CommonFuctions from '../commonfunction';



const allSerialNo = [];


function Phoneemailotpverify() {


  const SessionTime = new CommonFuctions();




  const navigate = useNavigate();
  const location = useLocation();
  const mainFunction = new Generatetoken();
  const { enteredPhoneNumberModal } = location.state || {};
  const { enteredPasswordModal } = location.state || {};
  const [mobileOTP, setMobileOTP] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTPError, setMobileOTPError] = useState('');
  const [emailOTPError, setEmailOTPError] = useState('');
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is logged in
        setUser(authUser);
        //  console.log("Logged in user:", authUser.email);
        const emailParts = authUser.email.split('@'); // Split email by '@'
        if (emailParts.length === 2) {
          const number = emailParts[0]; // Get the part before '@'
          console.log("Extracted number:", number);
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


  const getAdminPassword = (numberPart) => {
    const passwordRef = database.ref(`/adminRootReference/adminDetails/${numberPart}/adminProfile`);

    passwordRef.once('value', (snapshot) => {
      const fetchedPassword = snapshot.val();
      setAdminKey(fetchedPassword?.key);
      // console.log("Admin key : ", fetchedPassword?.key)
      setPassword(fetchedPassword?.password);
      //  console.log("Admin password : ", fetchedPassword?.password);


    });
  };





  const handleOnSubmit = async () => {



    const storedPhoneOTP = localStorage.getItem('otp'); // Get stored phone OTP
    const storedEmailOTP = localStorage.getItem('emailOTP'); // Get stored email OTP
    if (mobileOTP === storedPhoneOTP && emailOTP === storedEmailOTP) {
    //  console.log('New Password  ', enteredPasswordModal);
    ///  console.log('new Phone  ', enteredPhoneNumberModal);




      handleUpdateAdminDetails();

      handleUpdateCommon();

      handleUpdateEmailPasswordAndUIDInFirebase();

      handleUpdatetennent();

      handlePhoneSerialList();

      handleMeterList();

    } else {
      // OTPs do not match, set error messages or handle accordingly



      if (!mobileOTP) {
        setMobileOTPError('Enter valid OTP');
        return;
      }

      if (!emailOTP) {
        setEmailOTPError('Enter valid OTP');
        return;
      }


      if (mobileOTP !== storedPhoneOTP) {
        setMobileOTPError('Enter valid OTP');
        return;
      }

      if (emailOTP !== storedEmailOTP) {
        setEmailOTPError('Enter valid OTP');
        return;
      }




    }

  };



  const handlePhoneSerialList = async () => {
    console.log("Admin Log in Phone number  for handlePhoneSerialList ", phoneNumber);
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

  const handleMeterList = async () => {
    //const result = await handlePhoneSerialList();
    // console.log('Filter Serail Number ', result);
    // console.log('Change number for all commom meter  ', enteredPhoneNumberModal);

    try {
      const dataPath = database.ref(`/common/meterList/`);
      const snapshot = await dataPath.once('value');
      const serialData = snapshot.val();
      const filteredSerialData = Object.keys(serialData)
        .filter(serial => allSerialNo.includes(serial))
        .reduce((acc, serial) => {
          acc[serial] = serialData[serial];
          return acc;

        }, {});

      console.log('Serial Numbe data ', filteredSerialData);

      for (const serial in filteredSerialData) {
        const meterPath = database.ref(`/common/meterList/${serial}`);
        await meterPath.update({ phoneNo: enteredPhoneNumberModal }); // Replace 'NEW_PHONE_NUMBER' with the actual phone number you want to set
      }

      console.log('Phone numbers updated successfully.');
      //  handleLogout();

    } catch (error) {
      console.error("Error updating phone numbers:", error.message);
    }


  };



  const generateToken = async () => {

    try {
      const mytime = await mainFunction.fireabseServerTimestamp();
      //   const mytime = await mainFunction.serverTimeFirebase();
      //  console.log("It Is ServerTiem ", mytime);
      //  setTimeStamp(mytime);

      let type = '04';
      //  console.log("servertime",allSerialNo.length);

      for (let i = 0; i < allSerialNo.length; i++) {
        const phoneReconfigToken = mainFunction.updatePhoneAndPassword(mytime, type, enteredPhoneNumberModal, allSerialNo[i], newPassword, adminKey);

        console.log("Token Hex for reconfig :  ", phoneReconfigToken);

        updateMeterDetailsOnFirebase(allSerialNo[i], phoneReconfigToken, mytime);

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


  let newEmail = enteredPhoneNumberModal + "@gmail.com";
  let newPassword = enteredPasswordModal;
  let number = '1234512345';



  const handleUpdateEmailPasswordAndUIDInFirebase = () => {
    const authInstance = getAuth();
    const user = authInstance.currentUser;

    if (user) {
      const credential = EmailAuthProvider.credential(
        user.email,
        password
      );

      reauthenticateWithCredential(user, credential)
        .then(() => {
          // User reauthenticated successfully, now update email
          return updateEmail(user, newEmail)
            .then(() => {
              // Update password
              return updatePassword(user, newPassword)
                .then(() => {
                  // Update UID
                  return updateProfile(user, { uid: number })
                    .then(() => {
                      console.log("Email, password, and UID updated successfully");
                      //   handleLogout();
                    })
                    .catch((error) => {
                      console.error("Error updating UID: ", error.message);
                    });
                })
                .catch((error) => {
                  console.error("Error updating password: ", error.message);
                });
            })
            .catch((error) => {
              console.error("Error updating email: ", error.message);
            });
        })
        .catch((error) => {
          console.error("Error reauthenticating user: ", error.message);
        });
    }
  };


  let newPhoneNumber = enteredPhoneNumberModal;
  //let newPassword = 1234512345;
  const handleUpdateAdminDetails = async () => {
    const db = getDatabase();

    const adminProfilePath = `adminRootReference/adminDetails/${phoneNumber}/adminProfile`;
    const oldAdinDetialspath = database.ref(`adminRootReference/adminDetails/${phoneNumber}`);
    const newAdinDetialspath = database.ref(`adminRootReference/adminDetails/${newPhoneNumber}`);

    try {
      // Fetch existing data
      const snapshot = await get(ref(db, adminProfilePath));
      const existingData = snapshot.val();
      // Extract existing values
      const existingAddress = existingData.address;
      const existingEmail = existingData.email;
      const existingKey = existingData.key;
      const existingName = existingData.name;
      const existingPhone2 = existingData.phoneNo2;

      // Create new data object with updated phone number
      const newData = {
        ...existingData,
        address: existingAddress, // Retain the existing address
        email: existingEmail, // Retain the existing email
        key: existingKey, // Retain the existing key
        name: existingName, // Retain the existing name
        password: newPassword, // Retain the existing password
        phoneNo: newPhoneNumber, // Update the phone number
        phoneNo2: existingPhone2, // Retain the existing phoneNo2
        // Add other fields as needed
      };

      await set(ref(db, adminProfilePath), newData);

      // Move data to the new key and remove from the old key
      const snapshotData = await oldAdinDetialspath.once('value');
      const data = snapshotData.val();

      // Step 2: Write data to the new key
      await newAdinDetialspath.set(data);

      // Step 3: Remove data from the old key
      await oldAdinDetialspath.remove();

      console.log('Key updated successfully');



    } catch (error) {
      console.error('Error updating admin details:', error);
      // Handle the error as needed
    }
  };




  const handleUpdateCommon = () => {
    const oldDataRef = database.ref(`common/adminPhoneList/${phoneNumber}`);
    const newDataRef = database.ref(`common/adminPhoneList/${enteredPhoneNumberModal}`);
    const oldPasswordRef = database.ref(`common/adminPhoneList/${phoneNumber}/password`);
    const newPasswordRef = database.ref(`common/adminPhoneList/${enteredPhoneNumberModal}/password`);

    // Fetching old data and password
    Promise.all([
      oldDataRef.once('value'),
      oldPasswordRef.once('value')
    ])
      .then(([dataSnapshot, passwordSnapshot]) => {
        const data = dataSnapshot.val();

        // Step 1: Write data and password to the new key
        return Promise.all([
          newDataRef.set(data),
          newPasswordRef.set(newPassword)
        ]);
      })
      .then(() => {
        // Step 2: Remove data and password from the old key
        return Promise.all([
          oldDataRef.remove(),
          oldPasswordRef.remove()
        ]);
      })
      .then(() => {
        console.log('Key updated successfully');
      })
      .catch(error => {
        console.error('Error updating key:', error);
      });
  }



  // const handleUpdateCommon = () => {


  //   const oldDataRef = database.ref(`common/adminPhoneList/${phoneNumber}`);
  //   const newDataRef = database.ref(`common/adminPhoneList/${enteredPhoneNumberModal}`);

  //   oldDataRef.once('value')
  //     .then(snapshot => {
  //       const data = snapshot.val();

  //       // Step 2: Write data to the new key
  //       return newDataRef.set(data);
  //     })
  //     .then(() => {
  //       // Step 3: Remove data from the old key
  //       return oldDataRef.remove();
  //     })
  //     .then(() => {
  //       console.log('Key updated successfully');
  //     })
  //     .catch(error => {
  //       console.error('Error updating key:', error);
  //     });


  // }


  const handleUpdatetennent = () => {

    console.log(' logged tennet details number ', phoneNumber);
    console.log(' logged tennet details number ', enteredPhoneNumberModal);

    const oldDataRef = database.ref(`adminRootReference/tenantDetails/${phoneNumber}`);
    const newDataRef = database.ref(`adminRootReference/tenantDetails/${enteredPhoneNumberModal}`);

    oldDataRef.once('value')
      .then(snapshot => {
        const data = snapshot.val();

        // Step 2: Write data to the new key
        return newDataRef.set(data);
      })
      .then(() => {
        // Step 3: Remove data from the old key
        return oldDataRef.remove();
      })
      .then(() => {
        console.log('Key updated successfully11');
      })
      .catch(error => {
        console.error('Error updating key:', error);
      });



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
  // const SessionValidate = async (numberPart) => {

  //   const storeSessionId = localStorage.getItem('sessionId');
  //   const { sessionId } = await SessionTime.HandleValidatSessiontime(numberPart);
  //   // console.log("Received session ID from server: ", sessionId);

  //   if (storeSessionId === sessionId) {
  //     //  console.log('SessionId Match ', sessionId);
  //     return;
  //   } else {
  //     //  console.log('SessionId Mismatch');
  //     alert("Cannot login. Another session is active. Please retry after sometime. ");
  //     // console.log('you are logged out ');
  //     handleLogout();
  //   }

  // };


  const SessionUpdate =  () => {
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
              {/* <h3>Enter OTP</h3> */}
            </div>
            {/* <p> password : {enteredPasswordModal}</p> */}
            {/* <p>Phone number   : {enteredPhoneNumberModal}</p> */}
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

    </>
  )
}

export default Phoneemailotpverify