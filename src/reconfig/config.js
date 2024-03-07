import React, { useEffect } from 'react';
import firebase from './firebase'; // Adjust the path to your firebaseConfig file


const Config = () => {
  useEffect(() => {
    // Get a reference to the Firebase Cloud Function
    const reConfigPassword = firebase.functions().httpsCallable('reConfigPassword');

    // Call the Cloud Function when the component mounts
    const callReConfigPassword = async () => {
      try {
        const data = {
          tokenDetails: {/* tokenDetails data */},
          newPassword: 'newPasswordValue',
          isDelete: false, // or true based on your requirement
        };

        const result = await reConfigPassword(data);
        console.log('Function execution result:', result.data);
        // Handle the result here (e.g., set state to display result)
      } catch (error) {
        // Handle errors that occur during the function call
        console.error('Error calling function:', error);
      }
    };

    callReConfigPassword(); // Call the function when the component mounts

    // Cleanup function if necessary
    return () => {
      // Perform any necessary cleanup
    };
  }, []);

  return (
   <>
     <h1>reconfig </h1>
   </>
  );
};

export default Config;
