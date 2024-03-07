import React from 'react';

class CustomDataType {
  constructor(email, link) {
    this.email = email;
    this.link = link;
  }
}


const YourComponent = () => {
  // Creating an array of custom data type
  const customDataArray = [
    new CustomDataType('example1@email.com', 'http://example1.com'),
    new CustomDataType('example2@email.com', 'http://example2.com'),
    new CustomDataType('example3@email.com', 'http://example2.com'),
    // Add more items as needed
  ];

  // Rendering the array data
  return (
    <div>
      {customDataArray.map((item, index) => (
        <div key={index}>
          <p>Email: {item.email}  and Link : {item.link}</p>
          {/* <p>Link: {item.link}</p> */}
        </div>
      ))}
    </div>
  );
};

export default YourComponent;
