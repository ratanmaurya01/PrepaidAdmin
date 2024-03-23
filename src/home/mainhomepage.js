import React, { useState, useEffect } from 'react'
import Homelogo from '../Images/homelogo.png'
import Navbar from '../adminLogin/navbar';
import Login from '../adminLogin/login';
import { NavLink, useNavigate } from 'react-router-dom';
import './footer.css'

import { auth } from '../adminLogin/firebase'

function Mainhomepage() {

    const [user, setUser] = useState(null);
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                // User is signed in
                setUser(authUser); // Set the user state
                const number = authUser.email.split('@')[0];
                console.log("user number is ", number);
            } else {
                setUser(null); // Set the user state to null when signed out
            }
        });
        // Clean-up function to unsubscribe from the listener when the component unmounts
        return () => unsubscribe();
    }, []);

    return (
        <>
            {/* 
            <div>
                <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
                    <div className="container-fluid">
                        <NavLink className="navbar-brand" to="/">
                            <img src={Homelogo} style={{ width: '20%', }} alt='homepage_logo' />
                        </NavLink>
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                         aria-controls="navbarSupportedContent" 
                         aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse d-flex justify-content-between" >
                            <ul className="navbar-nav " style={{ marginRight: '50px' }}>
                                <li className="nav-item">
                                    <NavLink to="/homepagelogin" className="nav-link">Home  </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink to="" className="nav-link">About</NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="" className="nav-link">Contact</NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink to="/login" className=" btn btn-outline-primary nav-link" >Login</NavLink>
                                </li>

                            </ul>
                            <form className="form-inline my-2 my-lg-0">
                            </form>
                        </div>
                    </div>
                </nav>
            </div> */}

        

{/* <div className="navbar">
      <div className="logo">
     
      </div>
      <ul className="nav-links">
        <li className="menu"><a href="#">Home</a></li>
        <li className="menu"><a href="#">About</a></li>
        <li className="menu"><a href="#">Services</a></li>
        <li className="menu"><a href="#">Contact</a></li>
      </ul>
    </div> */}




<div className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
  <div className="container-fluid">
  
    <div className="topnav" id="navbarSupportedContent">
      <ul className="navbar-nav ml-auto d-flex flex-row">

        <NavLink className="nav-items" to="/">
          <img src={Homelogo} className="logo" alt='homepage_logo' />
        </NavLink>

        <li className="nav-items">
          <NavLink to="/" activeClassName="active" className="nav-link">Home</NavLink>
        </li>
        <li className="nav-items">
          <NavLink to="" className="nav-link">About</NavLink>
        </li>
        <li className="nav-items">
          <NavLink to="" className="nav-link">Contact</NavLink>
        </li>
        <li className="nav-items">
          <NavLink to="/login" className="btn btn-outline-primary">Login</NavLink>
        </li>
      </ul>
    </div>
  </div>
</div>


         {user && (
                <div>
                    <Navbar />
                </div>
            )}  
            
        </>
    )
}

export default Mainhomepage
