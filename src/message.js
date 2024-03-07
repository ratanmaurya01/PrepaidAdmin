
import React, { useState } from 'react';
import { functions, httpsCallable } from './adminLogin/firebase';

const Message =async (message, email)=> {
  // const [email, setEmail] = useState('');
  // const [message, setMessage] = useState('');

  // const handleSendMessage = async () => {
    try {
      // Get the Cloud Function reference
      const sendMessage = httpsCallable(functions, 'sendMessage');

      // Call the Cloud Function with the required data
      const result = await sendMessage({ email, message });

      // Handle the result
      console.log(result.data); // Assuming the Cloud Function returns an object with a 'result' property
      return result;

    } catch (error) {
      // Handle errors
      console.error('Error calling sendMessage function:', error);
      return error;
    }
  };

  // return (
  //   <>
  //     <div>
  //       <h1>Email message from firebase</h1>
  //     </div>
  //     <div>
  //       <input
  //         type="text"
  //         placeholder="Email"
  //         value={email}
  //         onChange={(e) => setEmail(e.target.value)}
  //       />
  //       <input
  //         type="text"
  //         placeholder="Message"
  //         value={message}
  //         onChange={(e) => setMessage(e.target.value)}
  //       />
  //       <button onClick={handleSendMessage}>Send Message</button>
  //     </div>
  //   </>
  // );
// }

export default Message;
