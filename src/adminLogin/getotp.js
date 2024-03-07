import { useState, useEffect } from 'react';
import React from 'react';
import { database } from './storedata'; // Import the Firebase database reference
import { ref, set, getDatabase } from 'firebase/database'; // Import necessary database functions

import { auth } from './firebase'; // Import the 'auth' object from the Firebase initialization file
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Import the 'createUserWithEmailAndPassword' function

import './login.css';
import { useNavigate } from 'react-router-dom';

function Getotp() {
  const navigate = useNavigate();
  const [mobileOTP, setMobileOTP] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const [timer, setTimer] = useState(45); // Initial timer value in seconds
  const [storedPhoneNumber, setStoredPhoneNumber] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [sentMobileOTP, setSentMobileOTP] = useState(''); // Dynamic sent OTP
  const [sentEmailOTP, setSentEmailOTP] = useState(''); // Dynamic sent OTP
  const [storedPassword, setStoredPassword] = useState('');
  const [customEmail, setCustomEmail] = useState(''); // Declare customEmail state
  const [mobileOTPError, setMobileOTPError] = useState('');
  const [emailOTPError, setEmailOTPError] = useState('');

  useEffect(() => {
    const storedPhone = localStorage.getItem('phoneNumber');
    setStoredPhoneNumber(storedPhone || ''); // Handling null values
    const email = storedPhone ? `${storedPhone}@gmail.com` : '';
    setCustomEmail(email); // Set the custom email in the state

    const storedEmail = localStorage.getItem('email');
    setStoredEmail(storedEmail || ''); // Handling null values

    const storedPw = localStorage.getItem('password');
    setStoredPassword(storedPw || ''); // Handling null values

    //  custom otp verify 
    //  const storedPhoneOTP = localStorage.getItem('phoneOTP');
    //  setSentMobileOTP(storedPhoneOTP || ''); // Handling null values

    //   const storedEmailOTP = localStorage.getItem('emailOTP');
    //  setSentEmailOTP(storedEmailOTP || ''); // Handling null values


  }, []);

  const isNumeric = /^\d+$/; // Regular expression to match only digits
  const maxLength = 6;

  const handleMobileOTPChange = (e) => {

    setMobileOTPError('');

    const { value } = e.target;
    if (value === '' || (value.length <= maxLength && isNumeric.test(value))) {
      setMobileOTP(value);
    }
  };

  const handleEmailOTPChange = (e) => {
    setEmailOTPError('');
    const { value } = e.target;
    if (value === '' || (value.length <= maxLength && isNumeric.test(value))) {
      setEmailOTP(value);
    }
  };

  // Function to generate a random key
  function generateRandomKey(length) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let randomKey = '';

    for (let i = 0; i < length; i++) {
      randomKey += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return randomKey;
  }
  // Usage example
  const keyLength = 16; // Specify the length of the key
  const randomKey = generateRandomKey(keyLength);

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

    // Original otp 
    const storedPhoneOTP = localStorage.getItem('otp'); // Get stored phone OTP
    const storedEmailOTP = localStorage.getItem('emailOTP'); // Get stored email OTP

    if (mobileOTP !== storedPhoneOTP) {
      setMobileOTPError('Incorrect mobile OTP');
    }

    if (emailOTP !== storedEmailOTP) {
      setEmailOTPError('Incorrect email OTP');
    }

    // (mobileOTP === storedPhoneOTP && emailOTP === storedEmailOTP)

    //for Manuall otp 
    // mobileOTP === sentMobileOTP && emailOTP === sentEmailOTP

    if ((mobileOTP === storedPhoneOTP && emailOTP === storedEmailOTP)) {
      try {
        const authInstance = getAuth(); // Get the auth instance
        const userCredential = await createUserWithEmailAndPassword(
          authInstance,
          customEmail,
          storedPassword
        );

        //    console.log('User registered:', userCredential.user);     
        if (userCredential) {
          try {
            const database = getDatabase(); // Get the database instance

            const passwordPath = `common/adminPhoneList/${storedPhoneNumber}/password`;
            await set(ref(database, passwordPath), storedPassword);

            const adminProfilePath = `adminRootReference/adminDetails/${storedPhoneNumber}/adminProfile`;

            const userData = {
              address: 'null',
              email: storedEmail,
              key: randomKey,
              name: 'null',
              password: storedPassword,
              phoneNo: storedPhoneNumber,
              phoneNo2: 'null',
              // Add other fields as needed
            };
            await set(ref(database, adminProfilePath), userData);
            const sessionPath = `adminRootReference/adminDetails/${storedPhoneNumber}/sessionData`;
            const timestampData = {
              lastActive: Date.now().toString(), // Saving current timestamp
              sessionId: Date.now().toString(), // Unique session ID, for example
              // Add other timestamp-related fields as needed
            };
            await set(ref(database, sessionPath), timestampData);
            alert('Account created successfully!');
            navigate('/welcome');
          } catch (error) {
            console.error('Error saving data to database:', error.message);
            // Handle the error
          }
        }
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          alert('An Account is already exist  with this mobile number.');
        } else {
          console.error('Error creating account:', error.message);
          alert('Error creating account. Please try again.');
        }
      }
    } else {
      alert('Invalid OTP.');
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
  useEffect(() => {

    const storedPhone = localStorage.getItem('phoneNumber');
    const storedEmail = localStorage.getItem('email');
    setStoredPhoneNumber(storedPhone || ''); // Handling null values
    setStoredEmail(storedEmail || ''); // Handling null values
  }, []);

  return (
    <>
      <div className='containers'>
        <form className='formgroup' onSubmit={handleSubmit}>
          {/* <div>
            <h3>Verify Mobile Number & Email-id</h3>
          </div> */}
          {/* <p>Your Stored Password: {storedPassword}</p> */}
          <div>
            {/* <p>Your Phone Number: {storedPhoneNumber}</p> */}
            <label htmlFor="email">Enter Mobile OTP</label>
            <input
              type="text"
              className='form-control'
              placeholder=" Mobile OTP"
              value={mobileOTP}
              onChange={handleMobileOTPChange}
            />
            {mobileOTPError && <p style={{ color: 'red' }} className="error">{mobileOTPError}</p>}
          </div>
          <div>
            {/* <p>Your Email: {storedEmail}</p> */}
            <label htmlFor="password">Enter E-mail OTP</label>
            <input
              type="text"
              className='form-control'
              placeholder=" E-mail OTP"
              value={emailOTP}
              onChange={handleEmailOTPChange}
            />
            {emailOTPError && <p style={{ color: 'red' }} className="error">{emailOTPError}</p>}

          </div>

          <div className='d-grid col-4'>
            <button className='btn btn-primary' type="submit">
              VERIFY
            </button>
          </div>

          {/* Display timer value in a paragraph */}
          <p>Resend in : {timer} </p>
        </form>
      </div>
    </>
  );
}

export default Getotp;
