import '../adminLogin/login.css';
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { auth } from '../adminLogin/firebase';
import Navbar from '../adminLogin/navbar';
import Singlemeter from './singlemeter';
import Adin from '../admin';
import './generete.css';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';


import CommonFuctions from '../commonfunction';


function Generaterecharge() {


  const Sessionid = new CommonFuctions();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [user, setUser] = useState(null);

  const [activeSinglemeter, setActiveSinglemeter] = useState(false);
  const [activeAdin, setActiveAdin] = useState(false);


  const [onlineStatus, setOnlineStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');



  // useEffect(() => {
  //   const checkInter = async () => {
  //     const result = await Sessionid.isCheckInterNet();
  //     setOnlineStatus(result);
  //     //  If no internet and already loading, automatically switch to show no internet after 5 seconds
  //     if (!result && loading) {
  //       setTimeout(() => {
  //         setLoading(false);
  //       }, 5000); // 5 seconds
  //     }
  //   };
  //   // Call checkInter function initially
  //   checkInter();
  //   // Set up an interval to check internet status periodically
  //   const interval = setInterval(checkInter, 5000); // Check every 5 seconds
  //   // Clean up interval on component unmount
  //   return () => clearInterval(interval);
  // }, [loading]); // Include loading in dependencies array to listen for its changes



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


  const handleSidebarItemClick = async (componentName) => {

    setLoading(true);


    const status = await Sessionid.checkInternetConnection(); // Call the function
    if (status === 'Poor connection.') {
      setIsDialogOpen(true);
      setModalMessage('No/Poor Internet connection. Cannot access server.');
      setLoading(false);
      return;
    }


    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await Sessionid.HandleValidatSessiontime(phoneNumber);
    if (storeSessionId === sessionId) {

      Sessionid.updateSessionTimeActiveUser(phoneNumber);



      // Toggle the state for the clicked component and reset others to false
      setActiveSinglemeter(componentName === 'Singlemeter');
      setLoading(false);

      setActiveAdin(componentName === 'Adin');

      setLoading(false);

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




  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    // window.location.reload(); // This will reload the page
  };



  return (

    <>

      <div>
        <Navbar />
      </div>
      {/* 
      {onlineStatus !== null && onlineStatus === false ? (
        <div style={{ textAlign: 'center', marginTop: '20%' }}>
        
          <h3>No Internet Connection</h3>
        </div>
      ) : ( */}



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


      <div>

        <div className="sidebar h-100" style={{ marginTop: '5%', width: '20%' }}>

          <div className='sidebarname'>
            {/* <h3 onClick={handleHomeButtonClick} style={{cursor:'pointer'}} className='home-button'>
              Home
            </h3> */}
          </div>
          <div className='sidebarname'>
            <p
              style={{ fontSize: '18px' }}
              className='paragraph'
              onClick={() => handleSidebarItemClick('Singlemeter')}
            >
              Generate Recharge Token for Single Meter
            </p>
          </div>

          <div className='sidebarname'>
            <p
              className='paragraph'
              style={{ fontSize: '18px' }}

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
      {/* )} */}



      <Modal show={isDialogOpen} onHide={closeDialog} backdrop="static" style={{ marginTop: '3%', pointerEvents: loading ? 'none' : 'auto' }}>
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

export default Generaterecharge