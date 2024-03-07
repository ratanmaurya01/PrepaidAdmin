import React, { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the default CSS
import Navbar from '../adminLogin/navbar';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import '../consucss.css';


import { auth } from '../adminLogin/firebase';

import { validatePhoneNumber, validateName, validateAddress, validateEmail } from '../validation/validation';

import CommonFuctions from '../commonfunction'

const Groupnameupdate = () => {
    const [showAddConsumer, setShowAddConsumer] = useState(false);
    const [activeComponent, setActiveComponent] = useState('consumerDetails'); // 'home', 'addConsumer', 'consumerDetails'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [meterList, setMeterList] = useState([]);
    const [data, setData] = useState({});
    const [showAllData, setShowAllData] = useState(false);
    const [groupNames, setGroupNames] = useState([]);
    const [selectedGroupName, setSelectedGroupName] = useState('');
    const [serialNumbersAndNames, setSerialNumbersAndNames] = useState([]);

    const [lastTariff, setLastTariff] = useState('');
    const [groupName, setGroupName] = useState(selectedGroupName || '');
    const [tariff, setTariff] = useState(lastTariff || '');
    const [clickedData, setClickedData] = useState(null);
    const [clickedSerial, setClickedSerial] = useState(null);
    const [clickedDataArray, setClickedDataArray] = useState([]);
    // const [dataFromFirebase, setDataFromFirebase] = useState({});
    const [isEditable, setIsEditable] = useState(false);

    const [serialNumber1, setSerialNumber] = useState('');
    const [originalData, setOriginalData] = useState([]);
    const [editedData, setEditedData] = useState([]);
    const [editedSerialNumber, setEditedSerialNumber] = useState(null);
    const dateInputRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showDatePickers, setShowDatePickers] = useState({});
    const [editModeSerialNumber, setEditModeSerialNumber] = useState(null);
    const [loading, setLoading] = useState(false);
    const [numberPart, setNumberPart] = useState(null); // State to store numberPart

    const [user, setUser] = useState(null);

    const [error, setError] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    let [inputValues, setInputValues] = useState({
        input1: '',
        input2: '', // Assuming default value for tariff rate is 0, update it accordingly
    });
    const [showInputs, setShowInputs] = useState(false);
    const [displayedInput2, setDisplayedInput2] = useState('');
    const [displayedInput1, setDisplayedInput1] = useState('');
    const [existingGroups, setExistingGroups] = useState([]);

    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedExistingGroupName, setSelectedExistingGroupName] = useState()
    const [updatetoken, setUpdateToken] = useState({});
    const [mergedArray, setMergedArray] = useState([]);
    const [serialOptions, setSerialOptions] = useState([]);
    const [groupNameError, setGroupNameError] = useState('');
    const [tariffRateError, setTariffRateError] = useState('');




    useEffect(() => {
        document.title = "Consumer Details "; // Set the title when the component mounts

    }, []);



    const handleSearch = async (phoneNumber) => {
        setLoading(true);
        const dataRef = database.ref(`/adminRootReference/tenantDetails/${phoneNumber}`);
        dataRef.once('value', (snapshot) => {

            const newData = snapshot.val();
            //  console.log('Retrieved Data:', newData);
            setUpdateToken(newData);
            if (newData !== null) {
                // setData(newData || {});
                // extractGroupNames(newData);
                // setShowAllData(true);
                // setSerialNumbersAndNames(newData);
                const modifiedData = removeUnderscores(newData);
                const modifiedDataWithoutTime = excludeTimeProperty(newData);
                //   console.log('Modified Data without Time:', modifiedDataWithoutTime);
                // Further processing with modifiedDataWithoutTime
                setData(modifiedDataWithoutTime || {});
                //  setData(modifiedData || {});
                extractGroupNames(modifiedDataWithoutTime);
                setShowAllData(true);
                setSerialNumbersAndNames(modifiedDataWithoutTime);
            } else {
                //   console.log('Data not found for the provided phone number.');
                setData({});
         
         
                setGroupNames([]);
                setShowAllData(false);
                setSerialNumbersAndNames({});
            }
            setLoading(false);
        });
    };




    const excludeTimeProperty = (data) => {
        const modifiedData = { ...data };
        delete modifiedData.time;
        return modifiedData;
    };

    const removeUnderscores = (data) => {
        const modifiedData = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const newKey = key.replace(/_/g, ' '); // Replace underscores with spaces
                modifiedData[newKey] = data[key];
            }
        }
        return modifiedData;
    };

    const handleAddConsumerClick = () => {
        setShowAddConsumer(!showAddConsumer);
        // Assuming you want to hide the "Show Test" content as well
        setSelectedGroupName(false);


    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const extractedNumberPart = emailParts[0];
                    if (extractedNumberPart !== '') {
                        setNumberPart(extractedNumberPart); // Set numberPart in state
                        handleSearch(extractedNumberPart); // Call handleSearch with numberPart
                        handleSearch1(numberPart);
                    }


                }
            } else {
                setUser(null);
                window.location.href = '/'; // Redirect to your login page
            }
        });

        return () => unsubscribe();
    }, [numberPart]);
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

    useEffect(() => {
        extractSerialNumbers();
    }, [updatetoken]);

    useEffect(() => {
        const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];
        setMergedArray(merged);
    }, [serialOptions, meterList]);

    const handleSearch1 = async (numberPart) => {
        try {
            if (numberPart === undefined || numberPart === null) {
                return;
            }
            const phoneNumberValue = numberPart.trim();
            if (phoneNumberValue !== '') {
                const snapshot = await firebase.database().ref(`/adminRootReference/adminDetails/${phoneNumberValue}/meterList`).once('value');
                const fetchedMeterList = snapshot.val();

                if (fetchedMeterList) {
                    setMeterList(Object.keys(fetchedMeterList));
                    Object.keys(fetchedMeterList).forEach(async (serialNumber) => {
                        await isTokenAvailable(serialNumber);
                    });

                }

            }
        } catch (error) {
            console.error('Error fetching admin meter list:', error);
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
                // console.log("Signle *");
                status = "*";
            } else if (isTransfer === 'true' && token !== 'null') {
                // console.log("Double  *");
                status = "**";
            } else {
                status = "";
            }

            setTokenStatus(prevState => ({
                ...prevState,
                [serialNumber]: status
            }));
        } catch (e) {
            console.log('Error Fetching:', e);
        }
    };

    useEffect(() => {
        mergedArray.forEach(({ serial }, index) => {
            isTokenAvailable(serial, index);
        });
    }, [mergedArray]);

    const extractGroupNames = (dataObj) => {
        if (dataObj) {
            const names = Object.keys(dataObj);
            //  console.log(names);
            setGroupNames(names);
        }
    };

    const handleGroupNameClick = (groupName) => {

        setActiveComponent(null);
        setSelectedGroupName(groupName);
        const selectedGroupData = data[groupName];
        //  console.log('Selected Group Data:', selectedGroupData);

        if (selectedGroupData) {
            setGroupName(groupName); // Set the groupName state
            setTariff(selectedGroupData.tariff || ''); // Set the tariff state from the selected group data

            // Rest of your logic
            setSerialNumbersAndNames(selectedGroupData);
            // ... (other logic)
        } else {
            setGroupName(''); // Reset groupName if data not found for the selected group
            setTariff('');
            // ... (other logic)
        }
        //  setShowAddConsumer(false);

    };

    const [errourGroup, setErroeGroup] = useState('');
    // Function to handle changes in group name input
    const handleGroupNameChange = (event) => {
        //  const groupname =  event.target.value;
        // setGroupName(groupname);

        const groupname = event.target.value;
        const errorMessage = validateName(groupname);

        if (errorMessage) {
            // Display the error message to the user
            setErroeGroup(errorMessage);
        } else {
            // Validation passed, set the group name in the state
            setGroupName(groupname);
            setErroeGroup("");
        }

    };
    
    const handleTariffChange = (event) => {
        const inputValue = event.target.value;
        const isValid = /^(?:\d{1,2}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/.test(inputValue);
        if (isValid || inputValue === '') {
            setTariff(inputValue);
        } else {
            // Handle invalid input, e.g., display an error message or prevent setting tariff
        }
    };



    const handleSerialNumberClick = (serialNumber, data) => {

        handleEditButtonClick();
      
        const existingIndex = clickedDataArray.findIndex(item => item.serialNumber === serialNumber);
        if (existingIndex !== -1) {
            // If the serial number already exists in the array, remove it
            const newArray = [...clickedDataArray];
            newArray.splice(existingIndex, 1);
            setClickedDataArray(newArray);

            // Hide the data when the serial number is clicked again
            setClickedSerial(null);
            setClickedData(null);
        } else {
            // If the serial number doesn't exist in the array, add it
            setClickedDataArray([...clickedDataArray, { serialNumber, data }]);

            // Set the clicked serial number and its associated data
            if (data && Object.keys(data).length > 0) {
                setClickedSerial(serialNumber);
                setClickedData(data);
            }
        }
        //  console.log('Clicked Serial Number:', serialNumber);
        setSerialNumber(serialNumber);
        //   console.log('All Data:', data);
    };

    useEffect(() => {
        // Store the initial data when the component mounts
        setOriginalData([...clickedDataArray]);
    }, [clickedDataArray]); // Update originalData when clickedDataArray changes
    const [errors, setErrors] = useState({
        name: '',
        phone: ''
    });

    const handleEditButtonClick = (serialNumber) => {

        setEditedSerialNumber(serialNumber);
        setEditModeSerialNumber(serialNumber);
        // console.log(`Edit clicked for serialNumber: ${serialNumber}`);
        setIsEditable(true);
        setShowDatePicker(true);

        setEditedData([...clickedDataArray]);
        setShowAddConsumer(false);
    };

    const [value, setValue] = useState('');

    const handleInputChange = (index, property, event) => {
        const { name, value } = event.target;
   
        if (property === 'location') {
            let updatedValue = value.replace(/^\s+|\s+$/g, ''); // Remove leading and trailing spaces
            updatedValue = updatedValue.replace(/^0+/, ''); // Remove leading zeros
            updatedValue = updatedValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Remove special characters
            if (updatedValue !== value) {
              event.target.value = updatedValue; // Update the input field value
            }
            if (updatedValue === '') {
              setErrors(prevErrors => ({
                ...prevErrors,
                location: 'Name is required'
              }));
            } else {
              setErrors(prevErrors => ({
                ...prevErrors,
                location: ''
              }));
            }
          }


    
        if (property === 'name') {
            let updatedValue = value.replace(/^\s+|\s+$/g, ''); // Remove leading and trailing spaces
            updatedValue = updatedValue.replace(/^0+/, ''); // Remove leading zeros
            updatedValue = updatedValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Remove special characters
            if (updatedValue !== value) {
              event.target.value = updatedValue; // Update the input field value
            }
            if (updatedValue === '') {
              setErrors(prevErrors => ({
                ...prevErrors,
                name: 'Name is required'
              }));
            } else {
              setErrors(prevErrors => ({
                ...prevErrors,
                name: ''
              }));
            }
          }
            
          if (property === 'email') {
            let updatedValue = value.replace(/^\s+|\s+$/g, ''); // Remove leading and trailing spaces
            updatedValue = updatedValue.replace(/^0+/, ''); // Remove leading zeros
            updatedValue = updatedValue.replace(/[^a-zA-Z0-9\s]/g, ''); // Remove special characters
            if (updatedValue !== value) {
              event.target.value = updatedValue; // Update the input field value
            }
            else {
              setErrors(prevErrors => ({
                ...prevErrors,
                email: ''
              }));
            }
          }




        if (property === 'phone') {
            let updatedValue = value.replace(/^0/, ''); // Remove leading zero
            updatedValue = updatedValue.replace(/^\s+/, ''); // Remove leading spaces
            updatedValue = updatedValue.replace(/\D/g, ''); // Remove all non-digits
            if (updatedValue !== value) {
              event.target.value = updatedValue; // Update the input field value
            }
            if (!/^[0-9]{10}$/.test(updatedValue)) {
              setErrors(prevErrors => ({
                ...prevErrors,
                phone: 'Phone is required!'
              }));
            } else {
              setErrors(prevErrors => ({
                ...prevErrors,
                phone: ''
              }));
            }
          }
          

        if (event && event.target && event.target.value !== undefined) {
            const updatedClickedDataArray = [...clickedDataArray];
            if (updatedClickedDataArray[index] && updatedClickedDataArray[index].data) {
                updatedClickedDataArray[index].data[property] = event.target.value;
                setClickedDataArray(updatedClickedDataArray);
                setEditedData(updatedClickedDataArray);
                // Update editedData here if needed
            }
        }
    };



    const handleUpdateButtonClick = () => {
        const updateroupName = (displayedInput1 || selectedExistingGroupName);
        if (editedSerialNumber !== null && numberPart != null) {
            const index = clickedDataArray.findIndex(item => item.serialNumber === editedSerialNumber);
            if (index !== -1) {
                const updatedData = clickedDataArray[index]['data'];
    
                const requiredFields = ['location', 'name', 'phone'];
                if (!updatedData[requiredFields[0]]?.trim()) {
                    return;
                } else if (!updatedData[requiredFields[1]]?.trim()) {
                    return;
                } else if (!updatedData[requiredFields[2]]?.trim()) {
                    return;
                }
    
                const oldRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${groupName}/${editedSerialNumber}`);
                const newRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${updateroupName}`);
                const groupTarrifRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${updateroupName}/tariff`);
                const findGroupChild = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${groupName}`);
    
                if (updateroupName === undefined) {
                    oldRef.update(updatedData).then(() => {
                        alert("Data updated successfully!");
                        window.location.reload(); // Reload the page
                    }).catch(error => {
                        console.error("Error updating data:", error);
                        alert("Failed to update data. Please try again.");
                    });
                } else if (updateroupName !== undefined && updateroupName !== groupName) {
                    newRef.child(editModeSerialNumber).set(updatedData)
                        .then(() => {
                            oldRef.remove().then(() => {
                                if (displayedInput1 !== '') {
                                    groupTarrifRef.set(displayedInput2)
                                        .then(() => { })
                                        .catch(error => { });
                                }
                                const cfunction = new CommonFuctions();
                                cfunction.isAnyMeterExist(findGroupChild)
                                    .then(childCount => {
                                        if (childCount == 0) {
                                            findGroupChild.remove().then(() => { })
                                                .catch(() => { });
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error in isAnyMeterExist:', error);
                                    });
                                alert('Data save successfully ');
                                window.location.reload(); // Reload the page
                            }).catch(error => { });
                        }).catch(error => { });
                }
                updateSerialNumber();
            }
        }
    };


    const updateSerialNumber = (newSerialNumber) => {
        // Assuming you have some logic to update the state
        setEditedSerialNumber(newSerialNumber);
    };

    const handleDeletebutton = (serialNumberToDelete) => {
        if (serialNumberToDelete !== null && numberPart != null) {
            const confirmDelete = window.confirm("Are you sure you want to delete this data?");

            // console.log('Deleting group name if no serialnumer 12', groupName);

            let newgroupName = groupName.replace(/ /g, "_");

            if (confirmDelete) {
                const dataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${newgroupName}/${serialNumberToDelete}`);
                const findGroupChild = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${newgroupName}`);

                dataRef.remove()
                    .then(() => {
                        // Alert message after successful delete
                        alert("Data deleted successfully!");

                        //  handleClose(); // Close the modal after successful deletion
                        // window.location.reload();
                    })
                    .catch(error => {
                        // Handle error if the delete fails
                        console.error("Error deleting data:", error);
                        alert("Failed to delete data. Please try again.");
                    });

                const cfunction = new CommonFuctions();
                cfunction.isAnyMeterExist(findGroupChild)
                    .then(childCount => {
                        //  console.log('childCount1111111111111', childCount);

                        if (childCount == 0) {
                            //  console.log('Deleting Firebase reference because childCount is 0');
                            //cfunction.deleteFirebaseReference(findGroupChild);
                            findGroupChild.remove().then(() => {
                                //  console.log("remove successfully");
                            })
                                .catch(() => {

                                    //  console.log("Error deleting Firebase reference");
                                });
                        } else {
                            //  console.log("Child count is greater than 0");
                        }
                    })
                    .catch(error => {
                        console.error('Error in isAnyMeterExist:', error);
                    });

                // Assuming you have some logic to update the state
                updateSerialNumber(null); // Set editedSerialNumber to null after deletion
            }
            // If the user cancels the deletion, you can add optional code here
        }
    };

    
    const handleUpdate = async () => {
        let selectedsr = selectedGroupName.replace(/ /g, "_");
        if (!selectedGroupName || (!groupName && tariff === undefined)) {
            console.log("Please select a group or enter a new group name or tariff rate");
            return;
        }

        if (!groupName.trim()) {
            alert('Group Name cannot be blank');
            return;
        }

        if (!tariff.trim()) {
            alert('Tariff cannot be blank');
            return;
        }


        try {
            // Read data from the current parent
            const currentDataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${selectedsr}/`);
            const snapshot = await currentDataRef.once('value');

            const data = snapshot.val();
          //  console.log("data not come ", data);


            if (!data) {
               // console.log('Selected group not found in the database');
                return;
            }
            // Create a reference to a new parent with the updated name

            const formattedGroupName = (groupName || selectedGroupName).split(' ').join('_');
            const newDataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${formattedGroupName}/`);

            // Conditionally update the group name and tariff rate
            if (groupName && formattedGroupName) {
                // data.groupName = groupName;
            }
            for (const serialKey in data) {
                if (Object.hasOwnProperty.call(data, serialKey)) {
                    const serialData = data[serialKey];
                    if (serialData && typeof serialData === 'object' && serialData.serial) {
                        // Check if the serial has a tariff property and update it
                        if (serialData.tariff !== undefined && serialData.tariff !== tariff) {
                            serialData.tariff = tariff;
                        }
                    }
                }
            }

            // Update grouptariff if it's different
            if (data.grouptariff !== undefined && data.grouptariff !== tariff) {
                data.grouptariff = tariff;
            }

            if (tariff !== undefined && tariff !== data.tariff) {
                data.tariff = tariff;
            }

            // Write data to the new parent
            await newDataRef.set(data);

            // Delete data from the current parent if the group name has changed
            if (groupName && groupName !== selectedGroupName) {
                await currentDataRef.remove();
            }

            //  console.log('Item updated successfully!');
            alert('Data save successfully ');
            window.location.reload(true);
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleCancelButtonClick = (serialNumber) => {
        // Revert back to original data on cancel
        // Disable the edit mode
        setIsEditable(false);

        // Reset editedSerialNumber to null
        setEditedSerialNumber(null);
        setShowDatePickers((prevState) => ({
            ...prevState,
            [serialNumber]: false, // Hide the DatePicker for the canceled item
        }));


    };

    // Assuming the default mode is editable

    const handleIconClick = () => {
        setShowDatePicker(!showDatePicker); // Toggle date picker visibility
    };

    function formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        return `${day}/${month}/${year}`;
    }

    const handleToggleDatePicker = (serialNumber) => {
        if (editModeSerialNumber === serialNumber) {
            // Show the DatePicker only if edit mode is active
            setShowDatePickers((prevState) => ({
                ...prevState,
                [serialNumber]: !prevState[serialNumber], // Toggle DatePicker visibility
            }));
        }
    };


    const handleInputChange1 = (e) => {
        const { name, value } = e.target;

        if (name === 'input1') {
            // Regular expression to match only alphanumeric characters and spaces
            const alphanumericRegex = /^[a-zA-Z0-9\s ]*$/;

            if (!alphanumericRegex.test(value) && value !== '') {
                setGroupNameError('Special characters not allowed ');
            }
            else if (value.charAt(0) === ' ') {

                return;
            }
            else {
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

    

    useEffect(() => {
        // Transform data into an array of group names (existing groups)
        const groups = Object.keys(data || {}).map(group => group.replace(/_/g, ' '));

        setExistingGroups(groups);



        //   console.log('Existing Groups:', groups);
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

        const groups = data[groupData.replace(/ /g, '_')]; // Assuming your data structure contains group-related data
        // console.log("Check groupData data come or not ", groupData);
        let count = 0;

        if (groups) {
            // Exclude the 'tariff' key from the count
            count = Object.keys(groups).filter(key => key !== 'tariff').length;
        }

        return count;
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



    const handleAddClick = async () => {
        try {

            if (!inputValues.input1 || !inputValues.input2) {
                // If either input field is empty, show an error message
                setGroupNameError(!inputValues.input1 ? "Cannot be empty" : "");
                setTariffRateError(!inputValues.input2 ? "Invalid tariff" : "");
                return; // Return early if there are errors
            }


            const newOption = `${inputValues.input1} - ${inputValues.input2}`;
            setDisplayedInput1(inputValues.input1);

            setSelectedGroupName(inputValues.input1);
            setShowInputs(false);

            setDisplayedInput2(inputValues.input2);
            setInputValues({
                input1: '',
                input2: ''
            });



            setShowInputs(false);
        } catch (error) {
            console.error('Error:', error);
            // Handle error (e.g., show an error message to the user)
        }
    };


    const handleSelectChange = (e) => {
        const value = e.target.value;
        setShowInputs(value === 'showInputs');
        //  console.log("check values", value);
    };

    useEffect(() => {
        // Transform data into an array of group names (existing groups)
        const groups = Object.keys(data || {}).map(group => group.replace(/_/g, ' '));
        setExistingGroups(groups);


        //console.log('Existing Groups:', groups);
    }, [data, setExistingGroups]);



    const handleButtonClick = (component) => {
        setActiveComponent(component);
        setSelectedGroupName(null);
    };



    return (

        <>
        <div>
                <div>
                    <div style={{ margin: '0' }}>
                        <div style={{ display: 'flex' }}> 
                         <div>
                                    {groupNames.map((groupName, index) => (
                                        <p key={index} onClick={() => handleGroupNameClick(groupName)}>
                                            <img
                                                src="https://img.icons8.com/fluency/100/user-group-man-woman.png"
                                                style={{ width: '50px', height: '50px', marginRight: '20px' }}
                                                alt="User Group Icon"
                                            />
                                            {groupName.replace(/_/g, ' ')}
                                        </p>
                                    ))}
                                </div>
                                
                        </div> 
                        {selectedGroupName && (
                            <div className='container ' style={{ marginLeft: '20%', marginTop: "3%" }}>
                                <div className=' groupname'>
                                    <div >

                                        <div className='group-icon' >
                                            <div style={{ display: 'flex', padding: '2%' }}>
                                                <img
                                                    src="https://img.icons8.com/fluency/48/add-user-male.png"
                                                    alt="Icon"
                                                    style={{ width: '25px', height: '25px', marginLeft: '4%' }}
                                                />
                                                <p style={{ marginLeft: '3%', marginTop: '3px', }}>{groupName.replace(/_/g, ' ')}</p>

                                            </div>
                                        </div>
                                        <div  >
                                            <div style={{ display: 'flex', marginLeft: '3%', marginTop: '10px', width: 'auto' }}>

                                                <input
                                                    type="text"
                                                    placeholder="Group Name"
                                                    className='input-field underline-input'
                                                    value={groupName.replace(/_/g, ' ')}
                                                    onChange={handleGroupNameChange}
                                                // Make this field read-only if you only want to display group name

                                                />


                                                <input
                                                    type="text"
                                                    placeholder="Tariff"
                                                    className='input-field underline-input'
                                                    value={tariff} // Display the tariff here
                                                    onChange={handleTariffChange} // Add onChange if you want to allow changes

                                                />


                                                <div>

                                                    <button className="btn btn-success" onClick={handleUpdate}>SAVE</button>
                                                </div>

                                            </div>
                                        </div>

                                    </div>



                                </div>

                                {/* Serial numbers and names */}
                                <div className="custom-scrollbar" style={{ maxHeight: '100vh', overflowY: 'scroll', overflowX: 'hidden' }} >
                                    <div>
                                        <div class="scroll-content">
                                            <ul className="list-unstyled" style={{ padding: 0, marginTop: '3%', pointer: 'cursor' }}>
                                                {Object.entries(serialNumbersAndNames)
                                                    .filter(([serialNumber]) => serialNumber !== 'tariff') // Filter out 'tariff'
                                                    .map(([serialNumber, data]) => (
                                                        <div style={{ display: 'flex' }}>
                                                            <div
                                                                // onClick={() => {
                                                                //     handleSerialNumberClick(serialNumber, data);

                                                                // }}
                                                                className="object-fit-cover border rounded"
                                                                key={serialNumber}
                                                                style={{
                                                                    margin: '10px',
                                                                    height: '40%',
                                                                    width: '10%',
                                                                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',

                                                                }}
                                                            >
                                                                {/* First Row: Icon */}
                                                                <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                                                                    <div style={{ position: 'relative' }}>
                                                                        <img
                                                                            src="https://img.icons8.com/fluency/48/add-user-male.png"
                                                                            alt="Icon"
                                                                            style={{ width: '35px', height: '35px', marginRight: '5px' }}
                                                                        />
                                                                        <div
                                                                            style={{ position: 'absolute', top: 30, right: 2 }}>
                                                                            <img
                                                                                onClick={() => {
                                                                                    handleSerialNumberClick(serialNumber, data);

                                                                                }}
                                                                                src="https://img.icons8.com/ios-glyphs/30/edit--v1.png"
                                                                                alt="Edit Icon"
                                                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}


                                                                            />

                                                                        </div>
                                                                        <div style={{ position: 'absolute', top: 0, right: 2 }}>
                                                                           


                                                                        </div>
                                                                    </div>

                                                                </div>
                                                                {/* Second Row: Serial Number */}
                                                                <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                                                                    <strong>{serialNumber} <span style={{ color: 'red' }}>{tokenStatus[serialNumber]} </span> </strong>
                                                                </div>
                                                                {/* Third Row: Name */}
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <p>{data.name}</p>
                                                                </div>
                                                                {/* Optional: Divider */}


                                                            </div>
                                                            <div style={{ marginTop: '-90px' }}>
                                                                <div style={{ display: 'flex' }}>



                                                                    {clickedDataArray.map((clickedItem, index) => (
                                                                        <div key={index} style={{ display: 'flex' }}>
                                                                            {clickedItem.serialNumber === serialNumber && (

                                                                                <div style={{ margin: '60px', }}>
                                                                                    <div className='row ' style={{ margin: '2px' }}>
                                                                                        <div className="col-md-6">
                                                                                            <label for="disabledTextInput" class="form-label">Select Meter Serial Number </label>
                                                                                            <input
                                                                                                type="text1"
                                                                                                name="serailnumber"
                                                                                                className='form-control'
                                                                                                id="serial"
                                                                                                value={serialNumber}
                                                                                                readOnly={editedSerialNumber !== clickedItem.serialNumber}
                                                                                                onChange={(event) => handleInputChange(index, 'serialNumber', event)}
                                                                                            />

                                                                                        </div>
                                                                                       
                                                                                        <div className="col-md-6">
                                                                                            <label className="form-label">Create/ Select group </label>
                                                                                            <div className="position-relative" onClick={() => {
                                                                                                setShowInputs(!showInputs); // Toggle inputs on icon click
                                                                                            }}>
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="form-control w-100" // Added Bootstrap class to set width to 100%
                                                                                                    placeholder="Select an option"

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
                                                                                                                onChange={handleInputChange1}

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


                                                                                                                onChange={handleInputChange1}
                                                                                                            />
                                                                                                            <p style={{ color: '#000000', fontSize: '10px', margin: '0', padding: "0", width: '140%' }}>Min. Limi 1.00, Max 99.99, Upto 2 deciaml places for paise</p>
                                                                                                            {tariffRateError && <p style={{ color: 'red' }}>{tariffRateError}</p>}
                                                                                                        </div>

                                                                                                    </div>

                                                                                                    <div className='btton' style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                                                        <button className="custom-button" onClick={handleAddClick}>
                                                                                                            Add
                                                                                                        </button>
                                                                                                        <button className="custom-button" onClick={() => setShowInputs(false)}>
                                                                                                            Close
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <hr style={{ width: '100%', border: '1.5px solid red' }} />
                                                                                                        <p>Select Exsting Group </p>

                                                                                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Add a scroll bar for overflow */}
                                                                                                            {
                                                                                                               
                                                                                                                existingGroups.map((group, index) => {
                                                                                                                   
                                                                                                                    if (group.includes('time')) {
                                                                                                                        return null; // Skip displaying if the group contains 'time'
                                                                                                                    }
                                                                                                                    
                                                                                                                    const metersCount = calculateMetersCount(group); // Replace this with your logic to count meters for the group

                                                                                                                    return (
                                                                                                                        <React.Fragment key={index}>
                                                                                                                            <div style={{ display: 'flex', alignItems: 'center', width: '250px' }}>
                                                                                                                                <img
                                                                                                                                    src="https://img.icons8.com/fluency/100/user-group-man-woman.png"
                                                                                                                                    alt={`${group} icon`}
                                                                                                                                    style={{ width: '50px', height: '50px', marginRight: '20px' }}
                                                                                                                                />
                                                                                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                                                                    <p style={{ margin: '1px' }} onClick={() => handleGroupClick(group)}>
                                                                                                                                        {group}
                                                                                                                                    </p>
                                                                                                                                    <p>No of Consumers: {metersCount}</p>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                            {(index % 2 === 1) && (index !== existingGroups.length - 1) && (
                                                                                                                                <hr style={{ width: '100%', margin: '5px 0' }} />
                                                                                                                            )}
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




                                                                                    </div>


                                                                                    <div className='row g-3' >
                                                                                    </div>
                                                                                    <div className='row g-3' style={{ margin: '10px' }}>
                                                                                        <div className="col-md-6">
                                                                                            <label class="form-label">Meter Location  </label>
                                                                                            <input
                                                                                                type="text"
                                                                                                name="serailnumber"
                                                                                                className='form-control'
                                                                                                id='location'
                                                                                                value={clickedItem.data.location}
                                                                                                readOnly={editedSerialNumber !== clickedItem.serialNumber}
                                                                                                onChange={(event) => handleInputChange(index, 'location', event)}
                                                                                                maxLength={40}
                                                                                            />
                                                                                            <span style={{ color: 'red' }}>  {errors.location && <p className="error-message">{errors.location}</p>} </span>
                                                                                        </div>

                                                                                        <div className="col-md-6">
                                                                                            <label class="form-label">Tariff Rate  </label>
                                                                                            <input
                                                                                                type="text"
                                                                                                name="tariff"
                                                                                                id='tariff'
                                                                                                className='form-control'
                                                                                                // value={displayedInput2}
                                                                                                value={displayedInput2 || tariff}
                                                                                                readOnly
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className='row g-3' style={{ margin: '10px' }}>
                                                                                        <div className="col-md-6">
                                                                                            <label for="validationDefaultUsername" className="form-label">Consumer Name </label>
                                                                                            <input
                                                                                                type="text"
                                                                                                //  id='name'
                                                                                                className='form-control'
                                                                                                id="validationDefaultUsername"
                                                                                                aria-describedby="inputGroupPrepend2" required
                                                                                                value={clickedItem.data.name}
                                                                                                readOnly={editedSerialNumber !== clickedItem.serialNumber}
                                                                                                onChange={(event) => handleInputChange(index, 'name', event)}
                                                                                                maxLength={20}
                                                                                            />
                                                                                            <span style={{ color: 'red' }}>  {errors.name && <p className="error-message">{errors.name}</p>} </span>
                                                                                        </div>
                                                                                        <div className="col-md-6">
                                                                                            <label class="form-label">Consumer Mobile Number </label>
                                                                                            <input

                                                                                                type="text"
                                                                                                name="phone"
                                                                                                id='phone'
                                                                                                className='form-control'
                                                                                                value={clickedItem.data.phone}
                                                                                                readOnly={editedSerialNumber !== clickedItem.serialNumber}
                                                                                                onChange={(event) => handleInputChange(index, 'phone', event)}
                                                                                                maxLength={10}
                                                                                            />
                                                                                            <span style={{ color: 'red' }}>  {errors.phone && <p className="error-message">{errors.phone}</p>} </span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className='row g-3' style={{ margin: '10px' }}>
                                                                                        <div className="col-md-6">
                                                                                            <label class="form-label">E-mail Address (Optional )</label>
                                                                                            <input
                                                                                                type="text"
                                                                                                name="email"
                                                                                                id=''
                                                                                                className='form-control'
                                                                                                value={clickedItem.data.email === 'na' ? '' : clickedItem.data.email}
                                                                                                readOnly={editedSerialNumber !== clickedItem.serialNumber}
                                                                                                onChange={(event) => handleInputChange(index, 'email', event)}
                                                                                                maxLength={40}

                                                                                            />
                                                                                            <span style={{ color: 'red' }}>  {errors.email && <p className="error-message">{errors.email}</p>} </span>
                                                                                        </div>
                                                                                        <div className="col-md-6">
                                                                                            <label class="form-label">Date Of Occupancy</label>

                                                                                            <div>
                                                                                                <input
                                                                                                    type="text"
                                                                                                    className="form-control"
                                                                                                    id={`doo-${clickedItem.serialNumber}`}
                                                                                                    placeholder="Date of Occupancy"
                                                                                                    onClick={() => handleToggleDatePicker(clickedItem.serialNumber)}
                                                                                                    value={clickedItem.data.doo}
                                                                                                    readOnly={editedSerialNumber !== clickedItem.serialNumber}
                                                                                                    onChange={(event) => handleInputChange(index, 'doo', event)}
                                                                                                />

                                                                                                {showDatePickers[clickedItem.serialNumber] && editModeSerialNumber === clickedItem.serialNumber && (

                                                                                                    <DatePicker
                                                                                                        closeOnScroll={true}
                                                                                                        showIcon
                                                                                                        selected={selectedDate}
                                                                                                        onChange={(date) => {
                                                                                                            setSelectedDate(date);
                                                                                                            handleToggleDatePicker(clickedItem.serialNumber);
                                                                                                            handleInputChange(index, 'doo', { target: { value: formatDate(date) } });
                                                                                                        }}
                                                                                                        inline

                                                                                                        icon="fa fa-calendar"
                                                                                                        dateFormat="dd/MM/yy"
                                                                                                        showYearDropdown
                                                                                                        showMonthDropdown
                                                                                                        popperPlacement="top"
                                                                                                    />
                                                                                                )}

                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="d-inline-flex gap-4" style={{ marginLeft: '70px' }}>
                                                                                        <button className="btn btn-primary" onClick={() => handleEditButtonClick(clickedItem.serialNumber)}> Edit </button>

                                                                                        <button className="btn btn-primary" onClick={handleUpdateButtonClick} > SAVE  </button>

                                                                                        <button className="btn btn-success" onClick={() => handleDeletebutton(clickedItem.serialNumber)}> Delete</button>
                                                                                    </div>

                                                                                </div>

                                                                            )}

                                                                        </div>

                                                                    ))}



                                                                </div>


                                                            </div>




                                                            <div>


                                                            </div>


                                                        </div>

                                                    ))}
                                            </ul>

                                        </div>
                                    </div>

                                </div>

                            </div>
                        )}

                    </div >
                </div>


            </div >


        </>



    );
};

export default Groupnameupdate;



