import React from 'react'
import './login.css';
import admin from '../Images/logo/admin.png'

function Avatar() {

    let imagesoutce =  "https://www.w3schools.com/howto/img_avatar2.pngl";
    return (
        <>
            <div className="imgcontainer">
                <img src={admin} alt="Avatar" className="avatar" />
            </div>
        </>
    )
}

export default Avatar