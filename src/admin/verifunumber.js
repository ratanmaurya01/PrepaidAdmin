import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '../adminLogin/firebase';
import CommonFuctions from '../commonfunction';
import Navbar from '../adminLogin/navbar';

import { Modal, Button } from 'react-bootstrap';







function Verifynumber() {
  const sessiontime = new CommonFuctions();


  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const location = useLocation();
  const { newPhone, newName, newAddress, newEmail } = location.state || {};
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');

  const storedPhoneOTP = localStorage.getItem('otp');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        //   console.log('Logged in user:', authUser.email);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const number = emailParts[0];
          //  console.log('Extracted number:', number);
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

  const onSubmitotp = async (e) => {
    e.preventDefault();


    if (otp === '') {
      setError('Invalid mobile OTP');
      return;
    }



    if (otp !== storedPhoneOTP) {
      setError('Invalid mobile OTP');
      return;
    }

    if (otp === storedPhoneOTP) {

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
          // Prepare the updated data
          const newData = {
            address: newAddress || '', // Retain the existing address
            email: newEmail || '', // Replace '' with a default value if needed
            key: existingKey, // Retain the existing key
            name: newName || '', // Replace '' with a default value if needed
            password: existingPassword, // Retain the existing password
            phoneNo: phoneNumber || '', // Replace '' with a default value if needed
            phoneNo2: newPhone || '', // Replace '' with a default value if needed
            // Add other fields as needed
          };
          // Update only phoneNo2 in Firebase
          await set(ref(db, adminProfilePath), newData);
          // Update session data after successfully updating admin profile
          // (assuming session data update logic remains unchanged)
          // const sessionDataPath = `adminRootReference/adminDetails/${phoneNumber}/sessionData`;
          // const timestampData = {
          //   lastActive: Date.now().toString(), // Update last active timestamp
          //   sessionId: Date.now().toString(), // Generate a new session ID or handle as required
          //   // Add other timestamp-related fields as needed
          // };
          // Perform update for session data
          //await set(ref(db, sessionDataPath), timestampData);

          // console.log('Data updated successfully in Firebase!');
          // alert('Data updated successfully!');

          /// navigate('/admindetail');

          try {
            sessiontime.updateSessionTimeActiveUser(phoneNumber);
            setModalMessage('Data Saved Successfully.');
            setisDialogOpenDataSave(true)
            setLoading(false);

          } catch (error) {
            setLoading(false);
            setIsDialogOpen(true);
            // const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry. `;
            const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry.`;
            setModalMessage(errorMessage);

          }



        } else {
          // setIsSessionActive(false);
          alert("Cannot login. Another session is active. Please retry after sometime. ");
          // console.log('you are logg out ');
          handleLogout();
        }
      } catch (error) {

        setLoading(false);
        setIsDialogOpen(true);
        const errorMessage = `Response not recieved  from server-S. (${error}). Please check if transaction completed successfully , else retry.`;
        setModalMessage(errorMessage);

      }

    } else {
      //
      setError('Enter valid OTP.');
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

  const handleMobileOTPChange = (e) => {

    const input = e.target.value.replace(/\D/g, ''); // Remove non-digit characters

    setOtp(input);
    setError('');
  };


  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => {
    setIsDialogOpen(false);
    // window.location.reload(); // This will reload the page
  };


  const [isDialogOpenDataSave, setisDialogOpenDataSave] = useState(false);

  const closeDialogDataSave = () => {
    isDialogOpenDataSave(false);
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

      <div className="containers">
        <form className="formgroup">
          <div>
            <label htmlFor="phoneNumber">Enter OTP </label>
            <input
              type="text"
              value={otp}
              className="form-control"
              //    onChange={(e) => setOtp(e.target.value)}
              onChange={handleMobileOTPChange}
              required
              maxLength={6}
              placeholder="Mobile-OTP "
            />
            {error && <div style={{ color: 'red' }}>{error}</div>}
          </div>
          {/* <div className="d-grid col-4">
            <button type="submit" className="btn btn-primary" onClick={onSubmitotp}>
              VERIFY
            </button>
          </div> */}

          <div className="d-flex justify-content-center w-100">
            <button className="btn btn-danger" onClick={handleBackButton} style={{ marginRight: '50px' }}>Back</button>
           
            <button type="submit" className="btn btn-primary" onClick={onSubmitotp}>
              VERIFY
            </button>

          </div>





        </form>



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

      </div>
    </>
  );
}

export default Verifynumber;
