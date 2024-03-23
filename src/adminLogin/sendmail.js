import React, { useState } from 'react';
import { functions, httpsCallable } from './firebase'; // Adjust the path accordingly
const Send = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // const [showCaptcha, setShowCaptcha] = useState(true); // State to control reCAPTCHA visibility
  
  const handleButtonClick = async (event) => {

      event.preventDefault();
    try {
      const grecaptcha = window.grecaptcha; // Ensure the reCAPTCHA Enterprise library is loaded globally

      if (grecaptcha.enterprise) {
        const token = await grecaptcha.enterprise.execute('6Lf2xj8pAAAAAPLYWM0no195q0oMmhLLOo6Y8o00', { action: 'LOGIN' });
        console.log('reCAPTCHA Token:', token);
        // Perform further actions like sending email OTP using Firebase Functions
        if (email && validateEmail(email)) {
          sendEmailOTP();
       
        } else {
          setErrorMessage('Please enter a valid email address.');
        }
        // Hide reCAPTCHA after obtaining the token

      } else {
        console.error('reCAPTCHA Enterprise library not loaded.');
      }
    } catch (error) {
      console.error('Error executing reCAPTCHA:', error);
      // Handle error if necessary
    }

  };

  const sendEmailOTP = async () => {
    try {
      const sendEmailCallable = httpsCallable(functions, 'sendEmail');
      const result = await sendEmailCallable({ email });
  
      if (result.data) {
        const emailOTP = result.data; // Assuming the OTP is directly in result.data
        console.log('OTP sent by email:', emailOTP);
        localStorage.setItem('emailOTP', emailOTP); // Store email OTP in local storage
        setErrorMessage('OTP sent successfully.');
      } else {
       // console.error('Email OTP not found in the response:', result);
        setErrorMessage('Error sending OTP. Please try again.');
      }
    } catch (error) {
    //  console.error('Error sending email:', error.message);
      setErrorMessage('Error sending OTP. Please try again.');
     throw error;

    }
  };
  
 const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  // Function to render reCAPTCHA
  const renderReCaptcha = () => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/enterprise.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  };
  // Call renderReCaptcha when the component mounts
  // This will render the reCAPTCHA element
  React.useEffect(() => {
    renderReCaptcha();
  }, []);

  return {
    email,
    setEmail,
    errorMessage,
    handleButtonClick,
  };



  
  // return (
  //   <div>

  //      <form >
  //       <input
  //         type="email"
  //         placeholder="Enter your email"
  //         value={email}
  //         onChange={(e) => setEmail(e.target.value)}
  //       />
  //       <button onClick={handleButtonClick}>Send OTP</button>
  //     </form>
  //     {errorMessage && <p>{errorMessage}</p>}
  //   </div>
  // );
};

export default Send;
