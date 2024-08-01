import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar"

import Home from "./pages/Home/Home";
import Tracker from "./pages/Tracker/Tracker";

function App() 
{
  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA]">
        <NavBar/>

        <BrowserRouter>
            <Routes>
                <Route path="/" element={ <Home/> }/> 
                <Route path="/tracker" element={ <Tracker/> }/> 
            </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App
