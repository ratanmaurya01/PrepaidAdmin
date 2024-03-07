import React, { useEffect, useState } from 'react';
import { auth } from './firebase'; // Ensure this import corresponds to your Firebase setup
import Navbar from './navbar';
import { useNavigate } from 'react-router-dom';

import CommonFuctions from '../commonfunction';


function Welcome() {
  const sessiontime = new CommonFuctions();
  const history = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userNumber, setUserNumber] = useState('');

  useEffect(() => {
    document.title = "Home"; // Set the title when the component mounts

  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is signed in
        setUser(authUser); // Set the user state
        setLoading(false); // Set loading to false when data is fetched
        // console.log("User is logged in");
        // Handle signed-in user
        const number = authUser.email.split('@')[0];
        setUserNumber(number); // Set user number in the local state
       // SessionValidate(number);
        //  console.log("user number is ", number);
      } else {
        // User is signed out
        //  console.log("User is logged out");
        setUser(null); // Set the user state to null when signed out
        setLoading(false); // Set loading to false when data is fetched
        // Handle signed-out user
        setUserNumber(''); // Set user number to empty when user is logged out
      }
    });
    // Clean-up function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []);


  //   const sessionId = localStorage.getItem('sessionId');
  // console.log('Retrieved sessionId:', sessionId);


  const handleLogout = () => {
    auth.signOut().then(() => {
      // Redirect to login page after successful logout
      history('/'); // Change '/login' to your login page route
    }).catch((error) => {
      // Handle any errors during logout
      console.error('Error logging out:', error.message);
    });
  };


  // const SessionValidate = async (PhoneNumber) => {
  //   const storeSessionId = localStorage.getItem('sessionId');
  //   const { sessionId } = await sessiontime.HandleValidatSessiontime(PhoneNumber);
  //   if (storeSessionId === sessionId) {
  //     console.log('SessionId Match ');
  //   } else {
  //     alert("Cannot login. Another session is active. Please retry after sometime. ");
  //     console.log('you are logg out ');
  //     handleLogout();
  //   }
  // };



  if (loading) {
    return <h3 style={{ marginTop: '3%', marginLeft: '10%' }}>Loading...</h3>; // Display a loading message or spinner while data is being fetched
  }


  return (
    <>
      {user ? (
        <>
          <div >
            <Navbar />
            {/* <button className='btn btn-outline-primary' onClick={handleLogout}>Logout</button> */}
          </div>
          {/* <div style={{ marginTop: '10%', marginLeft: "5%" }}>
            {userNumber && <h4>User Number: {userNumber}</h4>}
          </div> */}
        </>
      ) : (
        <div>
          <h1>Please login</h1>
        </div>
      )}
    </>
  );
}

export default Welcome;
