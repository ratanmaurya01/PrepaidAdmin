import { useState, useEffect } from 'react';
import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './login.css';
import { validateEmail, validatePassword } from './validation';

import Mainhomepage from '../home/mainhomepage'

import PhoneSendOtp from './phonesendotp';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';



import Send from './sendmail';
function Signin() {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [phoneError, setPhoneError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const { email, setEmail, errorMessage, handleButtonClick, } = Send();
    const [showPassword, setShowPassword] = useState(false);




    useEffect(() => {
        localStorage.setItem('phoneNumber', phoneNumber);
        localStorage.setItem('email', email);
        // Password storage in localStorage is not recommended for security reasons.
        // Instead, use a more secure authentication method or sessionStorage.
        localStorage.setItem('password', password);
    }, [phoneNumber, email, password]);

    const handlePhoneChange = (input) => {
        // Remove leading zeros and spaces
        setPhoneError('');
        let value = input.replace(/\D/g, '');
        if (value === '0') {
            // Show error message
            setPhoneError("Should not begin with Zero");
            value = '';
        } else {
            // Clear error message
            setPhoneError("");
            setPhoneNumber(value);
        }
    };

    const handlePasswordChange = (input) => {
        setPasswordError('')
        const trimmedInput = input.trim();
        if (trimmedInput.startsWith(' ')) {
            setPasswordError(' ');
        } else {
            setPasswordError('');
            setPassword(trimmedInput);
        }
    };


    const onSendButtonClick = () => {
        // console.log('nextphone ',phoneNumber);
        const phoneSendOtp = new PhoneSendOtp(phoneNumber);

        const result = phoneSendOtp.sendOTP(phoneNumber);
    };

  

  


    const [errorMessage1, setErrorMessage] = useState('');

    const handleChangeEmail = (inputValue) => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue.startsWith(' ')) {
            setErrorMessage('Email cannot start with a space');
            setEmail(trimmedValue.substr(1)); // Remove the leading space
        } else {
            setErrorMessage('');
            setEmail(trimmedValue);
        }
    }



    // const handleChangeEmail = (input) => {

    //     setErrors('');
    //     if (input.length > 0 && /\s/.test(input.charAt(0))) {
    //         console.log("Error: The email cannot start with a whitespace.");
    //         return;
    //     }
    //     setEmail(input);
    // };

    const handleButtonClick1 = (event) => {
        event.preventDefault(); // Prevent the default behavior
        if (phoneNumber.trim() === '') {

            setPhoneError("Enter valid mobile number ");
            return;
        }
        if (phoneNumber.length < 10) {

            setPhoneError("Enter valid mobile number ");
            return;
        }

        const emailError = validateEmail(email);
        if (emailError) {
            setErrors(prevErrors => ({
                ...prevErrors,
                email: emailError,
            }));
            return;
        }

        if (!email) {
            setErrors(prevErrors => ({
                ...prevErrors,
                email: "",
            }));
            return;
        }

        if (!password) {
            // Display an alert or use a different message mechanism
            setPasswordError('Password cannot be empty');
            return;
        }

        handleButtonClick(event); // Pass the event object to handleButtonClick from Send component
        onSendButtonClick(); // Call the onSendButtonClick function or other logic if needed
        navigate('/getotp');

    };



    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };




    return (
        <>

            <div>
                <Mainhomepage />
            </div>
            <div className='containers'>
                <div className='formgroup'>
                    <div>
                        <h3>Create Account</h3>
                    </div>
                    <div>
                        <label htmlFor="phone-number">Admin Phone Number</label>
                        <div className="input-container1">


                            <input
                                type="text"
                                className='form-control'
                                placeholder="Admin Phone Number"
                                value={phoneNumber}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                maxLength={10}
                            />


                            <i className="fas fa-phone" />
                        </div>


                        <span style={{ color: "red" }}>{phoneError && <p className="error">{phoneError}</p>}</span>
                    </div>
                    <div>
                        <label htmlFor="email">Admin E-mail</label>
                        <div className="input-container1">

                            <input
                                type="email"
                                className='form-control'
                                placeholder="Admin E-mail"
                                value={email}
                                // onChange={(e) => setEmail(e.target.value)}
                                onChange={(e) => handleChangeEmail(e.target.value)}
                            
                            />


                            <i class="fa-solid fa-envelope"></i>
                        </div>
                        {errorMessage1 && <p>{errorMessage1}</p>}

                        <span style={{ color: "red" }}>{errors.email && <p className="error">{errors.email}</p>}</span>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <div className="input-container1">


                            <input
                                // type="password"
                                type={showPassword ? 'text' : 'password'}
                                className='form-control'
                                placeholder="Enter Password"
                                value={password}
                                onChange={(e) => handlePasswordChange(e.target.value)}
                                maxLength={16}
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="password-toggle-button"
                            >
                                <FontAwesomeIcon
                                    icon={showPassword ? faEyeSlash : faEye}
                                    className='password-toggle-button-eye-icon'
                                // style={{ color: 'gray' }} // Change the color value as needed

                                />
                            </button>

                            <i className="fas fa-lock password-icon"></i>
                        </div>
                         <p  style={{ color: "black" }}> Minimum 8 characters </p>
                        <span style={{ color: "red"}}><p className="error">{passwordError}</p></span>

                    </div>
                    <div className='d-grid col-5'>
                        <button className='btn btn-primary' onClick={handleButtonClick1} >
                            CREATE ACCOUNT
                        </button>
                    </div>
                </div>
                {/* </form> */}
            </div>

            {errorMessage && <p>{errorMessage}</p>}

            {/* <p>{responseMessage}</p> */}

        </>
    )

}

export default Signin