import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import PhoneSendOtp from '../adminLogin/phonesendotp';
import Send from '../adminLogin/sendmail'; // Import the Send component
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import Navbar from '../adminLogin/navbar';

function Transfer() {

  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { phonenumberlist } = location.state || {};
  // const { email } = location.state || {};
  const { transferEmail } = location.state || {};

  const { transferPassword } = location.state || {};
  const { transferKey } = location.state || {};


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is logged in
        setUser(authUser);
        // console.log("Logged in user:", authUser.email);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];
          //console.log("Number part:", numberPart); // Log the extracted number part
          //  setPhoneNumber(numberPart);
          //  handleSearch(numberPart);
        }
      } else {
        setUser(null);
        window.location.href = '/'; // Redirect to your login page
      }
    });
    return () => {

      unsubscribe(); // Cleanup function for unmounting
    };
  }, []);



  const initialEmail = location.state?.transferEmail || ''; // Get email from location state
  const { email, setEmail, errorMessage, handleButtonClick } = Send(); // Using your custom hook
  useEffect(() => {
    setEmail(initialEmail); // Set initial email from location state
  }, [setEmail, initialEmail]);




  const handleGetOTP = () => {
    console.log('phone number 1212: ', phonenumberlist);
    const phoneSendOtp = new PhoneSendOtp(phonenumberlist);
    phoneSendOtp.sendOTP(phonenumberlist);

  };

  const handleButtonClick1 = (event) => {
    event.preventDefault();
    handleButtonClick(event);
    handleGetOTP();
    navigate('/transferphoneemail', { state: { phonenumberlist, transferPassword, transferKey } });
  };


  return (
    <>

      {/* <div>Transfer Admin Phone Number :  {phonenumberlist }</div>

      <div>Transfet Admin Email : {transferEmail}</div> */}

      {/* <div> Transefer Admin  Password  : {transferPassword}</div>  */}

     <Navbar/>

      <div className='containers'>
        <div className='formgroup'>
          <div>
            <h>Verify Mobile Number & Email-id</h>
          </div>

          <div>
            <label htmlFor="phoneNumber">Mobile Number</label>

            <div className='input-container1'>



              <input
                type="text"
                className='form-control'
                placeholder="Enter phone number"
                value={phonenumberlist}

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
                placeholder="Enter your email"
                value={transferEmail}
              />


              <i class="fa-solid fa-envelope"></i>
            </div>



          </div>
          <div className='d-grid col-5'>
            <button className='btn btn-primary' onClick={handleButtonClick1} >GET OTP</button>
          </div>
        </div>
      </div>





    </>
  )
}

export default Transfer