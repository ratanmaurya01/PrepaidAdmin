import React, { useEffect, useState } from 'react';
import Navbar from '../adminLogin/navbar';
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import './Phonepasswordchange.css'; // Import CSS file
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { set } from 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import CommonFuctions from '../commonfunction';



import '../adminLogin/login.css'


function Phonepasswordchange() {


    const SessionTime = new CommonFuctions();

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [enteredPhoneNumberModal, setEnteredPhoneNumberModal] = useState('');
    const [enteredPasswordModal, setEnteredPasswordModal] = useState('');
    const [email, setEmail] = useState('');
    const [phonenumberlist, setPhonenumberList] = useState('');
    const [transferEmail, setTranseferEmail] = useState('');
    const [transferPassword, setTransferPassword] = useState('');
    const [transferKey, setTranseferKey] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phoneError, setErrorPhoneError] = useState("");





    const handleClose = () => setShowModal(false);
    const handleShow = () => {
        setShowModal(true)
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const numberPart = emailParts[0];
                    //  console.log("Number", numberPart);
                    setPhoneNumber(numberPart);
                    getAdminPassword(numberPart);


                }
            } else {
                setUser(null);
                // Instead of redirecting, you can handle this case in your UI
                window.location.href = '/';
            }
        });

        return () => unsubscribe();
    }, []);


    const getAdminPassword = (numberPart) => {


        const passwordRef = database.ref(`/adminRootReference/adminDetails/${numberPart}/adminProfile`);

        passwordRef.once('value', (snapshot) => {
            const fetchedPassword = snapshot.val();
            // console.log("Fetched password", fetchedPassword.password);
            //  console.log("Fetched password", fetchedPassword.email);
            setEmail(fetchedPassword.email);
            setPassword(fetchedPassword.password);
            setLoading(false);
        });
    };

    const getAdminPhoneList = (enteredPhoneNumber) => {
        const passwordRef = database.ref(`/adminRootReference/adminDetails/`);

        passwordRef.once('value', (snapshot) => {
            const fetchedPasswords = snapshot.val();

            for (const phonelist in fetchedPasswords) {
                if (fetchedPasswords.hasOwnProperty(phonelist)) {
                    if (phonelist === enteredPhoneNumber) {
                        setMessage("The entered phone number is already present in the database.");
                        getTransferAdminemail(phonelist)
                        setPhonenumberList(phonelist)
                        return;
                    }
                }
            }
            setMessage(""); // Clear error if no matching phone number is found
        });
    };

    const getTransferAdminemail = (phonelist) => {

        const passwordRef = database.ref(`/adminRootReference/adminDetails/${phonelist}/adminProfile`);

        passwordRef.once('value', (snapshot) => {
            const fetchedPassword = snapshot.val();
            //  console.log("Transfer password", fetchedPassword.password);
            //  console.log("Transfer password", fetchedPassword.email);
            setTranseferEmail(fetchedPassword.email);
            setTransferPassword(fetchedPassword.password);
            setTranseferKey(fetchedPassword.key);

            // setEmail(fetchedPassword.email);
            // setPassword(fetchedPassword.password);
            // setLoading(false);
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        SessionUpdate();

        const enteredPhoneNumber = e.target.newPhoneNumber.value;
        const enteredPassword = e.target.newPassword.value;


        if (!enteredPhoneNumber.trim() && !enteredPassword.trim()) {
            setError("Please enter at least one field.");
            return;
        }
        if (enteredPhoneNumber === phoneNumber) {
            setError("No change in existing mobile no. and password Re-Config token will not be generated");
        } else {
            // console.log("New Phone Number:", enteredPhoneNumber);
            if (enteredPassword === password) {
                setError("No change in existing mobile no. and password Re-Config token will not be generated");
                return;
            }

            const storeSessionId = localStorage.getItem('sessionId');

            const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
            if (storeSessionId === sessionId) {


                //  console.log("New Password:", enteredPassword);
                getAdminPhoneList(enteredPhoneNumber);
                //  setEnteredPhoneNumberModal(enteredPhoneNumber);
                setEnteredPasswordModal(enteredPassword);
                // Add logic to update the database or perform other actions with the form data
                handleShow();

            } else {

                alert("You have been logged-out due to log-in from another device.");
                // console.log('you are logg out ');
                handleLogout();


            }
        }


    };


    const handleModalSubmit = () => {
        // console.log("New Number :", enteredPhoneNumberModal);
        // console.log("New Password:", enteredPasswordModal);
        // console.log("Old Phone number ", phoneNumber);
        // console.log("Old Email ", email);
        // if (enteredPhoneNumberModal ===phoneNumber) {
        //     navigate('/phoneemail', { state: { email, phoneNumber } });
        // } 
        
        // else {
        //     navigate('/phoneotp', { state: { email, enteredPhoneNumberModal, enteredPasswordModal, phoneNumber } });
        // }
        // if (enteredPasswordModal != password) {
        //     navigate('/passwordchange', { state: { email, enteredPasswordModal, phoneNumber } });
        // }
        // if (enteredPhoneNumberModal !== phoneNumber && enteredPasswordModal != password) {
        //     navigate('/phoneemail', { state: { enteredPhoneNumberModal, email, enteredPasswordModal } });;
        // }
        if (enteredPhoneNumberModal === phonenumberlist) {

            navigate('/transefer', { state: { phonenumberlist, transferEmail, transferPassword, transferKey } });

        }

    };


    // const handleModalSubmit = () => {
    //     console.log("New Number :", enteredPhoneNumberModal);
    //     console.log("New Password:", enteredPasswordModal);
    //     console.log("Old Phone number ", phoneNumber);

    //     console.log("Existing Accound number  ", phonenumberlist);
    //     console.log("Old Email ", email);


    //     if (enteredPhoneNumberModal && !enteredPasswordModal) {
    //         navigate('/phoneotp', { state: { email, enteredPhoneNumberModal, phoneNumber } });
    //     } else if (!enteredPhoneNumberModal && enteredPasswordModal) {
    //         navigate('/passwordchange', { state: { email, enteredPasswordModal, phoneNumber } });
    //     } else if (enteredPhoneNumberModal && enteredPasswordModal) {
    //         navigate('/phoneemail', { state: { enteredPhoneNumberModal, email, enteredPasswordModal } });
    //     }  else {
    //         console.log("No conditions matched");
    //     }
    //     if (enteredPhoneNumberModal === phonenumberlist) {
    //         console.log("Navigating to '/transefer'");
    //         navigate('/transefer', { state: { phonenumberlist, transferEmail, transferPassword, transferKey }});
    //     }

    // };


    const [errorphone, SetErrorphone] = useState();
    const handleChange = (e) => {

        setErrorPhoneError('');
        setError();
        const { value } = e.target;
        if (value.charAt(0) === '0') {
            SetErrorphone("Should not begin with Zero. ");
        }
        else {

            setEnteredPhoneNumberModal(value.replace(/[^0-9]|^0/g, ''));
            SetErrorphone("");
        }


    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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


    const SessionValidate = async () => {

        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
        // console.log("Received session ID from server: ", sessionId);

        if (storeSessionId === sessionId) {
            //  console.log('SessionId Match ', sessionId);
            return;
        } else {
            //  console.log('SessionId Mismatch');
            alert("Cannot login. Another session is active. Please retry after sometime. ");
            // console.log('you are logged out ');
            handleLogout();
        }

    };
    const SessionUpdate = () => {
        SessionTime.updateSessionTimeActiveUser(phoneNumber);
    }




    const [isOpenInternet, setisOpenInternet] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const closeInternet = () => {
        setisOpenInternet(false);
        // window.location.reload(); // This will reload the page
    };





    return (
        <>
        
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


            <div className='container'>
                <div>


                    <form className='formsection' onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className='lable' htmlFor="newPhoneNumber">New Phone Number</label>
                            <div className='input-container1'>

                                <input type='text'
                                    id="newPhoneNumber"
                                    placeholder='Enter Mobile Number'
                                    maxLength={10}
                                    className='form-control'
                                    // onInput={(e) => {
                                    //     e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Allow only numeric input
                                    // }}
                                    value={enteredPhoneNumberModal}
                                    onChange={handleChange}
                                    style={{ paddingLeft: '30px' }}

                                />
                                <i className="fas fa-phone"></i>

                            </div>
                            {errorphone && (
                                <div style={{ color: 'red' }}>{errorphone}</div>
                            )}

                            <div style={{ color: 'red' }}>{phoneError
                            }</div>

                            <span>Leave blank if don't want to change </span>
                        </div>


                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className='input-container1'>
                                <input
                                    //  type='text'
                                    // type={showPassword ? 'text' : 'password'}
                                    type={showPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    placeholder='Enter New Password'
                                    maxLength={20}
                                    autoComplete="new-passowrd"
                                    style={{ paddingLeft: '30px' }}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="password-toggle-button1"
                                >
                                    <FontAwesomeIcon
                                        icon={showPassword ? faEyeSlash : faEye}
                                        className="password-toggle-icon"
                                    />
                                </button>
                                <i class="fas fa-lock password-icon"></i>
                            </div>

                            <span>Minimum 8 characters, leave blank if don't want to change</span>
                        </div>


                        {/* 
<div className="form-group">
  <label htmlFor="newPassword">New Password</label>
  <div className='input-container1'>
    <div className="password-input-container">
      <input
          //  type='text'
          type={showPassword ? 'text' : 'password'}
          id="newPassword"
          placeholder='Enter New Password'
          maxLength={16}
          style={{ paddingLeft: '30px' }}
          autocomplete='new-password'
      />
      <i class="fas fa-lock password-icon"></i>
    </div>
    <button
        type="button"
        onClick={togglePasswordVisibility}
        className="password-toggle-button1"
    >
        <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="password-toggle-icon"
        />
    </button>
  </div>

  <span>Minimum 8 characters, leave blank if don't want to change</span>
</div>
 */}


                        <div>
                            <p style={{ color: 'blue', fontSize: '20px' }}>Note: Only the latest token is available. All pending tokens will be removed.</p>
                        </div>
                        <div style={{ color: 'red' }}>{error}</div>
                        <div style={{ marginLeft: '23%', marginTop: '20px' }}>
                            {/* Centered button */}
                            <button type="submit" className="btn btn-primary">Generate Token</button>
                        </div>
                    </form>

                </div>

            </div>

            {/* Modal */}
            <Modal show={showModal} onHide={handleClose} centered backdrop="static">
                {/* <Modal.Header closeButton>
                    
                </Modal.Header> */}
                <Modal.Body>
                    {message && (
                        <p style={{ color: 'red' }}>{message} {phonenumberlist}</p>
                    )}
                    {!message && (
                        <div>
                            {/* Display new phone number and password */}
                            {enteredPhoneNumberModal && !enteredPasswordModal && (
                                <p>Your New Number is: {enteredPhoneNumberModal}</p>
                            )}

                            {!enteredPhoneNumberModal && enteredPasswordModal && (
                                <p>Your New Password is: {enteredPasswordModal}</p>
                            )}

                            {enteredPhoneNumberModal && enteredPasswordModal && (
                                <p>Your New Number: {enteredPhoneNumberModal}<br />Your New Password: {enteredPasswordModal}</p>
                            )}
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        NO
                    </Button>
                    {/* Conditionally render the button based on your requirements */}


                    <Button variant="primary" onClick={handleModalSubmit}>
                        YES
                    </Button>
                </Modal.Footer>
            </Modal>



            <Modal show={isOpenInternet} onHide={closeInternet} backdrop="static" style={{ marginTop: '3%', pointerEvents: loading ? 'none' : 'auto' }}>
                {/* <Modal.Header closeButton>
      </Modal.Header>  */}
                <Modal.Body>
                    <p> {modalMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={closeInternet}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>


        </>
    )
}

export default Phonepasswordchange 