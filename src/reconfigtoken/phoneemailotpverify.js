import React, { useEffect, useState } from 'react'

import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import { Await, useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, update, serverTimestamp } from 'firebase/database';
import { getAuth, EmailAuthProvider, updateProfile, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';

import { Modal, Button } from 'react-bootstrap';
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
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true);


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
          fetchdata(number);
          fetchTennetDAta(number);
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




  const [address, setAddress] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [name, setName] = useState('');
  const [Phoneno, setPhoneno] = useState('');
  const [Phoneno2, setPhoneno2] = useState('');


  const getAdminPassword = async (numberPart) => {

    const status = await SessionTime.checkInternetConnection(); // Call the function
    if (status === 'Poor connection.') {
      setIsDialogOpen(true);
      setModalMessage('No/Poor Internet connection , Please retry.');
      setLoading(false);
      // alert('No/Poor Internet connection , Please retry.'); // Display the "Poor connection" message in an alert
      return;
    }
    const passwordRef = database.ref(`/adminRootReference/adminDetails/${numberPart}/adminProfile`);

    passwordRef.once('value', (snapshot) => {
      const fetchedPassword = snapshot.val();
      setAddress(fetchedPassword?.address);
      setAdminEmail(fetchedPassword?.email);
      setAdminKey(fetchedPassword?.key);
      setName(fetchedPassword?.name);
      // console.log("Admin key : ", fetchedPassword?.key)
      setPassword(fetchedPassword?.password);
      //  console.log("Admin password : ", fetchedPassword?.password);
      setPhoneno(fetchedPassword?.phoneNo);
      setPhoneno2(fetchedPassword?.phoneNo2);
      setPassword(fetchedPassword?.password);
      setLoading(false);


    });
  };


  const [parsedData ,setParsedData]  =useState('');
  const fetchdata = async (number) => {

    const FetchAdmin = firebase.database().ref(`adminRootReference/adminDetails/${number}`);
    const Admindetialsref = FetchAdmin.toString();
    try {
      const result = await SessionTime.callCloudFunction(Admindetialsref);
      const parsedData = JSON.parse(result);
      setParsedData(parsedData);
    } catch (error) {
      //   console.log('Data Not fect from FDB');
    }
  }
 
  const [tenantDetails , setTennentDetials ] =useState('');
 
   const fetchTennetDAta = async(number)=>{

    const Fetchtennentdetails = firebase.database().ref(`adminRootReference/tenantDetails/${number}`);
    const snapshot = await Fetchtennentdetails.once('value');
    const tenantDetails = snapshot.val();

    setTennentDetials(tenantDetails);

   }

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
      //  console.log('New Password  ', enteredPasswordModal);
      ///  console.log('new Phone  ', enteredPhoneNumberModal);

      setLoading(true);
      const status = await SessionTime.checkInternetConnection(); // Call the function
      if (status === 'Poor connection.') {
        setIsDialogOpen(true);
        setModalMessage('No/Poor Internet connection , Please retry.');
        setLoading(false);
        // alert('No/Poor Internet connection , Please retry.'); // Display the "Poor connection" message in an alert
        return;
      }
      //  handleUpdateAdminDetails();

      //  handleUpdateCommon();

      ///  handleUpdateEmailPasswordAndUIDInFirebase();

      //  handleUpdatetennent();

      handlePhoneSerialList();
      // handleMeterList();
    } else {
      // OTPs do not match, set error messages or handle accordingly

      // if (!mobileOTP) {
      //   setMobileOTPError('Enter valid OTP');
      //   return;
      // }

      // if (!emailOTP) {
      //   setEmailOTPError('Enter valid OTP');
      //   return;
      // }


      // if (mobileOTP !== storedPhoneOTP) {
      //   setMobileOTPError('Enter valid OTP');
      //   return;
      // }

      // if (emailOTP !== storedEmailOTP) {
      //   setEmailOTPError('Enter valid OTP');
      //   return;
      // }
    }

  };



  const handlePhoneSerialList = async () => {
    ///   console.log("Admin Log in Phone number  for handlePhoneSerialList ", phoneNumber);
    const status = await SessionTime.checkInternetConnection(); // Call the function
    if (status === 'Poor connection.') {
      setIsDialogOpen(true);
      setModalMessage('No/Poor Internet connection , Please retry.');
      setLoading(false);
      // alert('No/Poor Internet connection , Please retry.'); // Display the "Poor connection" message in an alert
      return;
    }


    const storeSessionId = localStorage.getItem('sessionId');
    try {
      const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
      if (storeSessionId === sessionId) {

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


      } else {
        //   alert("You have been logged-out due to log-in from another device.");
        /// console.log('you are logg out ');
      //   handleLogout();
      }

    } catch (error) {
      setLoading(false);
      setIsDialogOpenResponse(true);
      const errorMessage = `Response not recieved  from server-S. Please check if transaction completed successfully, else retry. (${error}).`;
      setModalMessageResponse(errorMessage);
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

    const storeSessionId = localStorage.getItem('sessionId');
    try {
      const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
      if (storeSessionId === sessionId) {

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


  const updateMeterDetailsOnFirebase = async (serialNumber, token, serverTime) => {

    console.log('Session validate Pending ',);

    const storeSessionId = localStorage.getItem('sessionId');
    try {
      const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
      if (storeSessionId === sessionId) {

        console.log('Session Validate OK:',);

        // Update Admin Detaisl in Admin path 

      //  const db = getDatabase();

       /// Fetch Admin Detials 
        // const FetchAdmin = firebase.database().ref(`adminRootReference/adminDetails/${phoneNumber}`);
        // const Admindetialsref = FetchAdmin.toString();
        // const result = await SessionTime.callCloudFunction(Admindetialsref);
        // const parsedData = JSON.parse(result);

     //   const tariffRef = firebase.database().ref(`adminRootReference/meterDetails/${serialNumber}`);
      //  const saveTariffReference = tariffRef.toString();
        //  const FectchTokenData = saveTariffReference.toString();
     //   const TokenData = await SessionTime.callCloudFunction(saveTariffReference);
     //   const updateGetTokenData = JSON.parse(TokenData);

        const updateToken = {
          [serialNumber]: {
            isTransfer: "false",
            token: token,
            tokenGeneratedTime: serverTime,
            tokenUsedTime: "null", // Use null instead of 'null'
            transferPhoneNumber: "null", // Use null instead of 'null'  
          }
        };

        //   console.log('dataaa : ', tokenDetails);

        ///  console.log('Update Token :', tokenDetails);

        // Fetch Tennent Details path
        // const Fetchtennentdetails = firebase.database().ref(`adminRootReference/tenantDetails/${phoneNumber}`);
        // const snapshot = await Fetchtennentdetails.once('value');
        // const tenantDetails = snapshot.val();

        // const adminDetails = {
        //   ...parsedData, // Include existing adminProfile data
        //   password: newPhoneNumber, // Update password field
        //   phoneNo: newPassword // Update phoneNo field
        // };
        const updatedAdminProfile = {
          ...parsedData.adminProfile,
          password: newPassword,
          phoneNo: newPhoneNumber,
        };

        // Update data with the modified admin profile
        const adminDetails = {
          ...parsedData,
          adminProfile: updatedAdminProfile,
        };

        const data = {
          tokenDetails: updateToken,
          adminDetails: adminDetails,
          tenantDetails: tenantDetails
        };


       console.log('Update data in databse  :' ,data);

        try {
          await SessionTime.callReconfigToken(data);

          // console.log('Update Succesffullyyy ');
          setLoading(false);
          setIsDialogOpenLogout(true);
          const errorMessage = ` Password and phone  has been change . You Logout `;
          setModalMessageLogout(errorMessage);

        }
        catch (error) {

          setLoading(false);
          setIsDialogOpenResponse(true);
          const errorMessage = `Response not recieved  from server-A. Please check if transaction completed successfully, else retry. (${error}).`;
          setModalMessageResponse(errorMessage);
        }


        // const functions = firebase.functions();

        // // Call the function
        // const reConfigFunction = functions.httpsCallable("reConfig");
        // reConfigFunction({
        //   tokenDetails: updateToken,
        //   adminDetails: adminDetails,
        //   tenantDetails: tenantDetails,
        // })
        //   .then((result) => {
        //     // Handle success
        //     console.log("Function call successful:", result.data);
        //   })
        //   .catch((error) => {
        //     // Handle error
        //     console.error("Error calling function:", error);
        //   });



        // handleUpdateAdminDetails();

        // handleUpdateCommon();
        // handleMeterList();

        // handleUpdateEmailPasswordAndUIDInFirebase();

        // handleUpdatetennent();
        // console.log('Update Succesffullyyy ');
        // setLoading(false);
        // setLoading(false);
        // setIsDialogOpenLogout(true);
        // const errorMessage = ` Password and phone  hase been change . You Logout `;
        // setModalMessageLogout(errorMessage);



        // console.log(`Updated reConfigToken for meter`);

      } else {
        // alert("You have been logged-out due to log-in from another device.");
        /// console.log('you are logg out ');
        // handleLogout();
      }


    } catch (error) {
      setLoading(false);
      setIsDialogOpenResponse(true);
      const errorMessage = `Response not recieved  from server-S. Please check if transaction completed successfully, else retry. (${error}).`;
      setModalMessageResponse(errorMessage);

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

      console.log('Key Update');

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
        console.log('Phone and Password save');
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


    // if (mobileOTP === '') {
    //   setMobileOTPError('Invalid mobile OTP');
    //   return;
    // }
    // if (emailOTP === '') {
    //   setMobileOTPError('Invalid mobile OTP');
    //   return;
    // }



    // const storeSessionId = localStorage.getItem('sessionId');
    // const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
    // if (storeSessionId === sessionId) {

    //   SessionUpdate();


    e.preventDefault(); // Prevent default form submission
    handleOnSubmit(); // Call the submit function


    // } else {

    //   alert("You have been logged-out due to log-in from another device.");
    //   // console.log('you are logg out ');
    //   handleLogout();
    // }

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

export default Phoneemailotpverify