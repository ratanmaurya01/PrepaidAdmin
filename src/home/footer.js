
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import './footer.css'

function Footer() {
    const [email, setEmail] = useState('');

    const handleNameChange = (event) => {

        const email = event.target.value;
        setEmail(email);

    }

    const handleSendmemail = () => {
        console.log('Enter your email', email);

        if (!email === '') {

            alert("Enter Email");
        }
    }
    return (
        <>


            <footer className="page-footer font-small blue pt-4">
                <div className="container-fluid text-center text-md-left">
                    <div className="row">
                        <div className="col-md-4 mt-md-0 mt-3">
                            <div className="row">
                                <div className="col-12">
                                    <h5 className="text-uppercase">MAXWELL INDIA</h5>
                                    <p>Maxwell India operates maxwellcart.com.</p>
                                    <p>We are Authorized Distributor for Bauerfeind products in India.</p>
                                    <p>E-3, M-1, Mezzanine Floor, Jagdamba Tower, <br /> Amrapali Circle, Vaishali Nagar, Jaipur-302021</p>
                                    <p>Any help/queries, Contact us at:support@maxwelljaipur.com</p>
                                    <p>Toll Free No.: 1800 102 1480</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-md-0 mt-3">
                            <div className="row">
                                <div className="col-12">
                                    <h5 className="text-uppercase">MAXWELLCART.COM</h5>
                                    <p><a href='https://www.maxwelljaipur.com/ ' target='maxwell india ' >Mawell India</a></p>
                                    <p><a href='' target='maxwell india ' >About Us</a></p>
                                    <p><a href='' target='maxwell india ' >Privacy Policy</a></p>
                                    <p><a href='' target='maxwell india ' >Terms and Conditions</a></p>
                                    <p><a href='' target='maxwell india ' >Contact Us</a></p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mt-md-0 mt-3">
                            <div className="row">
                                <div className="col-12">
                                    <h5 className="text-uppercase">SUBSCRIBE TO OUR NEWSLETTER</h5>
                                    <p>Promotions, new products and sales. <br /> <span>Directly to your inbox.</span></p>
                                    <div className="input-group">
                                        <input type="email" 
                                        className="form-control sm placeholder-blue "
                                         placeholder="Your email" 
                                         aria-label="Enter your email"
                                          aria-describedby="button-addon2"
                                           value={email} 
                                           onChange={handleNameChange} />

                                        
                                        <div className="input-group-append" 
                                        onClick={handleSendmemail}>
                                            <button className="btn btn-outline-secondary" type="button" id="button-addon2">
                                                <FontAwesomeIcon icon={faPaperPlane} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-copyright text-center py-3">
                    <p>© 2024, Maxwell India</p>
                </div>
            </footer>




            {/* <footer className="page-footer font-small blue pt-4">
                <div className="container-fluid text-center text-md-left">
                    <div className="row">


                        <div className="col-md-6 mt-md-0 mt-3 " >
                            <h5 style={{ marginLeft: '-10px' }} className="text-uppercase">MAXWELL INDIA</h5>
                            <p>Maxwell India operates maxwellcart.com.</p>

                            <p>We are Authorized Distributor for Bauerfeind products in India.</p>
                            <p>E-3, M-1, Mezzanine Floor, Jagdamba Tower, <br /> Amrapali Circle, Vaishali Nagar, Jaipur-302021</p>
                            <p>
                                Any help/queries, Contact us at:support@maxwelljaipur.com
                            </p>
                            <p> Toll Free No.: 1800 102 1480
                            </p>
                        </div>

                        <hr className="clearfix w-25 d-md-none pb-3" />


                        <div className="col-md-3 mb-md-0 mb-3">
                            <h5 className="text-uppercase">MAXWELLCART.COM</h5>

                            <p >
                                <a href='https://www.maxwelljaipur.com/ ' target='maxwell india ' >Mawell India</a>
                            </p>
                            <p>
                                <a href='https://www.maxwelljaipur.com/ ' target='maxwell india ' >About Us</a>
                            </p>
                            <p>
                                <a href='https://www.maxwelljaipur.com/ ' target='maxwell india ' >Privacy Policy</a>
                            </p>

                            <p>
                                <a href='https://www.maxwelljaipur.com/ ' target='maxwell india ' >Terms and Conditions</a>
                            </p>


                            <p>
                                <a href='https://www.maxwelljaipur.com/ ' target='maxwell india ' > Contact Us
                                </a>
                            </p>

                        </div>



                        <div className="col-md-3 mb-md-0 mb-3  " >
                            <h5 className="text-uppercase">SUBSCRIBE TO OUR NEWSLETTER</h5>
                            <p>Promotions, new products and sales. <br /> <span>Directly to your inbox.</span></p>
                            <div className="input-group mb-3">
                                <input type="email"
                                    className="form-control placeholder-blue"
                                    placeholder="Your email"
                                    aria-label="Enter your email"
                                    aria-describedby="button-addon2"
                                    value={email}
                                    onChange={handleNameChange}
                                />
                                <div className="input-group-append" onClick={handleSendmemail}>
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        id="button-addon2">

                                        <FontAwesomeIcon icon={faPaperPlane} />
                                    </button>
                                </div>
                            </div>
                        </div>




                    </div>
                </div>


                <div className="footer-copyright text-center py-3">
                    <p>
                        © 2024 , Maxwell India
                    </p>
                </div>
            </footer> */}


        </>
    )
}

export default Footer
