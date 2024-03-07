import React, { useState } from 'react';
import axios from 'axios';


class Phonesms  {

  constructor(phoneNumber){
    this.phoneNumber = phoneNumber;
  }


   sendOTP = async (phoneNumber) => {
      const otpCode = Math.floor(100000 + Math.random() * 900000);
      console.log('Generated OTP:', otpCode); // Log the OTP in the console
      const apiKey = 'Ar2Wnv0UdDJbGb4bre87vb1P5DbEhhv7FipucwNvE5R1PmqIvPjd3d4R9GLF'; // Replace with your Fast2SMS API key
      const message = '142208';
      const apiUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&sender_id=MAXMIJ&message=${message}&variables_values=${otpCode}&route=dlt&numbers=${phoneNumber}`;

      try {
        const response = await axios.get(apiUrl);
        console.log(response.data);
        localStorage.setItem('otp', otpCode);
        return true;
      } catch (error) {
        console.error('Error sending OTP:', error.response.data);
        return false;
      }
  
  };

  validatePhoneNumber = (phone) => {
    // Perform phone number validation logic here
    const phoneRegex = /^[0-9]{10}$/; // Regular expression for a 10-digit phone number
    return phoneRegex.test(phone);
  };
  
 };


export default Phonesms;
