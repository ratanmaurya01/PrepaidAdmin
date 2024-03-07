import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './adminLogin/login'
import Home from './adminLogin/home'
import Signup from './adminLogin/signup'
import Welcome from './adminLogin/welcome'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Createaccount from './adminLogin/createaccount'
import Signin from './adminLogin/signin'
import Getotp from './adminLogin/getotp'
import Send from './adminLogin/sendmail'
import Adminpage from './adminLogin/adminpage'
import Config from './reconfig/config'
import Show from './adminLogin/show'
import Phonesendotp from './adminLogin/phonesendotp'
import Sendotp from './adminLogin/sendotp'
import Createacc from './adminLogin/createacc'
import Forgetpaasword from './adminLogin/forgetpassword'
import Check from './adminLogin/check'
import Verifyphone from './adminLogin/verifyphone'
import Adin from './admin'
import Consumer from './consumer'
import Test from './test'
import AddConsumer from './addconsumer'
import Profile from './adminLogin/profile'
import NewApp from './NewApp'
import Verifyphoneotp from './adminLogin/verifyphoneotp'
import Meterdetail from './meterdetailonserver/meterdetail'
import Forgetpassverify from './adminLogin/fogetpassverify'
import Showpass from './adminLogin/showpassword'
import Admindetail from './admin/admindetail'
import Sendphoneotp from './admin/sendphoneotp'
import Verifynumber from './admin/verifunumber'
import Emailsendotp from './admin/emailsendotp'
import Phoneemailotp from './admin/phoneemailotp'
import Emailverify from './admin/emailverify'
import Sendemailotp from './admin/email'
import Phoneemailverify from './admin/phoneemailverify'
import Consumerdetails from './consumerdetials/consumerdetail'
import NameUpdater from './admin/new'
import Meterdata from './meterdetailonserver/meterdata'
import Groupdetails from './meterdetailonserver/groupdetails';
import Metername from './meterdetailonserver/metername';
import Singlemeter from './generaterecharge/singlemeter';
import Phonesms from './generaterecharge/phonesms';
import Generaterecharge from './generaterecharge/generateallrecharge';
import Name from './check';

import Ungroup from './meterserver/ungroup';
import Groupmeter from './meterserver/groupmeter';
import Singlegroupmeter from './meterserver/singlegroupmeter';
import Servermeter from './meterserver/servermeter';
import Message from './message';
import Homepage from './reconfigtoken/reconfigtoken'
import Phonepasswordchange from './reconfigtoken/phonepasswordchange';
import YourComponent from './maintest'
import Phoneotp from './reconfigtoken/phoneotp';
import Phoneemail from './reconfigtoken/phoneemail';
import Phoneandenailverify from './reconfigtoken/emailandphoneverify';
import Wel from './reconfigtoken/wel';
import Serialwithmeter from './reconfigtoken/serialwithnumber';
import Updatetennet from './reconfigtoken/updatetennet';
import Function1 from './testapp/function1';
import Passwordchange from './reconfigtoken/passwordchange';
import Passwordotp from './reconfigtoken/passwordotp';
import Phoneemailotpverify from './reconfigtoken/phoneemailotpverify';
import Transfer from './transfertoken/transefer';
import Isreconfig from './isReconfig';
import Transferphoneemail from './transfertoken/transferphoneemail'
import Createtime from './admin/createtime'
import Pendingtoken from './generaterecharge/pendingtoken'
import Ratan from './testapp/ratan'
import Mainhomepage from './home/mainhomepage'
import Homepagelogin from './home/homepagelogin'


function App() {
  return (
    <>
 
          {/* <Function1/> */}
      <Router>
        <div>
          <section>
            <Routes>
              <Route path="/ratan" element={<Ratan />} />
              <Route path="/home" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path='/welcome' element={<Welcome />} />
              <Route path='/createaccount' element={<Createaccount />} />
              <Route path='/signin' element={<Signin />} />
              <Route path='/getotp' element={<Getotp />} />
              <Route path='/adminpage' element={<Adminpage />} />
              <Route path='/sendmail' element={<Send />} />
              <Route path='/phonesendotp' element={<Phonesendotp />} />
              <Route path='/forgetpassword' element={<Forgetpaasword />} />
              <Route path='/verifyphone' element={<Verifyphone />} />
              <Route path='/verifyphoneotp' element={<Verifyphoneotp />} />
              <Route path='/admin' element={<Adin />} />
              <Route path='/consumer' element={<Consumer />} />
              <Route path='/test' element={<Test />} />
              <Route path='/addconsumer' element={<AddConsumer />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/NewApp' element={<NewApp />} />
              <Route path='/meterdetail' element={<Meterdetail />} />
              <Route path='/fogetpassverify' element={<Forgetpassverify />} />
              <Route path='/showpassword' element={<Showpass />} />
              <Route path='/admindetail' element={<Admindetail />} />
              <Route path='/sendphoneotp' element={<Sendphoneotp />} />
              <Route path='/verifunumber' element={<Verifynumber />} />
              <Route path='/emailsendotp' element={<Emailsendotp />} />
              <Route path='/phoneemailotp' element={<Phoneemailotp />} />
              <Route path='/emailverify' element={< Emailverify />} />
              <Route path='/email' element={< Sendemailotp />} />
              <Route path='/phoneemailverify' element={< Phoneemailverify />} />
              <Route path='/new' element={< NameUpdater />} />
              <Route path='/consumerdetail' element={< Consumerdetails />} />
              <Route path='/meterdata' element={< Meterdata />} />
              <Route path='/groupdetails' element={<Groupdetails />} />
              <Route path='/metername' element={<Metername />} />
              <Route path='/singlemeter' element={<Singlemeter />} />
              <Route path='/generateallrecharge' element={<Generaterecharge />} />
              <Route path='/check' element={<Name />} />
              <Route path='/ungroup' element={<Ungroup />} />
              <Route path='/groupmeter' element={<Groupmeter />} />
              <Route path='/singlegroupmeter' element={<Singlegroupmeter />} />
              <Route path='/servermeter' element={<Servermeter />} />
              <Route path='/message' element={<Message />} />
              <Route path='/reconfigtoken' element={<Homepage />} />
              <Route path='/phonepasswordchange' element={<Phonepasswordchange />} />
              <Route path='/maintest' element={<YourComponent />} />
              <Route path='/phoneotp' element={<Phoneotp />} />
              <Route path='/phoneemail' element={<Phoneemail />} />
              <Route path='/emailandphoneverify' element={<Phoneandenailverify />} />
              <Route path='/wel' element={<Wel />} />
              {/* <Route path='/serialwithnumber' element={<Serialwithmeter/>} /> */}
              {/* <Route path='/updatetennet' element={<Updatetennet/>} /> */}
              <Route path='/passwordchange' element={<Passwordchange />} />
              <Route path='/passwordotp' element={<Passwordotp />} />
              <Route path='/phoneemailotpverify' element={<Phoneemailotpverify />} />
              <Route path='/transefer' element={<Transfer />} />
              <Route path='/isReconfig' element={<Isreconfig />} />
              <Route path='/transferphoneemail' element={<Transferphoneemail />} />
              <Route path="/createtime" element={<Createtime />} />
              <Route path="/pendingtoken" element={<Pendingtoken />} />
              <Route path="/" element={<Mainhomepage />} />
              <Route path="/homepagelogin" element={<Homepagelogin />} />

            </Routes>
          </section>
        </div>
      </Router>
    </>
  )
}

export default App
