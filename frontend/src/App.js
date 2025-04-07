import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Components/Header.jsx";
import HomePage from "./Pages/Homepage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import AdminPage from "./Pages/AdminPage.jsx";
import NonmemberClub from "./Pages/NonmemberClub.jsx";
import Nonmemberinstrumentdetails from "./Pages/Nonmemberinstrumentdetails.jsx";
import RegisterPage from "./Pages/RegisterPage.jsx";
import MembershipManagerLogin from "./Pages/MembershipManagerLogin.jsx";
import InstrumentManagerLogin from "./Pages/InstrumentManagerLogin.jsx";
import AccessibilityIcon from "./Pages/AccessibilityIcon.jsx";
import MembershipHome from "./Pages/MembershipHome";
import Request from "./Pages/Request.jsx";
import Memberclub from "./Pages/Memberclub.jsx";
import MemberDetails from "./Pages/MemberDetails.jsx";
import Profile from "./Pages/Profile.jsx";
import AddProduct from "./Pages/AddProduct.jsx";
import Allinstruments from "./Pages/Allinstruments.jsx";
import InstrumentDetails from "./Pages/InstrumentDetails.jsx";
import InstrumentUpdate from "./Pages/InstrumentUpdate.jsx";
import InstrumentBooking from "./Pages/InstrumentBooking.jsx";
import NonMemberBooking from "./Pages/NonMemberBooking.jsx";
import InstrumentRequest from "./Pages/InstrumentRequest.jsx";
import Status from "./Pages/Status.jsx";
import Payment from "./Pages/Payment.jsx";
import PaymentRequest from "./Pages/PaymentRequest.jsx";
import ForgotPassword  from "./Pages/ForgotPassword.jsx";
import { Helmet } from "react-helmet";
import './App.css'; // or whatever your CSS file is named

const App = () => {
  return (
    <>
<Helmet>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RIC Portal</title>

        </Helmet>
      <Router>
      <Header />
          <AccessibilityIcon />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/RegisterPage" element={<RegisterPage />} />
            <Route path="/AdminPage" element={<AdminPage />} />
            <Route path="/NonmemberClub" element={<NonmemberClub />} />
            <Route path="/Nonmemberinstrumentdetails/:id" element={<Nonmemberinstrumentdetails />} />
            <Route path="/membership-manager" element={<MembershipManagerLogin />} />
            <Route path="/instrument-manager" element={<InstrumentManagerLogin />} />
            <Route path="/MembershipHome" element={<MembershipHome />} />
            <Route path="/Request" element={<Request />} />
            <Route path="/Memberclub" element={<Memberclub />} />
            <Route path="/memberdetails/:memberId" element={<MemberDetails />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/AddProduct" element={<AddProduct />} />
            <Route path="/Allinstruments" element={<Allinstruments />} />
            <Route path="/instrumentdetails/:id" element={<InstrumentDetails />} />
            <Route path="/InstrumentUpdate/:id" element={<InstrumentUpdate />} />
            <Route path="/InstrumentBooking/:id" element={<InstrumentBooking />} />
            <Route path="/NonMemberBooking/:id" element={<NonMemberBooking />} />
            <Route path="/InstrumentRequest" element={<InstrumentRequest />} />
            <Route path="/Status" element={<Status />} />
            <Route path="/Payment" element={<Payment />} />
            <Route path="/PaymentRequest" element={<PaymentRequest />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Memberclub />} />     
          </Routes>
      </Router>
      
      </>
  );
};

export default App;
