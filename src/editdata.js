import React, { useState } from 'react';
import { database } from './firebase';

function Editdata() {

     




  // Initial data
  const initialData = {
    name: 'abcsd',
    number: '9898343424',
    location: 'xyzz',
    email: 'mairua@gmail.com',
  };

  // State to manage edit mode and form data
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [tempFormData, setTempFormData] = useState(initialData);

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempFormData({
      ...tempFormData,
      [name]: value,
    });
  };

  // Function to handle the Edit button click
  const handleEditClick = () => {
    if (!editMode) {
      setTempFormData(formData);
    }
    setEditMode(!editMode);
  };

  // Function to handle the Save button click
  const handleSaveClick = () => {
    setFormData(tempFormData);

    setEditMode(false);
    console.log("Save data form ",tempFormData);
    
  };

  // JSX for input fields and data
  return (
    <div>
      <h2>Edit Data</h2>
      <form>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            value={editMode ? tempFormData.name : formData.name}
            readOnly={!editMode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="number">Number:</label>
          <input
            type="text"
            id="number"
            name="number"
            placeholder="Enter your number"
            value={editMode ? tempFormData.number : formData.number}
            readOnly={!editMode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="Enter your location"
            value={editMode ? tempFormData.location : formData.location}
            readOnly={!editMode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={editMode ? tempFormData.email : formData.email}
            readOnly={!editMode}
            onChange={handleInputChange}
          />
        </div>

        <button type="button" onClick={handleEditClick}>
            Edit
          </button>
       
          <button type="button" onClick={handleSaveClick}>
            Save
          </button>
       
      
      </form>
    </div>
  );
}

export default Editdata;
