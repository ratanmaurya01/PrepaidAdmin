import React, { useState } from 'react';
import { useLocation, useHistory, useNavigate } from 'react-router-dom';

import PhoneSendOtp from './phonesendotp'; // Import the Phonesendotp component

import Mainhomepage from '../home/mainhomepage'

import { Modal, Button } from 'react-bootstrap';
import CommonFuctions from '../commonfunction';

function Verifyphone() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

   
  const sessionTime = new CommonFuctions();

  let location = useLocation();
  const localphoneNumber = location.state?.phoneNumber || ''; // Access the phone number passed from the previous page
  //  console.log ('local phone number: ' ,localphoneNumber);

  // Destructure the required functions and states from Phonesendotp


  const handleGetOTP = async () => {

    setLoading(true);
   
    const status = await sessionTime.checkInternetConnection(); // Call the function
    if (status === 'Poor connection.') {
        setIsDialogOpen(true);
        setModalMessage('No/Poor Internet connection. Cannot access server.');
        setLoading(false);
        return;
    }
    //  console.log (' phone number  1212: ' ,localphoneNumber);
    const phoneSendOtp = new PhoneSendOtp(localphoneNumber);

    phoneSendOtp.sendOTP(localphoneNumber); // Assuming this function sends the OTP 
    // Redirect to another page after sending OTP (change '/other-page' to your desired route)
    navigate('/verifyphoneotp', { state: { phoneNumber: localphoneNumber } });
  };



  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const closeDialog = () => {
      setIsDialogOpen(false);
      // window.location.reload(); // This will reload the page
  };

  return (
    <>


      <div>
        <Mainhomepage />
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
          <div style={{}}>
            <h3 style={{ backgroundColor: '', color: 'black' }}
            >Verify Mobile Number</h3>
          </div>

          <div>
            <label htmlFor="phoneNumber">Phone Number</label>
            <div className="input-container1">
              <input
                type="text"
                className='form-control'
                // value = {localphoneNumber}
                defaultValue={localphoneNumber ? `+91${localphoneNumber}` : '+91'}
                readOnly
                // onChange={null} 
                maxLength={10}
                placeholder="Phone Number"
                style={{ paddingLeft: '30px' }}
              />
              <i class="fas fa-phone"></i>
            </div>
          </div>
          <div className="d-grid col-4">
            <button className='btn btn-primary' onClick={handleGetOTP}>Get OTP</button>
          </div>
        </div>
      </div>


      <Modal show={isDialogOpen} onHide={closeDialog} backdrop="static" style={{ marginTop: '3%', pointerEvents: loading ? 'none' : 'auto' }}>
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
  );
}

export default Verifyphone;
