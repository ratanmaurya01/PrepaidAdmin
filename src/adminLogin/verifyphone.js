import React, { useState } from 'react';
import { useLocation, useHistory, useNavigate } from 'react-router-dom';

import PhoneSendOtp from './phonesendotp'; // Import the Phonesendotp component

import Mainhomepage from '../home/mainhomepage'


function Verifyphone() {
    const navigate = useNavigate();

    let  location = useLocation();
    const  localphoneNumber = location.state?.phoneNumber || ''; // Access the phone number passed from the previous page
  //  console.log ('local phone number: ' ,localphoneNumber);
    
    // Destructure the required functions and states from Phonesendotp
    
    
    const handleGetOTP = () => {
      //  console.log (' phone number  1212: ' ,localphoneNumber);
        const phoneSendOtp = new PhoneSendOtp(localphoneNumber);
    
        phoneSendOtp.sendOTP(localphoneNumber); // Assuming this function sends the OTP 
        // Redirect to another page after sending OTP (change '/other-page' to your desired route)
       navigate('/verifyphoneotp' , { state: { phoneNumber: localphoneNumber } });
    };

    return (
        <>
         
                 
      <div>
        <Mainhomepage />
      </div>


            <div className='containers'>
                <div className='formgroup'> 
                 <div style={{}}>
                 <h3 style={{backgroundColor:'', color:'black'}}
                  >Verify Mobile Number</h3>
                 </div>
                    
                    <div>
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <div  className="input-container1"> 
                        <input
                            type="text"
                            className='form-control' 
                            // value = {localphoneNumber}
                            defaultValue={localphoneNumber ? `+91${localphoneNumber}` : '+91'}
                            readOnly
                            // onChange={null} 
                            maxLength={10}
                            placeholder="Phone Number"
                            style={{ paddingLeft: '30px' }}
                        />
                          <i class="fas fa-phone"></i>
                        </div> 
                    </div>
                    <div className="d-grid col-4">
                        <button className='btn btn-primary' onClick={handleGetOTP }>Get OTP</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Verifyphone;
