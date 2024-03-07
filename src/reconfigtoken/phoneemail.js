import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import PhoneSendOtp from '../adminLogin/phonesendotp';
import Send from '../adminLogin/sendmail'; // Import the Send component
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import Navbar from '../adminLogin/navbar';

import CommonFuctions from '../commonfunction';


function Phoneemail() {
  const navigate = useNavigate();


  const SessionTime = new CommonFuctions();


  const [user, setUser] = useState(null);
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const { enteredPhoneNumberModal } = location.state || {};


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
    //  console.log('phone number 1212: ', enteredPhoneNumberModal);
    const phoneSendOtp = new PhoneSendOtp(enteredPhoneNumberModal);
    phoneSendOtp.sendOTP(enteredPhoneNumberModal);

  };

  const handleButtonClick1 = async (event) => {

    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
    if (storeSessionId === sessionId) {

      SessionUpdate();

      event.preventDefault();
      handleButtonClick(event);
      handleGetOTP();
      navigate('/phoneemailotpverify', { state: { enteredPhoneNumberModal, enteredPasswordModal } });


    } else {

      alert("You have been logged-out due to log-in from another device.");
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
  // const SessionValidate = async (numberPart) => {

  //   const storeSessionId = localStorage.getItem('sessionId');
  //   const { sessionId } = await SessionTime.HandleValidatSessiontime(numberPart);
  //   // console.log("Received session ID from server: ", sessionId);

  //   if (storeSessionId === sessionId) {
  //     //  console.log('SessionId Match ', sessionId);
  //     return;
  //   } else {
  //     //  console.log('SessionId Mismatch');
  //     alert("Cannot login. Another session is active. Please retry after sometime. ");
  //     // console.log('you are logged out ');
  //     handleLogout();
  //   }

  // };


  const SessionUpdate = () => {
    SessionTime.updateSessionTimeActiveUser(phoneNumber);
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
            <label htmlFor="enteredPhoneNumberModal">Mobile Number</label>
            <div className="input-container1">
              <input
                type="text"
                id='enteredPhoneNumberModal'
                className='form-control'
                placeholder=" phone number"
                defaultValue={'+91' + enteredPhoneNumberModal}
                autoComplete="off"
                readOnly
              />
              {/* Display any response messages */}
              <i class="fas fa-phone"></i>

            </div>
          </div>

          <div>
            <label htmlFor="email">E-mail</label>
            <div className="input-container1">
              <input
                type="email"
                id='email'
                className='form-control'
                placeholder=" your email"
                defaultValue={email}
                autoComplete="off"
                readOnly
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

export default Phoneemail