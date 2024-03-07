// onGroupSelect.js

import React, { useState } from 'react';
import AddConsumer from './addconsumer';

const Group = () => {
  const [groupName, setGroupName] = useState('');
  const [editedSerialNumber, setEditedSerialNumber] = useState('');
  const [clickedItem, setClickedItem] = useState(null);

  const handleGroupSelect = (selectedGroupData) => {
    // Handle the selected group data from GroupSelectionComponent
    // Example: setGroupName(selectedGroupData.name);
    // Handle other state changes or actions based on the selected group
  };

  return (
    <div className="col-md-6">
      <label className="form-label">Create/Select Group</label>
      {/* Use the GroupSelectionComponent here */}
      <AddConsumer onGroupSelect={handleGroupSelect} />
      {/* You can pass necessary props or handle state changes as required */}
    </div>
  );
};

export default Group;
