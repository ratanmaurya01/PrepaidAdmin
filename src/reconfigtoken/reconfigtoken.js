import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../adminLogin/navbar';
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';
import firebase from 'firebase/compat/app'; // Import the Firebase app (latest version)
import 'firebase/compat/database';
import Phonepasswordchange from './phonepasswordchange';
import IsDelateTranferToken from '../transfertoken/deletetransfertoken'
import Dropdown from 'react-bootstrap/Dropdown';
import './Phonepasswordchange.css'; // Import CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import CommonFuctions from '../commonfunction';
import { Modal, Button } from 'react-bootstrap';



import '../adminLogin/login.css'

function Homepage() {


  const SessionTime = new CommonFuctions();
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGroupData, setSelectedGroupData] = useState([]);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [meterList, setMeterList] = useState([]);
  const [error, setError] = useState('');
  const [mergedArray, setMergedArray] = useState([]);
  const [data, setData] = useState({});

  const [serialOptions, setSerialOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const [selectOptions, setSelectOptions] = useState([]);
  const [showList, setShowList] = useState(false); // State to control list visibility
  const [showDropdown, setShowDropdown] = useState(false); // State to manage dropdown visibility

  useEffect(() => {
    document.title = "Re-Configuration Token"; // Set the title when the component mounts

  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];
          setPhoneNumber(numberPart);
          handleSearch(numberPart);
          handleSearch1(numberPart);
          getAdminPassword(numberPart);
          SessionValidate(numberPart);
          SessionUpdate(numberPart);
        }
      } else {
        setUser(null);
        // Instead of redirecting, you can handle this case in your UI
        window.location.href = '/';
      }
    });

    return () => unsubscribe();
  }, []);

  const getAdminPassword = (numberPart) => {
    const passwordRef = database.ref(`/adminRootReference/adminDetails/${numberPart}/adminProfile`);

    passwordRef.once('value', (snapshot) => {
      const fetchedPassword = snapshot.val();
      setPassword(fetchedPassword?.password || '');
      setLoading(false); // Set loading to false once data is loaded
    });
  };


  const handleSearch = async (phoneNumber) => {


    const status = await SessionTime.checkInternetConnection(); // Call the function
    //  setShowChecker(status);
    if (status === 'Poor connection.') {
      setisOpenInternet(true);
      setModalMessage('No/Poor Internet connection. Cannot access server.');
      setLoading(false);
      return;

    }

    const trimmedPhoneNumber = phoneNumber.trim();
    if (trimmedPhoneNumber !== '') {
      try {
        const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
        const snapshot = await dataRef.once('value');
        const newData = snapshot.val();
        setData(newData || {});
        setSelectedGroupData(newData);
        // console.log("data", newData);

        // Extract select options based on received data
        if (newData) {
          const options = Object.keys(newData).map(key => key.replace(/\s/g, '_'));
          setSelectOptions(options);
        }
        setSearchExecuted(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  };

  const extractSerialNumbers = () => {

    const extractedSerials = Object.values(data).reduce((acc, item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const keys = Object.keys(item);
        const filteredKeys = keys.filter((key) => !isNaN(Number(key)));
        acc.push(...filteredKeys.map(serial => ({ serial, name: item[serial].name })));
      }
      // console.log("return data")
      return acc;
    }, []);
    setSerialOptions(extractedSerials);
  }


  useEffect(() => {
    extractSerialNumbers();
  }, [data]);



  useEffect(() => {

    const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];

    // console.log('mergedArray:', mergedArray);

    setMergedArray(merged);
  }, [serialOptions, meterList]);

  useEffect(() => {

    const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];

    const uniqueSerialsMap = new Map();


    merged.forEach(item => {
      if (item.name) {
        // If a serial number already exists in the map, skip adding it (as we only want unique serials with names)
        if (!uniqueSerialsMap.has(item.serial)) {
          uniqueSerialsMap.set(item.serial, item.name); // Store serial number with its name
        }
      } else {
        // If no name is available, check for duplicates and store only one entry
        if (!uniqueSerialsMap.has(item.serial)) {
          uniqueSerialsMap.set(item.serial, null); // Store serial number without a name
        }
      }
    });
    const uniqueSerialsArray = Array.from(uniqueSerialsMap).map(([serial, name]) => ({ serial, name }));
    uniqueSerialsArray.sort((a, b) => a.serial.localeCompare(b.serial));
    setMergedArray(uniqueSerialsArray);
  }, [serialOptions, meterList]);

  
  useEffect(() => {
    extractSerialNumbers();
    handleSearch1();
  }, []);



  const handleSearch1 = async (numberPart) => {


    try {
      const phoneNumberValue = numberPart.trim(); // Retrieve phone number
      if (phoneNumberValue !== '') {
        setPhoneNumber(phoneNumberValue); // Update phoneNumber state
        const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumberValue}/meterList`).once('value');
        const fetchedMeterList = snapshot.val();
        // console.log("meteltelsit ", fetchedMeterList);
        if (fetchedMeterList) {
          const meterIds = Object.keys(fetchedMeterList);
          setMeterList(Object.keys(fetchedMeterList));
          Object.keys(fetchedMeterList).forEach(async (serialNumber) => {
            await isTokenAvailable(serialNumber);
            // deleteAllPendingToken(serialNumber);
          });
          setMeterList(meterIds);
          setError('');
        } else {
          setMeterList([]);
          setError('No meter list found for this admin phone');
        }
      }
    } catch (error) {
      console.error('Error fetching admin meter list:', error);
      setMeterList([]);
      setError('Error fetching admin meter list. Please try again.');
    }
  };



  const [tokenStatus, setTokenStatus] = useState([]);

  // const isTokenAvailable = async (serialNumber, index) => {

  //   try {

  //     const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${serialNumber}/reConfigToken`);
  //     const snapshot = await meterDetailsPath.once('value');
  //     const newData = snapshot.val();
  //     const isTransfer = newData.isTransfer;
  //     const token = newData.token;




  //     let status;
  //     if (isTransfer === 'false' && token !== 'null') {
  //       status = "*";
  //     } else if (isTransfer === 'true' && token !== 'null') {
  //       status = "**";
  //     } else {
  //       status = "";
  //     }

  //     setTokenStatus(prevState => ({
  //       ...prevState,
  //       [serialNumber]: status
  //     }));
  //   } catch (e) {
  //     console.log('Error Fetching:', e);
  //   }
  // };


  const isTokenAvailable = async (serialNumber, index) => {
    try {
      const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${serialNumber}/reConfigToken`);
      const snapshot = await meterDetailsPath.once('value');
      const newData = snapshot.val();
      if (newData !== null) {
        const isTransfer = newData.isTransfer;
        const token = newData.token;

        let status;
        if (isTransfer === 'false' && token !== 'null') {
          status = "*";
        } else if (isTransfer === 'true' && token !== 'null') {
          status = "**";
        } else {
          status = "";
        }

        setTokenStatus(prevState => ({
          ...prevState,
          [serialNumber]: status
        }));
      } else {
        // Handle case where newData is null
        //  console.log('Data not found for serial number:', serialNumber);
      }
    } catch (e) {
      console.log('Error Fetching:', e);
    }
  };

  useEffect(() => {
    mergedArray.forEach(({ serial }, index) => {
      isTokenAvailable(serial, index);
    });
  }, [mergedArray]);





  const deleteAllPendingToken = async () => {

    const status = await SessionTime.checkInternetConnection(); // Call the function
    //  setShowChecker(status);
    if (status === 'Poor connection.') {
      setisOpenInternet(true);
      setModalMessage('No/Poor Internet connection. Cannot access server.');
      setLoading(false);
      return;

    }

    try {
      const deleteToken = new IsDelateTranferToken();
      const { serialNumbers, pendingTokensDeleted } = await deleteToken.getAllTokenSerial(phoneNumber);

      if (pendingTokensDeleted) {
        console.log("Pending tokens deleted successfully.");
      }
      if (!pendingTokensDeleted || serialNumbers.length === 0) {
     //   console.log("No pending token.");

        setisOpenInternet(true);
        setModalMessage('No Transfer  token available.');
        setLoading(false);
      }


      //  console.log('Get All Serial number:', getSerialNumber);
    } catch (error) {
      console.error('Error deleting all pending tokens:', error);
    }
  }





  const confirmDelete = async () => {
    setModalMessage('Are you sure Want to delete ');
    setisConfirmed(true);

    // const storeSessionId = localStorage.getItem('sessionId');
    // const { sessionId } = await SessionTime.HandleValidatSessiontime(phoneNumber);
    // if (storeSessionId === sessionId) {

    //   SessionTime.updateSessionTimeActiveUser(phoneNumber);

    //   const confirmation = window.confirm('Are you sure you want to delete all pending tokens?');
    //   if (confirmation) {
    //         deleteAllPendingToken();  
    //   } else {
    //     // Optionally handle the case where the user cancels the action
    //   }
    // } else {

    //   alert("You have been logged-out due to log-in from another device.");
    //   // console.log('you are logg out ');
    // //  handleLogout();
    // }

  }





  const toggleListVisibility = () => {
    setShowList(!showList);
  };

  const handleInputClick = () => {
    setShowDropdown(!showDropdown);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show loading message while waiting for authentication or data
  // if (loading || !user) {
  //   return <div style={{ marginLeft: '40%', marginTop: '8%' }}>Loading...</div>;
  // }




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
  const SessionValidate = async (numberPart) => {

    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await SessionTime.HandleValidatSessiontime(numberPart);
    // console.log("Received session ID from server: ", sessionId);

    if (storeSessionId === sessionId) {
      //  console.log('SessionId Match ', sessionId);
      return;
    } else {
      //  console.log('SessionId Mismatch');
      alert("Cannot login. Another session is active. Please retry after sometime. ");
      // console.log('you are logged out ');
      handleLogout();
    }

  };
  const SessionUpdate = (numberPart) => {
    SessionTime.updateSessionTimeActiveUser(numberPart);
  }


  const [modalMessage, setModalMessage] = useState('');
  const [isOpenInternet, setisOpenInternet] = useState(false);

  const closeInternet = () => {
    setisOpenInternet(false);
    // window.location.reload(); // This will reload the page
  };

  const loadingStyle = {
    pointerEvents: loading ? 'none' : 'auto', // Disable pointer events if loading, otherwise enable
  };



  const [isConfirmed, setisConfirmed] = useState(false);
  const isConfirmedYes = () => {

    setisConfirmed(false);
    deleteAllPendingToken();
    setLoading(true);

  }

  const closeisConfirmed = () => {
    setisConfirmed(false);
  };







  return (
    <>


      <div style={loadingStyle}>

        <Navbar />

        {loading ? (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '9999' }}>
            <div className="spinner-border text-danger" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : null}
        <div style={{ display: 'flex' }}>
          <div>
            <div className='sidebar  ' style={{ marginTop: '5%', height: '100%', width: '20%' }}>


              <div style={{ marginTop: '10%', fontWeight: 'bold' }}>
                {/* <p >Current Mobile number <br /> {'+91' + phoneNumber} </p> */}
                <label htmlFor="phoneNumber">Phone Number</label>
                <div className='input-container1'>
                  <input
                    id='phoneNumber'
                    type="text"
                    // value={phoneNumber}
                    value={phoneNumber ? `+91${phoneNumber}` : '+91'}
                    className='form-control'
                    placeholder=" Phone Number"
                    readOnly
                    disabled
                  />

                  <i className="fas fa-phone"></i>
                </div>

              </div>

              <hr style={{ color: 'red', }}></hr>
              {/* <div style={{ fontWeight: 'bold' }}>
              <p>Current Password  <br /> {password} </p>
            </div> */}

              <div style={{ fontWeight: 'bold' }}>
                <label htmlFor="password">Current Password</label>
                <div className='input-container1'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className='form-control'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    name="password"
                    readOnly
                    disabled
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle-button"
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="password-toggle-icon"
                    />
                  </button>
                  <i class="fas fa-lock password-icon"></i>
                </div>
              </div>

              <hr style={{ color: 'red' }}></hr>

              {/* <div >
              <p style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={confirmDelete}>Delete all Pending Transfer Token</p>
            </div> */}

              <div className="delete-button">
                <p style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={confirmDelete}>Delete all Pending Transfer Token</p>
              </div>


              <hr style={{ color: 'red' }}></hr>


            </div>
          </div>
          <div className='container' style={{ marginLeft: '25%' }} >
            <div  >
              <h4 style={{ marginTop: '%', width: '35%' }} > </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '9%', marginLeft: '1%', backgroundColor: 'blue', width: '60%', }}>

              <label style={{ fontWeight: 'bold', marginLeft: '5px', color: 'white' }} htmlFor="reconfigureTokenCheckbox">
                Re-Configuration Token will be generated for all the meters present in the list

              </label>
            </div>


            {/* <select className="form-select w-50">
            <option>View Meter List</option>
            {Object.entries(data).map(([groupName, serialData]) => (
              Object.entries(serialData).map(([serialNumber, serialInfo]) => (
                <option key={serialNumber} value={serialInfo.name ? `${serialNumber} ${serialInfo.name}` : serialNumber}>
                  {groupName} - {serialNumber} - {serialInfo.name} - {tokenStatus[serialNumber]}
                </option>
              ))
            ))}
          </select> */}

            {/* 
          <select className="form-select w-50">
            <option>View All Meter List</option>
            {Object.entries(data).map(([groupName, groupData]) => (
              Object.entries(groupData).map(([serialNumber, serialInfo]) => (
                <option key={serialNumber} value={serialInfo.name ? `${serialNumber} ${serialInfo.name}` : serialNumber}>
                  {groupName} - {serialNumber} - {serialInfo.name}
                </option>
              ))
            ))}
          
            {mergedArray.map(({ serial, name, groupName }, index) => (
              <option key={`serial-${index}`} value={name ? `${serial} ${name}` : serial}>
                {serial} {name}
              </option>
            ))}
          </select> */}

            <div style={{ marginLeft: '1%', marginTop: '3%' }}>
              <select
                className="form-select w-50" // Added Bootstrap class to set width to 100%
                disabled={loading}
              >
                <option>View All Meter List</option>
                {mergedArray.map(({ serial, name }, index) => (
                  <option key={index} value={name ? `${serial}  ${name}` : serial}>

                    {serial}{tokenStatus[serial]} {name}
                  </option>
                ))}
              </select>

            </div>
            {/* 
          <div style={{ marginLeft: '5%' }}>

            <Dropdown className="mt-2">
              <Dropdown.Toggle className="custom-dropdown-toggle" id="dropdown-basic" >

                Meter list with pending token status
              </Dropdown.Toggle>

              {mergedArray.map(({ serial, name }, index) =>
              (<Dropdown.Menu className='.custom-dropdown-menu '>
                <Dropdown.Item key={index} value={name ? `${serial}  ${name}` : serial}>
                  {serial} {tokenStatus[serial]} {name}
                </Dropdown.Item>
              </Dropdown.Menu>))}
            </Dropdown>


          </div> */}



            <div>
              <Phonepasswordchange />
            </div>
          </div>
        </div>
      </div>

      <Modal show={isOpenInternet} onHide={closeInternet} backdrop="static" style={{ marginTop: '3%', pointerEvents: loading ? 'none' : 'auto' }}>
        {/* <Modal.Header closeButton>
      </Modal.Header>  */}
        <Modal.Body>
          <p> {modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeInternet}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isConfirmed} onHide={closeisConfirmed} backdrop="static" style={{ marginTop: '3%' }}>
        {/* <Modal.Header closeButton>
      </Modal.Header>  */}
        <Modal.Body>
          <p style={{ color: 'red' }} > {modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>

          <div className="d-flex justify-content-center w-100">

            <Button variant="primary" style={{ marginRight: '20px' }} onClick={isConfirmedYes}>
              YES
            </Button>

            <Button variant="success" onClick={closeisConfirmed}>
              No
            </Button>




          </div>
        </Modal.Footer>
      </Modal>


    </>

  );
}

export default Homepage;
