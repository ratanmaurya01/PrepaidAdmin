import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PhoneSendOtp from '../adminLogin/phonesendotp';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebase';
import { auth } from '../adminLogin/firebase';
import Navbar from '../adminLogin/navbar';
import { ref, set, get, child, getDatabase, onValue } from 'firebase/database';
import CommonFuctions from '../commonfunction';






function Sendphone() {
  const sessiontime = new CommonFuctions();
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [user, setUser] = useState(null);
  const { newPhone, newName, newAddress, newEmail } = location.state || {};

  // console.log("Enter phone number is ", newPhone);
  // console.log("new Name ", newName);
  // console.log("New Address ", newAddress);
  // console.log("New newEmail ", newEmail);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is logged in
        setUser(authUser);
      //  console.log("Logged in user:", authUser.email);
        const emailParts = authUser.email.split('@'); // Split email by '@'
        if (emailParts.length === 2) {
          const number = emailParts[0]; // Get the part before '@'
          // console.log("Extracted number:", number);
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


  const handleGetOTP = async() => {
    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await sessiontime.HandleValidatSessiontime(phoneNumber);
    if (storeSessionId === sessionId) {

        

    console.log('phone number 1212: ', newPhone);
    const phoneSendOtp = new PhoneSendOtp(newPhone);
    phoneSendOtp.sendOTP(newPhone);
    navigate('/verifunumber', { state: { newPhone, newName, newAddress, newEmail } });


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
          <h3>Verify Mobile Number</h3>
          <div>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              className='form-control'
              placeholder="Phone Number"
              defaultValue={newPhone ? `+91${newPhone}` : '+91'}
            />
          </div>
          <div className="d-grid col-4">
            <button className='btn btn-primary' onClick={handleGetOTP}>Get OTP</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sendphone;
