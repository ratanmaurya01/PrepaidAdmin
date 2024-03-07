// import React, { useState, useEffect, useRef } from 'react';
// import { database } from './firebase';
// import firebase from 'firebase/app';
// import 'firebase/database';
// import './consucss.css';
// import DatePicker from 'react-datepicker';


// function Creategroup() {
//     const [showInputs, setShowInputs] = useState(false);

//     let [inputValues, setInputValues] = useState({
//         input1: '',
//         input2: '', // Assuming default value for tariff rate is 0, update it accordingly
//     });
//     const [selectOptions, setSelectOptions] = useState([]);
//     const [data, setData] = useState({});
    
//     const [selectedGroupData, setSelectedGroupData] = useState([]);
//     const [searchExecuted, setSearchExecuted] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');

//     const handleSearch = async () => {
//         const phoneNumber = searchTerm.trim();
//         if (phoneNumber !== '') {
//             try {
//                 const dataRef = database.ref(`/adminRootReference/tenantDetails/${phoneNumber}`);
//                 const snapshot = await dataRef.once('value');
//                 const newData = snapshot.val();
//                 setData(newData || {});
//                 setSelectedGroupData(newData);
//                 console.log("data", newData);

//                 // Extract select options based on received data
//                 if (newData) {
//                     const options = Object.keys(newData).map(key => key.replace(/\s/g, '_'));
//                     setSelectOptions(options);
//                 }
//                 setSearchExecuted(true);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//                 // Handle error (e.g., show an error message to the user)
//             }
//         }
//     };

//     const extractSerialNumbers = () => {

//         const extractedSerials = Object.values(data).reduce((acc, item) => {
//             if (item && typeof item === 'object' && !Array.isArray(item)) {
//                 const keys = Object.keys(item);
//                 const filteredKeys = keys.filter((key) => !isNaN(Number(key)));
//                 acc.push(...filteredKeys.map(serial => ({ serial, name: item[serial].name })));
//             }
//             console.log("return data")
//             return acc;
//         }, []);

//     }
//     useEffect(() => {
//         extractSerialNumbers();
//     }, [data]);


//     return (
//    <>

//             <div className='container' style={{ marginLeft: '20%', padding: '10px', position: 'absolute' }}>

//                 <input
//                     type="number"
//                     className="input-field "
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     placeholder="Enter phone number"
//                     required
//                 />
//                 <button className="btn btn-primary my-2" onClick={() => {
//                     handleSearch();
//                  // Call handleSearch1 after updating phoneNumber
//                 }}>
//                     Search
//                 </button>
//                 </div>


//                 <div className="col-lg-4 col-md-12 mb-3">
//                                             <label className="form-label">Create/ Select group </label>
//                                             <div className="position-relative" onClick={() => {
//                                                 setShowInputs(!showInputs); // Toggle inputs on icon click
//                                             }}>
//                                                 <input
//                                                     type="text"
//                                                     className="form-control w-100" // Added Bootstrap class to set width to 100%
//                                                     placeholder="Select an option"
//                                                     readOnly // Prevent direct editing of input
//                                                     style={{ width: '100%', paddingRight: '30px' }} // Adjusted width for responsiveness
//                                                     value={getInputValue()} // Call the function to determine input value
//                                                     onChange={handleSelectChange}
//                                                 />
//                                                 <span
//                                                     className="position-absolute top-50 end-0 translate-middle-y"
//                                                     style={{ cursor: 'pointer' }}
//                                                     onClick={() => {
//                                                         setShowInputs(!showInputs); // Toggle inputs on icon click
//                                                     }}
//                                                 >
//                                                     &#9660; {/* Unicode for down arrow */}
//                                                 </span>
//                                             </div>
//                                         </div>
                               
//                                </







//             </>
//             )
// }

//             export default Creategroup