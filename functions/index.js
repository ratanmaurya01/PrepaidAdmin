import React, { useState } from 'react';
import { sendEmail } from './sendEmailFunction'; // Path to your sendEmailFunction file

const Send = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSendEmail = async () => {
    try {
      const response = await sendEmail({ email });
      setResult(`Email sent successfully! OTP: ${response.data}`);
    } catch (error) {
      setResult(`Error sending email: ${error.message}`);
      console.error('Error details:', error);
    }
  };

  return (
    <div>
      <h2>Send Email with OTP</h2>
      <input
        type="text"
        placeholder="Enter Email"
        value={email}
        onChange={handleEmailChange}
      />
      <button onClick={handleSendEmail}>Send Email</button>
      <p>{result}</p>
    </div>
  );
};

export default Send;
