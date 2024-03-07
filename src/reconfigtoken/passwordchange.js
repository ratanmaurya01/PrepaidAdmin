import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import PhoneSendOtp from '../adminLogin/phonesendotp';
import Send from '../adminLogin/sendmail'; // Import the Send component
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import CommonFuctions from '../commonfunction';

import Navbar from '../adminLogin/navbar';






function Passwordchange() {

  const SessionTime = new CommonFuctions();


  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const { enteredPasswordModal } = location.state || {};

  const initialEmail = location.state?.email || ''; // Get email from location state
  const { email, setEmail, errorMessage, handleButtonClick } = Send(); // Using your custom hook
  useEffect(() => {
    setEmail(initialEmail); // Set initial email from location state
  }, [setEmail, initialEmail]);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];
         // console.log("Number", numberPart);
          setPhoneNumber(numberPart);


        }
      } else {
        setUser(null);
        // Instead of redirecting, you can handle this case in your UI
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);



  const handleGetOTP = () => {
  //  console.log('phone number 1212: ', phoneNumber);
    const phoneSendOtp = new PhoneSendOtp(phoneNumber);
    phoneSendOtp.sendOTP(phoneNumber);

  };

  const handleButtonClick1 = async(event) => {

    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
    if (storeSessionId === sessionId) {

      SessionUpdate();

    event.preventDefault();
    handleButtonClick(event);
    handleGetOTP();
    navigate('/passwordotp', { state: { enteredPasswordModal } });
    
  } else {
    alert("You have been logged-out due to log-in from another device.");
    // console.log('you are logg out ');
    handleLogout();
  }

  };
  
  const SessionUpdate = () => {
    SessionTime.updateSessionTimeActiveUser(phoneNumber);
  }


  const history = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => {
      // Redirect to login page after successful logout
      history('/'); // Change '/login' to your login page route
    }).catch((error) => {
      // Handle any errors during logout
    //  console.error('Error logging out:', error.message);
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
            <h3>Verify Mobile Number & Email-id</h3>
          </div> */}

          <div>
            <label htmlFor="phoneNumber">Mobile Number</label>
            <div className='input-container1'>
              <input
                type="text"
                className='form-control'
                placeholder=" phone number"
                value={phoneNumber}

              />
              {/* Display any response messages */}

              <i class="fa-solid fa-user"></i>
            </div>


          </div>

          <div>
            <label htmlFor="email">E-mail</label>

            <div className='input-container1'>
              <input
                type="email"
                className='form-control'
                placeholder=" your email"
                value={email}

              />

              <i class="fa-solid fa-envelope"></i>
            </div>

          </div>
          <div className='d-grid col-5'>
            <button className='btn btn-primary' onClick={handleButtonClick1}  >GET OTP</button>
          </div>
        </div>
      </div>

    </>
  )
}

export default Passwordchange