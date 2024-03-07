import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';

const YourComponent = () => {
  const [dataFromFirebase, setDataFromFirebase] = useState({});
  const [isEditable, setIsEditable] = useState(false);

  const fetchDataFromFirebase = async () => {
    try {
      const dataRef = firebase.database().ref('/adminRootReference/tenantDetails/9782134129/Murlipura/100001');
      const snapshot = await dataRef.once('value');
      const data = snapshot.val();
      

      // Extract specific fields from the fetched data
      const { doo, email, location, name, phone, serial, tariff } = data || {};
      // Create an object with the extracted fields
      const extractedData = {
        doo: doo || '',
        email: email || '',
        location: location || '',
        name: name || '',
        phone: phone || '',
        serial: serial || '',
        tariff: tariff || '',
      };

      setDataFromFirebase(extractedData);
      console.log('Data fetched from Firebase:', extractedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchDataFromFirebase();
  }, []);

  const handleCheckDataClick = () => {
    fetchDataFromFirebase();
  };

  const handleEditButtonClick = () => {
    setIsEditable(true);
  };

  const handleSaveButtonClick = () => {
    setIsEditable(false);
    const dataRef = firebase.database().ref('/reseach/detail');
    dataRef.update(dataFromFirebase); // Update data in Firebase
    console.log('Data saved to Firebase:', dataFromFirebase);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDataFromFirebase((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <div>
        <button onClick={handleCheckDataClick}>Check Data</button>
      </div>

      <div>
        {Object.entries(dataFromFirebase).map(([key, value]) => (
          <div key={key}>
            <input
              type="text"
              name={key}
              value={value}
              readOnly={!isEditable}
              onChange={handleInputChange}
            />
          </div>
        ))}
        {isEditable ? (
          <button onClick={handleSaveButtonClick}>Save</button>
        ) : (
          <button onClick={handleEditButtonClick}>Edit</button>
        )}
      </div>
    </>
  );
};

export default YourComponent;
