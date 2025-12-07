import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import Main from "./MainPage.jsx";

function App() {
  return (
   
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/mainPage" element={<Main />} />
      </Routes>
    
  );
}

export default App;
