import React, { useEffect } from 'react';
import { functions, httpsCallable } from './firebase'; // Assuming this is the correct path to your firebase.js file

function Check() {
  useEffect(() => {
    // Get a reference to the Cloud Function
    const signUpFunction = httpsCallable(functions, 'signUp');

    // Define the data to be sent to the function
    const data = {
      uid: "USER_UID",
      email: "user@example.com",
      password: "userpassword",
      adminDetails: {
        // Add admin details if required
      },
      sessionData: {
        // Add session data if required
      }
    };

    // Call the Cloud Function
    signUpFunction(data)
      .then((result) => {
        // Handle the result from the Cloud Function
        console.log("Function result:", result.data);
        // Perform actions based on the result if needed
      })
      .catch((error) => {
        // Handle errors that occur during the function call
        console.error("Error calling function:", error);
      });
  }, []);

  return (
    <div>
      <p>Check Component</p>
      {/* Add your component content here */}
    </div>
  );
}

export default Check;
