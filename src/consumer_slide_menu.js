import React, { useState } from 'react';
import { database } from './firebase'; // Import your Firebase configuration

const Consumer = () => {
  const [data, setData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async () => {
    const phoneNumber = searchTerm.trim();
    if (phoneNumber !== '') {
      const dataRef = database.ref(`/adminRootReference/tenantDetails/${phoneNumber}`);
      dataRef.once('value', (snapshot) => {
        const newData = snapshot.val();
        setData(newData || {}); // Set an empty object if newData is null or undefined
        console.log('Check All data:', newData);
      });
    }
  };

  const filteredKeys = Object.keys(data).filter((key) => key !== 'time');

  return (
    <div>
      <h2>Consumer Details</h2>
      <div>
        <label>Search: </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div>
        <ul>
          {filteredKeys.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Consumer;



