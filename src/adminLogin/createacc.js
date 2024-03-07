// CreateAccount.js
import React, { useState } from 'react';
import {auth} from './firebase'; // Import the 'auth' object from the Firebase initialization file
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import the 'createUserWithEmailAndPassword' function


const Createacc = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User signed up successfully
        const user = userCredential.user;
        console.log('User signed up:', user);
        // Additional actions after signup
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // Handle errors here
        setError(errorMessage);
        console.error('Error creating user:', errorCode, errorMessage);
      });
  };

  return (
    <div>
      <h2>Create User Account</h2>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleSignUp}>Sign Up</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Createacc;
