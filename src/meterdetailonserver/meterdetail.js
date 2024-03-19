import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../adminLogin/navbar';
import { auth } from '../adminLogin/firebase';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import './meterdetail.css';
import { database } from '../firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CommonFuctions from '../commonfunction'; import { ref, set, get, child, getDatabase, onValue } from 'firebase/database';


import { validatePhoneNumber, validateName, validateAddress, validateEmail } from '../validation/validation';



function Meterdetail() {
  const allSerialNo = [];
  const cfunction = new CommonFuctions();

  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meterList, setMeterList] = useState([]);
  const [error, setError] = useState('');
  const [selectOptions, setSelectOptions] = useState([]);
  const [selectedGroupData, setSelectedGroupData] = useState([]);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mergedArray, setMergedArray] = useState([]);
  const [user, setUser] = useState(null); // State to hold user information
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSerial, setSelectedSerial] = useState(null);
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
  const [displayedInput2, setDisplayedInput2] = useState('');
  const [displayedInput1, setDisplayedInput1] = useState('');
  const [existingGroups, setExistingGroups] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState(''); // State to store selected group name
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedExistingGroupName, setSelectedExistingGroupName] = useState()
  const [consumerMobileNumber, setConsumerMobileNumber] = useState('');
  const [consumerEmail, setConsumerEmail] = useState('');


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is logged in
        setUser(authUser);
        //  console.log("Logged in user:", authUser.email);
        const emailParts = authUser.email.split('@');
        if (emailParts.length === 2) {
          const numberPart = emailParts[0];

          //  console.log("Number part:", numberPart); // Log the extracted number part
          setPhoneNumber(numberPart);
          handleSearch(numberPart);
          handleSearch1(numberPart);
          handlePhoneSerialList(numberPart);
          SessionValidate(numberPart);
          SessionUpdate(numberPart);
          setLoading(false);
        }
      } else {
        setUser(null);
        window.location.href = '/'; // Redirect to your login page
      }
    });
    return () => {
      setIsLoading(false);
      unsubscribe(); // Cleanup function for unmounting
    };
  }, []);


  const handleSerialClick = (serial) => {
    // Handle the click event, for example, set the selected serial to state

    setSelectedSerial(serial);

    setIsFormOpen(true);
    // You can add more logic here based on your requirements
  };



  const handleSearch = async (phoneNumber) => {


    const trimmedPhoneNumber = phoneNumber.trim();
    if (trimmedPhoneNumber !== '') {
      try {
        const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
        const snapshot = await dataRef.once('value');
        const newData = snapshot.val();
        setData(newData || {});
        setSelectedGroupData(newData);
        ///  console.log("data", newData);

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
      // console.log("return data")
      return acc;
    }, []);
    setSerialOptions(extractedSerials);
  }
  useEffect(() => {
    extractSerialNumbers();
  }, [data]);



  const extractGroupNames = () => {
    if (data) {
      const groupNames = Object.keys(data).filter(key => key !== 'tariff');
      return groupNames;
    }
    return [];
  };



  useEffect(() => {
    ///  console.log('Group Names:', extractGroupNames());
  }, [data]);


  const handleSearch1 = async (numberPart) => {
    try {
      if (numberPart === undefined || numberPart === null) {
        return;
      }
      const phoneNumberValue = numberPart.trim(); // Retrieve phone number
      if (phoneNumberValue !== '') {
        setPhoneNumber(phoneNumberValue); // Update phoneNumber state
        const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumberValue}/meterList`).once('value');
        const fetchedMeterList = snapshot.val();
        //   console.log("meteltelsit ", fetchedMeterList);
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


  const groupMergedArrayByNames = () => {
    const groupedMeters = {};

    mergedArray.forEach(({ serial, name }) => {
      if (name) {
        if (!groupedMeters[name]) {
          groupedMeters[name] = [];
        }
        groupedMeters[name].push(serial);
      }
    });
    return groupedMeters;
  };

  const groupedMeters = groupMergedArrayByNames();


  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;

  //   // Validation for input2 (Tariff Rate)
  //   if (name === 'input2') {
  //     // Regular expression to match only numeric characters with decimals
  //     const numericRegex = /^(?:\d{1,2}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/;

  //     if (numericRegex.test(value) || value === '') {
  //       setInputValues({ ...inputValues, [name]: value });
  //     }
  //   } else {
  //     // For other inputs (input1 or any other fields), update normally
  //     setInputValues({ ...inputValues, [name]: value });
  //   }
  // };

  // update grouapne and tariff validation 




  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;

  //   if (name === 'input1') {
  //     // Regular expression to match only alphanumeric characters and spaces
  //     const alphanumericRegex = /^[a-zA-Z0-9\s ]*$/;

  //     if (!alphanumericRegex.test(value) && value !== '') {
  //       setGroupNameError('Special characters not allowed ');
  //     }
  //     else if (value.charAt(0) === ' ') {

  //       return;
  //     } else {
  //       setGroupNameError('');
  //       setInputValues({ ...inputValues, [name]: value });
  //     }
  //   } else if (name === 'input2') {
  //     // Validation for input2 (Tariff Rate)
  //     const numericRegex = /^(?:\d{1,2}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/;

  //     if (numericRegex.test(value) || value === '') {
  //       setInputValues({ ...inputValues, [name]: value });
  //     } else {
  //       setTariffRateError('');
  //     }
  //   }
  // };



  //   const handleInputChange = (e) => {
  //     const { name, value } = e.target;
  //     if (name === 'input1') {
  //         // Regular expression to match only alphanumeric characters and spaces
  //         const alphanumericRegex = /^[a-zA-Z0-9\s ]*$/;

  //         if (!alphanumericRegex.test(value) && value !== '') {
  //             setGroupNameError('Special characters not allowed.');
  //         }
  //         if (value.charAt(0) === ' ') {

  //             return;
  //         }
  //         else {
  //             setGroupNameError('');
  //             setInputValues({ ...inputValues, [name]: value });
  //         }
  //     } else if (name === 'input2') {
  //         // Validation for input2 (Tariff Rate)
  //         const numericRegex = /^(?:[1-9]\d{0,1}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/;

  //         if (numericRegex.test(value) || value === '') {
  //             setInputValues({ ...inputValues, [name]: value });
  //         } else {
  //             setTariffRateError('');
  //         }
  //     }
  // };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'input1') {
      // Regular expression to match only alphanumeric characters and spaces
      const alphanumericRegex = /^[a-zA-Z0-9\s ]*$/;

      if (!alphanumericRegex.test(value) && value !== '') {
        setGroupNameError('Special characters not allowed.');
      }
      if (value.charAt(0) === ' ') {

        return;
      }
      else {
        setGroupNameError('');
        setInputValues({ ...inputValues, [name]: value });
      }
    } else if (name === 'input2') {
      // Validation for input2 (Tariff Rate)
      const numericRegex = /^(?:[1-9]\d{0,1}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/;

      if (numericRegex.test(value) || value === '') {
        setInputValues({ ...inputValues, [name]: value });
      } else {
        setTariffRateError('');
      }
    }
  };



  const [groupNameError, setGroupNameError] = useState('');
  const [tariffRateError, setTariffRateError] = useState('');



  const handleAddClick = async () => {

    setErrorMessagegroupname('');

    setTariffRateError('');
    try {
      if (!inputValues.input1) {
        // If input1 is empty, show an error message and return early
        setGroupNameError("Enter group name. ");
        return;
      }
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

      setDisplayedInput2(updatedInput2Value);
      setInputValues({
        input1: '',
        input2: ''
      });


      setShowInputs(false);
    } catch (error) {
      //  console.error('Error:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  // const handleAddClick = async () => {
  //   setErrorMessagegroupname('');
  //   try {

  //     if (!inputValues.input1 || !inputValues.input2) {
  //       // If either input field is empty, show an error message
  //       setGroupNameError(!inputValues.input1 ? "Cannot be empty" : "");
  //       setTariffRateError(!inputValues.input2 ? "Invalid tariff" : "");
  //       return; // Return early if there are errors
  //     }


  //     const newOption = `${inputValues.input1} - ${inputValues.input2}`;
  //     setDisplayedInput1(inputValues.input1);

  //     setSelectedGroupName(inputValues.input1);
  //     setShowInputs(false);

  //     setDisplayedInput2(inputValues.input2);
  //     setInputValues({
  //       input1: '',
  //       input2: ''
  //     });
  //     // After the asynchronous operation, you can update state or perform other tasks
  //     setShowInputs(false);

  //   } catch (error) {
  //     //   console.error('Error:', error);
  //     // Handle error (e.g., show an error message to the user)
  //   }
  // };



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

    //  console.log("Group name ", groupData);
    setSelectedExistingGroupName(group);
    const groupName = displayedInput1 || selectedExistingGroupName; // Choose the appropriate value
    // console.log("Group Name for Saving Data:", groupName);
    //  console.log("Selected Existing Group Name:", group);
    if (groupData && groupData.tariff) {
      setDisplayedInput2(groupData.tariff.toString()); // Assuming displayedInput2 is a state variable

      //   console.log ("Selected group tariff rate ", setDisplayedInput2);
    } else {
      setDisplayedInput2(''); // Clear the displayedInput2 if no tariff rate is available for the selected group
    }


    // Update the input values when a group is clicked
    // setInputValues({
    // input1: group, // Set input1 with the group name
    // input2: groupData ? groupData.tariff : '', // Set input2 with the group's tariff rate or an empty string
    // });

    setShowInputs(false); // Hide the input fields after selecting a group

    // Set the selected group name in the label
    // const labelElement = document.querySelector('.form-label');
    // if (labelElement) {
    // labelElement.textContent = group;
    // }
  };

  const calculateMetersCount = (groupData) => {
    let count = 0;
    if (groupData) {
      count = Object.keys(groupData).filter(key => key !== 'tariff').length;
    }
    return count;
  };





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



  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeDialog = () => {
    setIsDialogOpen(false);

    // window.location.reload(); // This will reload the page
  };


  const [isDialogOpenSavedata, setIsDialogOpenSavedata] = useState(false);

  const closeDialogSavedata = () => {
    setIsDialogOpenSavedata(false);
    setIsFormOpen(false); // Close the form after submission
    window.location.reload();
    // window.location.reload(); // This will reload the page
  };


  const [modalMessage, setModalMessage] = useState('');


  const handleFormSubmit = async (event) => {

    if (selectedGroupName === "") {
      event.preventDefault();
      setErrorMessagegroupname("Create or Select a group for the meter.");
      // alert("Please enter a email");
      return;
    }

    const meterLocation = document.getElementById('inputEmail1').value;
    const tariffRate = document.getElementById('inputEmail2').value;
    const consumerName = document.getElementById('inputEmail3').value;
    const consumerMobileNumber = document.getElementById('consumerMobileNumber').value;
    // const consumerEmailAddress = document.getElementById('inputEmail5').value;
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

    if (consumerMobileNumber.length !== 10) {
      setErrorMessagenumber('Enter valid mobile number.');
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

    setLoading(true);

    const status = await cfunction.checkInternetConnection(); // Call the function
    //  setShowChecker(status);
    if (status === 'Poor connection.') {
      setIsDialogOpen(true);
      setModalMessage('No/Poor Internet connection. Cannot access server.');
      setLoading(false);
      /// alert('No/Poor Internet connection , Please retry.'); // Display the "Poor connection" message in an alert
      return;
      //  alert('No/Poor Internet connection , Please retry. ftech data from firebase '); // Display the "Poor connection" message in an alert
      //  return;
    }



    const storeSessionId = localStorage.getItem('sessionId');
    try {
      const { sessionId } = await cfunction.HandleValidatSessiontime(phoneNumber);
      if (storeSessionId === sessionId) {

        event.preventDefault();
        // const groupName = displayedInput1 || selectedExistingGroupName;
        const groupName = (displayedInput1 || selectedExistingGroupName).split(' ').join('_');
        const selectedSerialNumber = selectedSerial; // Replace with actual selected serial number

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
        // console.log("groupName before reference construction:", groupName);

        // Get reference to Firebase database
        //  const adminReference = firebase.database().ref(`/adminRootReference/tenantDetails/${phoneNumber}/${groupName}/${selectedSerialNumber}`);


        const db = getDatabase(); // Assuming getDatabase is defined elsewhere
        const adminRootReference = ref(db, `adminRootReference/tenantDetails/${phoneNumber}/${groupName}/${selectedSerialNumber}`);
        const fullAdminProfilePath = adminRootReference.toString();

        const dataToSend = {
          [fullAdminProfilePath]: data
        };

        try {
          cfunction.callWriteRtdbFunction(dataToSend);

          const tariffReference = firebase.database().ref(`/adminRootReference/tenantDetails/${phoneNumber}/${groupName}/tariff`);
          await tariffReference.set(tariffRate);

          setIsDialogOpenSavedata(true)
          const errorMessage = `Data saved successfully!`;
          setModalMessage(errorMessage);
          setLoading(false);

        }
        catch (error) {

          setLoading(false);
          setIsDialogOpen(true);
          const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry. `;
          setModalMessage(errorMessage);



        }



        // try {
        // Save data to Firebase
        //   await adminReference.set(data);
        // Update tariff rate in Firebase
        // const tariffReference = firebase.database().ref(`/adminRootReference/tenantDetails/${phoneNumber}/${groupName}/tariff`);
        // await tariffReference.set(tariffRate);

        // Data saved successfully
        // console.log('Data saved to Firebase!');


        //  alert('Data saved successfully!');
        // setIsDialogOpenSavedata(true)
        // const errorMessage = `Data saved successfully!`;
        // setModalMessage(errorMessage);


        // Optionally, perform any additional actions upon successful data save
        // } catch (error) {
        //   // Handle errors
        //   console.error('Error saving data to Firebase: ', error);
        //   // Optionally, display an error message or handle the error condition
        // }
      } else {

        alert("You have been logged-out due to log-in from another device.");
        // console.log('you are logg out ');
        handleLogout();
      }

    } catch (error) {

      setLoading(false);
      setIsDialogOpen(true);
      // const errorMessage = `Response not recieved  from server-A. (${error}). Please check if transaction completed successfully , else retry. `;
      const errorMessage = `Response not recieved  from server-S. (${error}). Please check if transaction completed successfully , else retry.`;
      setModalMessage(errorMessage);

    }






    // setIsFormOpen(false); // Close the form after submission




  };




  const getInputValue = () => {
    if (selectedGroupName) {
      return selectedGroupName.split('_').join(' '); // Replace underscores with spaces
    } else if (inputValues.input1) {
      return inputValues.input1;
    } else {
      return 'Create/Selected Group';
    }
  };


  // const getInputValue = () => {
  //   if (selectedGroupName) {
  //     return selectedGroupName;
  //   } else if (inputValues.input1) {

  //   } else {
  //     return 'Create/Selected Group';
  //   }
  // };

  // const handleMobileNumberChange = (e) => {
  //   const inputValue = e.target.value.slice(0, 10); // Limit input to 10 characters
  //   setConsumerMobileNumber(inputValue.replace(/\D/g, '')); // Allow only digits
  // };



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





  // const handleEmailChange = (e) => {
  //   setConsumerEmail(e.target.value);
  // };


  const [errorEmail, setEmailError] = useState('');
  const handleEmailChange = (event) => {

    const value = event.target.value;
    setConsumerEmail(value);
    const error = validateEmail(value);
    setEmailError(error || '');
  };


  // when click on close then reset data to default
  // const handleClose = () => {

  //   setSelectedGroupName("");
  //   setDisplayedInput2("");
  //   setIsFormOpen(false); 

  // };
  const handleResetInputs = () => {
    setInputValues({
      input1: '',
      input2: '',
    });
  };


  const handleClose = () => {
    handleResetInputs();
    // If inputs are shown, close the inputs
    if (showInputs) {
      setShowInputs(false);
    } else {
      // If inputs are not shown, reset data and close the modal
      handleResetInputs();
      setSelectedGroupName("");
      setDisplayedInput2("");
      setIsFormOpen(false);
      setShowDatePicker(false);
    }
  };


  const handlePhoneSerialList = async (numberPart) => {
    try {
      const newAdminDetailsPath = database.ref(`adminRootReference/adminDetails/${numberPart}/meterList`);
      const snapshot = await newAdminDetailsPath.once('value');
      const serialData = snapshot.val();
      const keys = Object.keys(serialData);
      const promises = [];

      for (let i = 0; i < keys.length; i++) {
        allSerialNo.push(keys[i]);
        //  console.log('Serial Number:', keys[i]); // Print each serial number
        promises.push(handleGetreConfigToken(keys[i]));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error("Error fetching serial data:", error.message);
    }
  }
  // Function to fetch token info for a given serial number
  const handleGetreConfigToken = async (serialNumber) => {
    try {
      const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${serialNumber}/reConfigToken`);
      const snapshot = await meterDetailsPath.once('value');
      const newData = snapshot.val();

      if (newData) {
        const tokens = newData.token;

        if (tokens === "null") {
          //  console.log(`No Token for serial number ${serialNumber}`);
          return false;
        } else if (tokens !== null) {
          // console.log(`Token available for serial number ${serialNumber}`);
          return true;
        } else {
          // console.log(`Fetching data for serial number ${serialNumber}`);
          return false;
        }
      } else {
        // console.log(`No data found for serial number ${serialNumber}`);
        return false;
      }
    } catch (e) {
      //  console.log('Error Fetching:', e);
      return false;
    }
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
        // console.log('single *')
        status = "*";
      } else if (isTransfer === 'true' && token !== 'null') {
        // console.log('Double  *')
        status = "**";
      } else {
        status = "";
      }

      setTokenStatus(prevState => ({
        ...prevState,
        [serialNumber]: status
      }));
    } catch (e) {
      //  console.log('Error Fetching:', e);
    }
  };

  useEffect(() => {
    mergedArray.forEach(({ serial }, index) => {
      isTokenAvailable(serial, index);
    });
  }, [mergedArray]);


  const history = useNavigate();
  const handleLogout = () => {
    auth.signOut().then(() => {
      // Redirect to login page after successful logout
      history('/'); // Change '/login' to your login page route
    }).catch((error) => {
      // Handle any errors during logout
      console.error('Error logging out:', error.message);
    })

  }
  const SessionValidate = async (numberPart) => {
    const storeSessionId = localStorage.getItem('sessionId');
    const { sessionId } = await cfunction.HandleValidatSessiontime(numberPart);
    //  console.log("Received session ID from server: ", sessionId);
    if (storeSessionId === sessionId) {
      ////    console.log('SessionId Match ', sessionId);
      return;
    } else {
      //  console.log('SessionId Mismatch');
      alert("Cannot login. Another session is active. Please retry after sometime. ");
      // console.log('you are logged out ');
      handleLogout();
    }
  };

  const SessionUpdate = (numberPart) => {
    cfunction.updateSessionTimeActiveUser(numberPart);
  }



  return (

    <>

      <div style={{ marginLeft: '16%', marginTop: '7%' }} >

        {/* <div>
          {mergedArray.some(({ name }) => !name) && (
            <h4 style={{ color: '#8B0000' }} >Add Details</h4>
          )}
        </div> */}

        <div>
          {mergedArray.some(({ name }) => !name) ? (
            <h4 style={{ color: '#8B0000' }}>Add Details</h4>
          ) : (
            <>

              <h4 style={{ color: '#8B0000' }}> Add Details.</h4>
              <h6 style={{ color: 'blue' }}> Note : Details of all consumers are available, you can edit or delete. </h6>

            </>
          )}
        </div>

        {/* <div>
                  {mergedArray.some(({ name }) => name) && (
                     <>
                     <h4 style={{ color: '#8B0000' }}> Add Details.</h4>
                     <h6 style={{color:'blue'}}> Note : Details of all consumers are available, you can edit or delete. </h6>
                   </>
                  )}
                </div>  */}

        <div className="rowContainer">

          {mergedArray.map(({ serial, name }, index) => (

            !name && (
              <div key={index} className='customBox' onClick={() => handleSerialClick(serial)}>
                <p>{serial} <span style={{ color: 'red' }}> {tokenStatus[serial]}</span></p>
              </div>
            )
          ))}

        </div>

        {/* {loading ? (
          <div style={{ marginLeft: '35%', marginTop: '10%%' }}>
            <div className="spinner-border text-danger" role="status">
              <span className="sr-only"></span>
            </div>
          </div>
        ) : ( */}


        {loading ? (
          <div style={{ position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: '9999' }}>
            <div className="spinner-border text-danger" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : null}


        <Modal show={isFormOpen} onHide={handleClose} backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>Add Details </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <section >
              <div className='row'>
                <div className='col-md-3 mb-3 w-100'>
                  <div className="row ">
                    <div className="col-md-6">
                      <label className="form-label"> Meter Serial Number</label>

                      <input
                        type="text"
                        className="form-control"
                        value={selectedSerial || ''}
                        onChange={(e) => setSelectedSerial(e.target.value)}
                        disabled
                      />
                    </div>
                    {/* Check Data */}
                    <div className="col-md-6">
                      <label className="form-label">Create/ Select group </label>
                      <div className="position-relative" onClick={() => {
                        setShowInputs(!showInputs); // Toggle inputs on icon click
                      }}>
                        <input
                          type="text"
                          className="form-control" // Added Bootstrap class to set width to 100%
                          placeholder="Select an option"
                          readOnly // Prevent direct editing of input
                          style={{ width: '100%', paddingRight: '30px' }} // Adjusted width for responsiveness
                          value={getInputValue()} // Call the function to determine input value
                          onChange={handleSelectChange}
                          disabled={loading}
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
                        <button className="custom-button" onClick={handleClose}>
                          Close
                        </button>
                      </div>
                      <div>
                        <hr style={{ width: '100%', border: '1.5px solid red' }} />
                        <p> Select Exsting Group </p>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Add a scroll bar for overflow */}
                          {
                            existingGroups.map((group, index) => {
                              // Filter out 'time' from group names
                              //   console.log("my group name data ", group);
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

                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>


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
                    disabled={loading}


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
                    value={displayedInput2}
                    disabled={loading}
                  />
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
                    disabled={loading}

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
                    disabled={loading}
                  />

                  {errroPhone && (
                    <div style={{ color: 'red' }}>{errroPhone}</div>
                  )}

                  <span style={{ color: 'red' }}>{errormessagenumber}</span>



                </div>

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
                    disabled={loading}
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
                      disabled={loading}

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
                <div className='col-12'>
                  {/* Submit button for the entire form */}
                  <div className="d-grid gap-2  col-4 mx-auto my-3 py-2">
                    <button className="btn btn-primary"
                      onClick={handleFormSubmit}
                      disabled={loading}
                    >Add</button>
                  </div>
                </div>

              </div>

            </section>


          </Modal.Body>
        </Modal>

      </div >

      <Modal show={isDialogOpen} onHide={closeDialog} backdrop="static" style={{ marginTop: '3%' }}>
        {/* <Modal.Header closeButton>
      </Modal.Header>  */}
        <Modal.Body>
          <p> {modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDialog}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal show={isDialogOpenSavedata} onHide={closeDialogSavedata} backdrop="static" style={{ marginTop: '3%' }}>
        {/* <Modal.Header closeButton>
      </Modal.Header>  */}
        <Modal.Body>
          <p> {modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeDialogSavedata}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>



    </>

  );
}

export default Meterdetail;