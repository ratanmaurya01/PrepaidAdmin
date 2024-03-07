// RealtimeData.js
import React, { useState, useEffect } from 'react';
import { database } from './firebase';

const Meterdetials = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null);
  const [meterList, setMeterList] = useState({});

  useEffect(() => {
    const fetchData = () => {
      const dataRef = database.ref('/adminRootReference/adminDetails/');
      dataRef.on('value', (snapshot) => {
        const newData = snapshot.val();
        setData(newData);
      });
    };
    fetchData();

    
  }, []);

  useEffect(() => {
    const suggestions = Object.keys(data).filter((key) =>
      key.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchSuggestions(suggestions);
  }, [searchTerm, data]);

  const handleSearch = (phoneNumber) => {
    const details = data[phoneNumber];
    if (details) {
      setSelectedPhoneNumber(phoneNumber);

      // Set meterList directly
      setMeterList(details.meterList || {});
    } else {
      setSelectedPhoneNumber(null);
      setMeterList({});
    }
  };

  return (
    <div>
      <h2>Meter Data</h2>
      <div>
        <label>Search: </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => handleSearch(searchTerm)}>Search</button>
      </div>
      <div>
        <h3>Suggestions:</h3>
        <ul>
          {searchSuggestions.map((suggestion) => (
            <li key={suggestion} onClick={() => handleSearch(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
      {selectedPhoneNumber && (
        <div>
          <h3>Meter List for {selectedPhoneNumber}:</h3>
          <ul>
            {Object.entries(meterList).map(([meterId, meterValue]) => (
              <li key={meterId}>
                <strong>{meterId}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Meterdetials;
