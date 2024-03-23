import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PhoneSendOtp from '../adminLogin/phonesendotp';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebase';
import { auth } from '../adminLogin/firebase';
import Navbar from '../adminLogin/navbar';
import { ref, set, get, child, getDatabase, onValue } from 'firebase/database';
import CommonFuctions from '../commonfunction';
import { Modal, Button } from 'react-bootstrap';
import { invalid } from 'moment';



function Sendphone() {
  const sessiontime = new CommonFuctions();
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const [modalMessage1, setModalMessage1] = useState('');

  const { newPhone, newName, newAddress, newEmail } = location.state || {};


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
          setLoading(false);
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


  const handleGetOTP = async () => {
    setAlertMessage('');

    setLoading(true);
    const status = await sessiontime.checkInternetConnection(); // Call the function
    //  setShowChecker(status);
    if (status === 'Poor connection.') {
      setIsDialogOpen(true);
      setModalMessage('No/Poor Internet connection , Please retry.');
      setLoading(false);
      // alert('No/Poor Internet connection , Please retry.'); // Display the "Poor connection" message in an alert
      return;
    }

    const storeSessionId = localStorage.getItem('sessionId');


    try {
      const { sessionId } = await sessiontime.HandleValidatSessiontime(phoneNumber);
      if (storeSessionId === sessionId) {

        // console.log('phone number 1212: ', newPhone);
        try {
          const phoneSendOtp = new PhoneSendOtp(newPhone);
          const result = await phoneSendOtp.sendOTP(newPhone);
          if (result === 411) {
            setAlertMessage(`Invalid number : (${result})`);
            setLoading(false);
          } else {
           navigate('/verifunumber', { state: { newPhone, newName, newAddress, newEmail } });
          }
        } catch (otpError) {
        }

        // navigate('/verifunumber', { state: { newPhone, newName, newAddress, newEmail } });
      } else {
        alert("Cannot login. Another session is active. Please retry after sometime. ");
        // console.log('you are logg out ');
        handleLogout();
      }


    } catch (error) {
      setLoading(false);
      setIsDialogOpen1(true);
      // const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry. `;
      const errorMessage = `Response not recieved  from server-S. (${error}). Please check if transaction completed successfully , else retry.`;
      setModalMessage1(errorMessage);


    }

  };

  const history = useNavigate();
  const handleLogout = () => {
    auth.signOut().then(() => {
      // Redirect to login page after successful logout
      history('/'); // Change '/login' to your login page route
    }).catch((error) => {
      // Handle any errors during logout
      ///  console.error('Error logging out:', error.message);
    })

  }


  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => {
    setIsDialogOpen(false);
    // window.location.reload(); // This will reload the page
  };


  const [isDialogOpen1, setIsDialogOpen1] = useState(false);
  const closeDialog1 = () => {

    setIsDialogOpen1(false);
    navigate('/admindetail');
    //   window.location.reload(); // This will reload the page
  };



  const handleBackButton = () => {
    navigate('/admindetail');
  }





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
          {/* <h3>Verify Mobile Number</h3> */}
          <div>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              className='form-control'
              placeholder="Phone Number"
              defaultValue={newPhone ? `+91${newPhone}` : '+91'}
              readOnly
              disabled

            />

            {alertMessage && (
              <div className="alert-container">
                <p style={{ color: 'red' }}><i className="fas fa-exclamation-circle" style={{ color: 'red' }}></i> {alertMessage}</p>
              </div>
            )}

          </div>
          {/* <div className="d-grid col-4">
            <button className='btn btn-primary' onClick={handleGetOTP}>Get OTP</button>
          </div> */}


          <div className="d-flex justify-content-center w-100">
            <button className="btn btn-danger" onClick={handleBackButton} style={{ marginRight: '50px' }}>Back</button>
            <button className='btn btn-primary' onClick={handleGetOTP}>Get OTP</button>

          </div>

          {/* {alertMessage && <p>{alertMessage}</p>} */}





        </div>

      </div>



      <Modal show={isDialogOpen} onHide={closeDialog} backdrop="static" style={{ marginTop: '3%' }}>
        {/* <Modal.Header closeButton>
      </Modal.Header>  */}
        <Modal.Body>
          <p> {modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDialog}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* REsponse from session vaidation  */}

      <Modal show={isDialogOpen1} onHide={closeDialog1} backdrop="static" style={{ marginTop: '3%' }}>
        {/* <Modal.Header closeButton>
      </Modal.Header>  */}
        <Modal.Body>
          <p> {modalMessage1}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDialog1}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>





    </>
  )
}

export default Sendphone;
