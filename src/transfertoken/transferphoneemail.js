import React, { useEffect, useState } from 'react';
import Navbar from '../adminLogin/navbar';
import 'firebase/compat/database';
import '../meterdetailonserver/meterdetail.css';
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import { functions, httpsCallable } from '../adminLogin/firebase'; // Adjust the path accordingly
import { Await, useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set, update, serverTimestamp } from 'firebase/database';
import { getAuth, EmailAuthProvider, updateProfile, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';
import firebase from 'firebase/compat/app'; // Import the Firebase app
import 'firebase/compat/firestore';
import Generatetoken from '../reconfigtoken/generatetokenkey';
import 'firebase/compat/auth';
import 'firebase/compat/functions';

const allSerialNo = [];
let countA = 0;
const tokenGenerrateType = '';

function Transferphoneemail() {

  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOTP, setMobileOTP] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [mobileOTPError, setMobileOTPError] = useState('');
  const [emailOTPError, setEmailOTPError] = useState('');
  const [oldAdminNumber, setOldAdminNumber] = useState('');
  const [password, setPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [loading, setLoading] = useState(true); // State to track loading status

  const { phonenumberlist } = location.state || {};
  // const { email } = location.state || {};
  const { transferPassword } = location.state || {};

  const { transferKey } = location.state || {};

  const mainFunction = new Generatetoken();


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is logged in
        setUser(authUser);
        // console.log("Logged in user:", authUser.email);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];
          setOldAdminNumber(numberPart);
          getAdminPassword(numberPart);
          setLoading(false);

          //  console.log("Number part:", numberPart); // Log the extracted number part
        }
      } else {
        setUser(null);
        window.location.href = '/'; // Redirect to your login page
      }
    });
    return () => {

      unsubscribe(); // Cleanup function for unmounting
    };
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

  //   // console.log('transfer Admin  Phone  ', phonenumberlist);
  //   // console.log('transfer Admin Password  ', transferPassword);
  //   // console.log('transfer Admin  Key   ', transferKey);

  const handleOnSubmit = async () => {

    const storedPhoneOTP = localStorage.getItem('otp'); // Get stored phone OTP
    const storedEmailOTP = localStorage.getItem('emailOTP'); // Get stored email OTP
    if (mobileOTP === storedPhoneOTP && emailOTP === storedEmailOTP) {
      // console.log('New Password  ', transferPassword);
      // console.log('new Phone  ', phonenumberlist);

      handlePhoneSerialList();
      // } else {
      //   // OTPs do not match, set error messages or handle accordingly
      //   if (mobileOTP !== storedPhoneOTP) {
      //     setMobileOTPError('Invalid mobile OTP');
      //   }
      if (emailOTP !== storedEmailOTP) {
        setEmailOTPError('Invalid email OTP');
      }
    }

  };


  const handlePhoneSerialList = async () => {

    console.log("Old Admin Phone Number ", oldAdminNumber);
    try {
      const newAdinDetialspath = database.ref(`adminRootReference/adminDetails/${oldAdminNumber}/meterList`);
      const snapshot = await newAdinDetialspath.once('value');
      const serialData = snapshot.val();

      const keys = Object.keys(serialData);
      //  console.log('check all transfer Key :   ', keys);
      const isDuplicate = allSerialNo.includes(keys);

      for (let i = 0; i < keys.length; i++) {
        //  console.log('Serial: valye ', keys[i]);
        allSerialNo.push(keys[i]);
        //  console.log('Seria0l: valye ',allSerialNo[i]);
      }
      // console.log('Serial: valye ', allSerialNo.length);
      // generateToken();
      isTokenAvailable();
      // console.log('phone related serial1111:  ', keys);

      // console.log('phone related serial1111:  ', typeof keys);
      return keys;
    } catch (error) {
      console.error("Error fetching serial data:", error.message);
    }
  }

  const generateToken = async (srnumber) => {

    try {
      const mytime = await mainFunction.fireabseServerTimestamp();
      //   const mytime = await mainFunction.serverTimeFirebase();
      //   console.log("It Is ServerTiem ", mytime);
      //  setTimeStamp(mytime);
      countA++;
      let type = '04';
      //  console.log("servertime",allSerialNo.length);

      //  for (let i = 0; i < allSerialNo.length; i++) {
      const TransferToken = mainFunction.isTransferToken(type, phonenumberlist, srnumber, transferPassword, transferKey, adminKey);

      console.log("Token Hex for reconfig :  ", TransferToken);

      handleUpdateFromfirebase(srnumber, TransferToken, mytime);
      // }

    } catch (error) {
      console.error("Error fetching server time:", error);
    }
  };

  const handleUpdateFromfirebase = async (serialNumber, token, serverTime) => {
    try {
      const meterDetailsPath = `adminRootReference/meterDetails/${serialNumber}/reConfigToken`;
      await firebase.database().ref(meterDetailsPath).update({
        isTransfer: "true",
        token: token,
        tokenGeneratedTime: serverTime,
        tokenUsedTime: 'null',
        transferPhoneNumber: phonenumberlist,
      });

      console.log(`Updated reConfigToken for meter`);

    } catch (error) {
      console.error('Error updating reConfigToken fields:', error);
    }

  }




  const isTokenAvailable = async () => {
    console.log("Something went wrong ", allSerialNo);
    // countA = 0;

    let countGenerated = 0;
    let countNotGenerated = 0;

    try {
      for (let i = 0; i < allSerialNo.length; i++) {
        let sr = allSerialNo[i];
        const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${sr}`);
        const snapshot = await meterDetailsPath.once('value');
        const newData = snapshot.val();
        //  console.log("serial", sr);
        if (newData !== null) {
          console.log("serial new ");
          if (newData !== undefined) {
            if (newData.reConfigToken !== undefined) {
              const isTransfer = newData.reConfigToken.isTransfer;
              const token = newData.reConfigToken.token;
              if (isTransfer === "true" && token !== "null") {

                console.log("Token not generated");
                countNotGenerated++;
                /// countB++;
              } else {

                console.log(" generated");
                countGenerated++;
                generateToken(sr);
              }
            } else {
              console.log("reConfigToken not found");
              countGenerated++;
              generateToken(sr);
            }
          } else {
            console.log("meter not exist");
            countGenerated++;
            generateToken(sr);
          }
        } else {
          // console.log("meter not exist : ", sr);
          generateToken(sr);
          countGenerated++;
        }
      }

      // After the loop is done and counts are calculated

      alert("Re-Configuration token Generated for  " + countGenerated + " meter(s). \n Re-Configuration token not generated for" + countNotGenerated + "  meter(s).\n  as token pending for transefer to new admin. You have been logged out. \n Please LogIn ");
      // console.log("Count of generated tokens:", countGenerated);
      // console.log("Count of tokens not generated:", countNotGenerated);


      //   const popupContent = `
      //   <p>Count of generated tokens: ${countGenerated}</p>
      //   <p>Count of tokens not generated: ${countNotGenerated}</p>
      // `;

      // const popupWindow = window.open("", "Token Counts", "width=400, height=200");
      // popupWindow.document.write(popupContent);

    } catch (e) {
      console.log('Error Fetching:', e);
    }
  };



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

  const handleSubmitClick = (e) => {
    e.preventDefault(); // Prevent default form submission

    if (mobileOTP === '') {
      setMobileOTPError('Invalid mobile OTP');
      return;
    }

    if (emailOTP === '') {

      setMobileOTPError('Invalid mobile OTP');
      return;
    }

    handleOnSubmit(); // Call the submit function


  };


  const loadingStyle = {
    pointerEvents: loading ? 'none' : 'auto', // Disable pointer events if loading, otherwise enable
  };



  return (
    <>

      <div style={loadingStyle}>

        <div>
          <Navbar />
        </div>



        {loading ? (
          <div style={{ position: 'fixed', top: '60%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '9999' }}>
            <div className="spinner-border text-danger" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : null}

        <div className='containers'>
          <div className='formgroup'>
            <div>
              {/* <div>
              <h3>Enter OTP</h3>
            </div> */}
              <label htmlFor="mobileOTP">Enter Mobile OTP</label>
              <input
                type="text"
                className='form-control'
                placeholder="Mobile OTP"
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
                placeholder="E-mail OTP"
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

      </div>


    </>
  )
}

export default Transferphoneemail