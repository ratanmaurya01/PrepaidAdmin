import React, { useState, useEffect } from 'react';
import firebase from './firebase';
import CryptoJS from 'crypto-js';
import './style.css'


const CheckboxColumn = ({ item, handleCheckboxChange }) => {
  return (
    <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
      <input
        style={{
          margin: '10px',
          height: '30px', // Set the desired height
        }}
        type="checkbox"
        name={`checkbox-${item.id}`}
        checked={item.checked}
        onChange={() => handleCheckboxChange(item.id)}
      />
    </div>
  );
};

const EditableInput = ({ label, placeholder, value, onChange }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <label>{label}</label>
      <br />
      <input
        style={{ margin: '5px', padding: '5px' }}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

const ReadOnlyInput = ({ label, placeholder, value }) => {
  return (
    <div style={{ textAlign: 'center' }}>
      <label>{label}</label>
      <br />
      <input
        style={{ margin: '5px', padding: '5px' }}
        type="text"
        placeholder={placeholder}
        value={value}
        readOnly
      />
    </div>
  );
};



const Generatetoken = () => {
  const [data, setData] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [generatedData, setGeneratedData] = useState([]);
  // const [showGeneratedData, setShowGeneratedData] = useState(true); // Removed, as it's not being used
  // const [checkedItems, setCheckedItems] = useState([]); // Removed, as it's not being used
  // const [decryptedData, setDecryptedData] = useState(''); // Removed, as it's not being used

  useEffect(() => {
    const messagesRef = firebase.database().ref('/meters/');

    const fetchData = async () => {
      try {
        const snapshot = await messagesRef.once('value');
        const dataFromFirebase = snapshot.val();

        if (dataFromFirebase) {
          const values = {};
          Object.keys(dataFromFirebase).forEach((key) => {
            const itemData = dataFromFirebase[key];
            Array.from({ length: 4 }).forEach((_, index) => {
              const inputValue = itemData[`value${index + 1}`] || '';
              values[`${key}-${index}`] = inputValue;
            });
          });

          setInputValues(values);
          setData(Object.keys(dataFromFirebase).map((key) => ({
            id: key,
            ...dataFromFirebase[key],
            checked: false,
          })));
        } else {
          console.log('No data found in Firebase.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const onDataChange = (snapshot) => {
      const dataFromFirebase = snapshot.val();

      if (dataFromFirebase) {
        const values = {};
        Object.keys(dataFromFirebase).forEach((key) => {
          const itemData = dataFromFirebase[key];
          Array.from({ length: 4 }).forEach((_, index) => {
            const inputValue = itemData[`value${index + 1}`] || '';
            values[`${key}-${index}`] = inputValue;
          });
        });

        setInputValues(values);
        setData(Object.keys(dataFromFirebase).map((key) => ({
          id: key,
          ...dataFromFirebase[key],
          checked: false,
        })));
      } else {
        console.log('Real-time update - No data found in Firebase.');
      }
    };

    messagesRef.on('value', onDataChange);

    return () => messagesRef.off('value', onDataChange);
  }, []);

  const handleCheckboxChange = (itemId) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleInputChange = (inputKey, value) => {
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [inputKey]: value,
    }));
  };

  const handleGenerateClick = () => {
    // Generate and store data in the generatedData state
    const checkedItems = data.filter((item) => item.checked);

    if (checkedItems.length === 0) {
      // Add your validation logic here (e.g., display an alert)
      alert('Please select at least one item before generating data.');
      return;
    }

    const generatedDataArray = checkedItems.map((item) => {
      const rechargeAmount = inputValues[`${item.id}-0`] || '';
      const paymentDetails = inputValues[`${item.id}-1`] || '';
      const totalKWh = item.id;
      const availableBalance = item.sr.replace('₹', ''); // Remove the currency symbol

      const generatedDataString = `${rechargeAmount}/${paymentDetails}/${totalKWh}/${availableBalance}`;

      // Encrypt the generated data
      const encryptedData = CryptoJS.AES.encrypt(generatedDataString, 'secret_key').toString();

      // Automatically attempt decryption
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, 'secret_key');
        const decryptedDataString = decryptedBytes.toString(CryptoJS.enc.Utf8);

        return {
          encryptedData,
          decryptedData: decryptedDataString,
        };
      } catch (error) {
        console.error('Error decrypting data:', error);
        // Handle decryption error (e.g., display an alert)
        return {
          encryptedData,
          decryptedData: 'Error decrypting data',
        };
      }
    });

    setGeneratedData(generatedDataArray);
  };

  return (
    <div className="container">
        <div className='logo'>
           <div>
           {/* <img src='https://picsum.photos/200/300' alt='profile Image'/> */}
           </div>
           <div className='paragraph '>
            <p>Murlipura Jainpur -1</p>
            <p>Tariff Rate : R 10.5</p>
           </div>
        </div>
        <div>
            <div className='rechargetoken'>
                <p>Recharge Token</p>
            </div>
        </div>
      {data.map((item) => (
        <div key={item.id} style={{ display: 'flex', paddingTop: '50px', marginLeft: '10px' }}>
          <CheckboxColumn item={item} handleCheckboxChange={handleCheckboxChange} />
          <EditableInput
            label="Recharge Amount"
            placeholder="Amount"
            value={inputValues[`${item.id}-0`] || ''}
            onChange={(value) => handleInputChange(`${item.id}-0`, value)}
          />
          <EditableInput
            label="Payment Details"
            placeholder="Google Pay"
            value={inputValues[`${item.id}-1`] || ''}
            onChange={(value) => handleInputChange(`${item.id}-1`, value)}
          />
          <ReadOnlyInput label="Total KWh at time of request" placeholder="Amount for id" value={item.id} />
          <ReadOnlyInput label="Available Balance At Time of Request" placeholder="Amount for sr" value={item.sr} />
        </div>
      ))}

      {/* Centered Bootstrap "Generate" button */}
      <div className="text-center mt-3">
        <button className="btn btn-primary" onClick={handleGenerateClick}>
          Generate
        </button>
      </div>

      {/* Display generated data */}
      {generatedData.length > 0 && (
        <div>
          <h2>All Encrypted and Decrypted Data</h2>
          {generatedData.map((data, index) => (
            <div key={index} style={{ display: 'flex', paddingTop: '10px', marginLeft: '10px' }}>
              <p><strong>Generated Data (Encrypted) {index + 1}:</strong> {data.encryptedData}</p>
              <p><strong>Decrypted Data {index + 1}:</strong> {data.decryptedData}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Generatetoken;
