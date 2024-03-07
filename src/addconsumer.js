import React, { useState, useEffect, useRef } from 'react';
import { database } from './firebase'; // Import the Realtime Database instance
import firebase from 'firebase/compat/app'; // Import the Firebase app (latest version)
import 'firebase/compat/database'; // Import the Realtime Database (latest version)
import './consucss.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from './adminLogin/navbar';
import { auth } from './adminLogin/firebase';
import { validatePhoneNumber, validateName, validateAddress, validateEmail } from './validation/validation';





function AddConsumer() {
    const dateInputRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const handleIconClick = () => {
        setShowDatePicker(!showDatePicker); // Toggle date picker visibility
    };
    function formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
    }
    const [data, setData] = useState({});
    const [serialOptions, setSerialOptions] = useState([]);
    const [showInputs, setShowInputs] = useState(false);
    let [inputValues, setInputValues] = useState({
        input1: '',
        input2: '', // Assuming default value for tariff rate is 0, update it accordingly
    });
    const [selectOptions, setSelectOptions] = useState([]);
    const [displayedInput2, setDisplayedInput2] = useState('');
    const [displayedInput1, setDisplayedInput1] = useState('');
    const [existingGroups, setExistingGroups] = useState([]);
    const [selectedGroupData, setSelectedGroupData] = useState([]);
    const [searchExecuted, setSearchExecuted] = useState(false);
    const [selectedMeter, setSelectedMeter] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [meterList, setMeterList] = useState([]);
    const [error, setError] = useState('');
    const [mergedArray, setMergedArray] = useState([]);
    const [selectedGroupName, setSelectedGroupName] = useState(''); // State to store selected group name
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedExistingGroupName, setSelectedExistingGroupName] = useState()
    const [consumerMobileNumber, setConsumerMobileNumber] = useState('');
    const [consumerEmail, setConsumerEmail] = useState('');
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
                    // console.log("Number part:", numberPart); // Log the extracted number part
                    handleSearch(numberPart);
                    handleSearch1(numberPart);
                }
            } else {
                setUser(null);
                window.location.href = '/'; // Redirect to your login page
            }
        });
        return () => unsubscribe(); // Cleanup function for unmounting
    }, []);


    const handleSearch = async (phoneNumber) => {
        const trimmedPhoneNumber = phoneNumber.trim();
        if (trimmedPhoneNumber !== '') {
            try {

                if (!phoneNumber) {
                    //   console.error('Error: numberPart is undefined or null.');
                    return;
                }
                const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
                const snapshot = await dataRef.once('value');
                const newData = snapshot.val();
                setData(newData || {});
                setSelectedGroupData(newData);
                //  console.log("data", newData);

                // Extract select options based on received data
                if (newData) {
                    const options = Object.keys(newData).map(key => key.replace(/\s/g, '_'));
                    setSelectOptions(options);
                }
                setSearchExecuted(true);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error (e.g., show an error message to the user)
            }
        }
    };


    const extractSerialNumbers = () => {

        const extractedSerials = Object.values(data).reduce((acc, item) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                const keys = Object.keys(item);
                const filteredKeys = keys.filter((key) => !isNaN(Number(key)));
                acc.push(...filteredKeys.map(serial => ({ serial, name: item[serial].name })));
            }
            //  console.log("return data")
            return acc;
        }, []);
        setSerialOptions(extractedSerials);
    }
    useEffect(() => {
        extractSerialNumbers();
    }, [data]);




    const handleSearch1 = async (numberPart) => {
        try {
            if (!numberPart) {
                // console.error('Error: numberPart is undefined or null.');
                return;
            }
            const phoneNumberValue = numberPart.trim(); // Retrieve phone number
            if (phoneNumberValue !== '') {
                setPhoneNumber(phoneNumberValue); // Update phoneNumber state
                const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumberValue}/meterList`).once('value');
                const fetchedMeterList = snapshot.val();
                //  console.log("meteltelsit ", fetchedMeterList);
                if (fetchedMeterList) {
                    const meterIds = Object.keys(fetchedMeterList);
                    Object.keys(fetchedMeterList).forEach(async (serialNumber) => {
                        await isTokenAvailable(serialNumber);
                    });
                    setMeterList(meterIds);

                    setError('');
                } else {
                    setMeterList([]);
                    setError('No meter list found for this admin phone');
                }
            }
        } catch (error) {
            console.error('Error fetching admin meter list:', error);
            setMeterList([]);
            setError('Error fetching admin meter list. Please try again.');
        }
    };


    useEffect(() => {
        extractSerialNumbers();
        handleSearch1();
    }, []);


    useEffect(() => {
        // Merge two arrays when either serialOptions or meterList changes
        const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];
        setMergedArray(merged);
    }, [serialOptions, meterList]);

    // useEffect(() => {
    //     // Filtering the merged array based on matching serial numbers with names or no names in meterList
    //     const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];
    //     setMergedArray(merged);
    // }, [serialOptions, meterList]);
    useEffect(() => {
        // Merge two arrays when either serialOptions or meterList changes
        const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];

        // Create a map to store unique serial numbers with their names
        const uniqueSerialsMap = new Map();

        // Iterate through the merged array to filter out duplicates based on serial number
        merged.forEach(item => {
            if (item.name) {
                // If a serial number already exists in the map, skip adding it (as we only want unique serials with names)
                if (!uniqueSerialsMap.has(item.serial)) {
                    uniqueSerialsMap.set(item.serial, item.name); // Store serial number with its name
                }
            } else {
                // If no name is available, check for duplicates and store only one entry
                if (!uniqueSerialsMap.has(item.serial)) {
                    uniqueSerialsMap.set(item.serial, null); // Store serial number without a name
                }
            }
        });

        // Convert the unique serials map back to an array
        const uniqueSerialsArray = Array.from(uniqueSerialsMap).map(([serial, name]) => ({ serial, name }));

        // Sort the merged array alphabetically based on serial numbers
        uniqueSerialsArray.sort((a, b) => a.serial.localeCompare(b.serial));

        // Set the sorted merged array with unique serials and names
        setMergedArray(uniqueSerialsArray);
    }, [serialOptions, meterList]);



    const handleInputChange = (e) => {


        
        setTariffRateError('');
        setGroupNameError('');



        const { name, value } = e.target;

        if (name === 'input1') {
            // Regular expression to match only alphanumeric characters and spaces
            const alphanumericRegex = /^[a-zA-Z0-9\s ]*$/;

            if (!alphanumericRegex.test(value) && value !== '') {
                setGroupNameError('Special characters not allowed ');
            }
            else if (value.charAt(0) === ' ') {

                return;
            } else {
                setGroupNameError('');
                setInputValues({ ...inputValues, [name]: value });
            }
        } else if (name === 'input2') {
            // Validation for input2 (Tariff Rate)
            const numericRegex = /^(?:\d{1,2}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/;

            if (numericRegex.test(value) || value === '') {
                setInputValues({ ...inputValues, [name]: value });
            } else {
                setTariffRateError('');
            }
        }
    };




    // const handleInputChange = (e) => {

    //     const { name, value } = e.target;
    //     // Validation for input2 (Tariff Rate)
    //     if (name === 'input2') {
    //         // Regular expression to match only numeric characters with decimals
    //         const numericRegex = /^(?:\d{1,2}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/;

    //         if (numericRegex.test(value) || value === '') {
    //             setInputValues({ ...inputValues, [name]: value });
    //         }
    //     } else {
    //         // For other inputs (input1 or any other fields), update normally
    //         setInputValues({ ...inputValues, [name]: value });
    //     }

    //     if (name === 'input1') {
    //         setGroupNameError('');
    //     } else if (name === 'input2') {
    //         setTariffRateError('');
    //     }


    // };


    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setInputValues({ ...inputValues, [name]: value });
    // };



    const handleAddClick = async () => {

        setErrorMessagegroupname('');
        setTariffRateError('');

        
        try {
            // if (!inputValues.input1 || !inputValues.input2) {
            //     // If either input field is empty, show an error message
            //     setGroupNameError(!inputValues.input1 ? "Cannot be empty" : "");
            //     setTariffRateError(!inputValues.input2 ? "Invalid tariff" : "");
            //     return; // Return early if there are errors
            // }
            if (!inputValues.input1) {
                // If input1 is empty, show an error message and return early
                setGroupNameError("Enter group name. ");
                return;
            }
            
            // if (!inputValues.input2) {
            //     // If input2 is empty, show an error message and return early
            //     setTariffRateError("Enter tariff rate");
            //     return;
            // }


            if (!inputValues.input2) {
                // If input2 is empty, show an error message and return early
                setTariffRateError("Enter tariff rate.");
                return;
            }
            

          
            if (
                inputValues.input2.startsWith(".") ||
                inputValues.input2.startsWith("0.") ||
                inputValues.input2.startsWith("00.") ||
                inputValues.input2 === "0" ||
                inputValues.input2 === "00" ||
                inputValues.input2.endsWith(".")
            ) {
                // If any of the conditions are met, show an error message and return early
                setTariffRateError("Invalid tariff rate");
                return;
            }
            
            if (/^0(\.0{1,2})?$|^0\.99$/.test(inputValues.input2)) {
                // If input2 is in the range, show an error message and return early
                setTariffRateError("Invalid tariff.");
                return;
            }
            


            const input2Value = inputValues.input2;
            let updatedInput2Value = input2Value;
            if (input2Value.includes('.') && input2Value.split('.')[1].length === 1) {
                updatedInput2Value = input2Value + '0';
            }


            const newOption = `${inputValues.input1} - ${inputValues.input2}`;
            setDisplayedInput1(inputValues.input1);

            setSelectedGroupName(inputValues.input1);
            setShowInputs(false);

            // setDisplayedInput2(inputValues.input2);
            setDisplayedInput2(updatedInput2Value);
            setInputValues({
                input1: '',
                input2: ''
            });

            // After the asynchronous operation, you can update state or perform other tasks
            setShowInputs(false);
        } catch (error) {
            console.error('Error:', error);
            // Handle error (e.g., show an error message to the user)
        }

    };



    const handleSelectChange = (e) => {
        const value = e.target.value;
        setShowInputs(value === 'showInputs');
        // console.log("check values", value);
    };
 

    useEffect(() => {
        // Transform data into an array of group names (existing groups)
        const groups = Object.keys(data || {}).map(group => group.replace(/_/g, ' '));
        setExistingGroups(groups);


        //  console.log('Existing Groups:', groups);
    }, [data, setExistingGroups]);
    // console.log("Check all data for", data);
    const handleGroupClick = (group) => {
        // Access the data related to the clicked group and perform actions
        const groupData = data[group.replace(/ /g, '_')]; // Assuming your data structure contains group-related data
        // setSelectedGroupData(groupData);
        setSelectedGroupName(group);
        setSelectedGroup(group);
        const groupNames = Object.keys(groupData || {}).filter(key => key !== 'tariff');
        // console.log("Group names for", group, ":", groupNames);

        ////  console.log("Group name ", groupData);
        setSelectedExistingGroupName(group);
        const groupName = displayedInput1 || selectedExistingGroupName; // Choose the appropriate value
        /// console.log("Group Name for Saving Data:", groupName);
        console.log("Selected Existing Group Name:", group);
        if (groupData && groupData.tariff) {
            setDisplayedInput2(groupData.tariff.toString()); // Assuming displayedInput2 is a state variable
        } else {
            setDisplayedInput2(''); // Clear the displayedInput2 if no tariff rate is available for the selected group
        }



        setShowInputs(false); // Hide the input fields after selecting a group


    };

    const calculateMetersCount = (groupData) => {
        let count = 0;
        if (groupData) {
            count = Object.keys(groupData).filter(key => key !== 'tariff').length;
        }
        return count;
    };


    const [errorserialnumber, setErrorMessageserialnumber] = useState('');
    const [errormeterlocation, setErrorMessagemeterlocation] = useState('');
    const [errormessagename, setErrorMessagename1] = useState('');
    const [errormessagenumber, setErrorMessagenumber] = useState('');
    const [errormessagedoo, setErrorMessageedoo] = useState('');
    const [errormessagegroupname, setErrorMessagegroupname] = useState('');

    const [dateSelected, setDateSelected] = useState(false);
    useEffect(() => {
        if (dateSelected) {
            setErrorMessageedoo('');
        }
      }, [dateSelected]);
      



    const handleFormSubmit = (event) => {
        //  event.preventDefault();

        if (!selectedMeter) {
            // Form submission should be prevented if selectedMeter is not set
            event.preventDefault();
            setErrorMessageserialnumber('Please select meter serial number.');
            return;
        }

    
        if (selectedGroupName === "") {
            event.preventDefault();
            setErrorMessagegroupname("Create or Select a group for the meter.");
            // alert("Please enter a email");
         return;
        }

        event.preventDefault();


        // Retrieve form input values
        const meterLocation = document.getElementById('inputEmail1').value;
        const tariffRate = document.getElementById('inputEmail2').value;
        const consumerName = document.getElementById('inputEmail3').value;
        const consumerMobileNumber = document.getElementById('consumerMobileNumber').value;
        //  const consumerEmailAddress = document.getElementById('inputEmail5').value;
        const dateOfOccupancy = document.getElementById('email').value;
        const emailToSave = consumerEmail.trim() === '' ? 'na' : consumerEmail;


        if (meterLocation === "") {
            setErrorMessagemeterlocation("Enter the consumer's meter location.");
            // alert("Please enter a email");
            return;
        }

        if (consumerName === "") {
            setErrorMessagename1("Enter the consumer's name.");
            // alert("Please enter a email");
            return;
        }
        if (consumerMobileNumber === "") {
            setErrorMessagenumber("Enter a valid mobile number.");
            // alert("Please enter a email");
            return;
        }
        if (dateOfOccupancy === "") {
            setErrorMessageedoo("Date canont be empty.");
            // alert("Please enter a email");
            return;
        }


        // if (meterLocation === '' || tariffRate === '' || consumerName === '' || consumerMobileNumber === '') {
        //     // Handle validation error - one or more fields are empty
        //     alert('Please fill in all required fields.');
        //     return;
        // }


        if (selectedMeter.includes('-')) {
            // Condition to check if the selected meter is a group
            alert('Consumer details present for this meter. \n You can edit or delete.');
            window.location.reload();
            return;
        }

        const groupName = (displayedInput1 || selectedExistingGroupName).split(' ').join('_');


        // const groupName = displayedInput1 || selectedExistingGroupName; // Get the group name for saving data
        // console.log("Group Name for Saving Data:", groupName);


        const selectedSerialNumber = selectedMeter; // Replace with actual selected serial number

        // Prepare data object
        const data = {
            name: consumerName,
            email: emailToSave,
            location: meterLocation,
            phone: consumerMobileNumber,
            serial: selectedSerialNumber,
            tariff: tariffRate,
            doo: dateOfOccupancy,
            // Add other fields as needed
        };
        console.log("groupName before reference construction:", groupName);
        // Get reference to Firebase database
        const adminReference = firebase.database().ref(`/adminRootReference/tenantDetails/${phoneNumber}/${groupName}/${selectedSerialNumber}`);
        // Save data to Firebase
        adminReference.set(data)
            .then(() => {
                event.target.reset();
                setSelectedMeter(''); // Reset selectedMeter state to clear the first select element
                setDisplayedInput1('');
                // Reset displayedInput1 state to clear the second select element

                const tariffReference = firebase.database().ref(`/adminRootReference/tenantDetails/${phoneNumber}/${groupName}/tariff`);
                tariffReference.set(tariffRate)
                    .then(() => {
                        // Data saved successfully
                        //  console.log('Tariff rate saved to Firebase!');
                        // Optionally, perform any additional actions upon successful tariff rate save
                    })
                    .catch((error) => {
                        // Handle errors
                        //   console.error('Error saving tariff rate to Firebase: ', error);
                        // Optionally, display an error message or handle the error condition
                    });
                // Data saved successfully
                //console.log('Data saved to Firebase!');
                alert('Data saved successfully!');
                window.location.reload();
                // Optionally, perform any additional actions upon successful data save
            })
            .catch((error) => {
                // Handle errors
                // console.error('Error saving data to Firebase: ', error);
                // Optionally, display an error message or handle the error condition
            });
    };




    // const getInputValue = () => {
    //     if (selectedGroupName) {
    //         return selectedGroupName;
    //     } else if (inputValues.input1) {

    //     } else {
    //         return 'Create/Selected Group';
    //     }
    // };
    // Modified getInputValue function to handle displaying group name with underscores replaced by spaces


    const getInputValue = () => {
        if (selectedGroupName) {
            return selectedGroupName.split('_').join(' '); // Replace underscores with spaces
        } else if (inputValues.input1) {
            return inputValues.input1;
        } else {
            return 'Create/Selected Group';
        }
    };



    const [errroPhone, setPhoneError] = useState('');
    const handleMobileNumberChange = (e) => {
        setErrorMessagenumber('')
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        // Check if the first character is '0'
        if (value.charAt(0) === '0') {
            // Display error message
            setPhoneError("Can't start with Zero");
        } else {
            // Clear error message if no longer applicable
            setPhoneError("");
            // Update state
            setConsumerMobileNumber(value);
        }
    };


    // const handleMobileNumberChange = (e) => {

    //     const inputValue = e.target.value; // Limit input to 10 characters
    //     setConsumerMobileNumber(inputValue); // Allow only digits
    // };

    // const handleEmailChange = (e) => {
    //     setConsumerEmail(e.target.value);
    // };


    const [errorEmail, setEmailError] = useState('');
    const handleEmailChange = (event) => {

        const value = event.target.value;
        setConsumerEmail(value);
        const error = validateEmail(value);
        setEmailError(error || '');
    };


    const handleResetInputs = () => {
        setInputValues({
            input1: '',
            input2: '',
        });
    };
    
    const handleCloseClick = () => {

        setGroupNameError('');
        setTariffRateError('');

        handleResetInputs(); // Reset input values when closing


        setShowInputs(false);
    };




    const [tokenStatus, setTokenStatus] = useState([]);


    const isTokenAvailable = async (serialNumber, index) => {
        try {
            const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${serialNumber}/reConfigToken`);
            const snapshot = await meterDetailsPath.once('value');
            const newData = snapshot.val();
            if (!newData) {
                // console.log(`Data not found for serial number ${serialNumber}`);
                return;
            }

            const isTransfer = newData.isTransfer;
            const token = newData.token;

            let status;
            if (isTransfer === 'false' && token !== 'null') {
                status = "*";
            } else if (isTransfer === 'true' && token !== 'null') {
                status = "**";
            } else {
                status = "";
            }

            setTokenStatus(prevState => ({
                ...prevState,
                [serialNumber]: status
            }));
        } catch (e) {
            // console.log('Error Fetching:', e);
        }
    };

    useEffect(() => {
        mergedArray.forEach(({ serial }, index) => {
            isTokenAvailable(serial, index);
        });
    }, [mergedArray]);



    const [errorName, setErrorName] = useState('');
    const [consumerName, setConsumerName] = useState('');


    const handleInputNameChange = (e) => {

        setErrorMessagename1('');

        const newName = e.target.value;
        const validationError = validateName(newName); // Use validateName function
        if (validationError) {
            setErrorName(validationError);
            //  setNewName(''); // Clear the input field value
        } else {
            // setErrorName('');
            setConsumerName(newName);
        }

    };

    const [meterLocation, setmeterLocation] = useState('');
    const [errorMeter, setErrorMeter] = useState('');

    const handleInputMeterChange = (event) => {
        setErrorMessagemeterlocation('');
        const address = event.target.value;
        const addressError = validateAddress(address);

        if (addressError) {
            // Display the address error message
            setErrorMeter(addressError);
        } else {
            // Update the state with the valid address
            setmeterLocation(address);
            setErrorMeter("");
        }
    };
    


    // const [inputValues, setInputValues] = useState({ groupName: '', tariffRate: '' });
    const [groupNameError, setGroupNameError] = useState('');
    const [tariffRateError, setTariffRateError] = useState('');

    const handleSelectChange1 = (e) => {
        const selectedValue = e.target.value;
        setErrorMessageserialnumber('')
        if (selectedValue.includes('-')) {
            console.log('You selected serial with name:', selectedValue);
            setSelectedMeter(selectedValue);
            alert("Consumer details present for this meter. \n You can edit or delete.", selectedValue);
            e.preventDefault(); // Prevents the form from being submitted
            // Set the entire selected value with name to the state
        } else {
            console.log('You selected only meter:', selectedValue.split(' - ')[0]);
            setSelectedMeter(selectedValue.split(' - ')[0]); // Set only the serial part without the name to the state
        }
    };





    return (
        <>
            {/* <Navbar /> */}

            <div className='container' style={{ marginLeft: '17%', marginTop: '4%', padding: '10px', position: 'absolute' }}>

                <div>
                    <h2>Add Details</h2>
                </div>
                {/* <input
                    type="number"
                    className="input-field "
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter phone number"
                    required
                />
                <button className="btn btn-primary my-2" onClick={() => {
                    handleSearch();
                    handleSearch1(); // Call handleSearch1 after updating phoneNumber
                }}>
                    Search
                </button> */}

                <div className='container' >
                    {searchExecuted && (
                        <section className='container' onSubmit={handleFormSubmit}>
                            <div className='row'>
                                <div className='col-md-3 mb-3 w-75'>
                                    <div className="row ">
                                        <div className="col-lg-4 col-md-12 mb-3">
                                            <label className="form-label">Select serial number </label>
                                            <select
                                                // className="form-select w-100" // Added Bootstrap class to set width to 100%
                                                // value={selectedMeter}
                                                // onChange={(e) => {
                                                //     const selectedValue = e.target.value;
                                                //     if (selectedValue.includes('-')) {
                                                //         console.log('You selected serial with name:', selectedValue);
                                                //         setSelectedMeter(selectedValue);
                                                //         alert("you are in already in group", selectedValue);
                                                //         // Set the entire selected value with name to the state
                                                //     } else {
                                                //         console.log('You selected only meter:', selectedValue.split(' - ')[0]);
                                                //         setSelectedMeter(selectedValue.split(' - ')[0]); // Set only the serial part without the name to the state
                                                //     }
                                                // }}
                                                className="form-select w-100"
                                                value={selectedMeter}
                                                onChange={handleSelectChange1}
                                            >
                                                <option>Select meter</option>
                                                {mergedArray.map(({ serial, name }, index) => (
                                                    <option key={index} value={name ? `${serial} - ${name}` : serial}>
                                                        {/* {name ? `${serial} - ${name}` : serial} */}
                                                        {serial} {tokenStatus[serial]}{name}
                                                    </option>
                                                ))}
                                            </select>

                                            <span style={{ color: 'red' }}>{errorserialnumber}</span>
                                        </div>
                                        {/* Check Data */}
                                        <div className="col-lg-4 col-md-12 mb-3">
                                            <label className="form-label">Create/ Select group </label>
                                            <div className="position-relative" onClick={() => {
                                                setShowInputs(!showInputs); // Toggle inputs on icon click
                                            }}>
                                                <input
                                                    type="text"
                                                    className="form-control w-100" // Added Bootstrap class to set width to 100%
                                                    placeholder="Select an option"
                                                    readOnly // Prevent direct editing of input
                                                    style={{ width: '100%', paddingRight: '30px' }} // Adjusted width for responsiveness
                                                    value={getInputValue()} // Call the function to determine input value
                                                    onChange={handleSelectChange}
                                                />
                                                <span
                                                    className="position-absolute top-50 end-0 translate-middle-y"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setShowInputs(!showInputs); // Toggle inputs on icon click
                                                    }}
                                                >
                                                    &#9660; {/* Unicode for down arrow */}
                                                </span>


                                            </div>
                                            <span style={{ color: 'red' }}>{errormessagegroupname}</span>
                                        </div>
                                    </div>

                                    {showInputs ? (
                                        <div className="inputs-container" style={{ position: 'absolute', left: '28%', backgroundColor: '#fff', zIndex: '333' }}>
                                            <div>
                                                <div class="col-md-6 mb-3 text-start">
                                                    <label class="form-label" >Group Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Group Name "
                                                        className="input-field"
                                                        name="input1"
                                                        value={inputValues.input1}
                                                        onChange={handleInputChange}

                                                    />
                                                    {groupNameError && <p style={{ color: 'red' }}>{groupNameError}</p>}
                                                </div>
                                                <div class="col-md-6 mb-3">
                                                    <label class="form-label ">Tariff Rate </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Tariff Rate"
                                                        className="input-field"
                                                        name="input2"
                                                        value={inputValues.input2}
                                                        onChange={handleInputChange}
                                                    />
                                                    <p style={{ color: '#000000', fontSize: '10px', margin: '0', padding: "0", width: '140%' }}>Min. Limi 1.00, Max 99.99, Upto 2 deciaml places for paise</p>
                                                    {tariffRateError && <p style={{ color: 'red' }}>{tariffRateError}</p>}
                                                </div>

                                            </div>

                                            <div className='btton' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button className="custom-button" onClick={handleAddClick}>
                                                    Add
                                                </button>
                                                <button className="custom-button" onClick={handleCloseClick}>
                                                    Close
                                                </button>
                                            </div>
                                            <div>
                                                <hr style={{ width: '100%', border: '1.5px solid red' }} />
                                                <p>Select Exsting Group </p>

                                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Add a scroll bar for overflow */}
                                                    {
                                                        existingGroups.map((group, index) => {
                                                            // Filter out 'time' from group names
                                                            //  console.log("my group name data ", group);
                                                            if (group.includes('time')) {
                                                                return null; // Skip displaying if the group contains 'time'
                                                            }

                                                            // Calculate meters count for the current group
                                                            const groupData = data[group.replace(/ /g, '_')]; // Assuming your data structure contains group-related data
                                                            const metersCount = calculateMetersCount(groupData); // Replace this with your logic to count meters for the group


                                                            // const iconURL = ``;

                                                            return (

                                                                <React.Fragment key={index}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', width: "250px", }}>
                                                                        <img
                                                                            src="https://img.icons8.com/fluency/100/user-group-man-woman.png"
                                                                            alt={`${group} icon`}
                                                                            style={{ width: '50px', height: '50px', marginRight: '20px' }} /> {/* Replace this with your icon */}
                                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                            <p style={{ margin: '1px' }} onClick={() => handleGroupClick(group)}>
                                                                                {group}
                                                                            </p>
                                                                            <p>No of Consumers: {metersCount}</p>

                                                                        </div>

                                                                    </div>
                                                                    {((index + 1) % 2 === 0) && (index !== group.length - 1) && <hr style={{ width: '100%', margin: '5px 0' }} />}
                                                                    {/* {(index + 1) % 2 === 0 && <hr style={{ width: '100%', margin: '5px 0' }} />} Add a horizontal line after every pair */}
                                                                </React.Fragment>
                                                            );
                                                        })
                                                    }
                                                </div>
                                                <div>
                                                    {/* {selectedGroupData && (
                                                <div>
                                                    <p>Selected Group Name:</p>
                                                    <p>{selectedGroupName}</p>
                                                    <p>Selected Group Tariff:</p>
                                                    <p>{selectedGroupData.tariff}</p>

                                                </div>
                                            )} */}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>


                            <div className='row'>
                                <form class="row col-6 " >
                                    <div class="col-md-6 mb-3">
                                        <label for="inputEmail1" class="form-label">Meter Location</label>
                                        <input type="text"
                                            class="form-control"
                                            id="inputEmail1"
                                            placeholder="Enter Meter Location "
                                            aria-label="First name"
                                            value={meterLocation}
                                            onChange={handleInputMeterChange}
                                            maxLength={40}


                                        />

                                        <span style={{ color: 'red' }}>{errormeterlocation}</span>
                                        <span style={{ color: 'red' }}>  {errorMeter && <p className="error-message">{errorMeter}</p>}</span>


                                    </div>

                                    <div class="col-md-6 mb-3">
                                        <label for="inputEmail2" class="form-label">Trariff Rate </label>

                                        {/* {selectedGroupData && ( */}
                                        <input type="text" 
                                        class="form-control" 
                                        id="inputEmail2"
                                         placeholder="Tariff Rate"
                                         aria-label="Tariff Rate" 
                                        value={displayedInput2} />
                                        {/* )} */}
                                    </div>

                                    <div class="col-md-6 mb-4">
                                        <label for="inputEmail4" class="form-label">Consumer Name </label>
                                        <input type="text"
                                            class="form-control"
                                            id="inputEmail3"
                                            placeholder="Enter Consumer Name"
                                            aria-label="First name"
                                            maxLength={20}
                                            value={consumerName}
                                            onChange={handleInputNameChange}
                                        />

                                        <span style={{ color: 'red' }}>{errormessagename}</span>
                                        <span style={{ color: 'red' }}>  {errorName && <p className="error-message">{errorName}</p>}</span>
                                    </div>

                                    <div className="col-md-6 mb-4">
                                        <label htmlFor="consumerMobileNumber" className="form-label">Consumer Mobile Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="consumerMobileNumber"
                                            placeholder="Enter Consumer Mobile Number"
                                            aria-label="Consumer Mobile Number"
                                            value={consumerMobileNumber}
                                            onChange={handleMobileNumberChange}
                                            maxLength={10} // Set maximum length to 10 characters
                                        />


                                        {errroPhone && (
                                            <div style={{ color: 'red' }}>{errroPhone}</div>
                                        )}
                                        <span style={{ color: 'red' }}>{errormessagenumber}</span>

                                    </div>
                                    {/* <div class="col-md-6 mb-4">
                                        <label for="inputEmail4" class="form-label">Consumer Mobile Number </label>
                                        <input type="text" class="form-control" id="inputEmail4" placeholder="Enter Consumer Mobile Number" aria-label="First name" />
                                    </div> */}

                                    {/* <div class="col-md-6 mb-4">
                                        <label for="inputEmail5" class="form-label">Email Address (Optional)</label>
                                        <input type="email" class="form-control" id="inputEmail5" placeholder="Enter Consumer Emial Address " aria-label="First name" />
                                    </div> */}


                                    <div className="col-md-6 mb-4">
                                        <label htmlFor="inputEmail5" className="form-label">Email Address (Optional)</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="inputEmail5"
                                            placeholder="Enter Consumer Email Address"
                                            aria-label="Email Address"
                                            value={consumerEmail}
                                            onChange={handleEmailChange}
                                        />

                                        {errorEmail && (
                                            <div style={{ color: 'red' }}>{errorEmail}</div>
                                        )}
                                    </div>


                                    <div class="col-md-6 mb-4">
                                        <label for="email" class="form-label">Date of Occupancy</label>

                                        <div>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="email"
                                                placeholder="Date of Occupancy"
                                                onClick={handleIconClick}
                                                ref={dateInputRef}
                                                value={selectedDate ? formatDate(selectedDate) : ''}

                                            />
                                            <div className="date-picker-wrapper">
                                                {showDatePicker && (
                                                    <DatePicker
                                                        selected={selectedDate}
                                                        onChange={(date) => {
                                                            setSelectedDate(date);
                                                            setDateSelected(true);
                                                            setShowDatePicker(false);
                                                        }}
                                                        popperPlacement="top"
                                                        inline
                                                        dateFormat="dd/MM/yy"
                                                        showYearDropdown
                                                        showMonthDropdown

                                                        ref={dateInputRef}
                                                    />

                                                )}
                                            </div>
                                        </div>
                                        <span style={{ color: 'red' }}>{errormessagedoo}</span>

                                        {/* <input type="date" class="form-control" id="email" placeholder="First name" aria-label="First name" /> */}
                                    </div>
                                    <div>
                                    </div>
                                    <div class="d-grid gap-2 col-4 mx-auto my-3 py-2" >
                                        <button className="btn btn-primary" type="submit">Add</button>
                                    </div>
                                </form>
                            </div>
                        </section>


                    )}

                </div>


            </div>


        </>

    );

}

export default AddConsumer;
