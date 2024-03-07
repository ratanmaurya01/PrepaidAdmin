import React, { useEffect, useState } from 'react';
import firebase from './firebase';
import './style.css'

function Tokenui() {
    const [data, setData] = useState({
        location: '',
        name: '',
        serial: '',
        phone: ''
    });

    useEffect(() => {
        // Function to fetch data from Firebase Realtime Database
        const fetchData = async () => {
            try {
                const database = firebase.database();
                const dataRef = database.ref('tenantDetails/'); // Replace with your actual database path

                // Fetch data once from the database
                const snapshot = await dataRef.once('value');

                // Get the data from the snapshot
                const fetchedData = snapshot.val();

                console.log('Fetched Data:', fetchedData); // Log fetched data

                // Update the state with the fetched data
                setData({
                    location: fetchedData.location || '',
                    name: fetchedData.name || '',
                    serial: fetchedData.serial || '',
                    phone: fetchedData.phone || ''
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData(); // Fetch data when the component mounts

        // Clean-up function (optional)
        return () => {
            // Perform any necessary clean-up
        };
    }, []);

    console.log('Data:', data); // Log current state data

    return (
        <>
            {/* <div>
        <label htmlFor="srNo">SR No:</label>
        <input type="text" id="srNo" value={data.location} disabled /><br />

        <label htmlFor="date">Date:</label>
        <input type="text" id="date" value={data.name} disabled /><br />

        <label htmlFor="time">Time:</label>
        <input type="text" id="time" value={data.serial} disabled /><br />

        <label htmlFor="paymentDetails">Payment Details:</label>
        <input type="text" id="paymentDetails" value={data.phone} disabled /><br />
      </div> */}
            <div className='container'>

                <div className='meterdetails'>
                    <input type='checkbox' />
                    <p>Meter Serial:</p>
                    <p><span>name:</span><span> Address:</span></p>
                </div>
                <div>
                    <form className='form'>
                        <div class="input-row">
                            <div class="input-field">
                                <label for="input1">Input 1:</label>
                                <input type="text" id="input1" placeholder="Enter Input 1" />
                            </div>
                            <div class="input-field">
                                <label for="input2">Input 2:</label>
                                <input type="text" id="input2" placeholder="Enter Input 2" />
                            </div>
                            <div class="input-field">
                                <label for="input3">Input 3:</label>
                                <input type="text" id="input3" placeholder="Enter Input 3" />
                            </div>
                            <div class="input-field">
                                <label for="input4">Input 4:</label>
                                <input type="text" id="input4" placeholder="Enter Input 4" />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Tokenui;
