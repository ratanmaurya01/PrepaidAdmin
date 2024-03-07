import React, { useState, useEffect } from 'react';
import './style.css'

import { database } from './firebase';
import CryptoJS from 'crypto-js';

function NewApp() {
  const [adminPhone, setAdminPhone] = useState('');

  /// delete below after succesfull implmentation
  //const [adminPhone, setAdminPhone] = useState('');
  const [inputError, setInputError] = useState(false);
  const baseUrlAdminDetails = database.ref('/adminRootReference/adminDetails/');
  const baseUrlMeterDetails = database.ref('/adminRootReference/meterDetails/');
  const [meters, setMeters] = useState([]);
  const [rechargeTokens, setRechargeTokens] = useState([]);
  const [decryptedTokens, setDecryptedTokens] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [fetchedData, setFetchedData] = useState(null);
  const [trnumbe, settrnumbe] = useState();
  const [s, setS] = useState();






  
  const getTime = () => {
   // if(adminPhone != null){
    baseUrlAdminDetails
      .child('9509717149')
      .child('sessionData')
      .child('time')
      .once('value')
      .then((snapshot) => {
        const result = snapshot.val();
        console.log ("New ", result);
        setFetchedData(result); // Update state with fetched data
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  //  }
  };

  getTime();
  const calculateRechargeAmount = (selectedToken) => {
    let rechargeAmount = 0;
    if (selectedToken) {
      rechargeAmount = selectedToken.amount; // Example calculation, modify as needed
    }
    return rechargeAmount;
  };
  const handleGenerateClick = () => {
    // Filter the decryptedTokens array to get only the SR numbers of selected items
    const selectedSRNumbers = selectedItems.map((item) => item.srNo);
    console.log("Selected SR Numbers:", selectedSRNumbers);

    selectedSRNumbers.forEach((srNumber) => {
      baseUrlMeterDetails
        .child(srNumber)
        .child('rechargeRequestToken')
        .update({ isUsed: "true" }) // Updated to an object containing the child to replace
        .then(() => {
          console.log('Updated');
        })
        .catch((error) => {
          console.error('Error updating:', error);
        });

      const selectedToken = decryptedTokens.find((token) => token.srNo === srNumber);
      const rechargeAmount = calculateRechargeAmount(selectedToken);
      // Change time to timestamp
      baseUrlAdminDetails
        .child(adminPhone)
        .child('sessionData')
        .child('time')
        .once('value')
        .then((snapshot) => {
          const result = snapshot.val();
          //currentTimestamp = result; // Update state with fetched data    

      // YY/MM/DD conversion
      const parsedTimestamp = parseInt(fetchedData);

      const dateObj = new Date(parsedTimestamp);

      const year = dateObj.getFullYear() % 100; // Extract last two digits of the year
      let month = dateObj.getMonth() + 1; // Adding 1 since getMonth returns a zero-based index
      let day = dateObj.getDate();
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes().toString().substring(0, 1);


      const formattedDate = `${day}${month}${year}`;
      const formattedTime = `${hours}${minutes}`;
    
    const searialhex = parseInt(srNumber).toString(16).toUpperCase();
    const tokenidhex = parseInt(trnumbe, 10).toString(16).padStart(2, '0').toUpperCase();
    const typehex  = '01'.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join('');
    const dayhex = day.toString(16).padStart(2, '0').toUpperCase();
    const monthhex = month.toString(16).padStart(2, '0').toUpperCase();
    const yearhex = year.toString().substring(2).toString(16).padStart(2, '0').toUpperCase();
    const hourhex = hours.toString(16).padStart(2, '0').toUpperCase();
    const minuthex = minutes.toString(16).padStart(2, '0').toUpperCase();
    const rechargeAmounthex = parseInt(rechargeAmount, 10).toString(16).padStart(4, '0').toUpperCase();

      const tarrifhex = parseInt('64.63', 10).toString(16).padStart(4, '0').toUpperCase();

      const phonehex = parseInt("9509717149", 10).toString(16).padStart(10, '0').toUpperCase();

      // const GenerateTimehex = parseInt("time", 10).toString(16).padStart(10, '0').toUpperCase();

      const tokenData = `${typehex}${searialhex}${dayhex}${monthhex}03${hourhex}${minuthex}${tokenidhex}${rechargeAmounthex}${tarrifhex}${phonehex}`;
      const part1 = tokenData.toString().substring(0, 32);
      console.log("rrr",part1);
      const part2 = tokenData.toString().substring(32);
      const data = `${phonehex}${searialhex}`;
      const number = 12341234; // UserPassword
      const keyhex = `${number.toString(16).toUpperCase()}0000000000000000`; //Secret Key End with 16 digit (0)
      const encryptedkey = CryptoJS.AES.encrypt(data, keyhex).toString();
      const encryptdata = CryptoJS.AES.encrypt(part1, encryptedkey).toString();

      const tokenLink = `https://dk9936.github.io/re-tok-${trnumbe}-${srNumber}-${formattedDate}-${formattedTime}/${encryptdata}`;
      console.log("Token Link:", tokenLink);
      setS(srNumber);
      baseUrlMeterDetails
        .child(srNumber)
        .child('rechargeToken')
        .once('value')
        .then((snapshot) => {
          const numberOfChildren = snapshot.numChildren();
          settrnumbe(numberOfChildren);
          baseUrlMeterDetails
            .child(srNumber)
            .child('rechargeToken')
            .child(`${result}-0${numberOfChildren}`)
            .set({
              balance: "null",
              isEmergency: false,
              isOC: false,
              kwh: "null",
              phoneNumber: adminPhone.toString(),
              link: tokenLink.toString(),
              rechargeAmount: rechargeAmount.toString(),
              rechargeToken: encryptdata, //56571852434D54529A72EE8A42112B2CF3B25A0D6C117A9C0f85711f56
              serialNumber: srNumber,
              tariffRate: "64.63",
              tokenGenerationTime: `${day}-${month}-${year}, ${hours}:${minutes}:00`,  //"14-10-23, 12:04:00"
              tokenId: numberOfChildren.toString()

            })
            .then(() => {
              console.log('Updated');
            })
            .catch((error) => {
              console.error('Error updating:', error);
            });


          baseUrlMeterDetails
            .child(srNumber)
            .child('rechargeToken')
            .update({ tokenCount: `0${numberOfChildren}` })

          // baseUrlAdminDetails
          // .child('adminPhone')
          // .child('sessionData')
          // .child('time')
          // .once('value')
          // .then((v)=>{
          // console.log("gfhfhf",v)
          // })

          baseUrlAdminDetails
            .child(adminPhone)
            .child('sessionData')
            .child('time')
            .once('value')
            .then((snapshot) => {
              const result = snapshot.val();
              setFetchedData(result); // Update state with fetched data
            })
          // .catch((err) => {
          // console.error("Error fetching data:", err);
          // });


        })
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
    });


    // Perform further operations with the selected SR numbers as needed
  };

  const decrypt = (token) => {
    const parsedURL = new URL(token);
    const urlSegment = parsedURL.pathname.split('/').pop();
    const ciphertext = CryptoJS.enc.Hex.parse(urlSegment.substring(0, 64));
    const key = CryptoJS.enc.Hex.parse('6D783230313139390000000000000000');
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }
    );






   // return decrypted.toString(CryptoJS.enc.Utf8);
    const decryptedHex = decrypted.toString(CryptoJS.enc.Hex);

    const timestamp = parseInt(decryptedHex.substring(30, 42).toLowerCase(), 16);
    const dateObject = new Date(timestamp);
    const dateTimeString = dateObject.toString();
    const hexToSignedInt = (hex) => {
      const value = parseInt(hex, 16);
      const maxInt = Math.pow(2, hex.length * 4 - 1);
      return value > maxInt ? value - maxInt * 2 : value;
    };
    const decryptedData = {
      srNo: parseInt(decryptedHex.substring(0, 6).toLowerCase(), 16).toString(),
      balance: hexToSignedInt(decryptedHex.substring(6, 14).toLowerCase(), 16).toString(),
      kWh: parseInt(decryptedHex.substring(14, 22).toLowerCase(), 16).toString(),
      amount: parseInt(decryptedHex.substring(22, 30).toLowerCase(), 16).toString(),
      timestamp: urlSegment.substring(64),


    };


    const exists = decryptedTokens.some((data) => {
      return (
        data.srNo === decryptedData.srNo &&
        data.balance === decryptedData.balance &&
        data.kWh === decryptedData.kWh &&
        data.amount === decryptedData.amount &&
        data.timestamp === decryptedData.timestamp
      );
    });

    if (!exists) {
      setDecryptedTokens((prevTokens) => [...prevTokens, decryptedData]);
    }
  };

  useEffect(() => {
    if (meters.length > 0) {
      showPendingTokens();
    }
  }, [meters]);

  const showAdminDetail = async () => {
    if (adminPhone.trim() === '') {
      setInputError(true);
      window.alert('Please enter admin phone number');
      return;
    }

    setInputError(false);

    try {
      const adminDetailsRef = baseUrlAdminDetails.child(adminPhone).child('meterList');
      const snapshot = await adminDetailsRef.once('value');
      const meterData = snapshot.val();

      if (meterData) {
        const meterKeys = Object.keys(meterData);
        setMeters(meterKeys);
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
    }
  };

  const showPendingTokens = async () => {
    try {
      const tokens = await Promise.all(
        meters.map((meter) =>
          baseUrlMeterDetails
            .child(meter)
            .child('rechargeRequestToken')
            .once('value')
            .then((snapshot) => snapshot.val())
        )
      );

      setRechargeTokens(tokens);

      tokens.forEach((token) => {
        if (token && token.isUsed === 'false') {
          decrypt(token.requestLink);
        }
      });
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  // Function to handle selecting/deselecting individual tokens
  const handleCheckboxChange = (token) => {
    const selectedIndex = selectedItems.indexOf(token);
    let newSelected = [...selectedItems];

    if (selectedIndex === -1) {
      newSelected = [...newSelected, token];
    } else {
      newSelected.splice(selectedIndex, 1);
    }

    setSelectedItems(newSelected);
  };

  // Function to handle toggling "Select All"
  const handleSelectAll = () => {
    if (!selectAll) {
      setSelectedItems([...decryptedTokens]);
    } else {
      setSelectedItems([]);
    }
    setSelectAll(!selectAll);
  };

  return (
    <>
      <div>
        <label htmlFor="adminPhoneInputId">Enter Admin Phone</label>
        <input
          id="adminPhoneInputId"
          type="number"
          value={adminPhone}
          onChange={(phone) => {
          setAdminPhone(phone.target.value);
          setInputError(false);
          }}
          required
        />
        <button onClick={showAdminDetail}>Get Admin Details</button>
      </div>
      <div>

        <label>
          <input type="checkbox"
            style={{ height: '25px', width: '25px', margin: '10px', float: 'left' }}
            checked={selectAll}
            onChange={handleSelectAll} />
          Select All
        </label>
        {decryptedTokens.map((token, index) => (

          <div>

            <div key={index}>
              <p>Meter Serial : {token.srNo}</p>

              <input
                style={{ height: '25px', width: '25px', margin: '10px', float: 'left' }}
                type="checkbox"
                checked={selectedItems.includes(token)}
                onChange={() => handleCheckboxChange(token)}
              />
              <input type="text" value={token.amount} readOnly />
              <input type="text" value={token.timestamp} readOnly />
              <input type="text" value={(token.kWh / 100.00).toFixed(2)} readOnly />
              <input type="text" value={(token.balance / 100.00).toFixed(2)} readOnly />
              {/* Conditionally render the Generate button only for the last token */}
              <div>
                {index === decryptedTokens.length - 1 && (
                  <button
                    onClick={handleGenerateClick}
                    style={{ alignItems: 'cennter' }}>
                    Generate</button>
                )}
              </div>

            </div>

          </div>
        ))}

      </div>

    </>
  );
}

export default NewApp;

