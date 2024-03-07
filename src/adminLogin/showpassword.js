import React from 'react';
import { useLocation } from 'react-router-dom';


function Showpass() {
    const location = useLocation();
    const { state } = location;

    // Retrieving password and localphoneNumber from the state object
    const { password, localphoneNumber } = state || {};

    // Ensure that localphoneNumber is set in the state object correctly
    console.log('Local Phone Number:', localphoneNumber); // Check if localphoneNumber is getting here

    // Now you can use password and localphoneNumber as needed in this component
    // For example, displaying them in the UI
    return (
        <div>
            <h1>Show Password</h1>
            <p>Password: {password}</p>
            <p>Local Phone Number: {localphoneNumber}</p>
            {/* Other components/UI */}
        </div>
    );
}

export default Showpass;
