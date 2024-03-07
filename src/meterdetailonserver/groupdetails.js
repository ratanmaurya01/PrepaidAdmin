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
import { validateName } from '../validation/validation';
import CommonFuctions from '../commonfunction';
import GroupName from './groupchange';
import { useNavigate, NavLink } from 'react-router-dom';

import SelectedGroupName from './selectedgroup';

function Groupdetails() {

    const cfunction = new CommonFuctions();
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
    const [error, setError] = useState('');
    const [selectOptions, setSelectOptions] = useState([]);
    const [selectedGroupData, setSelectedGroupData] = useState([]);

    //const [isGroupNameChanged, setIsGroupNameChanged] = useState(false);
    const [searchExecuted, setSearchExecuted] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const dateInputRef = useRef(null);
    const [selectedSerialData, setSelectedSerialData] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    let [inputValues, setInputValues] = useState({
        input1: '',
        input2: '', // Assuming default value for tariff rate is 0, update it accordingly
    });
    const [showInputs, setShowInputs] = useState(false);
    const [displayedInput2, setDisplayedInput2] = useState('');
    const [displayedInput1, setDisplayedInput1] = useState('');
    const [existingGroups, setExistingGroups] = useState([]);
    const [selectedGroupName, setSelectedGroupName] = useState(''); // State to store selected group name
    //  const [groupName, setGroupName] = useState(false);  //selectedGroupName ||


    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedExistingGroupName, setSelectedExistingGroupName] = useState()
    const [numberPart, setNumberPart] = useState(''); // New state for numberPart
    const [updatetoken, setUpdateToken] = useState({});
    const [groupNameError, setGroupNameError] = useState('');
    const [tariffRateError, setTariffRateError] = useState('');
    const [groupTariffRate ,setGroupTariifRate]  = useState('');








    let isGroupNameChanged = false;


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
                //   console.log("Logged in user:", authUser.email);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const numberPart = emailParts[0];
                    //    console.log("Number part:", numberPart);
                    setNumberPart(numberPart);
                    handleSearch(numberPart);
                    handleSearch1(numberPart);
                    SessionValidate(numberPart);
                    SessionUpdate(numberPart);

                }
            } else {
                setUser(null);
                window.location.href = '/'; // Redirect to your login page
            }
        });
        return () => {
            setIsLoading(false);
            unsubscribe();
        };
    }, []);


    // Function to remove underscores from keys in an object
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

    // The handleSearch function
    // const handleSearch = async (phoneNumber) => {
    //     const trimmedPhoneNumber = phoneNumber.trim();
    //     if (trimmedPhoneNumber !== '') {
    //         try {
    //             const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
    //             const snapshot = await dataRef.once('value');
    //             const newData = snapshot.val(); 
    //             setUpdateToken(newData);

    //             if (newData) {
    //                 const modifiedDataWithoutUnderscores = removeUnderscores(newData);
    //                 setSelectedGroupData(modifiedDataWithoutUnderscores);
    //                 setData(modifiedDataWithoutUnderscores || {});

    //                 const options = Object.keys(modifiedDataWithoutUnderscores).map(key => key.replace(/_/g, ' '));
    //                 setSelectOptions(options);
    //             }
    //             setSearchExecuted(true);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     }
    // };



    const handleSearch = async (phoneNumber) => {
        const trimmedPhoneNumber = phoneNumber.trim();
        if (trimmedPhoneNumber !== '') {
            try {
                const dataRef = database.ref(`/adminRootReference/tenantDetails/${trimmedPhoneNumber}`);
                const snapshot = await dataRef.once('value');
                const newData = snapshot.val();
                setUpdateToken(newData);
                //  console.log('group name related alll data ', newData);
                const modifiedDataWithoutTime = excludeTimeProperty(newData);
                // console.log('Modified Data without Time:', modifiedDataWithoutTime);
                setSelectedGroupData(modifiedDataWithoutTime);
                setData(modifiedDataWithoutTime || {});
                if (newData) {
                    const options = Object.keys(newData).map(key => key.replace(/_/g, ' '));
                    // console.log("groupData", options);
                    setSelectOptions(options);
                }
                setSearchExecuted(true);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };



    const excludeTimeProperty = (data) => {
        const modifiedData = { ...data };
        delete modifiedData.time;
        return modifiedData;
    };


    const extractGroupNames = () => {
        if (data) {

            const groupNames = Object.keys(data).filter(key => key !== 'tariff');
            //   console.log("Grpuprealed tariff group names", groupNames);
            return groupNames;
        }
        return [];
    };





    const [meterList, setMeterList] = useState([]);
    const [serialOptions, setSerialOptions] = useState([]);
    const [mergedArray, setMergedArray] = useState([]);


    useEffect(() => {
        extractSerialNumbers();
    }, [updatetoken]);

    useEffect(() => {
        const merged = [...serialOptions, ...meterList.map(meterId => ({ serial: meterId }))];
        setMergedArray(merged);
    }, [serialOptions, meterList]);



    const extractSerialNumbers = () => {
        const extractedSerials = Object.values(data).reduce((acc, item) => {
            if (item && typeof item === 'object' && !Array.isArray(item)) {
                const keys = Object.keys(item);
                const filteredKeys = keys.filter((key) => !isNaN(Number(key)));
                acc.push(...filteredKeys.map(serial => ({ serial, name: item[serial].name })));
            }
            return acc;
        }, []);
        setSerialOptions(extractedSerials);
    };
    const handleSearch1 = async (numberPart) => {
        try {
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
            console.log('Error Fetching:', e);
        }
    };

    // Call isTokenAvailable function with appropriate arguments


    useEffect(() => {
        mergedArray.forEach(({ serial }, index) => {
            isTokenAvailable(serial, index);
        });
    }, [mergedArray]);


    const handleCustomBoxClick = (groupName, serial, info) => {

        console.log(" slelect Group Name:", groupName, "Serial:", serial, "Info:", info);
        console.log(" slelect Group Name:", editGroupName);
        // setSelectedSerialData({ serial,
        // setSelectedSerialData({ serial, info });

        setSelectedSerialData({
            serial,
            info: {
                ...info,
            },
            tariff: data[groupName].tariff, // Assuming data[groupName].tariff holds the tariff value
        });

        setSelectedGroupName(groupName);
        setGroupName(groupName);
        openModal();
    };






    useEffect(() => {
        //  console.log('Group Names:', extractGroupNames());
    }, [data]);

    useEffect(() => {
        if (selectedSerialData) {
            // console.log("Selected Serial Data:", selectedSerialData);
            // Do more actions with the selected data if needed
        }
    }, [selectedSerialData]);

    const [locationError, setLocationError] = useState('');
    const [nameError, setNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleInputChange = (field, value) => {

        setErrorMessageLocation('');


        // Validate the address if the field is 'location'
        if (field === 'location') {
            // Regular expression to match any special characters
            const specialCharsRegex = /[^a-zA-Z0-9\s]/;

            // Check if the value contains any special characters
            if (specialCharsRegex.test(value)) {
                // Set the locationError state to display an error message
                setLocationError('Special characters Not allowed');
            }
            else if (value.charAt(0) === ' ') {
                return ''; // Error message for name starting with a space
            } else {
                // Reset the locationError state if the value is valid
                setLocationError('');
            }

            // Remove special characters from the input value
            value = value.replace(specialCharsRegex, '');
        }




        let errorMessage = '';

        if (field === 'name') {
            setErrorMessageName('');
            const specialCharsRegex = /[^a-zA-Z0-9\s]/;

            // Check if the value contains any special characters
            if (specialCharsRegex.test(value)) {
                // Set the locationError state to display an error message
                setNameError('Special characters Not allowed');
            }
            else if (value.charAt(0) === ' ') {
                return ''; // Error message for name starting with a space
            } else {
                // Reset the locationError state if the value is valid
                setNameError('');
            }

            // Remove special characters from the input value
            value = value.replace(specialCharsRegex, '');
        }



        if (field === 'phone') {
            // Remove non-digit characters from the value

            setErrorMessagePhone('');

            const newValue = value.replace(/\D/g, '');

            if (value.charAt(0) === '0') {
                // Display error message
                setPhoneError("Can't start with Zero");
            }

            // Check if the value has changed
            if (value !== newValue) {
                setPhoneError('Special characters not allowed');
                // Update the value in the input field
                value = newValue;
            }
            // If there's an error message, set the phone error state
            if (errorMessage) {
                setPhoneError(errorMessage);
            } else {
                // Clear the phone error state if there's no error
                setPhoneError('');
            }

        }


        //     const email = value; // Trim leading and trailing whitespace
        //     const specialCharsRegex = /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/;

        //     if (email.charAt(0) === " ") {

        //         setEmailError('Email address cannot start with a space');
        //     } else if (!specialCharsRegex.test(email)) {
        //         setEmailError('Invalid email address');
        //     } else {
        //         setEmailError('');
        //     }
        // }


        if (field === 'email') {

            value = value.trim();
            const specialCharsRegex = /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/;

            if (value.charAt(0) === " ") {
                setEmailError('Email address cannot start with a space');
            } else if (!specialCharsRegex.test(value)) {
                setEmailError('Invalid email address');
            } else {
                setEmailError('');
            }
            // Set the value after trimming spaces
            setSelectedSerialData(prevState => ({
                ...prevState,
                info: {
                    ...prevState.info,
                    email: value
                }
            }));

        }


        // if (field === 'email') {
        //     const email = value.trim(); // Trim leading and trailing whitespace
        //     const specialCharsRegex = /^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$/;

        //     if (value.charAt(0) === " ") {
        //         // Remove the leading space
        //         const trimmedEmail = value.replace(/^\s+/, '');

        //         if (!specialCharsRegex.test(trimmedEmail)) {
        //             setEmailError('Invalid email address');
        //         } else {
        //             setEmailError('');
        //         }
        //     } else if (!specialCharsRegex.test(email)) {
        //         setEmailError('Invalid email address');
        //     } else {
        //         setEmailError('');
        //     }
        // 

        setSelectedSerialData(prevData => ({
            ...prevData,
            info: {
                ...prevData.info,
                [field === 'date' ? 'doo' : field]: value,

            }
        }));
    };

    const handleInputChange1 = (e) => {
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



    // const handleInputChange1 = (e) => {

    //     setTariffRateError('');
    //     setGroupNameError('');
    //     const { name, value } = e.target;

    //     if (name === 'input1') {
    //         // Regular expression to match only alphanumeric characters and spaces
    //         const alphanumericRegex = /^[a-zA-Z0-9\s ]*$/;

    //         if (!alphanumericRegex.test(value) && value !== '') {
    //             setGroupNameError('Special characters not allowed ');
    //         }
    //         else if (value.charAt(0) === ' ') {

    //             return;
    //         } else {
    //             setGroupNameError('');
    //             setInputValues({ ...inputValues, [name]: value });
    //         }
    //     } else if (name === 'input2') {
    //         // Validation for input2 (Tariff Rate)
    //         const numericRegex = /^(?:\d{1,2}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/;

    //         if (numericRegex.test(value) || value === '') {
    //             setInputValues({ ...inputValues, [name]: value });
    //         } else if (value.charAt(0) === ' ') {
    //             return ' '; // Error message for name starting with a space
    //         }
    //         else {
    //             setTariffRateError('');
    //         }
    //     }

    // };

    // const handleInputChange1 = (e) => {
    //     const { name, value } = e.target;
    //     if (name === 'input2') {
    //         // Regular expression to match only numeric characters with decimals
    //         const numericRegex = /^(?:\d{1,2}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/;

    //         if (numericRegex.test(value) || value === '') {
    //             setInputValues({ ...inputValues, [name]: value });
    //         }
    //     } else {
    //         setInputValues((prevValues) => ({
    //             ...prevValues,
    //             [name]: value,
    //         }));
    //     };
    // };

    const openModal = () => {
        setModalIsOpen(true);
    };


    useEffect(() => {
        // Transform data into an array of group names (existing groups)
        const groups = Object.keys(data || {}).map(group => group.replace(/_/g, ' '));
        setExistingGroups(groups);


        //  console.log('Existing Groups:', groups);
    }, [data, setExistingGroups]);
    //console.log("Check all data for", data);

    const handleGroupClick = (group) => {
        // Access the data related to the clicked group and perform actions
        const groupData = data[group.replace(/ /g, '_')]; // Assuming your data structure contains group-related data
        // setSelectedGroupData(groupData);
        setSelectedGroupName(group);
        setSelectedGroup(group);
        const groupNames = Object.keys(groupData || {}).filter(key => key !== 'tariff');
        //  console.log("Group names for", group, ":", groupNames);

        //  console.log("Group name ", groupData);
        setSelectedExistingGroupName(group);
        const groupName = displayedInput1 || selectedExistingGroupName; // Choose the appropriate value
        //  console.log("Group Name for Saving Data:", groupName);
        //   ////  console.log("Selected Existing Group Name:", group);
        if (groupData && groupData.tariff) {
            setDisplayedInput2(groupData.tariff.toString()); // Assuming displayedInput2 is a state variable
        } else {
            setDisplayedInput2(''); // Clear the displayedInput2 if no tariff rate is available for the selected group
        }

        if (groupData && groupData.tariff !== undefined) {
            //     console.log("Tariff Value:", groupData.tariff); // Add this line to check if tariff is present

            // Update displayedInput2 with the selected group's tariff
            setDisplayedInput2(groupData.tariff.toString());

        }
        setTariffRateError('');
        setShowInputs(false); // Hide the input fields after selecting a group


    };



    // const getInputValue = () => {
    //     if (selectedGroupName) {

    //         //    console.log("selected dddddddddddd", selectedGroupName);
    //         return selectedGroupName;

    //     } else if (inputValues.input1) {

    //     } else {
    //         return 'Create/Selected Group';
    //     }
    // };

    const getInputValue = () => {
        if (selectedGroupName) {
            return selectedGroupName.split('_').join(' '); // Replace underscores with spaces
        } else if (inputValues.input1) {
            return inputValues.input1;
        } else {
            return 'Create/Selected Group';
        }
    };


    const calculateMetersCount = (groupData) => {
        let count = 0;
        if (groupData) {
            count = Object.keys(groupData).filter(key => key !== 'tariff').length;
        }
        return count;
    };

    const handleAddClick = async () => {

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

    const handleResetInputss = () => {
        setInputValues({
            input1: '',
            input2: '',
        });
    };

    const handleCloseClick = () => {

        setGroupNameError('');
        setTariffRateError('');

        handleResetInputss(); // Reset input values when closing


        setShowInputs(false);
    };


    const handleSelectChange = (e) => {
        const value = e.target.value;
        setShowInputs(value === 'showInputs');
        //console.log("check values", value);
    };

    useEffect(() => {
        // Transform data into an array of group names (existing groups)
        const groups = Object.keys(data || {}).map(group => group.replace(/_/g, ' '));
        setExistingGroups(groups);


        //  console.log('Existing Groups:', groups);
    }, [data, setExistingGroups]);


    // const handleClose = () => {

    //     setSelectedGroupName("");
    //     setDisplayedInput2("");
    //     setModalIsOpen(false);

    // };


    // const handleSavebutton = async () => {
    //     try {
    //         if (selectedSerialData) {
    //             console.log('Selected Serial Data:', selectedSerialData);
    //             // Destructure selectedSerialData
    //             const { serial, info } = selectedSerialData;
    //             // Define database paths
    //             const databasePath = `/adminRootReference/tenantDetails/${numberPart}/${selectedGroupName}/${serial}`;

    //           // await firebase.database().ref(databasePath).update(info);
    //          // Log all input field values
    //             console.log('number check:', numberPart);
    //             console.log(' newGroup Name:', selectedGroupName);
    //             console.log(' Group Name :', groupName);
    //             console.log('Location:', selectedSerialData.info.location);
    //             console.log('Tariff:', displayedInput2 || selectedSerialData.info.tariff);
    //             console.log('Consumer Name:', selectedSerialData.info.name);
    //             console.log('Consumer Mobile Number:', selectedSerialData.info.phone);
    //             console.log('E-mail Address:', selectedSerialData.info.email);
    //             console.log('Date of Occupancy:', selectedSerialData.info.doo);
    //         //    console.log("Check 1",isAnyDataChanged);

    //         console.log('new Group Name:', selectedGroupName);
    //         console.log('Group Name:', groupName);

    //         //setIsGroupNameChanged(false);

    //         if (selectedGroupName !== groupName) {
    //             isGroupNameChanged = true;

    //         } else {
    //             isGroupNameChanged = false;
    //         }

    //         console.log("isGroupNameChanged", isGroupNameChanged);

    //             // Check for changes in data
    //             let isAnyDataChanged =
    //                 info.location !== selectedSerialData.info.location ||
    //                 (displayedInput2 || info.tariff) !== selectedSerialData.info.tariff ||
    //                 info.name !== selectedSerialData.info.name ||
    //                 info.phone !== selectedSerialData.info.phone ||
    //                 info.email !== selectedSerialData.info.email ||
    //                 info.doo !== selectedSerialData.info.doo;

    //                 console.log("Check 2",isAnyDataChanged);


    //             if (isAnyDataChanged) {
    //                 // Update the database only if there are changes
    //              //   await firebase.database().ref(databasePath).update(info);
    //                 alert('Data updated successfully!');
    //             } else {
    //                 alert('No changes detected.');
    //             }
    //         }
    //     } catch (error) {
    //          console.error('Error updating data:', error);
    //         console.log('Error updating data. Please check the console for details.');
    //     }
    // };


    const [errorMessageLocation, setErrorMessageLocation] = useState('');
    const [errorMessageName, setErrorMessageName] = useState('');
    const [errorMessagePhone, setErrorMessagePhone] = useState('');



    const handleSavebutton = async () => {
        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await cfunction.HandleValidatSessiontime(numberPart);
        if (storeSessionId === sessionId) {
            try {
                if (!selectedSerialData) {
                    throw new Error('Selected serial data is missing.');
                }

                if (selectedGroupName === "") {
                    alert("Please enter a email");
                    return;
                }

                const { serial, info } = selectedSerialData;

                let locationError = '';
                let nameError = '';
                let phoneError = '';

                if (!info.location) {
                    locationError = "Enter the consumer's meter location";
                }

                if (!info.name) {
                    nameError = 'Name is required!';
                }

                if (!info.phone) {
                    phoneError = 'Phone is required!';
                }

                setErrorMessageLocation(locationError);
                setErrorMessageName(nameError);
                setErrorMessagePhone(phoneError);

                if (locationError || nameError || phoneError) {
                    return;
                }

                const formattedGroupName = selectedGroupName.split(' ').join('_');
                const newgroupName = groupName.replace(/ /g, '_');

                const databasePath = `/adminRootReference/tenantDetails/${numberPart}/${formattedGroupName}/${serial}`;
                const deletePath = `/adminRootReference/tenantDetails/${numberPart}/${newgroupName}/${serial}`;
                const tariffReference = `/adminRootReference/tenantDetails/${numberPart}/${formattedGroupName}/tariff`;
                const findGroupChild = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${newgroupName}`);

                if (formattedGroupName !== groupName) {
                    isGroupNameChanged = true;

                    await firebase.database().ref(databasePath).update(info);
                    const newTariffRate = displayedInput2 || info.tariff;
                    await firebase.database().ref(tariffReference).set(newTariffRate);
                    await firebase.database().ref(deletePath).remove();

                    cfunction.isAnyMeterExist(findGroupChild)
                        .then((childCount) => {
                            if (childCount == 0) {
                                findGroupChild.remove().then(() => {
                                    console.log('Remove successfully');
                                }).catch(() => {
                                    console.log('Error deleting Firebase reference');
                                });
                            } else {
                                console.log('Child count is greater than 0');
                            }
                        })
                        .catch((error) => {
                            console.error('Error in isAnyMeterExist:', error);
                        });

                    alert('Data updated successfully!');
                    window.location.reload(true);
                } else {
                    // Check if there's any change in the data
                    const currentData = await firebase.database().ref(databasePath).get();
                    const currentInfo = currentData.val();
                    if (JSON.stringify(info) === JSON.stringify(currentInfo)) {
                        // No change in the data
                        alert('No changes in existing data.');
                    } else {
                        isGroupNameChanged = false;
                        await firebase.database().ref(databasePath).update(info);
                        const newTariffRate = displayedInput2 || info.tariff;
                        await firebase.database().ref(tariffReference).set(newTariffRate);
                        alert('Data updated successfully!');
                        window.location.reload(true);
                    }
                }
            } catch (error) {
                console.error('Error during data update:', error);
            }
        } else {
            alert("You have been logged-out due to log-in from another device.");
            handleLogout();
        }
    };


    // const handleSavebutton = async () => {

    //     const storeSessionId = localStorage.getItem('sessionId');
    //     const { sessionId } = await cfunction.HandleValidatSessiontime(numberPart);
    //     if (storeSessionId === sessionId) {

    //         try {
    //             if (!selectedSerialData) {
    //                 throw new Error('Selected serial data is missing.');
    //             }


    //             if (selectedGroupName === "") {

    //                 // setErrorMessagegroupname("Create or Select a group for the meter.");
    //                 alert("Please enter a email");
    //                 return;
    //             }

    //             const { serial, info } = selectedSerialData;

    //             let locationError = '';
    //             let nameError = '';
    //             let phoneError = '';


    //             // Check if location is empty
    //             if (!info.location) {
    //                 console.log("Required Meter Location ");
    //                 locationError = "Enter the consumer's meter location";
    //             }

    //             // Check if name is empty
    //             if (!info.name) {
    //                 console.log("Required Name ");
    //                 nameError = 'Name is required!';
    //             }

    //             // Check if phone is empty
    //             if (!info.phone) {
    //                 console.log("Required phone number ");
    //                 phoneError = 'Phone is required!';
    //             }


    //             // Update error messages
    //             setErrorMessageLocation(locationError);
    //             setErrorMessageName(nameError);
    //             setErrorMessagePhone(phoneError);


    //             // If any error message is set, display the error messages and return
    //             if (locationError || nameError || phoneError) {

    //                 return;
    //             }

    //             const formattedGroupName = selectedGroupName.split(' ').join('_');
    //             const newgroupName = groupName.replace(/ /g, '_');

    //             const databasePath = `/adminRootReference/tenantDetails/${numberPart}/${formattedGroupName}/${serial}`;
    //             const deletePath = `/adminRootReference/tenantDetails/${numberPart}/${newgroupName}/${serial}`;
    //             const tariffReference = `/adminRootReference/tenantDetails/${numberPart}/${formattedGroupName}/tariff`;
    //             const findGroupChild = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${newgroupName}`);

    //             if (formattedGroupName !== groupName) {
    //                 isGroupNameChanged = true;

    //                 await firebase.database().ref(databasePath).update(info);
    //                 const newTariffRate = displayedInput2 || info.tariff;
    //                 await firebase.database().ref(tariffReference).set(newTariffRate);
    //                 await firebase.database().ref(deletePath).remove();


    //                 cfunction.isAnyMeterExist(findGroupChild)
    //                     .then((childCount) => {
    //                         if (childCount == 0) {
    //                             findGroupChild.remove().then(() => {
    //                                 console.log('Remove successfully');
    //                             })
    //                                 .catch(() => {
    //                                     console.log('Error deleting Firebase reference');
    //                                 });
    //                         } else {
    //                             console.log('Child count is greater than 0');
    //                         }
    //                     })
    //                     .catch((error) => {
    //                         console.error('Error in isAnyMeterExist:', error);
    //                     });

    //                 alert('Data updated successfully!');
    //                 window.location.reload(true);
    //             } else {
    //                 isGroupNameChanged = false;
    //                 await firebase.database().ref(databasePath).update(info);
    //                 const newTariffRate = displayedInput2 || info.tariff;
    //                 await firebase.database().ref(tariffReference).set(newTariffRate);

    //                 alert('Data updated successfully!');
    //                 window.location.reload(true);
    //             }
    //         } catch (error) {
    //             //  console.error('Error during data update:', error);
    //         }


    //     } else {

    //         alert("You have been logged-out due to log-in from another device.");
    //         // console.log('you are logg out ');
    //         handleLogout();
    //     }
    // };


    const handleDelete = async (event) => {
        event.preventDefault();


        const storeSessionId = localStorage.getItem('sessionId');
        const { sessionId } = await cfunction.HandleValidatSessiontime(numberPart);
        if (storeSessionId === sessionId) {


            let selectedGroupNamed = selectedGroupName.replace(/ /g, "_");

            if (!selectedSerialData || !selectedGroupNamed) {
                //   console.error('No selected serial data or group name to delete.');
                return;
            }

            //  console.log('Deleting group name if no serialnumer 12', groupName);

            //  console.log('Deleting group name if no serialnumer 34', selectedGroupNamed);
            // Use window.confirm to display a confirmation dialog
            const isConfirmed = window.confirm('Are you sure you want to delete this data?');

            if (isConfirmed) {
                const { serial } = selectedSerialData;
                const databasePath = `/adminRootReference/tenantDetails/${numberPart}/${selectedGroupNamed}/${serial}`;

                const findGroupChild = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${selectedGroupNamed}`);
                // Delete the data from Firebase


                firebase.database().ref(databasePath).remove()
                    .then(() => {


                        //  console.log('Data deleted successfully!');
                        // Add any additional logic you need after deleting
                        handleClose(); // Close the modal after successful deletion
                        window.location.reload();
                    })
                    .catch((error) => {
                        console.error('Error deleting data:', error);
                        // Handle errors here
                    });

                const cfunction = new CommonFuctions();
                cfunction.isAnyMeterExist(findGroupChild)
                    .then(childCount => {
                        console.log('childCount1111111111111', childCount);

                        if (childCount == 0) {
                            console.log('Deleting Firebase reference because childCount is 0');
                            //cfunction.deleteFirebaseReference(findGroupChild);
                            findGroupChild.remove().then(() => {
                                // console.log("remove successfully");
                            })
                                .catch(() => {

                                    console.log("Error deleting Firebase reference");
                                });
                        } else {
                            console.log("Child count is greater than 0");
                        }
                    })
                    .catch(error => {
                        console.error('Error in isAnyMeterExist:', error);
                    });



            } else {
                console.log('Deletion canceled by user.');
                // Handle cancellation or do nothing
            }

        } else {

            alert("You have been logged-out due to log-in from another device.");
            // console.log('you are logg out ');
            handleLogout();
        }



    }

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
            setModalIsOpen(false);
            setShowDatePicker(false);

        }
    };


    const [modalIsOpendata, setModalIsOpenData] = useState(false); // State to manage the modal
    const handleClosed = () => {
        setSelectedGroupName(''); // Reset the selected group name
        setModalIsOpenData(false); // Close the modal
    };

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
        // console.log("Received session ID from server: ", sessionId);

        if (storeSessionId === sessionId) {
            //  console.log('SessionId Match ', sessionId);
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

    const [serialNumbersAndNames, setSerialNumbersAndNames] = useState([]);


    const handleGroupNameClick = (groupName) => {
        setSelectedGroupName(groupName);
        setEditGroupName(groupName); // This ensures that editGroupName is updated when the selectedGroupName is updated
        const selectedGroupData = data[groupName];

        if (selectedGroupData) {
            setGroupName(groupName);
            setTariff(selectedGroupData.tariff || '');
            setGroupTariifRate(selectedGroupData.tariff );

            setSerialNumbersAndNames(selectedGroupData);
        } else {
            setGroupName('');
            setTariff('');
        }

        setModalIsOpenData(true); // Open the modal
    };

    const [Errorgroup, setErroeGroup] = useState('');

    // Edit group name and related data
    const [tariff, setTariff] = useState('');
    const [groupName, setGroupName] = useState(selectedGroupName);
    const [editGroupName, setEditGroupName] = useState(selectedGroupName); // Initialize editGroupName with selectedGroupName

    const handleGroupNameChange = (event) => {
        // setEditGroupName(event.target.value);
        setEnterGroupnameError('');

        const groupname = event.target.value;
        const errorMessage = validateName(groupname);

        if (errorMessage) {
            // Display the error message to the user
            setErroeGroup(errorMessage);
        } else {
            // Validation passed, set the group name in the state
            setEditGroupName(groupname);
            setErroeGroup("");
        }
    };



    const handleTariffChange = (event) => {
        setEnterTariffError('');
        const inputValue = event.target.value;
        if (inputValue === '0') {
            setTariff('');
        } else {
            const isValid = /^(?:\d{1,2}(?:\.\d{0,2})?|99.99(?:\.00?)?)$/.test(inputValue);
            if (isValid || inputValue === '') {
                setTariff(inputValue);
            } else {
                // Handle invalid input, e.g., display an error message or prevent setting tariff
            }
        }
    };


    const [EnterGroupnameError, setEnterGroupnameError] = useState('');
    const [EnterTariffError, setEnterTariffError] = useState('');



    // const handleUpdate = async () => {
    //     console.log(" Tariff Rate name  ", tariff);
    //     if (!editGroupName.trim()) {
    //         setEnterGroupnameError("Cannot be empty.")
    //         return;
    //     }
    //     if (!tariff.trim()) {
    //         setEnterTariffError('"Cannot be empty."')
    //         return;
    //     }


    //     if (tariff.endsWith('.')) { // Check if tariff ends with a dot
    //         setEnterTariffError("Invalid tariff.");
    //         return;
    //     }

    //     let selectedsr = selectedGroupName.replace(/ /g, "_");
    //     try {
    //         const currentDataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${selectedsr}/`);
    //         const snapshot = await currentDataRef.once('value');
    //         const data = snapshot.val();
    //         console.log("data not come ", data);
    //         if (!data) {
    //             console.log('Selected group not found in the database');
    //             return;
    //         }

    //         const formattedGroupName = (editGroupName || selectedGroupName).split(' ').join('_');
    //         const newDataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${formattedGroupName}/`);
    //         // Conditionally update the group name and tariff rate
    //         if (editGroupName && formattedGroupName) {
    //             // data.groupName = groupName;
    //         }

    //         for (const serialKey in data) {
    //             if (Object.hasOwnProperty.call(data, serialKey)) {
    //                 const serialData = data[serialKey];
    //                 if (serialData && typeof serialData === 'object' && serialData.serial) {
    //                     // Check if the serial has a tariff property and update it
    //                     if (serialData.tariff !== undefined && serialData.tariff !== tariff) {
    //                         serialData.tariff = tariff;
    //                     }
    //                 }
    //             }
    //         }
    //         // Update grouptariff if it's different
    //         if (data.grouptariff !== undefined && data.grouptariff !== tariff) {
    //             data.grouptariff = tariff;
    //         }

    //         if (tariff !== undefined && tariff !== data.tariff) {
    //             data.tariff = tariff;
    //         }

    //         // Write data to the new parent
    //         await newDataRef.set(data);

    //         // Delete data from the current parent if the group name has changed
    //         if (editGroupName && editGroupName !== selectedGroupName) {
    //             await currentDataRef.remove();
    //         }

    //         //  console.log('Item updated successfully!');
    //         alert('Data save successfully ');
    //         window.location.reload(true);

    //     } catch (e) {

    //         console.log("error from save detials :", e);
    //     }

    // }


    const isAnychangeGroupname =(oldGroupname , newGroupname , oldTariff , newTariff)=>{

        return  (oldGroupname !== newGroupname || oldTariff !== newTariff );

    }



    const handleUpdate = async () => {

       let  isAnychange =  isAnychangeGroupname(selectedGroupName , editGroupName , groupTariffRate , tariff);
      
       if (isAnychange ){

       
       
       
       
    //    console.log(" Tariff Rate name  ", tariff);
    //     console.log(" old Rate   ",  groupTariffRate);
    //     console.log(" old group name   ", selectedGroupName);
    //     console.log(" new group name ",  editGroupName);

        if (!editGroupName.trim()) {
            setEnterGroupnameError("Cannot be empty.")
            return;
        }
        if (!tariff.trim()) {
            setEnterTariffError('"Cannot be empty."')
            return;
        }

        if (tariff.endsWith('.')) { // Check if tariff ends with a dot
            setEnterTariffError("Invalid tariff.");
            return;
        }

        // Add this line to format the tariff to two decimal places
        const formattedTariff = parseFloat(tariff).toFixed(2);

        let selectedsr = selectedGroupName.replace(/ /g, "_");
        try {
            const currentDataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${selectedsr}/`);
            const snapshot = await currentDataRef.once('value');
            const data = snapshot.val();
            console.log("data not come ", data);
            if (!data) {
                console.log('Selected group not found in the database');
                return;
            }

            const formattedGroupName = (editGroupName || selectedGroupName).split(' ').join('_');
            const newDataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${formattedGroupName}/`);
            // Conditionally update the group name and tariff rate
            if (editGroupName && formattedGroupName) {
                // data.groupName = groupName;
            }

            for (const serialKey in data) {
                if (Object.hasOwnProperty.call(data, serialKey)) {
                    const serialData = data[serialKey];
                    if (serialData && typeof serialData === 'object' && serialData.serial) {
                        // Check if the serial has a tariff property and update it
                        if (serialData.tariff !== undefined && serialData.tariff !== formattedTariff) {
                            serialData.tariff = formattedTariff;
                        }
                    }
                }
            }
            // Update grouptariff if it's different
            if (data.grouptariff !== undefined && data.grouptariff !== formattedTariff) {
                data.grouptariff = formattedTariff;
            }

            if (formattedTariff !== undefined && formattedTariff !== data.tariff) {
                data.tariff = formattedTariff;
            }

            // Write data to the new parent
            await newDataRef.set(data);

            // Delete data from the current parent if the group name has changed
            if (editGroupName && editGroupName !== selectedGroupName) {
                await currentDataRef.remove();
            }

            //  console.log('Item updated successfully!');
            alert('Data save successfully ');
            window.location.reload(true);

        } catch (e) {

            console.log("error from save detials :", e);
        }

    }  else{

        alert ('No change in existing data. ');
    }

    }



    const handleDeleteGroupname = async () => {
        console.log('groupname ', editGroupName);
        const formattedGroupName = (editGroupName || selectedGroupName).split(' ').join('_');
    
        const newDataRef = database.ref(`/adminRootReference/tenantDetails/${numberPart}/${formattedGroupName}/`);
        const snapshot = await newDataRef.once('value');
        const data = snapshot.val();
        console.log('Data before deletion: ', data);
    
        if (data) {
            const keys = Object.keys(data).filter(key => key !== 'time'); // Exclude 'time' key
            if (keys.length === 0) {
                // If no keys other than 'time', delete the group name
                await newDataRef.remove();
                console.log(`Group ${formattedGroupName} deleted successfully.`);
            } else {
              //  console.log(`Group ${formattedGroupName} has keys other than 'time', checking for serial numbers.`);
                const serialNumbers = keys.filter(key => key !== 'tariff'); // Exclude 'tariff' key if needed
                if (serialNumbers.length === 0) {
                    await newDataRef.remove();
                    alert(`Group ${formattedGroupName} deleted successfully as it has no serial numbers.`);
                    window.location.reload();

                } else {
                    // alert(`Group ${formattedGroupName} has ${serialNumbers.length} serial numbers, not deleting.`);
                    alert(`Meter present in this group cannot delete..`);
                }
            }
        } else {
            console.log(`Group ${formattedGroupName} not found.`);
        }
    }

    
    



    return (
        <>
            <div style={{ marginLeft: '16%' }}>

                {/* <div>
                    {extractGroupNames().length > 0 && (
                        <h4 style={{ color: '#8B0000' }} >Edit Details</h4>
                    )}

                </div> */}


                <div>
                    {extractGroupNames().length > 0 ? (
                        <h4 style={{ color: '#8B0000' }}>Edit Details</h4>
                    ) : (
                        <>
                            <h4 style={{ color: '#8B0000' }}>Edit Details</h4>
                            <h6>No consumer details available for edit or delete.</h6>
                        </>
                    )}
                </div>

                {extractGroupNames().map((groupName, groupIndex) => (
                    <div key={groupIndex}>
                        <div style={{
                            display: 'flex',
                            backgroundColor: '#e3f2fd',
                            width: '30%',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',

                            position: 'relative'
                        }}>
                            <h2 style={{ width: 'auto' }}>{groupName.replace(/_/g, ' ')}</h2>
                            <img
                                src="https://img.icons8.com/ios-glyphs/30/edit--v1.png"
                                alt="Edit Icon"
                                style={{

                                    height: '20px',
                                    cursor: 'pointer',
                                    margin: '20px',
                                    marginTop: '0'
                                }}
                                onClick={() => handleGroupNameClick(groupName)}
                            />
                        </div>



                        <Modal show={modalIsOpendata} onHide={handleClosed}
                            size="lg"

                            backdrop="static">
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Details</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>

                                <div className=' groupname'>
                                    <div >

                                        <div className='group-icon' >
                                            <div style={{ display: 'flex', padding: '2%' }}>
                                                <img
                                                    src="https://img.icons8.com/fluency/48/add-user-male.png"
                                                    alt="Icon"
                                                    style={{ width: '25px', height: '25px', marginLeft: '4%' }}
                                                />

                                                <p  >{selectedGroupName.replace(/_/g, ' ')}</p>
                                            </div>
                                        </div>
                                        <div  >
                                            <div className='groupnameFrom' style={{ display: 'flex', marginLeft: '3%', marginTop: '10px', width: 'auto' }}>
                                                <div>
                                                    <label> Group Name  </label>

                                                    <br></br>

                                                    <input
                                                        type="text"
                                                        placeholder="Group Name"
                                                        className='input-field underline-input w-auto'
                                                        value={editGroupName.replace(/_/g, ' ')}
                                                        onChange={handleGroupNameChange}
                                                    />

                                                    <br></br>

                                                    {EnterGroupnameError && <span style={{ color: 'red' }}>{EnterGroupnameError}</span>}

                                                </div>
                                                <div>
                                                    <label> Tariff Rate (₹)   </label>
                                                    <br></br>
                                                    <input
                                                        type="text"
                                                        placeholder="Tariff"
                                                        className='input-field underline-input w-auto'
                                                        value={tariff} // Display the tariff here
                                                        onChange={handleTariffChange} // Add onChange if you want to allow changes
                                                    />

                                                    <br></br>
                                                    <span style={{ fontSize: '10px' }} >Min. Limi 1.00, Max 99.99, Upto 2 deciaml places for paise</span>

                                                    <br></br>
                                                    {EnterTariffError && <span style={{ color: 'red' }}>{EnterTariffError}</span>}


                                                </div>

                                                <div>

                                                    <button className="btn btn-primary" onClick={handleUpdate} >UPDATE</button>

                                                    <button className="btn btn-danger" style={{marginLeft:'10px'}} onClick={handleDeleteGroupname} >Delete</button>

                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                </div>


                            </Modal.Body>
                        </Modal>

                        <div className="rowContainer">
                            {Object.entries(data[groupName]).map(([serial, info], index) => (
                                (info !== 'tariff' && info !== null && serial !== 'tariff') && (
                                    <div key={index} className='customBox' style={{ position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p>{serial}  <span style={{ color: 'red' }}>{tokenStatus[serial]} </span> </p>
                                                {/* <span style={{color:'red'}}>{tokenStatus[serial]} </span> */}
                                                <p>{info.name}</p>
                                                {/* <p>{data[groupName].tariff}</p> */}

                                            </div>
                                            <div style={{ position: 'absolute', top: '5px', right: '5px' }}>
                                                <img
                                                    src="https://img.icons8.com/ios-glyphs/30/edit--v1.png"
                                                    alt="Edit Icon"
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                    onClick={() => handleCustomBoxClick(groupName, serial, info)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                ))}
            </div >


            <Modal show={modalIsOpen} onHide={handleClose} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedSerialData && (
                        <div>
                            <div className="row">
                                <div className="col-md-6">
                                    <label>Meter Serial Number </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedSerialData.serial}
                                        onChange={(e) => handleInputChange('serial', e.target.value)}
                                        disabled
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
                                                    // console.log("my group name data ", group);
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

                            <div className="row">
                                <div className="col-md-6">
                                    <label>Meter Location</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedSerialData.info.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        maxLength={40}
                                    />

                                    {errorMessageLocation && (
                                        <div style={{ color: 'red' }} className="error-message">{errorMessageLocation}</div>
                                    )}

                                    {locationError && (
                                        <div style={{ color: 'red' }}>{locationError}</div>
                                    )}

                                </div>
                                <div className="col-md-6">

                                    <label>Tariff</label>
                                    {selectedGroupData && (
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={displayedInput2 || selectedSerialData.tariff}

                                            readOnly

                                        />
                                    )}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <label>Consumer Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedSerialData.info.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        maxLength={20}
                                    />
                                    {nameError && <div style={{ color: 'red' }} className="error-message">{nameError}</div>}


                                    {errorMessageName && (
                                        <div style={{ color: 'red' }} className="error-message">{errorMessageName}</div>
                                    )}

                                </div>
                                <div className="col-md-6">
                                    <label>Consumer Mobile Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedSerialData.info.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        maxLength={10}
                                    />

                                    {errorMessagePhone && (
                                        <div style={{ color: 'red' }} className="error-message">{errorMessagePhone}</div>
                                    )}

                                    {phoneError &&
                                        <div style={{ color: 'red' }} className="error-message">
                                            {phoneError}

                                            {/* {errorMessagePhone && (
                                                <div style={{ color: 'red' }} className="error-message">{errorMessagePhone}</div>
                                            )} */}
                                        </div>}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <label>E-mail Address (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-control"

                                        value={selectedSerialData.info.email === 'na' ? '' : selectedSerialData.info.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                    />
                                    {emailError &&
                                        <div style={{ color: 'red' }} className="error-message">
                                            {emailError}
                                        </div>}
                                </div>

                                {/* <div className="col-md-6">
                                                <label>Date of Occupancy</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={selectedSerialData.info.doo} // Use 'doo' instead of 'date'
                                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                                />
                                            </div>
 */}

                                <div className="col-md-6">
                                    <label>Date of Occupancy</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="email"
                                        placeholder="Date of Occupancy"
                                        onClick={handleIconClick}
                                        ref={dateInputRef}
                                        value={
                                            selectedDate // Use selectedDate if it's available
                                                ? formatDate(selectedDate)
                                                : selectedSerialData.info.doo // If selectedDate is not available, use selectedSerialData.info.doo
                                        }
                                    />
                                    <div className="date-picker-wrapper">
                                        {showDatePicker && (
                                            <DatePicker
                                                selected={selectedDate}
                                                onChange={(date) => {
                                                    setSelectedDate(date);
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




                            </div>
                        </div>

                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex justify-content-center w-100">
                        <Button onClick={handleSavebutton} style={{ marginRight: '20px' }}>Update</Button>
                        <Button className="btn btn-danger" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal.Footer>
            </Modal>


        </>
    );
}

export default Groupdetails;
