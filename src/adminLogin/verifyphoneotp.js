import React, { useState } from 'react';
import { useNavigate  , useLocation } from 'react-router-dom';

import Mainhomepage from '../home/mainhomepage'
import CommonFuctions  from '../commonfunction';


function Verifyphoneotp() {
  const sessiontime = new CommonFuctions();
  const navigate = useNavigate();
  const location = useLocation();
  const localPhoneNumber = location.state?.phoneNumber; // Access the phone number passed from the previous page
  const [sessionValid, setSessionValid] = useState(true); // Initialize sessionValid to true

 // console.log ('local phone number: ' ,localPhoneNumber);
  
  const [otp, setOtp] = useState(''); // Initialize OTP state with an empty string
  const [error, setError] = useState('');

  const storedPhoneOTP = localStorage.getItem('otp'); // Get stored phone OTP

  const onSubmitotp =async (e) => {
    e.preventDefault();

    // await SessionValidate();

    if ( otp === storedPhoneOTP) {
      // Proceed only if sessionValid is true and OTPs match
      await SessionValidate();
      // navigate('/welcome'); // Navigate to '/welcome' if OTPs match
    } else {
      setError('Invalid Otp'); // Set error message if OTPs do not match or session is invalid
    }

     
    // SessionValidate();

    // if (otp === storedPhoneOTP) { // Check if the entered OTP matches the stored OTP
    //   navigate('/welcome'); // Navigate to '/welcome' if OTPs match
    // } else {
    
    //   setError('Please enter the correct OTP'); // Set error message if OTPs do not match
    // }
  };
   

  const SessionValidate = async () => {

    const {lastActive} = await sessiontime.HandleValidatSessiontime(localPhoneNumber);
    const severTimestammp = await sessiontime.fireabseServerTimestamp();
   //   console.log('Last active time ', lastActive);
  //  const currentTime = Date.now();
   //  console.log('Corretime ', severTimestammp);

    if (severTimestammp - lastActive <= 60000) {
      // Compare against 60000 for 1 minute (60 seconds)
      setSessionValid(false); // Set sessionValid to false if session has expired
      alert("Cannot login. Another session is active. Please retry after sometime. ");
      navigate('/login');
    } else {
      updateSessionTime();
      navigate('/welcome');
      setSessionValid(true); // Set sessionValid to true if session is valid
    }
  };

  const updateSessionTime = async()=>{
       const sessionId   = await sessiontime.updateSessionTimeInLogIn(localPhoneNumber);

     //  console.log("Sessdion Id :", sessionId);

       localStorage.setItem('sessionId', sessionId); 

   }


//   const SessionValidate = async ()=>{  
//     const sessiontime = new CommonFuctions();
//     const time =  await sessiontime.HandleUpdateSessiontime(localPhoneNumber);
         
//     console.log('Last active time ',time);

//     const currentTime = Date.now();
//     console.log("Corretime ", currentTime);

//     if (currentTime - time <= 60000){ // Compare against 60000 for 1 minute (60 seconds)
  
//       setSessionValid(false); 

//         alert("Another user logged in on another device."); 

//     } else {
//         // Do something else if needed
//     }
// }


  return (

    <>
      <div>
        <Mainhomepage />
      </div>

      <div className='containers'>
        <form className='formgroup' onSubmit={onSubmitotp}>
          <div>
            <label htmlFor="phoneNumber">Enter OTP </label>
            <input
              type="text"
              value={otp}
              className='form-control'
              // onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, ''); // Remove spaces
                if (/^\d*$/.test(value)) { // Test if the value contains only digits
                  setOtp(value); // Update the OTP state if it's valid
                }
              }}
              maxLength={6}

              placeholder="Mobile-OTP "
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
          </div>
          <div className="d-grid col-4">
            <button type="submit" className='btn btn-primary'>VERIFY</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Verifyphoneotp;
