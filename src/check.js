import React, { useState, useEffect } from 'react';
import { database } from './firebase'; // Importing the Realtime Database instance
import firebase from 'firebase/compat/app'; // Import the Firebase app
import 'firebase/compat/firestore'; // Import Firestore
import { auth } from './adminLogin/firebase';


function Check() {

  const [user, setUser] = useState(null);
  const [selectedGroupData, setSelectedGroupData] = useState([]);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [meterList, setMeterList] = useState([]);
  const [mergedArray, setMergedArray] = useState([]);
  const [data, setData] = useState({});

  const [serialOptions, setSerialOptions] = useState([]);
  const [selectOptions, setSelectOptions] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');


  const [error, setError] = useState('');


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];
          // console.log("Number part:", numberPart);
          handleSearch(numberPart);
          handleSearch1(numberPart);
        }
      } else {
        setUser(null);
        window.location.href = '/'; // Redirect to your login page
      }
    });

    return () => unsubscribe(); // Cleanup function for unmounting
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
        console.log("data", newData);

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

          console.log("All Ungroup Meter List", meterIds);
          setMeterList(Object.keys(fetchedMeterList));
          Object.keys(fetchedMeterList).forEach(async (serialNumber) => {
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





  return (
    <>




    </>
  )
}

export default Check