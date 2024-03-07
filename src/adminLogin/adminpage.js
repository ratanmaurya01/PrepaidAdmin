import React, { useEffect, useState } from 'react';

function Adminpage() {
    const [storedPhoneNumber, setStoredPhoneNumber] = useState('');
    const [storedEmail, setStoredEmail] = useState('');

    useEffect(() => {
        // Retrieve phone number and email from local storage when the component mounts
        const phoneNumber = localStorage.getItem('phoneNumber');
        const email = localStorage.getItem('email');
        if (phoneNumber) {
            setStoredPhoneNumber(phoneNumber);
        }
        if (email) {
            setStoredEmail(email);
        }
    }, []); // Ensure the empty dependency array ensures the useEffect runs only once when mounted
    return (
        <div>
            <h2>Admin Page </h2>
            {storedPhoneNumber ? (
                <p>User Phone Number: {storedPhoneNumber}</p>
            ) : (
                <p>No phone number stored.</p>
            )}
            {storedEmail ? (
                <p>User Email: {storedEmail}</p>
            ) : (
                <p>No email stored.</p>
            )}
            {/* You can use storedPhoneNumber and storedEmail state variables as needed in this component */}
        </div>
    );
}

export default Adminpage;
