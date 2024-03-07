

import React, { useState, useEffect } from 'react';
import firebase from './firebase';
import CryptoJS from 'crypto-js';

const getDate = new Date().getFullYear();

const CheckboxColumn = ({ item, handleCheckboxChange }) => {
  return (
    <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
      <input
        style={{
          margin: '10px',
          height: '30px',
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

const Rechargetoken = () => {
  const [data, setData] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const [generatedData, setGeneratedData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  const handleSelectAllChange = () => {
    setSelectAll(!selectAll);
    setData((prevData) =>
      prevData.map((item) => ({
        ...item,
        checked: !selectAll,
      }))
    );
  };

  const handleInputChange = (inputKey, value) => {
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [inputKey]: value,
    }));
  };

  const handleGenerateClick = async () => {
    const checkedItems = data.filter((item) => item.checked);

    if (checkedItems.length === 0) {
      alert('Please select at least one item before generating data.');
      return;
    }

    // Check for empty input fields in selected checkboxes
    const hasEmptyFields = checkedItems.some((item) => {
      const rechargeAmount = inputValues[`${item.id}-0`] || '';
      const paymentDetails = inputValues[`${item.id}-1`] || '';

      return !rechargeAmount.trim() || !paymentDetails.trim();
    });

    if (hasEmptyFields) {
      alert('Input fields are empty.');
      return;
    }

    // Update the Firebase database for each checked item
    const updates = {};
    checkedItems.forEach((item) => {
      // Remove id and sr fields from the updates
      updates[`/meters/${item.id}/id`] = null;
      updates[`/meters/${item.id}/sr`] = null;
    });

    try {
      // Update the Firebase database
      await firebase.database().ref().update(updates);
    } catch (error) {
      console.error('Error updating data in Firebase:', error);
    }

    // Remove selected items from the Firebase Realtime Database
    const removalUpdates = {};
    checkedItems.forEach((item) => {
      removalUpdates[`/meters/${item.id}`] = null;
    });
    
     console.log('Removal Updates:', removalUpdates);

    try {
      // Remove selected items from the Firebase Realtime Database
      await firebase.database().ref().update(removalUpdates);
    } catch (error) {
      console.error('Error removing data from Firebase:', error);
    }

    const generatedDataArray = checkedItems.map((item) => {
      const rechargeAmount = inputValues[`${item.id}-0`] || '';
      const paymentDetails = inputValues[`${item.id}-1`] || '';
      const totalKWh = item.id;
      const availableBalance = typeof item.sr === 'string' ? item.sr.replace('₹', '') : item.sr;

      const generatedDataString = `/${getDate}/${rechargeAmount}/${paymentDetails}/${totalKWh}/${availableBalance}`;

      // Encrypt the data (using CryptoJS AES encryption, you may need to install CryptoJS)
      const encryptedDataString = CryptoJS.AES.encrypt(generatedDataString, 'secretkey').toString();

      // Prepend "http//current" to the encrypted data
      const encryptedDataWithPrefix = `https://dk9936.github.io/rt-req-500008-221123-162/${encryptedDataString}`;

      return {
        generatedData: generatedDataString,
        encryptedData: encryptedDataWithPrefix,
      };
    });

    setGeneratedData(generatedDataArray);

    // Remove selected items from the state
    setData((prevData) => prevData.filter((item) => !checkedItems.includes(item)));

    setInputValues((prevInputValues) => {
      const updatedValues = { ...prevInputValues };
      checkedItems.forEach((item) => {
        updatedValues[`${item.id}-0`] = '';
        updatedValues[`${item.id}-1`] = '';
      });
      return updatedValues;
    });
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <label>
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAllChange}
          />
          Select All
        </label>
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
          <ReadOnlyInput label="Total KWh at the time of request" placeholder="Amount for id" value={item.id} />
          <ReadOnlyInput label="Available Balance At the Time of Request" placeholder="Amount for sr" value={item.sr} />
        </div>
      ))}

      <div className="text-center mt-3">
        <button className="btn btn-primary" onClick={handleGenerateClick}>
          Generate
        </button>
      </div>

      {generatedData.length > 0 && (
        <div>
          <h2>All Generated Data</h2>
          {generatedData.map((data, index) => (
            <div key={index} style={{ display: 'flex', paddingTop: '10px', marginLeft: '10px' }}>
              <p><strong>Generated Data {index + 1}:</strong> {data.generatedData}</p><br/>
              <p style={{ marginLeft: '10px' }}><strong>Encrypted Data {index + 1}:</strong> {data.encryptedData}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rechargetoken;





// import React, { useState, useEffect } from 'react';
// import firebase from './firebase';
// import CryptoJS from 'crypto-js';

// const CheckboxColumn = ({ item, handleCheckboxChange }) => {
//   return (
//     <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
//       <input
//         style={{
//           margin: '10px',
//           height: '30px', // Set the desired height
//         }}
//         type="checkbox"
//         name={`checkbox-${item.id}`}
//         checked={item.checked}
//         onChange={() => handleCheckboxChange(item.id)}
//       />
//     </div>
//   );
// };

// const EditableInput = ({ label, placeholder, value, onChange }) => {
//   return (
//     <div style={{ textAlign: 'center' }}>
//       <label>{label}</label>
//       <br />
//       <input
//         style={{ margin: '5px', padding: '5px' }}
//         type="text"
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//       />
//     </div>
//   );
// };

// const ReadOnlyInput = ({ label, placeholder, value }) => {
//   return (
//     <div style={{ textAlign: 'center' }}>
//       <label>{label}</label>
//       <br />
//       <input
//         style={{ margin: '5px', padding: '5px' }}
//         type="text"
//         placeholder={placeholder}
//         value={value}
//         readOnly
//       />
//     </div>
//   );
// };



// const Rechargetoken = () => {
//   const [data, setData] = useState([]);
//   const [inputValues, setInputValues] = useState({});
//   const [generatedData, setGeneratedData] = useState([]);
//   // const [showGeneratedData, setShowGeneratedData] = useState(true); // Removed, as it's not being used
//   // const [checkedItems, setCheckedItems] = useState([]); // Removed, as it's not being used
//   // const [decryptedData, setDecryptedData] = useState(''); // Removed, as it's not being used

//   useEffect(() => {
//     const messagesRef = firebase.database().ref('/meters/');

//     const fetchData = async () => {
//       try {
//         const snapshot = await messagesRef.once('value');
//         const dataFromFirebase = snapshot.val();

//         if (dataFromFirebase) {
//           const values = {};
//           Object.keys(dataFromFirebase).forEach((key) => {
//             const itemData = dataFromFirebase[key];
//             Array.from({ length: 4 }).forEach((_, index) => {
//               const inputValue = itemData[`value${index + 1}`] || '';
//               values[`${key}-${index}`] = inputValue;
//             });
//           });

//           setInputValues(values);
//           setData(Object.keys(dataFromFirebase).map((key) => ({
//             id: key,
//             ...dataFromFirebase[key],
//             checked: false,
//           })));
//         } else {
//           console.log('No data found in Firebase.');
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();

//     const onDataChange = (snapshot) => {
//       const dataFromFirebase = snapshot.val();

//       if (dataFromFirebase) {
//         const values = {};
//         Object.keys(dataFromFirebase).forEach((key) => {
//           const itemData = dataFromFirebase[key];
//           Array.from({ length: 4 }).forEach((_, index) => {
//             const inputValue = itemData[`value${index + 1}`] || '';
//             values[`${key}-${index}`] = inputValue;
//           });
//         });

//         setInputValues(values);
//         setData(Object.keys(dataFromFirebase).map((key) => ({
//           id: key,
//           ...dataFromFirebase[key],
//           checked: false,
//         })));
//       } else {
//         console.log('Real-time update - No data found in Firebase.');
//       }
//     };

//     messagesRef.on('value', onDataChange);

//     return () => messagesRef.off('value', onDataChange);
//   }, []);

//   const handleCheckboxChange = (itemId) => {
//     setData((prevData) =>
//       prevData.map((item) =>
//         item.id === itemId ? { ...item, checked: !item.checked } : item
//       )
//     );
//   };

//   const handleInputChange = (inputKey, value) => {
//     setInputValues((prevInputValues) => ({
//       ...prevInputValues,
//       [inputKey]: value,
//     }));
//   };

//   const handleGenerateClick = () => {
//     // Generate and store data in the generatedData state
//     const checkedItems = data.filter((item) => item.checked);

//     if (checkedItems.length === 0) {
//       // Add your validation logic here (e.g., display an alert)
//       alert('Please select at least one item before generating data.');
//       return;
//     }

//     const generatedDataArray = checkedItems.map((item) => {
//       const rechargeAmount = inputValues[`${item.id}-0`] || '';
//       const paymentDetails = inputValues[`${item.id}-1`] || '';
//       const totalKWh = item.id;
//       const availableBalance = item.sr.replace('₹', ''); // Remove the currency symbol

//       const generatedDataString = `${rechargeAmount}/${paymentDetails}/${totalKWh}/${availableBalance}`;

//       // Encrypt the generated data
//       const encryptedData = CryptoJS.AES.encrypt(generatedDataString, 'secret_key').toString();

//       // Automatically attempt decryption
//       try {
//         const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, 'secret_key');
//         const decryptedDataString = decryptedBytes.toString(CryptoJS.enc.Utf8);

//         return {
//           encryptedData,
//           decryptedData: decryptedDataString,
//         };
//       } catch (error) {
//         console.error('Error decrypting data:', error);
//         // Handle decryption error (e.g., display an alert)
//         return {
//           encryptedData,
//           decryptedData: 'Error decrypting data',
//         };
//       }
//     });

//     setGeneratedData(generatedDataArray);
//   };

//   return (
//     <div className="container">
//       {data.map((item) => (
//         <div key={item.id} style={{ display: 'flex', paddingTop: '50px', marginLeft: '10px' }}>
//           <CheckboxColumn item={item} handleCheckboxChange={handleCheckboxChange} />
//           <EditableInput
//             label="Recharge Amount"
//             placeholder="Amount"
//             value={inputValues[`${item.id}-0`] || ''}
//             onChange={(value) => handleInputChange(`${item.id}-0`, value)}
//           />
//           <EditableInput
//             label="Payment Details"
//             placeholder="Google Pay"
//             value={inputValues[`${item.id}-1`] || ''}
//             onChange={(value) => handleInputChange(`${item.id}-1`, value)}
//           />
//           <ReadOnlyInput label="Total KWh at time of request" placeholder="Amount for id" value={item.id} />
//           <ReadOnlyInput label="Available Balance At Time of Request" placeholder="Amount for sr" value={item.sr} />
//         </div>
//       ))}

//       {/* Centered Bootstrap "Generate" button */}
//       <div className="text-center mt-3">
//         <button className="btn btn-primary" onClick={handleGenerateClick}>
//           Generate
//         </button>
//       </div>

//       {/* Display generated data */}
//       {generatedData.length > 0 && (
//         <div>
//           <h2>All Encrypted and Decrypted Data</h2>
//           {generatedData.map((data, index) => (
//             <div key={index} style={{ display: 'flex', paddingTop: '10px', marginLeft: '10px' }}>
//               <p><strong>Generated Data (Encrypted) {index + 1}:</strong> {data.encryptedData}</p>
//               <p><strong>Decrypted Data {index + 1}:</strong> {data.decryptedData}</p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Rechargetoken;
