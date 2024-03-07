import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

const DecryptionComponent = () => {
  const [decryptedData, setDecryptedData] = useState(null);
  const encryptedText = 'FC7FDF128F2C257C5578328AB83E30634A17EBB9D212BCA46F7E4908EBF20297';
  const secretKey = '6D783230313139390000000000000000';

  const decryptData = () => {
    const encryptedData = CryptoJS.enc.Hex.parse(encryptedText);
    const key = CryptoJS.enc.Hex.parse(secretKey);

    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedData }, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    });

    setDecryptedData(decrypted);
  };

  const formatDecryptedData = () => {
    if (decryptedData) {
      const decryptedHex = CryptoJS.enc.Hex.stringify(decryptedData);
      return decryptedHex;
    }
    return 'No decrypted data available';
  };

  const hexToDecimal = (hex) => {
    return parseInt(hex, 16);
  };

  const getInputFields = () => {
    if (decryptedData) {
      const decryptedHex = CryptoJS.enc.Hex.stringify(decryptedData);

      const serialNumber = hexToDecimal(decryptedHex.substring(0, 6));
      const balAmountHex = decryptedHex.substring(6, 14); // Get the hex value
      let balAmount = hexToDecimal(balAmountHex); // Convert to decimal

      // Handle signed 2's complement representation with 3 digits
      const isNegative = (balAmount & (1 << 23)) !== 0;
      if (isNegative) {
        balAmount = -((~balAmount + 1) & 0x7FFFFF); // Apply 2's complement if negative
      }

      const kWh = hexToDecimal(decryptedHex.substring(14, 22));
      const amount = hexToDecimal(decryptedHex.substring(22, 30));
      const time = hexToDecimal(decryptedHex.substring(30, 42));

      return (
        <div>
          <div>
            <label htmlFor="serialNumber">Serial Number:</label>
            <input id="serialNumber" type="text" value={serialNumber} readOnly />
          </div>
          <div>
            <label htmlFor="balAmount">Bal Amount:</label>
            <input id="balAmount" type="text" value={balAmount} readOnly />
          </div>
          <div>
            <label htmlFor="kWh">kWh:</label>
            <input id="kWh" type="text" value={kWh} readOnly />
          </div>
          <div>
            <label htmlFor="amount">Amount:</label>
            <input id="amount" type="text" value={amount} readOnly />
          </div>
          <div>
            <label htmlFor="time">Time:</label>
            <input id="time" type="text" value={time} readOnly />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <p>Encrypted Text: {encryptedText}</p>
      <button onClick={decryptData}>Decrypt</button>
      <div>
        <p>Decrypted Text (in Hex): {formatDecryptedData()}</p>
        {getInputFields()}
      </div>
    </div>
  );
};

export default DecryptionComponent;
