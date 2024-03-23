import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import PhoneSendOtp from '../adminLogin/phonesendotp';
import Send from '../adminLogin/sendmail'; // Import the Send component
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import Navbar from '../adminLogin/navbar';
import { Modal, Button } from 'react-bootstrap';
import CommonFuctions from '../commonfunction';


function Transfer() {
 
  
  const SessionTime = new CommonFuctions();
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const { phonenumberlist } = location.state || {};
  // const { email } = location.state || {};
  const { transferEmail } = location.state || {};

  const { transferPassword } = location.state || {};
  const { transferKey } = location.state || {};

  const [modalMessage, setModalMessage] = useState('');





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
          setLoading(false);
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

  const handleGetOTP = async () => {
    // console.log('phone number 1212: ', phonenumberlist);
    // const phoneSendOtp = new PhoneSendOtp(phonenumberlist);
    // phoneSendOtp.sendOTP(phonenumberlist);
    try {
      const phoneSendOtp = new PhoneSendOtp(phonenumberlist);
      const result = await phoneSendOtp.sendOTP(phonenumberlist);
      if (result === 411) {
        setAlertMessage(`Invalid number : (${result})`);
        setLoading(false);
      } else {
      //  navigate('/verifunumber', { state: { newPhone, newName, newAddress, newEmail } });

      navigate('/transferphoneemail', { state: { phonenumberlist, transferPassword, transferKey } });

      }
    } catch (otpError) {
    }

  };

  const handleButtonClick1 = async (event) => {
    setAlertMessage('');
    setLoading(true);
    event.preventDefault();

    const status = await SessionTime.checkInternetConnection(); // Call the function
    if (status === 'Poor connection.') {
      setIsDialogOpen(true);
      setModalMessage('No/Poor Internet connection , Please retry.');
      setLoading(false);
      // alert('No/Poor Internet connection , Please retry.'); // Display the "Poor connection" message in an alert
      return;
    }

    handleButtonClick(event);
    handleGetOTP();
    // navigate('/transferphoneemail', { state: { phonenumberlist, transferPassword, transferKey } });
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const closeDialog = () => {
    setIsDialogOpen(false);
    // window.location.reload(); // This will reload the page
  };

  return (
    <>

      {/* <div>Transfer Admin Phone Number :  {phonenumberlist }</div>

      <div>Transfet Admin Email : {transferEmail}</div> */}

      {/* <div> Transefer Admin  Password  : {transferPassword}</div>  */}

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

            {alertMessage && (
              <div className="alert-container">
                <p style={{ color: 'red' }}><i className="fas fa-exclamation-circle" style={{ color: 'red' }}></i> {alertMessage}</p>
              </div>
            )}



          </div>
          <div className='d-grid col-5'>
            <button className='btn btn-primary' onClick={handleButtonClick1} >GET OTP</button>
          </div>
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




    </>
  )
}

export default Transfer