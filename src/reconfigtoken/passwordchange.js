import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import PhoneSendOtp from '../adminLogin/phonesendotp';
import Send from '../adminLogin/sendmail'; // Import the Send component
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import CommonFuctions from '../commonfunction';

import Navbar from '../adminLogin/navbar';
import { Modal, Button } from 'react-bootstrap';


function Passwordchange() {

  const SessionTime = new CommonFuctions();

  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true);


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
          setLoading(false);



        }
      } else {
        setUser(null);
        // Instead of redirecting, you can handle this case in your UI
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);



  const handleGetOTP = async () => {
    //  console.log('phone number 1212: ', phoneNumber);
    // const phoneSendOtp = new PhoneSendOtp(phoneNumber);
    // phoneSendOtp.sendOTP(phoneNumber);

    try {
      const phoneSendOtp = new PhoneSendOtp(phoneNumber);
      const result = await phoneSendOtp.sendOTP(phoneNumber);
      if (result === 411) {
        setAlertMessage(`Invalid number : (${result})`);
        setLoading(false);
      } else {

        navigate('/passwordotp', { state: { enteredPasswordModal } });

      }
    } catch (otpError) {
    }



  };

  const handleButtonClick1 = async (event) => {



    setLoading(true);
    setAlertMessage('');
    // Mark data as saved
    const status = await SessionTime.checkInternetConnection(); // Call the function
    if (status === 'Poor connection.') {
      setIsDialogOpen(true);
      setModalMessage('No/Poor Internet connection. Cannot access server.');
      setLoading(false);
      return;
    }

    const storeSessionId = localStorage.getItem('sessionId');

    try  {

   
    const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
    if (storeSessionId === sessionId) {

      SessionUpdate();
      event.preventDefault();
      handleButtonClick(event);
      handleGetOTP();
      // navigate('/passwordotp', { state: { enteredPasswordModal } });

    } else {
      alert("You have been logged-out due to log-in from another device.");
      // console.log('you are logg out ');
      handleLogout();
    }
     
    } catch (error) {
      setLoading(false);
      setIsDialogOpenResponse(true);
      // const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry. `;
      const errorMessage = `Response not recieved  from server-S. (${error}). Please check if transaction completed successfully , else retry.`;

      setModalMessageResponse(errorMessage);
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




  const [modalMessage, setModalMessage] = useState('');

  const [modalMessageResponse, setModalMessageResponse] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const closeDialog = () => {
    setIsDialogOpen(false);
    // window.location.reload(); // This will reload the page
  };



  const [isDialogOpenResponse, setIsDialogOpenResponse] = useState(false);
  const closeDialogResponse = () => {
    setIsDialogOpenResponse(false);
    window.location.reload(); // This will reload the page
  };






  return (

    <>


      <div>

        <Navbar />
      </div>



      {loading ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: '9999'
        }}>
          <div className="spinner-border text-danger" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : null}


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
                disabled

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
                disabled

              />

              <i class="fa-solid fa-envelope"></i>
            </div>


            {alertMessage && (
              <div className="alert-container">
                <p style={{ color: 'red' }}><i className="fas fa-exclamation-circle" style={{ color: 'red' }}></i> {alertMessage}</p>
              </div>
            )}


          </div>
          <div className='d-grid col-5'>
            <button className='btn btn-primary' onClick={handleButtonClick1}  >GET OTP</button>
          </div>
        </div>
      </div>


      <Modal show={isDialogOpen} onHide={closeDialog} backdrop="static" style={{ marginTop: '3%', pointerEvents: loading ? 'none' : 'auto' }}>
        <Modal.Body>
          <p> {modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDialog}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>



      <Modal show={isDialogOpenResponse} onHide={closeDialogResponse} backdrop="static" style={{ marginTop: '3%', pointerEvents: loading ? 'none' : 'auto' }}>
        {/* <Modal.Header closeButton>
      </Modal.Header>  */}
        <Modal.Body>
          <p> {modalMessageResponse}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDialogResponse}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>


    </>
  )
}

export default Passwordchange