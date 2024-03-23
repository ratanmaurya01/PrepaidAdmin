import React, { useState, useEffect } from 'react'
import Mainhomepage from './mainhomepage'
import Login from '../adminLogin/login';

import image from '../Images/homepage/Images1.jpeg';
import Home from '../Images/homepage/Home.png';
import Meter2 from '../Images/homepage/Meter2.jpeg';
import Profile from '../Images/homepage/Profile.png';
import Clients from '../Images/homepage/Clients.png';
import Footer from './footer'
import CommonFuctions from '../commonfunction';



function Homepagelogin () {
   
  const internet = new CommonFuctions();
  const [isInternetAvailable, setIsInternetAvailable] = useState(true);

     ///const status =  internet.checkInternetConnection(); // Call the function
  useEffect(() => {
   
    const checkInternet = async () => {
      const status = await internet.checkInternetConnection();
      setIsInternetAvailable(status);
    };

    checkInternet();

    // Cleanup function (optional)
    return () => {
      // Perform cleanup if needed
    };
  }, []); // Empty dependency array to run effect only once on mount

 


  return (
    <>
      <div>
        <Mainhomepage />
      </div>
  

<div>
      
      </div>


      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <img
          style={{ width: '100%', height: '700px' }}
          src={Home}
          alt="My Image"
        />

      </div>

      <div>
        <img
          style={{ width: '100%' }}
          src={Profile}
          alt="My Image"
        />
      </div>




      <div>
        <img
          style={{ width: '100%' }}
          src={Clients}
          alt="My Image"
        />
      </div>


      <div>
        <Footer />
      </div>


    </>



  )
}

export default Homepagelogin
