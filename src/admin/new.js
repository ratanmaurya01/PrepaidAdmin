import React, { useState } from 'react';

const NameUpdater = () => {
  const [name1, setName1] = useState('Initial Name1');
  const [name2, setName2] = useState('Initial Name2');
  const [inputValue, setInputValue] = useState('');

  const handleButtonClick = () => {
    console.log(`Previous name1: ${name1}`);
    console.log(`Current name2: ${name2}`);
   
    // Update name2 with the current input field value
    setName2(inputValue);

    // Update name1 with the current value of name2
    setName1(name2);
  };

  return (
    <div>
      <label>
        Input Field:
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleButtonClick}>Update Names</button>
      <br />
      <div>
        <strong>name1:</strong> {name1}
      </div>
      <div>
        <strong>name2:</strong> {name2}
      </div>
    </div>
  );
};

export default NameUpdater;