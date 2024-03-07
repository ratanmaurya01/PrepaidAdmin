import React from 'react';
// ... rest of your code
import { useState } from 'react';
import { auth } from './firebase';
import { useNavigate, NavLink } from 'react-router-dom';
import './login.css';


const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      // Signed in
      const user = userCredential.user;
      console.log('Signed up user:', user);
      navigate('/login');
    } catch (error) {
      setError(error.message); // Set error message in state
      console.error('Error signing up:', error.code, error.message);
      // Handle error appropriately
    }
  };
  
  return (
   <div className='containers'>
      <form className='formgroup' onSubmit={onSubmit}>
        <div>
          <label htmlFor="email-address">Email address</label>
          <input
            type="email"
            value={email}
            className='form-control'
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            value={password}
            className='form-control'
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
        </div>
        <div className='d-grid col-5' >
          <button className='btn btn-primary  ' type="submit">
            Sign up
          </button>
        </div>
      </form>
      {error && <p>{error}</p>}

     <div style={{marginLeft:'55%'}}>
     <p>
        Already have an account?{' '}
        <NavLink to="/">
          Sign in
        </NavLink>
      </p>
     </div>
    </div>
  );
};

export default Signup;
