import React, { useEffect, useState } from 'react';
import { auth } from '../adminLogin/firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set } from 'firebase/database';
import CommonFuctions from '../commonfunction';
import Navbar from '../adminLogin/navbar';
import { Modal, Button } from 'react-bootstrap';
import { faL } from '@fortawesome/free-solid-svg-icons';



function Emailverify() {
  const navigate = useNavigate();
  const sessiontime = new CommonFuctions();
  const [user, setUser] = useState(null);
  const [mobileOTP, setMobileOTP] = useState('');
  const [emailOTP, setEmailOTP] = useState('');
  const maxLength = 6; // Assuming OTP length is 6
  const [mobileOTPError, setMobileOTPError] = useState('');
  const [emailOTPError, setEmailOTPError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const { initialEmail, newName, newAddress, newPhone } = location.state || {};

  // console.log("new Email"  , initialEmail);
  // console.log("new new Name"  , newName);
  // console.log("new new phone"  , newPhone);
  // console.log("new address"  , newAddress);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        //  console.log('Logged in user:', authUser.email);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const number = emailParts[0];
          //   console.log('Extracted number:', number);
          setPhoneNumber(number);
          setLoading(false);
        }
      } else {
        setUser(null);
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOnSubmit = async () => {

    const storedPhoneOTP = localStorage.getItem('otp'); // Get stored phone OTP
    const storedEmailOTP = localStorage.getItem('emailOTP'); // Get stored email OTP

    if (mobileOTP !== storedPhoneOTP) {
      setMobileOTPError('Invalid mobile OTP');
    } else if (emailOTP !== storedEmailOTP) {
      setEmailOTPError('Invalid email OTP');
    } else {
      // Both OTPs are valid, proceed with the submission
      // You can also reset any existing errors here, if needed
      setMobileOTPError('');
      setEmailOTPError('');

      // Proceed with the submission
    }

    if (mobileOTP === storedPhoneOTP && emailOTP === storedEmailOTP) {


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

          const db = getDatabase();
          const adminProfilePath = `adminRootReference/adminDetails/${phoneNumber}/adminProfile`;

          const snapshot = await get(ref(db, adminProfilePath));
          const existingData = snapshot.val();
          const existingKey = existingData.key;
          const existingPassword = existingData.password;
          const newData = {
            // Update email in the newData object
            address: newAddress || '', // Retain the existing address
            email: initialEmail || existingData.initialEmail || '', // Replace '' with a default value if needed
            key: existingKey, // Retain the existing key
            name: newName || '', // Replace '' with a default value if needed
            password: existingPassword, // Retain the existing password
            phoneNo: phoneNumber || '', // Replace '' with a default value if needed
            phoneNo2: newPhone || '', // Replace '' with a default value if needed
            // Add other fields as needed
          };


          await set(ref(db, adminProfilePath), newData);
          setModalMessage('Data Saved Successfully.');
          setisDialogOpenDataSave(true)
          setLoading(false);

          // navigate('/admindetail');
          try {
            sessiontime.updateSessionTimeActiveUser(phoneNumber);


          } catch (error) {
            setLoading(false);
            setIsDialogOpen(true);
            // const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry. `;
            const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry.`;
            setModalMessage(errorMessage);

          }

          //   alert('Data saved successfully!');




        } else {
          // setIsSessionActive(false);
          alert("Cannot login. Another session is active. Please retry after sometime. ");
          // console.log('you are logg out ');
          //  handleLogout();
        }

      } catch (error) {


        setLoading(false);

        setIsDialogOpen(true);
        // const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry. `;

        const errorMessage = `Response not recieved  from server-S. (${error}). Please check if transaction completed successfully , else retry.`;

        setModalMessage(errorMessage);


      }


    } else {
      // OTPs do not match, set error messages or handle accordingly
      // if (mobileOTP !== storedPhoneOTP) {
      //   setMobileOTPError('Invalid mobile OTP');
      // }
      // if (emailOTP !== storedEmailOTP) {
      //   setEmailOTPError('Invalid email OTP');
      // }
    }




  };

  const handleMobileOTPChange = (e) => {

    const input = e.target.value.replace(/\D/g, ''); // Remove non-digit characters

    setMobileOTP(input);
    setMobileOTPError('');

  };

  const handleEmailOTPChange = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digit characterssdffs
    setEmailOTP(input);
    setEmailOTPError('');
  };

  const handleSubmitClick = async (e) => {


    if (mobileOTP === '') {
      setMobileOTPError('Invalid mobile OTP');
      return;
    }

    if (emailOTP === '') {

      setMobileOTPError('Invalid mobile OTP');
      return;
    }

    // const storeSessionId = localStorage.getItem('sessionId');
    // try {
    //   const { sessionId } = await sessiontime.HandleValidatSessiontime(phoneNumber);
    //   if (storeSessionId === sessionId) {

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

    e.preventDefault(); // Prevent default form submission
    handleOnSubmit(); // Call the submit function

    //   } else {
    //     // setIsSessionActive(false);
    //     alert("Cannot login. Another session is active. Please retry after sometime. ");
    //     // console.log('you are logg out ');
    //     handleLogout();
    //   }

    // } catch (error) {


    // }



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



  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => {
    setIsDialogOpen(false);
    navigate('/admindetail');
    // window.location.reload(); // This will reload the page
  };

  const [isDialogOpenDataSave, setisDialogOpenDataSave] = useState(false);

  const closeDialogDataSave = () => {
    setisDialogOpenDataSave(false);
    navigate('/admindetail');
    window.location.reload(); // This will reload the page
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
          {/* <div>
            
              <h3>Enter OTP</h3>
            </div> */}
          <div>
            <label htmlFor="mobileOTP">Enter Mobile OTP</label>
            <input
              type="text"
              className='form-control'
              placeholder="Mobile OTP"
              value={mobileOTP}
              onChange={handleMobileOTPChange}
              maxLength={6}
            />
            {mobileOTPError && <p style={{ color: 'red' }} className="error">{mobileOTPError}</p>}
          </div>
          <div>
            <label htmlFor="emailOTP">Enter E-mail OTP</label>
            <input
              type="text"
              className='form-control'
              placeholder="E-mail OTP"
              value={emailOTP}
              onChange={handleEmailOTPChange}
              maxLength={6}
            />
            {emailOTPError && <p style={{ color: 'red' }} className="error">{emailOTPError}</p>}
          </div>
          {/* <div className='d-grid col-4'>
            <button type="submit" className='btn btn-primary' onClick={handleSubmitClick}>
              VERIFY
            </button>
          </div> */}


          <div className="d-flex justify-content-center w-100">
            <button className="btn btn-danger" onClick={handleBackButton} style={{ marginRight: '50px' }}>Back</button>
            
            <button type="submit" className='btn btn-primary' onClick={handleSubmitClick}>
              VERIFY
            </button>

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



      <Modal show={isDialogOpenDataSave} onHide={closeDialogDataSave} backdrop="static" style={{ marginTop: '3%' }}>
        {/* <Modal.Header closeButton>
      </Modal.Header>  */}
        <Modal.Body>
          <p> {modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDialogDataSave}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  );
}

export default Emailverify;
