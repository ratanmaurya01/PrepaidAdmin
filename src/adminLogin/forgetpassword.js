import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Send from './sendmail'; // Import the Send component
import { useNavigate } from 'react-router-dom';
import PhoneSendOtp from './phonesendotp';
import { auth } from './firebase'; // Import your Firebase authentication instance
import { ref, get } from 'firebase/database';
// Make sure to import the Firebase database instance if not already imported
import { database } from './firebase'; // Import your Firebase database instance
import firebase from '../firebase';

import './login.css';


import Mainhomepage from '../home/mainhomepage'


const Forgetpassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [responseMessage, setresponseMessage] = useState('');
  const localphoneNumber = location.state?.phoneNumber || '';
  // const phoneNumber = location.state && location.state.phoneNumber;
  const { email, setEmail, errorMessage, handleButtonClick } = Send();
  //const { phoneNumber, responseMessage, handleInputChange, sendOTP, validatePhoneNumber } = Phonesendotp();

  useEffect(() => {
    setEmail(email); // Set initial email from location state
  }, [setEmail,]);



  useEffect(() => {
    if (localphoneNumber) {
      const adminRootReference = firebase.database().ref(`adminRootReference/adminDetails/${localphoneNumber}/adminProfile`);
      adminRootReference.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && data.email) {
          setEmail(data.email);
        } else {
          // Handle the case where no email is found for the given phoneNumber
          setEmail('Email not found');
        }
      });
    }
  }, [localphoneNumber]);

  const handleGetOTP = () => {
    console.log(' phone number  1212: ', localphoneNumber);
    const phoneSendOtp = new PhoneSendOtp(localphoneNumber);
    const result = phoneSendOtp.sendOTP(localphoneNumber); // Assuming this function sends the OTP 
    // Redirect to another page after sending OTP (change '/other-page' to your desired route)
  };
  const handleButtonClick1 = (event) => {
    event.preventDefault();
    handleButtonClick(event);
    handleGetOTP();

    navigate('/fogetpassverify', { state: { localphoneNumber } });
  };
  return (
    <>

      <div>
        <Mainhomepage />
      </div>

      <div className='containers'>
        <div className='formgroup'>
          {/* <div>
            <h4>Verify Mobile Number & Email-id</h4>
          </div> */}
          <div>
            <label htmlFor="phoneNumber">Mobile Number</label>
            <div className="input-container1">
              <input
                type="text"
                className='form-control'
                placeholder="Enter phone number"
                defaultValue={localphoneNumber ? `+91${localphoneNumber}` : '+91'}
                onChange={null}
                readOnly
              />
              <i className="fas fa-phone" />
            </div>

            <p style={{ color: 'red' }}>{responseMessage}</p>
          </div>
          <div>
            <label htmlFor="phoneNumber">E-mail</label>
            <div className="input-container1">
              <input
                type="email"
                className='form-control'
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly
              />
              <i class="fa-solid fa-envelope"></i>
            </div>

            {errorMessage && <p>{errorMessage}</p>}
          </div>
          <div className='d-grid col-4'>
            <button className='btn btn-primary' onClick={handleButtonClick1}>GET OTP</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Forgetpassword;
