import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { auth } from './firebase'; // Import your Firebase authentication instance
import { ref, get } from 'firebase/database';
// Make sure to import the Firebase database instance if not already imported
import { database } from './firebase'; // Import your Firebase database instance


import Mainhomepage from '../home/mainhomepage'

function Forgetpassverify() {
    const navigate = useNavigate();
    const location = useLocation();
    const localphoneNumber = location.state?.localphoneNumber || '';
  
    const [mobileOTP, setMobileOTP] = useState('');
    const [emailOTP, setEmailOTP] = useState('');
    const [timer, setTimer] = useState(45); // Initial timer value in seconds
  
    const [mobileOTPError, setMobileOTPError] = useState('');
    const [emailOTPError, setEmailOTPError] = useState('');
    const [userEmail, setUserEmail] = useState('');
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMobileOTPError('');
        setEmailOTPError('');
      
        // if (mobileOTP.length !== maxLength || emailOTP.length !== maxLength) {
        //   alert('Please enter a 6-digit OTP for both fields.');
        //   return;
        // }

        if (!mobileOTP) {
            setMobileOTPError('Enter valid mobile OTP');
            return;
        }
    
        if (!emailOTP) {
            setEmailOTPError('Enter valid mobile OTP');
            return;
        }


    
        const storedPhoneOTP = localStorage.getItem('otp'); // Get stored phone OTP
        const storedEmailOTP = localStorage.getItem('emailOTP'); // Get stored email OTP
      
        if (mobileOTP !== storedPhoneOTP) {
          setMobileOTPError('Incorrect mobile OTP');
        }
      
        if (emailOTP !== storedEmailOTP) {
          setEmailOTPError('Incorrect email OTP');
        }

        if (mobileOTP === storedPhoneOTP && emailOTP === storedEmailOTP) {
          // Assuming you have a method to retrieve user's email after verifying OTPs
          // Replace this with your logic to fetch user's email

          const passwordRef = ref(database, `common/adminPhoneList/${localphoneNumber}/password`);
          get(passwordRef)
              .then((snapshot) => {
                  if (snapshot.exists()) {
                      const password = snapshot.val();
                      // Logging password to the console
                      console.log("User's password:", password);
                      console.log('Local Phone Number:', localphoneNumber); // Add this line to check the value

                      // Navigating to the 'showpassword' route with userNumber and password as state
                      navigate('/login', { state: { password, localphoneNumber } });
                      console.log('user password changed', password);
                  } else {
                      console.log("Password does not exist for this user.");
                      // Handle the case where password doesn't exist
                  }
              })
              .catch((error) => {
                  console.error("Error fetching password:", error);
                  // Handle errors while fetching password
              });
        }
    };
    
    useEffect(() => {
        // Timer logic to decrement timer value every second
        const countdown = setInterval(() => {
            if (timer > 0) {
                setTimer((prevTimer) => prevTimer - 1);
            }
        }, 1000); // Runs every second

        // Clear interval when the timer reaches 0 or the component unmounts
        return () => clearInterval(countdown);
    }, [timer]);

    const handleMobileOTPChange = (e) => {
        setMobileOTP(e.target.value);
        setMobileOTPError('');  
    };

    const handleEmailOTPChange = (e) => {
        setEmailOTP(e.target.value);
        setEmailOTPError('');
    };

    return (
        <>
         
         
      <div>

        
        <Mainhomepage />

      </div>


            <div className='containers'>
                <form className='formgroup' onSubmit={handleSubmit}>
                    {/* <div>

                        <h3>Enter OTP</h3>
                    </div> */}
                    <div>
                        <label htmlFor="email">Enter Mobile OTP</label>
                        <input
                            type="text"
                            className='form-control'
                            placeholder=" Mobile OTP"
                            value={mobileOTP}
                            onChange={handleMobileOTPChange}
                            maxLength={6}
                        />
                     {mobileOTPError && <p style={{color:'red'}} className="error">{mobileOTPError}</p>}
                    </div>
                    <div>
                        <label htmlFor="password">Enter E-mail OTP</label>
                        <input
                            type="text"
                            className='form-control'
                            placeholder=" E-mail OTP"
                            value={emailOTP}
                            onChange={handleEmailOTPChange}
                            maxLength={6}
                        />
                        {emailOTPError && <p style={{color :'red'}} className="error">{emailOTPError}</p>}
                    </div>

                    <div className='d-grid col-6'>
                        <button className='btn btn-primary' type="submit">
                            VERIFY
                        </button>
                    </div>

                    {/* Display timer value in a paragraph */}
                    <p>Time remaining: {timer} seconds</p>
                </form>
            </div>
        </>
    );
}

export default Forgetpassverify;
