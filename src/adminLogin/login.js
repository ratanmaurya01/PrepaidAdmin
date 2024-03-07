import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, updateProfile, fetchSignInMethodsForEmail } from "firebase/auth";
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import './login.css';
import Avatar from './avatar';
import Navbar from './navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import phoneicon from '../Images/logo/phoneIcon1.png'
import '../testapp/test.css';


import Mainhomepage from '../home/mainhomepage';




const Login = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Placing useLocation here
  const { state } = location;

  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);





  useEffect(() => {
    if (state && state.password && state.localphoneNumber) {
      // Set the password and localphoneNumber received from state
      setPassword(state.password);
      setPhoneNumber(state.localphoneNumber);
    }
  }, [state]);

  const onLogin = async (e) => {

    e.preventDefault();
    if (!phoneNumber) {
      setPhoneNumberError('Enter valid mobile number');
      return;
    }
    if (phoneNumber.length !== 10) {
      setPhoneNumberError('Enter valid mobile number.');
      return;
    }
    if (!password) {
      setPasswordError('Enter valid Password');
      return;
    }
    if (password.length < 8) {

      setPasswordError('Enter valid Password');
      return;
    }
    setIsLoading(true); // Set loading to true when starting authentication
    try {
      const auth = getAuth();
      const email = `${phoneNumber}@gmail.com`; // Convert phone number to custom email format

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Optionally, you can update the user's profile with their phone number
      await updateProfile(user, { displayName: phoneNumber });
      console.log('Logged user:', user);
      navigate("/verifyphone", { state: { phoneNumber } });
    } catch (error) {

      // if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      //   // Handle the case when the phone number does not match with Firebase or when the password is incorrect
      //   setError("Account does not exist with this mobile number.");
      //   return;
      // }

        if (error.code === "auth/user-not-found") {
       // Handle the case when the phone number does not match with Firebase or when the password is incorrect
         setError("Account does not exist with this mobile number.");
         return;
       }

      if (error.code === "auth/wrong-password"){
        setError("Incorrect Password.");
        return;
      }

      setError(error.message);
      console.error('Error signing in:', error.code, error.message);

      // setError(error.message);
      // console.error('Error signing in:', error.code, error.message);
    } finally {
      setIsLoading(false); // Set loading back to false when the process ends
    }
  };


  const handlePhoneNumberChange = (e) => {

    setError('');

    setPhoneNumberError('');

    let input = e.target.value.replace(/\D/, '').slice(0, 10); // Remove non-digit characters and limit length to 10 digits

    if (input.length > 0 && input.charAt(0) === '0') {
      input = input.slice(1);
    }
    if (input === '0') {

      setError('Phone number cannot be 0');

    } else {
      setPhoneNumber(input);
      setError(null);
    }
  };
  const handlechangePassword = (input) => {
    setError('');

    setPasswordError('');
    setPassword(input);
  }


  const handleForgotPassword = async () => {
    setError('');
    if (phoneNumber.trim() !== '') {
      try {
        const auth = getAuth();
        const email = `${phoneNumber}@gmail.com`;
        // Check if the user exists for the provided email (constructed from phone number)
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
          // User exists, navigate to the forgetpassword page
          navigate("/forgetpassword", { state: { phoneNumber } });
        } else {
          // User does not exist, show error message
          setError('User does not exist. Please create an account.');
        }
      } catch (error) {
        alert('Error checking user existence. Please try again later.');
        console.error('Error checking user existence:', error);
      }
    } else {
      alert('Please enter your phone number');
    }
  };


  const handleChangePassword = (value) => {
    setPassword(value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div>


        <Mainhomepage />

      </div>
      <div>
        {isLoading && <p style={{ marginLeft: '10%' }}
          className="spinner-border text-danger" role="status"></p>}
      </div>

      <div className="containerpage" id="container">
        <div className="form-container log-in-container">
          <form action="#">
            <h2>Login Account </h2>
            {/* <input type="email" placeholder="Email" /> */}
            <div style={{ margin: '15px' }}>
              <p className='paragrap' htmlFor="phoneNumber">Phone Number</p>
              <div className="input-container1">
                <input
                  type="text"
                  value={phoneNumber}
                  className='form-control'
                  onChange={handlePhoneNumberChange}
                  maxLength={10}
                  placeholder=" Phone Number"
                  style={{ paddingLeft: '30px' }}
                // style={{ opacity:'.3'}}
                />
                <i class="fas fa-phone"></i>
                {/* <img className="fas fa-phone"
                src={phoneicon}
                alt='PHone Number Icon'
              /> */}
              </div>
              <span style={{ color: 'red' }}>{phoneNumberError}</span>
            </div>

            {/* <br></br> */}
            {/* <input type="password" placeholder="Password" /> */}

            <div style={{ margin: '15px' }}>
              <p className='paragrappassword' htmlFor="password">Password</p>
              <div class="input-container1">
                {/* <input
                  // type="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  className='form-control'
                  onChange={(e) => handlechangePassword(e.target.value)}
                  maxLength={18}
                  placeholder="Password"
                  style={{ paddingLeft: '30px' }}
                /> */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  className='form-control'
                  onChange={(e) => handlechangePassword(e.target.value)}
                  maxLength={18}
                  placeholder="Password"
                  style={{ paddingLeft: '30px' }}
                  autocomplete="current-password" // Add this line
                />

                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle-button"
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}

                    className='password-toggle-button-eye-icon'
                  // style={{ color: 'gray' }} // Change the color value as needed

                  />
                </button>

                <i className="fas fa-lock password-icon"></i>

              </div>

              <span style={{ color: 'red' }}>{passwordError}</span>
            </div>
            <div>
              <p style={{ color: 'Red' }}>{error}</p>
            </div>
            <div className="">
              <button className='btn btn-primary button' onClick={onLogin}>Sign In</button>
            </div>

            <p style={{ cursor: 'pointer', color: 'blue', margin: '10px' }} onClick={handleForgotPassword}>
              Forgot Password ?
            </p>


            {/* <p style={{ color: 'blue' }}>If Already create an account </p> */}
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-right">

              {/* <h5>Welcome To </h5>
              <h3>MIJ Prepaind Meter</h3>
              <div style={{}}>
                <NavLink to="/createaccount">
                  <button className='createbutton'>CREATE ACCOUNT </button>
                </NavLink>
                <p>Don't have an account ?</p>
              </div> */}

              <div className="flex-container">
                <div className="welcome-text">
                  <h3>Welcome To Maxwell</h3>
                  <h5>Prepaid Energy Meter System</h5>
                </div>
                <div className="button-container">
                  <p style={{ margin: '-1px' }}>Don't have an account ?</p>
                  <NavLink to="/createaccount">
                    <button className='createbutton'>CREATE ACCOUNT</button>
                  </NavLink>
                  {/* <p>Don't have an account ?</p> */}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>



    </>
  );
};

export default Login;
