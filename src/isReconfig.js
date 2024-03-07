import React, { useEffect, useState } from 'react';
import Navbar from './adminLogin/navbar';
import { auth } from './adminLogin/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { database } from './firebase';


function Isreconfig() {

  const [user, setUser] = useState(null);
  const [data, setData] = useState({});
  const [meterList, setMeterList] = useState([]);
  const [serialOptions, setSerialOptions] = useState([]);
  const [mergedArray, setMergedArray] = useState([]);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];
          handleSearch(numberPart);
          handleSearch1(numberPart);
        }
      } else {
        setUser(null);
        window.location.href = '/';
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);


  const handleSearch = async (phoneNumber) => {
    const trimmedPhoneNumber = phoneNumber.trim();
    if (trimmedPhoneNumber !== '') {
      try {
        const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
        const snapshot = await dataRef.once('value');
        const newData = snapshot.val() || {};
        setData(newData);
        setOptions(Object.keys(newData).map(key => key.replace(/\s/g, '_')));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };


  useEffect(() => {
    extractSerialNumbers();
  }, [data]);

  useEffect(() => {
    const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];
    setMergedArray(merged);
  }, [serialOptions, meterList]);

  const extractSerialNumbers = () => {
    const extractedSerials = Object.values(data).reduce((acc, item) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const keys = Object.keys(item);
        const filteredKeys = keys.filter((key) => !isNaN(Number(key)));
        acc.push(...filteredKeys.map(serial => ({ serial, name: item[serial].name })));
      }
      return acc;
    }, []);
    setSerialOptions(extractedSerials);
  };


  const handleSearch1 = async (numberPart) => {
    try {
      const phoneNumberValue = numberPart.trim();
      if (phoneNumberValue !== '') {
        const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumberValue}/meterList`).once('value');
        const fetchedMeterList = snapshot.val();

        if (fetchedMeterList) {
          setMeterList(Object.keys(fetchedMeterList));
          Object.keys(fetchedMeterList).forEach(async (serialNumber) => {
            await isTokenAvailable(serialNumber);
          });

        }

      }
    } catch (error) {
      console.error('Error fetching admin meter list:', error);
    }
  };


  const [tokenStatus, setTokenStatus] = useState([]);

  const isTokenAvailable = async (serialNumber, index) => {
    try {
      const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${serialNumber}/reConfigToken`);
      const snapshot = await meterDetailsPath.once('value');
      const newData = snapshot.val();
      const isTransfer = newData.isTransfer;
      const token = newData.token;

      let status;
      if (isTransfer === 'false' && token !== 'null') {
        status = "*";
      } else if (isTransfer === 'true' && token !== 'null') {
        status = "**";
      } else {
        status = "Not Available";
      }

      setTokenStatus(prevState => ({
        ...prevState,
        [serialNumber]: status
      }));
    } catch (e) {
      console.log('Error Fetching:', e);
    }
  };

  useEffect(() => {
    mergedArray.forEach(({ serial }, index) => {
      isTokenAvailable(serial, index);
    });
  }, [mergedArray]);



  return (
    <>
      <div>

      <select className="form-select w-50">
          {mergedArray.map(({ serial, name }, index) => (
            !name && (
              <option key={index} value={serial}>
                {serial}
                {name}
                {tokenStatus[serial]}
              </option>
            )
          ))}
        </select>

      </div>
    </>
  )
}

export default Isreconfig;