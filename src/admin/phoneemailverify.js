import React, { useEffect, useState } from 'react';
import { auth } from '../adminLogin/firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, set } from 'firebase/database';
import CommonFuctions from '../commonfunction';
import Navbar from '../adminLogin/navbar';



function Phoneemailverify() {

    const sessiontime = new CommonFuctions();

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [mobileOTP, setMobileOTP] = useState('');
    const [emailOTP, setEmailOTP] = useState('');
    const maxLength = 6; // Assuming OTP length is 6
    const [mobileOTPError, setMobileOTPError] = useState('');
    const [emailOTPError, setEmailOTPError] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailFromState, setEmailFromState] = useState('');

    const location = useLocation();
    const { email } = location.state || {};
    const { newPhone } = location.state || {};
    const { newName } = location.state || {};
    const { newAddress} = location.state || {};


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
                console.log('Logged in user:', authUser.email);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const number = emailParts[0];
                    console.log('Extracted number:', number);
                    setPhoneNumber(number);
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

       
      

        if (mobileOTP === storedPhoneOTP && emailOTP === storedEmailOTP) {
            const db = getDatabase();
            const adminProfilePath = `adminRootReference/adminDetails/${phoneNumber}/adminProfile`;

            try {
                const snapshot = await get(ref(db, adminProfilePath));
                const existingData = snapshot.val();
            const existingKey = existingData.key;
            const existingPassword = existingData.password;
                const newData = {
                    ...existingData,

                    address: newAddress || '', // Retain the existing address
                    email: email || '', // Replace '' with a default value if needed
                    key: existingKey, // Retain the existing key
                    name: newName || '', // Replace '' with a default value if needed
                    password: existingPassword, // Retain the existing password
                    phoneNo: phoneNumber || '', // Replace '' with a default value if needed
                    phoneNo2: newPhone || '', // Replace '' with a default value if needed
                    // Add other fields as needed
                };

                await set(ref(db, adminProfilePath), newData);

                // Further logic...
                // Update session data if needed

                navigate('/admindetail');
                alert('Data saved successfully!');
            } catch (error) {
                console.error('Error updating data:', error);
                alert('Failed to update data. Please try again.');
            }
        } else {
            // OTPs do not match, set error messages or handle accordingly
            // if (mobileOTP !== storedPhoneOTP) {
            //     setMobileOTPError('Invalid mobile OTP');
            // }
            // if (emailOTP !== storedEmailOTP) {
            //     setEmailOTPError('Invalid email OTP');
            // }
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
              
        }
    };


    
    const handleMobileOTPChange = (e) => {
        setMobileOTP(e.target.value);
        setMobileOTPError('');
    };

    const handleEmailOTPChange = (e) => {
        setEmailOTP(e.target.value);
        setEmailOTPError('');
    };



    const handleSubmitClick = async (e) => {

        
        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await sessiontime.HandleValidatSessiontime(phoneNumber);
        if (storeSessionId === sessionId) {




        e.preventDefault(); // Prevent default form submission
        handleOnSubmit(); // Call the submit function
    
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

            <div className='containers'>
                <div className='formgroup'>
                    <div>
                        {/* <div>
                            <h3>Enter OTP</h3>
                        </div> */}
                        <label htmlFor="mobileOTP">Enter Mobile OTP</label>
                        <input
                            type="text"
                            className='form-control'
                            placeholder=" Mobile OTP"
                            value={mobileOTP}
                            onChange={handleMobileOTPChange}
                        />
                        {mobileOTPError && <p style={{color:'red'}} className="error">{mobileOTPError}</p>}
                    </div>
                    <div>
                        <label htmlFor="emailOTP">Enter E-mail OTP</label>
                        <input
                            type="text"
                            className='form-control'
                            placeholder=" E-mail OTP"
                            value={emailOTP}
                            onChange={handleEmailOTPChange}
                        />
                        {emailOTPError && <p style={{color:'red'}} className="error">{emailOTPError}</p>}
                    </div>
                    <div className='d-grid col-4'>
                        <button type="submit" className='btn btn-primary' onClick={handleSubmitClick}>
                            VERIFY
                        </button>
                    </div>


                </div>
            </div>
        </>

    )

}

export default Phoneemailverify