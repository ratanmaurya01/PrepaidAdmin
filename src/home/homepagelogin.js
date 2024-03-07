import React from 'react'
import Mainhomepage from './mainhomepage'
import Login from '../adminLogin/login';

import image from '../Images/homepage/Images1.jpeg';
import Home from '../Images/homepage/Home.png';
import Meter2 from '../Images/homepage/Meter2.jpeg';
import Profile from '../Images/homepage/Profile.png';
import Clients from '../Images/homepage/Clients.png';
import Footer from './footer'


function Homepagelogin() {
  return (
    <>
      <div>
        <Mainhomepage />
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
