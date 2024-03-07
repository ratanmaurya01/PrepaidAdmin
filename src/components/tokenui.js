import React,  { useEffect, useState } from 'react'
import './style.css'
import firebase from './firebase';


function Tokenui() {
    const [data, setData] = useState({
        srNo: '',
        date: '',
        time: '',
        paymentDetails: ''
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
    
            // Update the state with the fetched data
            setData({
              srNo: fetchedData.srNo || '',
              date: fetchedData.date || '',
              time: fetchedData.time || '',
              paymentDetails: fetchedData.paymentDetails || ''
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
  return (
    <>
    <div>
      <label htmlFor="srNo">SR No:</label>
      <input type="text" id="srNo" value={data.srNo} disabled /><br />

      <label htmlFor="date">Date:</label>
      <input type="text" id="date" value={data.date} disabled /><br />

      <label htmlFor="time">Time:</label>
      <input type="text" id="time" value={data.time} disabled /><br />

      <label htmlFor="paymentDetails">Payment Details:</label>
      <input type="text" id="paymentDetails" value={data.paymentDetails} disabled /><br />
    </div>
       {/* <div className='container'> 
          <div className='generate_token'>
               <h3>Generate Token</h3>
          </div>
          <div className='meterdetails'>
                <input type='checkbox' ></input>
                <p> Meter Serial :</p>    
                <p><span>name : </span> <span> Address :</span></p>       
          </div>
       </div> */}
    </>
  )
}

export default Tokenui
