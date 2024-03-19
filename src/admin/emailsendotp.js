import React, { useEffect, useState } from 'react';
import { auth } from '../adminLogin/firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import Send from '../adminLogin/sendmail'; // Import the Send component
import PhoneSendOtp from '../adminLogin/phonesendotp';
import CommonFuctions from '../commonfunction';
import Navbar from '../adminLogin/navbar';
import { Modal, Button } from 'react-bootstrap';



function Emailsendotp() {

    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(true);

    
    const sessiontime = new CommonFuctions();
    const [user, setUser] = useState(null);
    const [number, setNumber] = useState(''); // State to store the extracted number
    const [onlineStatus, setOnlineStatus] = useState(null);
    const { email, setEmail, errorMessage, handleButtonClick } = Send(); // Using your custom hook
    const navigate = useNavigate();
    const location = useLocation();
    const { newName, newPhone, newAddress } = location.state || {};
    const { newEmail } = location.state || {};
    // console. log("name ", newName);
    // console. log("newPhone ", newPhone);
    // console. log("newAddress ", newAddress);
    // console. log("newAddress ", newEmail);
    const initialEmail = location.state?.newEmail || ''; // Get email from location state
    //  console.log("initialEmail ", initialEmail);
    useEffect(() => {
        setEmail(initialEmail); // Set initial email from location state
    }, [setEmail, initialEmail]);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
                //  console.log("Logged in user:", authUser.email);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const extractedNumber = emailParts[0];
                    ///   console.log("Extracted number:", extractedNumber);
                    setNumber(extractedNumber); // Set the extracted number in the state
                    setLoading(false);
                }
            } else {
                setUser(null);
                window.location.href = '/'; // Redirect to your login page
            }
        });

        // Cleanup function for unmounting
        return () => unsubscribe();
    }, []);



    const handleGetOTP = () => {
        ///  console.log('GetOTP for phone number', number);
        const phoneSendOtp = new PhoneSendOtp(number);
        const result = phoneSendOtp.sendOTP(number);
        // Redirect to another page after sending OTP (change '/other-page' to your desired route)
    };

   

    const handleButtonClick1 = async (event) => {
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

        // const result = sessiontime.isCheckInterNet();
        // if (result) {

        const storeSessionId = localStorage.getItem('sessionId');
        try {
        const { sessionId } = await sessiontime.HandleValidatSessiontime(number);
        if (storeSessionId === sessionId) {
            // console.log('SessionId Match ');
            event.preventDefault();
            handleButtonClick(event);
            handleGetOTP();
            navigate('/emailverify', { state: { initialEmail, newName, newAddress, newPhone } });
        } else {
            // setIsSessionActive(false);
            alert("Cannot login. Another session is active. Please retry after sometime. ");
            // console.log('you are logg out ');
            handleLogout();
        }
             
    }catch(console){

        setIsDialogOpen(true);
        setModalMessage('No/Poor Internet connection , Please retry.');


            
    }

        // } else {
        //     setOnlineStatus(result);
        //     // alert(" No internet connection ");
        // }

    };



    const handleNumberChange = (event) => {
        setNumber(event.target.value);
    }


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
        // window.location.reload(); // This will reload the page
    };




    return (
        <>
            <div>
                <Navbar />
            </div>

            {/* {onlineStatus !== null && onlineStatus === false ? (
                    <div style={{ textAlign: 'center', marginTop: '20%' }}>

                        <h3>No Internet Connection</h3>
                    </div>
                ) : ( */}


            {loading ? (
                <div style={{ textAlign: 'center', marginTop: '20%' }}>
                    <div className="spinner-border text-danger" role="status">
                        <span className="sr-only"></span>
                    </div>
                </div>
            ) : (

                <div className='containers'>
                    <div className='formgroup'>
                        {/* <div>
                        <h1>Verify Mobile Number & Email-id</h1>
                    </div> */}

                        <div>
                            <label htmlFor="phoneNumber">Mobile Number</label>
                            <input
                                type="text"
                                className='form-control'
                                placeholder="Enter phone number"
                                value={number ? `+91${number}` : '+91'}
                                onChange={handleNumberChange}
                                readOnly
                                disabled
                            />
                            {/* Display any response messages */}
                        </div>

                        <div>
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                className='form-control'
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errorMessage && <p style={{ color: 'red' }} >{errorMessage}</p>}
                        </div>
                        <div className='d-grid col-4'>
                            <button className='btn btn-primary' onClick={handleButtonClick1}>Send OTP</button>
                        </div>
                        {/* {!isSessionActive && (
            <div className="alert alert-primary" role="alert">
              Cannot login. Another session is active. Please retry after sometime.
            </div>
          )} */}

                    </div>
                </div>


            )}
            {/* )} */}



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

export default Emailsendotp;
