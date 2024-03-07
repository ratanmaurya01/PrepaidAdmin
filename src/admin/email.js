import React, { Component } from 'react';
import { functions, httpsCallable } from '../adminLogin/firebase'; // Adjust the path accordingly
class SendEmailOtp {
    constructor(email) {
      this.email = email;
      this.state = {
        email: '', // Initialize email state
        errorMessage: '', // Initialize errorMessage state
      };
    }
  
    componentDidMount() {
      this.renderReCaptcha();
    }
  
    handleButtonClick = async (event) => {
      try {
        event.preventDefault(); // Prevent default action of the event
  
        const grecaptcha = window.grecaptcha;
        if (grecaptcha.enterprise) {
          const token = await grecaptcha.enterprise.execute('6Lf2xj8pAAAAAPLYWM0no195q0oMmhLLOo6Y8o00', { action: 'LOGIN' });
          console.log('reCAPTCHA Token:', token);
  
          const { email } = this.state; // Access email from component state
          if (email && this.validateEmail(email)) {
            await this.sendEmailOTP(email); // Pass the email to the sendEmailOTP method
          } else {
            this.setState({ errorMessage: 'Please enter a valid email address.' });
          }
        } else {
          console.error('reCAPTCHA Enterprise library not loaded.');
        }
      } catch (error) {
        console.error('Error executing reCAPTCHA:', error);
      }
    };
  
    sendEmailOTP = async (email) => {
      try {
        const sendEmailCallable = httpsCallable(functions, 'sendEmail');
        const result = await sendEmailCallable({ email });
  
        
        if (result.data) {
          const emailOTP = result.data;
          console.log('OTP sent by email:', emailOTP);
          localStorage.setItem('emailOTP', emailOTP);
          this.setState({ errorMessage: 'OTP sent successfully.' });
        } else {
          console.error('Email OTP not found in the response:', result);
          this.setState({ errorMessage: 'Error sending OTP. Please try again.' });
        }
      } catch (error) {
        console.error('Error sending email:', error.message);
        this.setState({ errorMessage: 'Error sending OTP. Please try again.' });
      }
    };
  
    validateEmail = (email) => {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    };
  
    renderReCaptcha = () => {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/enterprise.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };
  
    render() {
      const { errorMessage } = this.state; // Destructure errorMessage from state
  
      // You can return JSX elements or perform rendering logic here
    }
  }
  
  export default SendEmailOtp;