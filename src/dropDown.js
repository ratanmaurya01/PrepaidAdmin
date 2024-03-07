import React, { useState } from 'react';
import { database } from './firebase';
import './consucss.css';

function DropDown() {
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState({});
    const [groupNames, setGroupNames] = useState([]);
    const [showAllData, setShowAllData] = useState(false);
    const [selectedGroupSerials, setSelectedGroupSerials] = useState([]);
    const [selectedSerialData, setSelectedSerialData] = useState({});
    const [selectedGroupName, setSelectedGroupName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedSerialData, setEditedSerialData] = useState({});


    const handleSearch = async () => {
        const phoneNumber = searchTerm.trim();
        if (phoneNumber !== '') {
            const dataRef = database.ref(`/adminRootReference/tenantDetails/${phoneNumber}`);
            dataRef.once('value', (snapshot) => {
                const newData = snapshot.val();
                console.log('Retrieved Data:', newData);
                if (newData !== null) {
                    setData(newData || {});
                    extractGroupNames(newData);
                    setShowAllData(true);
                    // You may perform additional operations based on retrieved data
                } else {
                    console.log('Data not found for the provided phone number.');
                    setData({});
                    setGroupNames([]);
                    setShowAllData(false);
                    // Handle case where data is not found
                }
            });
        } else {
            // Handle empty search term case if needed
        }
    };

    const extractGroupNames = (dataObj) => {
        if (dataObj) {
            const names = Object.keys(dataObj);
            setGroupNames(names);
        }
    };

    const handleGroupNameClick = (groupName) => {
        setSelectedGroupName(groupName);
        const selectedGroupData = data[groupName];
        console.log('Selected Group Data:', selectedGroupData);

        if (selectedGroupData) {
            const serials = Object.keys(selectedGroupData).filter(key => key !== 'tariff');
            if (serials.length > 0) {
                setSelectedGroupSerials(serials);
                console.log('Serial Numbers:', serials);
            } else {
                setSelectedGroupSerials([]);
                console.log('No serial numbers found for this group.');
            }
        } else {
            setSelectedGroupSerials([]);
            console.log('No data found for this group.');
        }
    };
    const [selectedSerialDataList, setSelectedSerialDataList] = useState([]);
    const handleSerialNumberClick = (serialNumber) => {
        const selectedSerialData = data[selectedGroupName][serialNumber]; // Assuming selectedGroupName is defined
        console.log('Selected Serial Data:', selectedSerialData);
       
        const updatedSelectedSerialDataList = [...selectedSerialDataList, selectedSerialData];
    setSelectedSerialDataList(updatedSelectedSerialDataList);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setEditedSerialData(selectedSerialData);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setEditedSerialData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSaveClick = () => {
        setSelectedSerialData(editedSerialData);
        setIsEditing(false);
    }







    return (
        <>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter phone number"
            />
            <button onClick={handleSearch}>Search</button>

            {showAllData && (
                <div>
                   
                    <ul>
                        {groupNames.map((groupName) => (
                            <li key={groupName}>
                                <button onClick={() => handleGroupNameClick(groupName)}>
                                    {groupName}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div>
                        <h3>Selected Group Serial Numbers:</h3>
                        <ul>
                            {selectedGroupSerials.map((serialNumber) => (
                                <li key={serialNumber}>
                                    <button onClick={() => handleSerialNumberClick(serialNumber)}>
                                        {serialNumber}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Display selected serial number data */}
                    <div>
                     
                        <div className='input-row'>

                        <div>
    {selectedSerialDataList.map((serialData, index) => (
        <div key={index} className=''>
            {Object.entries(serialData).map(([key, value]) => (
                <div key={key}>
                    <label htmlFor={key}>{key}:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            id={key}
                            value={editedSerialData[key]}
                            onChange={handleInputChange}
                        />
                        
                    ) : (
                        <input
                            type="text"
                            id={key}
                            value={value}
                            readOnly
                        />
         
                    )}
                </div>
            ))}
            <div>
                {isEditing ? (
                    <button onClick={handleSaveClick}>Save</button>
                ) : (
                    <button onClick={handleEditClick}>Edit</button>
                )}
          
            </div>
        </div>
    ))}
</div>

                         
                            
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

export default DropDown;
