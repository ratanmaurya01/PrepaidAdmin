import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './login.css';
import Avatar from './avatar'
import { validateSerialNumber, validateCodeNumber } from './validation';
import  metericon  from '../Images/logo/meter_icon.png'
import metercodeicon from '../Images/logo/meter_code.png'

import Mainhomepage from '../home/mainhomepage'


function Createaccount() {
    const navigate = useNavigate();
    const [serialNumber, setSerialNumber] = useState('');
    const [codeNumber, setCodeNumber] = useState('');
    const [serialNumberError, setSerialNumberError] = useState('');
    const [codeNumberError, setCodeNumberError] = useState('');
    const [isVerificationFailed, setIsVerificationFailed] = useState(false);


    const handleSerialNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        if (value.charAt(0) === '0') {
            setSerialNumberError('Should not begin with Zero.');
            return;
        }

        setSerialNumber(value);
        // console.log('value', value);
        const error = validateSerialNumber(value);
        setSerialNumberError(error);
        //console.log('serial', serialNumber);

    };

    const handleCodeNumberChange = (event) => {
        const value = event.target.value.replace(/\D/g, '');
        if (value.charAt(0) === '0') {
            setCodeNumberError('Should not begin with Zero.');
            return;
        }
        setCodeNumber(value);

        let error = validateCodeNumber(value);


        setCodeNumberError(error);
    };

    const handleVerification = () => {

        if (serialNumber.trim() === '') {
            setSerialNumberError('Enter a valid meter serail number. ');
            return;
        }
        if (serialNumber.length < 6) {
            setSerialNumberError('Enter a valid meter serial number.');
            return;
        }
        if (codeNumber.trim() === '') {
            setCodeNumberError('Enter a valid code. ');
            return;
        }
        if (codeNumber.length < 11) {
            setCodeNumberError('Enter a valid code.');
            return;
        }
        // Check if the squared sum of serialNumber + 123456 matches codeNumber
        const squaredSum = Math.pow(parseInt(serialNumber), 2) + Math.pow(123456, 2);

        if (codeNumber === squaredSum.toString()) {
            // console.log('Numbers match');
            navigate('/signin');
        } else {

            alert('Varification failed. Please Enter a valid code.');
            // setIsVerificationFailed(true);
            //  console.log('Numbers do not match');
            // Handle the case where numbers do not match
        }
    };

  

    return (
        <>
    <div>
        <Mainhomepage/>
    </div>
            <div className='containers'>
                <div className='formgroup'>
                    <Avatar />
                    <p style={{ color: 'black' }}>Enter serial number and code number of a new meter purchased by you.</p>
                    <div className='d-grid col-5' >
                        <label htmlFor="phone-number">Meter Serial Number </label>
                        <div className="input-container1">
                            <input
                                type="text"
                                className='form-control'
                                id="serailnumber "
                                required
                                placeholder="Meter Serial Number"
                                value={serialNumber}
                                onChange={handleSerialNumberChange}
                                
                            />
                            <img className="fas fa-phone"
                                src={metericon}
                                style={{height:'20px' , width:'20px' , color:'black'}}
                                alt='PHone Number Icon'
                            />
                        </div>
                        {serialNumberError && <span style={{ color: 'red' }}>{serialNumberError}</span>}
                    </div>
                    <div className='d-grid col-5'>
                        <label htmlFor="password">Meter Code Number</label>
                        <div className="input-container1">
                        <input
                            type="text "
                            className='form-control'
                            id="metercode"
                            required
                            placeholder="Meter Code Number"
                            value={codeNumber}
                            onChange={handleCodeNumberChange}
                            maxLength={13}

                        />
                           
                           <img className="fas fa-phone"
                                src={metercodeicon}
                                style={{height:'20px' , width:'20px' , color:'black'}}
                                alt='PHone Number Icon'
                            />

                        </div>
                        {codeNumberError && <span style={{ color: 'red' }}>{codeNumberError}</span>}
                    </div>
                    <div className="d-grid col-6">
                        <button style={{ margin: '15px' }} className='btn btn-primary' onClick={handleVerification}>Verify </button>
                    </div>
                </div>

            </div>



            {/* {isVerificationFailed && (
                <div className='verification-failed-modal'>
                    <div className='modal-content'>
                        <p>Verification failed. Please enter a valid code.</p>
                        <button onClick={() => setIsVerificationFailed(false)}>Close</button>
                    </div>
                </div>
            )} */}

        </>
    );
}

export default Createaccount;
