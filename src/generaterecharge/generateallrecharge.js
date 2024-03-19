import '../adminLogin/login.css';
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { auth } from '../adminLogin/firebase';
import Navbar from '../adminLogin/navbar';
import Singlemeter from './singlemeter';
import Adin from '../admin';
import './generete.css';
import { useNavigate } from 'react-router-dom';


import CommonFuctions from '../commonfunction';


function Generaterecharge() {

  
  const Sessionid = new CommonFuctions();
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [user, setUser] = useState(null);

  const [activeSinglemeter, setActiveSinglemeter] = useState(false);
  const [activeAdin, setActiveAdin] = useState(false);

  useEffect(() => {
    document.title = "Generate Recharge Token"; // Set the title when the component mounts

  }, []);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is logged in
        setUser(authUser);
        //  console.log("Logged in user:", authUser.email);
        const emailParts = authUser.email.split('@'); // Split email by '@'
        if (emailParts.length === 2) {
          const number = emailParts[0]; // Get the part before '@'
          //  console.log("Extracted number:", number);
           setPhoneNumber(number); // Set extracted number in state
           SessionValidate(number);
           updateSessionActiveTime(number);
          // fetchEmailFromFirebase(number);
        }
      } else {
        // No user is logged in, you can redirect to another page or handle accordingly
        setUser(null);
        // Example: Redirect to another page
        window.location.href = '/'; // Redirect to your login page
      }
    });

    return () => unsubscribe(); // Cleanup function for unmounting
  }, []);


  const handleSidebarItemClick =async (componentName) => {
    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await Sessionid.HandleValidatSessiontime(phoneNumber);
    if (storeSessionId === sessionId) {

      Sessionid.updateSessionTimeActiveUser(phoneNumber);



    // Toggle the state for the clicked component and reset others to false
    setActiveSinglemeter(componentName === 'Singlemeter');
    setActiveAdin(componentName === 'Adin');
  
  } else {
           
    alert("You have been logged-out due to log-in from another device.");
   // console.log('you are logg out ');
   handleLogout();
}



  };



  const handleHomeButtonClick = async () => {

    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await Sessionid.HandleValidatSessiontime(phoneNumber);
    if (storeSessionId === sessionId) {

      Sessionid.updateSessionTimeActiveUser(phoneNumber);


    // Reset both states when the Home button is clicked
    setActiveSinglemeter(false);
    setActiveAdin(false);

  } else {
           
    alert("You have been logged-out due to log-in from another device.");
   // console.log('you are logg out ');
   handleLogout();
}




  };



  const updateSessionActiveTime = (number) => {
    Sessionid.updateSessionTimeActiveUser(number);
}

const SessionValidate = async (number) => {
    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await Sessionid.HandleValidatSessiontime(number);
    if (storeSessionId === sessionId) {
       // console.log('SessionId Match ');
    } else {
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
 
      <div>

        <div className="sidebar h-100" style={{marginTop:'5%' , width: '20%'}}>

          <div className='sidebarname'>
            {/* <h3 onClick={handleHomeButtonClick} style={{cursor:'pointer'}} className='home-button'>
              Home
            </h3> */}
          </div>
          <div className='sidebarname'>
            <p 
            style={{fontSize:'18px'}}
              className='paragraph'
              onClick={() => handleSidebarItemClick('Singlemeter')}
            >
              Generate Recharge Token for Single Meter 
            </p>
          </div>

          <div className='sidebarname'>
            <p
              className='paragraph'
              style={{fontSize:'18px'}}

              onClick={() => handleSidebarItemClick('Adin')}
            >
              Generate Recharge Token for Pending Request(s) 
            </p>
          </div>
          
          {/* Add the "Home" button */}

        </div>

        <div className='container'>
          <div style={{ marginTop: '8%' }}>
            {/* Render Singlemeter only when it's the active component */}
            {activeSinglemeter && <Singlemeter />}
          </div>
          <div>
            {/* Render Adin only when it's the active component */}
            {activeAdin && <Adin />}
          </div>
          {/* Render the main screen content when an option is not selected */}
          {!activeSinglemeter && !activeAdin && <div>


            <div>    <Adin /> </div>




          </div>
          }
        </div>
      </div>
    </>

  )
}

export default Generaterecharge