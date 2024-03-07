import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import Mainhomepage from '../home/mainhomepage';
import Homelogo from '../Images/homelogo.png'
import './navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import Nav from './nav'

function Navbar() {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };




  return (
    <>

      <>


        {/* Your First  navbar */}

        <div>
          <Nav />
        </div>

        {/* Your Second   navbar */}

        <div>

          <nav className="navbar fixed-top navbar-expand-lg navbar-light" style={{ backgroundColor: '#e3f2fd', marginTop: '3%' }}>
            <div className="container-fluid">
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" style={{ color: '#FF0000' }}></span> {/* Use the style attribute */}
              </button>
              <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  <li className="nav-item">
                    <NavLink to="/admindetail" className="nav-link" activeClassName="active">Admin Details</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/test" className="nav-link" activeClassName="active">Consumer Details</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/reconfigtoken" className="nav-link" activeClassName="active">Generate Re-Configuration Token</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/generateallrecharge" className="nav-link" activeClassName="active">Generate Recharge Token</NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink to="/groupmeter" className="nav-link" activeClassName="active">Meter Details on Server</NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>


        {/* <div>
    <nav className="navbar fixed-top navbar-expand-lg navbar-light " style={{ backgroundColor: '#e3f2fd'  , marginTop:'3%' }} data-mdb-theme="light">
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="lini-nav-items">
              <NavLink to="/admindetail" className="nav-link nav-link-with-line">Admin Details</NavLink>
            </li>
            <li className="lini-nav-items">
              <NavLink to="/test" className="nav-link nav-link-with-line">Consumer Details</NavLink>
            </li>
            <li className="lini-nav-items">
              <NavLink to="/reconfigtoken" className="nav-link nav-link-with-line"> Generate Re-Configuration Token</NavLink>
            </li>
            <li className="lini-nav-items">
              <NavLink to="/generateallrecharge" className="nav-link nav-link-with-line">Generate Recharge Token</NavLink>
            </li>
            <li className="">
              <NavLink to="/groupmeter" className="nav-link nav-link-with-line">Meter Details on Server</NavLink>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  </div>
 */}


      </>















      {/* <div>
     <Mainhomepage/>
     </div> */}

      {/* <nav className="navbar navbar-expand-lg navbar-light" style={{ backgroundColor: '#e3f2fd' }} data-mdb-theme="light">
        <div className="container-fluid">
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              
              <li className="nav-item"> 
                <NavLink to="/admindetail" className="nav-link nav-link-with-line">Admin Details</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/test" className="nav-link nav-link-with-line">Consumer Details</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/reconfigtoken" className="nav-link nav-link-with-line">Re-Configuration Token</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/generateallrecharge" className="nav-link">Generate Recharge Token</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/groupmeter" className="nav-link">Meter Details on Server</NavLink>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="btn btn-outline-primary sm">Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav> */}


      {/* <nav   >
        <ul>
          <li><NavLink exact to="/welcome" className="NavLink-text">Home</NavLink></li>
          <li><NavLink to="/admindetail" className="nav-link">Admin Details</NavLink></li>
          <li><NavLink to="/test" className="nav-link">Consumer Details</NavLink></li>
         
          <li><NavLink to="/generateallrecharge" className="nav-link">Generate Recharge Token</NavLink></li>
          <li><NavLink to="/groupmeter" className="nav-link">Meter Details on Server</NavLink></li>
          <li><button onClick={handleLogout} className="btn btn-outline-primary">Logout</button></li>
        </ul>
      </nav> */}
    </>
  );
}

export default Navbar;
