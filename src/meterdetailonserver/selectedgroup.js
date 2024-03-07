import React, { useState, useEffect, useRef } from 'react';
import { database } from '../firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the default CSS
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import '../consucss.css';


class SelectedGroupName {

    constructor() {

        this.selectedGroup = ''; // Initialize with an empty string


    }
    isGroupName(selectedGroup) {
    
        this.selectedGroup = selectedGroup;
        // console.log("Selected Group name :", this.selectedGroup);
        return this.selectedGroup; // Return the value

    }

}




export default SelectedGroupName;