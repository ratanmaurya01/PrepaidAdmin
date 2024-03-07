import React from 'react';
import Send from './sendmail'; // Import the Send component
import Phonesendotp from './phonesendotp';

function Sendotp() {
    // Assuming Send and Phonesendotp return necessary functions and state variables
    const {
        email,
        setEmail,
        errorMessage,
        handleButtonClick,
    } = Send();
    const {phoneNumber,responseMessage,handleInputChange,sendOTP,validatePhoneNumber,
} = Phonesendotp();

    const onSendButtonClick = () => {
        if (validatePhoneNumber(phoneNumber)) {
            sendOTP();
        } else {
            console.log('Invalid phone number');
            // Handle the invalid phone number case
        }   
    };
    const handleButtonClick1 = (event) => {
        event.preventDefault(); // Prevent the default behavior
        handleButtonClick(event); // Pass the event object to handleButtonClick from Send component
     onSendButtonClick(); // Call the onSendButtonClick function or other logic if needed
        // ... Additional functions or logic
    };
    return (
        <>
            <div>
                <input
                    type="text"
                    className='form-control'
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={handleInputChange}
                />
                {/* <button onClick={onSendButtonClick}>Send OTP phone</button> */}
                <p>{responseMessage}</p>
            </div>
            <div>
                <input
                    type="email"
                    className='form-control'
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {/* <button onClick={handleButtonClick}>Send OTP email </button> */}
                {errorMessage && <p>{errorMessage}</p>}
            </div>
            <div className='d-grid col-4'>
        
                <button className='btn btn-primary' onClick={handleButtonClick1} >Send OTP </button>
        
            </div>
        </>
    );
}

export default Sendotp;
