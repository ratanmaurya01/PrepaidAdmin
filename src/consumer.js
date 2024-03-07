import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import './consucss.css';
import Navbar from './adminLogin/navbar';
import Login from './adminLogin/login';
import { auth } from './adminLogin/firebase';

const Consumer = () => {
    const [data, setData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedSerial, setSelectedSerial] = useState(null);
    const [editableFields, setEditableFields] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [showAllData, setShowAllData] = useState(false);
    const [groupDetails, setGroupDetails] = useState(null);
    const [user, setUser] = useState(null); // State to hold user information


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                // User is logged in
                setUser(authUser);
                console.log("Logged in user:", authUser.email);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const numberPart = emailParts[0];
                    console.log("Number part:", numberPart); // Log the extracted number part
                    // Fetch data based on the numberPart
                    const dataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}`);
                    dataRef.once('value', (snapshot) => {
                        const newData = snapshot.val();
                        if (newData !== null) {
                            setData(newData || {});
                            setShowAllData(true); // Show the fetched data
                        } else {
                            console.log('Data not found for the provided number part.');
                            setData({});
                            setShowAllData(false); // Hide data if not found
                        }
                    });
                }
            } else {
                // No user is logged in, you can redirect to another page or handle accordingly
                setUser(null);
                // Example: Redirect to another page
                window.location.href = '/'; // Redirect to your login page
            }
        });

        return () => unsubscribe(); // Cleanup function for unmounting
    }, []);

    const handleSearch = async () => {

        const phoneNumber = searchTerm.trim();
        if (phoneNumber !== '') {
            const dataRef = database.ref(`/adminRootReference/tenantDetails/${phoneNumber}`);
            dataRef.once('value', (snapshot) => {
                const newData = snapshot.val();
                if (newData !== null) {
                    setData(newData || {});
                } else {
                    console.log('Data not found for the provided phone number.');
                    setData({});
                }
            });
        }

        setShowAllData(true);
    };

    const handleItemClick = (key) => {
        setSelectedItem(key);
        const details = data[key]; // Assuming data contains group details
        setGroupDetails(details);
        setSelectedSerial(null);
        setEditableFields(false); // Reset editable fields on item click
        // Fetch and set the details of the selected group

        setEditedData({}); // Clear edited data


    };

    const handleSerialClick = (serial) => {
        setSelectedSerial(serial);
        setEditableFields(false); // Reset editable fields on serial click
        setEditedData({}); // Clear edited data
    };


    const handleEdit = () => {
        setEditableFields(!editableFields);
        setEditedData({ ...data[selectedItem][selectedSerial] });
    };

    const handleSave = async () => {
        const phoneNumber = searchTerm.trim();
        const dataRef = database.ref(`/adminRootReference/tenantDetails/${phoneNumber}/${selectedItem}/${selectedSerial}`);

        // Save edited data to Firebase
        await dataRef.set(editedData);

        // Disable editing after saving
        setEditableFields(false);

        // Clear edited data
        setEditedData({});

        // Fetch the updated data from Firebase and update the state to reflect changes
        dataRef.once('value', (snapshot) => {
            const updatedData = snapshot.val();
            if (updatedData !== null) {
                setData((prevData) => ({
                    ...prevData,
                    [selectedItem]: {
                        ...prevData[selectedItem],
                        [selectedSerial]: updatedData,
                    },
                }));
            }
        });
    };

    const handleInputChange = (e, key) => {
        const { value } = e.target;
        setEditedData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    return (

        <>
            <Navbar />

            <div>
                <div className='contaier '>
                    <h2>Consumer Details</h2>
                     {/* <div>
                    <label>Search: </label>
                    <input
                        type="text"
                        className='input-field'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button class="btn btn-primary" onClick={handleSearch}>Search</button>
                </div>  */}
                </div>
                {showAllData && (
                    <div style={{ display: 'flex' }}>
                        <div className='sidebar' style={{ position: 'fixed', height: '85%', width: '15%', overflowY: 'auto' }}>
                            {/* Sidebar content */}
                            {Object.keys(data)
                                .filter((key) => key !== 'time' && key !== 'tarrif')
                                .map((key) => (
                                    <p key={key} onClick={() => handleItemClick(key)}>
                                        <img
                                            src="https://img.icons8.com/fluency/100/user-group-man-woman.png"
                                            style={{ width: '50px', height: '50px', marginRight: '20px' }}
                                            alt="User Group Icon"
                                        />
                                        {key}
                                    </p>
                                ))}
                        </div>
                        <div className='content' style={{ width: '95%', marginLeft: '15%' }}>
                            {/* <div style={{ backgroundColor: 'pink', height: '40px', borderRadius: '3px', width: '100%' }}>
                            <div style={{ display: 'flex' }}>
                                <img
                                    src="https://img.icons8.com/fluency/48/add-user-male.png"
                                    alt="Icon"
                                    style={{ width: '35px', height: '35px', marginRight: '5px' }}
                                />
                                <p style={{ color: '#000000', margin: '5px' }}>Add Consumer</p>
                            </div>
                        </div> */}
                            <div className='container'>
                                <div>
                                    {selectedItem && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            {/* Display serial numbers */}
                                            {Object.keys(data[selectedItem] || {})
                                                .filter(serial => serial !== 'tariff')
                                                .map((serial) => (
                                                    <p
                                                        style={{
                                                            margin: '10px',
                                                            width: '10%',
                                                            height: '50%',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                                            padding: '10px',
                                                            borderRadius: '5px',
                                                            backgroundColor: '#FFFFFF', // Add background color if needed
                                                        }}
                                                        key={serial}
                                                        onClick={() => handleSerialClick(serial)}
                                                    >
                                                        {/* Your serial number display content */}
                                                        {serial}
                                                    </p>
                                                ))}
                                            {/* Display group details */}
                                            {groupDetails && selectedItem in groupDetails && (
                                                <div style={{ width: '100%' }}>
                                                    <h3>Details for {selectedItem}</h3>
                                                    <ul>
                                                        {Object.entries(groupDetails[selectedItem]).map(([key, value]) => (
                                                            <li key={key}>
                                                                {key}: {value}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                )}
            </div>

        </>
    );
};

export default Consumer;
