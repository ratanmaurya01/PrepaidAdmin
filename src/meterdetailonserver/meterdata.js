import React, { useEffect, useState } from 'react';
import Navbar from '../adminLogin/navbar';
import { auth } from '../adminLogin/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import './meterdetail.css';
import { database } from '../firebase';

function Meterdata() {
  const [data, setData] = useState({});
  const [meterList, setMeterList] = useState([]);
  const [error, setError] = useState('');
  const [serialOptions, setSerialOptions] = useState([]);
  const [selectOptions, setSelectOptions] = useState([]);
  const [selectedGroupData, setSelectedGroupData] = useState([]);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mergedArray, setMergedArray] = useState([]);
  const [user, setUser] = useState(null); // State to hold user information
  const [isLoading, setIsLoading] = useState(true);




  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is logged in
        setUser(authUser);
      //  console.log("Logged in user:", authUser.email);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];
      //    console.log("Number part:", numberPart); // Log the extracted number part

          handleSearch(numberPart);
          handleSearch1(numberPart);


        }
      } else {
        setUser(null);
        window.location.href = '/'; // Redirect to your login page
      }
    });
    return () => {
      setIsLoading(false);
      unsubscribe(); // Cleanup function for unmounting
    };
  }, []);



  const handleSearch = async (phoneNumber) => {
    const trimmedPhoneNumber = phoneNumber.trim();
    if (trimmedPhoneNumber !== '') {
      try {
        const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
        const snapshot = await dataRef.once('value');
        const newData = snapshot.val();
        setData(newData || {});
        setSelectedGroupData(newData);
      //  console.log("data", newData);

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
      console.log("return data")
      return acc;
    }, []);
    setSerialOptions(extractedSerials);
  }
  useEffect(() => {
    extractSerialNumbers();
  }, [data]);


    const extractGroupNames = () => {
    if (data) {
      const groupNames = Object.keys(data).filter(key => key !== 'tariff');
      return groupNames;
    }
    return [];
  };

  useEffect(() => {
  //  console.log('Group Names:', extractGroupNames());
  }, [data]);




  const handleSearch1 = async (numberPart) => {
    try {
      const phoneNumberValue = numberPart.trim(); // Retrieve phone number
      if (phoneNumberValue !== '') {
        setPhoneNumber(phoneNumberValue); // Update phoneNumber state
        const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumberValue}/meterList`).once('value');
        const fetchedMeterList = snapshot.val();
      //  console.log("meteltelsit ", fetchedMeterList);
        if (fetchedMeterList) {
          const meterIds = Object.keys(fetchedMeterList);
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


  useEffect(() => {
    extractSerialNumbers();
    handleSearch1();
  }, []);


  useEffect(() => {
    // Merge two arrays when either serialOptions or meterList changes
    const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];
    setMergedArray(merged);
  }, [serialOptions, meterList]);

  // useEffect(() => {
  //     // Filtering the merged array based on matching serial numbers with names or no names in meterList
  //     const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];
  //     setMergedArray(merged);
  // }, [serialOptions, meterList]);
  useEffect(() => {
    // Merge two arrays when either serialOptions or meterList changes
    const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];

    // Create a map to store unique serial numbers with their names
    const uniqueSerialsMap = new Map();

    // Iterate through the merged array to filter out duplicates based on serial number
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

    // Convert the unique serials map back to an array
    const uniqueSerialsArray = Array.from(uniqueSerialsMap).map(([serial, name]) => ({ serial, name }));

    // Sort the merged array alphabetically based on serial numbers
    uniqueSerialsArray.sort((a, b) => a.serial.localeCompare(b.serial));

    // Set the sorted merged array with unique serials and names
    setMergedArray(uniqueSerialsArray);
  }, [serialOptions, meterList]);


  const groupMergedArrayByNames = () => {
    const groupedMeters = {};

    mergedArray.forEach(({ serial, name }) => {
      if (name) {
        if (!groupedMeters[name]) {
          groupedMeters[name] = [];
        }
        groupedMeters[name].push(serial);
      }
    });

    return groupedMeters;
  };
  const groupedMeters = groupMergedArrayByNames();

  return (


    <>
 
    <div style={{marginLeft:'20%'}} >
    <div className='container'>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Your existing content */}
          <h2 style={{marginTop:'5%'}}>Add Consumer </h2>
          <div className="rowContainer">
            {/* Render items without names */}
            {mergedArray.map(({ serial, name }, index) => (
              !name && (
                <div key={index} className='customBox'>
                  <p>{serial}</p>
                </div>
              )
            ))}
          </div>
          {/* Grouped Meters */}
          {extractGroupNames().map((groupName, groupIndex) => (
            <div key={groupIndex}>
              <h2 >{groupName}</h2>
              {/* Render items with names for each group */}
              <div className="rowContainer">
                {Object.entries(data[groupName]).map(([serial, info], index) => (
                  (info !== 'tariff' && info !== null && serial !== 'tariff') && (
                    <div key={index} className='customBox'>
                      <p>{serial}</p>
                      <p>{info.name}</p>
                      {/* Display other information as needed */}
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
    </div>
  </>
    
  );
}

export default Meterdata;
