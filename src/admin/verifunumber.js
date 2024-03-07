import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDatabase, ref, get, set } from 'firebase/database';
import { auth } from '../adminLogin/firebase';
import CommonFuctions from '../commonfunction';
import Navbar from '../adminLogin/navbar';





function Verifynumber() {
  const sessiontime = new CommonFuctions();


  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const location = useLocation();
  const { newPhone , newName, newAddress, newEmail } = location.state || {};
  const [phoneNumber, setPhoneNumber] = useState('');

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

    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await sessiontime.HandleValidatSessiontime(phoneNumber);
    if (storeSessionId === sessionId) {

        



    if (otp === storedPhoneOTP) {
      const db = getDatabase();
      const adminProfilePath = `adminRootReference/adminDetails/${phoneNumber}/adminProfile`;

      try {
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
        const sessionDataPath = `adminRootReference/adminDetails/${phoneNumber}/sessionData`;
        const timestampData = {
            lastActive: Date.now().toString(), // Update last active timestamp
            sessionId: Date.now().toString(), // Generate a new session ID or handle as required
            // Add other timestamp-related fields as needed
        };

        // Perform update for session data
        await set(ref(db, sessionDataPath), timestampData);


        // console.log('Data updated successfully in Firebase!');
        alert('Data updated successfully!');
      } catch (error) {
        // console.error('Error updating data:', error);
        alert('Failed to update data. Please try again.');
      }

      navigate('/admindetail');
    } else {
      setError('Enter valid OTP.');
    }


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
        

       
    <div className="containers">
      <form className="formgroup">
        <div>
          <label htmlFor="phoneNumber">Enter OTP </label>
          <input
            type="text"
            value={otp}
            className="form-control"
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            placeholder="Mobile-OTP "
          />
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
        <div className="d-grid col-4">
          <button type="submit" className="btn btn-primary" onClick={onSubmitotp}>
            VERIFY
          </button>
        </div>
      </form>
    </div>
    </>
  );
}

export default Verifynumber;
