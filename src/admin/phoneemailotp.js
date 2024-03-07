import React, { useEffect, useState } from 'react';
import { auth } from '../adminLogin/firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import Send from '../adminLogin/sendmail'; // Import the Send component
import PhoneSendOtp from '../adminLogin/phonesendotp';
import CommonFuctions from '../commonfunction';
import Navbar from '../adminLogin/navbar';




function Phoneemailotp() {
    const navigate = useNavigate();
    const sessiontime = new CommonFuctions();

    const [user, setUser] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const location = useLocation();
    const { newPhone } = location.state || {}; // Retrieve the email value from location state
    const { newName } = location.state || {}; 
    const { newAddress } = location.state || {}; 

    // console.log('phone2 come are not ', newPhone);
    // console.log('new Name ', newName);
    // console.log('new Address ', newAddress);

    const initialEmail = location.state?.newEmail || ''; // Get email from location state
    const { email, setEmail, errorMessage, handleButtonClick } = Send(); // Using your custom hook
    useEffect(() => {
        setEmail(initialEmail); // Set initial email from location state
    }, [setEmail, initialEmail]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                // User is logged in
                setUser(authUser);
                console.log("Logged in user:", authUser.email);
                const emailParts = authUser.email.split('@'); // Split email by '@'
                if (emailParts.length === 2) {
                    const number = emailParts[0]; // Get the part before '@'
                    console.log("Extracted number:", number);
                    setPhoneNumber(number);

                }
            } else {
                // No user is logged in, you can redirect to another page or handle accordingly
                setUser(null);
                // Example: Redirect to another page
                window.location.href = '/'; // Redirect to your login page
            }
        });

        return () => unsubscribe(); // Cleanup function for unmounting
    }, []);

    
    const handleGetOTP = () => {
        console.log('phone number 1212: ', newPhone);
        const phoneSendOtp = new PhoneSendOtp(newPhone);
        phoneSendOtp.sendOTP(newPhone);

    };

    const handleButtonClick1 =async (event) => {

        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await sessiontime.HandleValidatSessiontime(phoneNumber);
        if (storeSessionId === sessionId) {

            

        event.preventDefault();
        handleButtonClick(event);
        handleGetOTP();
        navigate('/phoneemailverify', { state: {newName, email, newPhone,newAddress } });

    } else {
        // setIsSessionActive(false);
        alert("Cannot login. Another session is active. Please retry after sometime. ");
        // console.log('you are logg out ');
        handleLogout();
      }

    };


    const history = useNavigate();
    const handleLogout = () => {
        auth.signOut().then(() => {
            // Redirect to login page after successful logout
            history('/'); // Change '/login' to your login page route
        }).catch((error) => {
            // Handle any errors during logout
            console.error('Error logging out:', error.message);
        })
  
    }



    return (
        <>
          <div>
          <Navbar />
          </div>
        
            <div className='containers'>
                <div className='formgroup'>
                    {/* <div>
                        <h1>Verify Mobile Number & Email-id</h1>
                    </div> */}

                    <div>
                        <label htmlFor="phoneNumber">Mobile Number</label>
                        <input
                            type="text"
                            className='form-control'
                            placeholder="Enter phone number"
                            defaultValue={newPhone ? `+91${newPhone}` : '+91'}
                            readOnly

                        />
                        {/* Display any response messages */}
                    </div>

                    <div>
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            className='form-control'
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly
                        />
                        {errorMessage && <p  style={{color:'red'}}  >{errorMessage}</p>}

                    </div>
                    <div className='d-grid col-2'>
                        <button className='btn btn-primary' onClick={handleButtonClick1} >GET OTP</button>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Phoneemailotp