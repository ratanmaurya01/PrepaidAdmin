
import React, { useState , useEffect} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import Mainhomepage from '../home/mainhomepage';
import Homelogo from '../Images/homelogo.png'
import './navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { ref, set, get, child, getDatabase, onValue } from 'firebase/database';
import '../home/footer.css'

import { Dropdown } from 'react-bootstrap'; // import Dropdown from react-bootstrap
import CommonFuctions  from '../commonfunction';


function Nav() {

  const sessiontime = new CommonFuctions();

  const [user, setUser] = useState(null); // State to hold user information
  const [name, setName] = useState('');
  const [sessionTime, setSessionTime]= useState('');
  const [phoneNumber , setPhoneNumber ] = useState("");

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
              fetchEmailFromFirebase(number);
           
             //   fetchSessionFromFirebase(number);
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



const fetchEmailFromFirebase = (storedPhoneNumber) => {
  const db = getDatabase();
  const adminRootReference = ref(db, `adminRootReference/adminDetails/${storedPhoneNumber}/adminProfile`);
  onValue(adminRootReference, (snapshot) => {
      const data = snapshot.val();
      if (data) {
         
          setName(data.name === 'null' ? '' : data.name || '');
          // Set other state variables similarly for other fields
          // setLoading(false);
      } else {
          //  console.log("Data not found in Firebase.");
          // setLoading(false);
      }
  });
};


// const fetchSessionFromFirebase = (adminPhoneNumber) => {
//   const db = getDatabase();
//   const adminRootReference = ref(db, `adminRootReference/adminDetails/${adminPhoneNumber}/sessionData`);
//   onValue(adminRootReference, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
         
//         setSessionTime(data.sessionId);
//          console.log ('Session time :', data.sessionId);
//        // Check if session time is within one minute
//        const currentTime = Date.now();
//        if (currentTime - data.sessionId <= 60000) {
//          // Session time is within one minute
//          console.log('User will be logged out after 1 minute');
//          handleLogout();
//        }
         
//      } else {
//          console.log("Data not found in Firebase.");
//      }
//   });
// };


  const history = useNavigate();
  const handleLogout = () => {
    auth.signOut().then(() => {
      // Redirect to login page after successful logout
      history('/homepagelogin'); // Change '/login' to your login page route
    }).catch((error) => {
      // Handle any errors during logout
      console.error('Error logging out:', error.message);
    })

  }

  const validateSessionId =()=>{

    const sessionId = localStorage.getItem('sessionId');
    console.log('Retrieved sessionId:', sessionId);

  }
  
  return (
    <>






<div className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
  <div className="container-fluid">
  
    <div className="topnav" id="navbarSupportedContent">
      <ul className="navbar-nav ml-auto d-flex flex-row">

        <NavLink className="nav-items" to="/homepagelogin">
          <img src={Homelogo} className="logo" alt='homepage_logo' />
        </NavLink>

        <li className="nav-items">
          <NavLink to="/homepagelogin" className="nav-link">Home</NavLink>
        </li>
        <li className="nav-items">
          <NavLink to="" className="nav-link">About</NavLink>
        </li>
        <li className="nav-items">
          <NavLink to="" className="nav-link">Contact</NavLink>
        </li>
       
        <ul className="navbar-nav ml-auto">
          
          <li className="nav-items">
            <button onClick={handleLogout} className="btn btn-outline-primary">Logout</button>
          </li>


          <li className="nav-items" >
            <h6 style={{marginTop:'10px' ,}}>{name}</h6>
          </li>


        </ul>
      </ul>
    </div>
  </div>
</div>



{/* <div>
    <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/homepagelogin">
          <img src={Homelogo} style={{ width: '20%' }} alt='homepage_logo' />
        </NavLink>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink to="/homepagelogin" className="nav-link">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="" className="nav-link">About</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="" className="nav-link">Contact</NavLink>
            </li>
          </ul>
          <ul className="navbar-nav ml-auto">
          
            <li className="nav-item">
              <button onClick={handleLogout} className="btn btn-outline-primary">Logout</button>
            </li>


            <li className="nav-item" >
              <h6 style={{marginTop:'10px' ,}}>{name}</h6>
            </li>


          </ul>
        </div>
      </div>
    </nav>
    </div> */}
    

    
{/*    
    <div>
  <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
    <div className="container-fluid">
      <NavLink className="navbar-brand" to="/homepagelogin">
        <img src={Homelogo} style={{ width: '20%' }} alt='homepage_logo' />
      </NavLink>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse d-flex justify-content-between">
        <ul className="navbar-nav">
       
            <li className="nav-item">
            <NavLink to="/homepagelogin" className="nav-link">Home</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="" className="nav-link">About</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="" className="nav-link">Contact</NavLink>
          </li>
          <li className="nav-item">
            <button onClick={handleLogout} className="btn btn-outline-primary">Logout</button>
          </li>
        </ul>
          
        <h5 >{name}</h5>
      </div>
    </div>
  </nav>
</div> */}


    </>
  )
}

export default Nav
