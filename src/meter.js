import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app'; // Import the Firebase app (latest version)
import 'firebase/compat/database'; // Import the Realtime Database (latest version)

// Your component code goes here



// import React, { useState, useEffect } from 'react';
// import firebase from 'firebase/app';
// import 'firebase/database';

const Meter = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [meterList, setMeterList] = useState([]);
  const [selectedMeter, setSelectedMeter] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async () => {
    try {
      const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumber}/meterList`).once('value');
      const fetchedMeterList = snapshot.val();

      if (fetchedMeterList) {
        const meterIds = Object.keys(fetchedMeterList);
        setMeterList(meterIds);
        setError('');
      } else {
        setMeterList([]);
        setError('No meter list found for this admin phone');
      }
    } catch (error) {
      console.error('Error fetching admin meter list:', error);
      setMeterList([]);
      setError('Error fetching admin meter list. Please try again.');
    }
  };

  const handleSelectMeter = (event) => {
    setSelectedMeter(event.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Enter phone number"
      />
      <button onClick={handleSearch}>Search</button>
     
      {meterList.length > 0 ? (
        <div>
          <h3>Select a Meter:</h3>
          <select value={selectedMeter} onChange={handleSelectMeter}>
            <option value="">Select a meter</option>
            {meterList.map((meterId) => (
              <option key={meterId} value={meterId}>
                {meterId}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
};

export default Meter;
