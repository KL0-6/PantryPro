import React from "react"

import Cart from "../../assets/cart.png"

const HomePage = () => 
{
  const hash = window.crypto.randomUUID();

  return (
    <>
      <main className="flex-grow p-4 flex items-center justify-between">
          <div>
              <h1  style={{ fontSize: "clamp(2rem, 3vw, 80px)" }} className="font-bold">
              Take control of your Pantry with  
              <span className="text-[#b6465f]"> PantryPro</span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-gray-700">
                  Organize your food inventory with ease and never run out of essentials again!
              </p>

              <button onClick={() => { location.href = "/tracker?hash=" + hash; }} className="rounded-full bg-[#b6465f] h-[50px] w-[150px] mt-5 text-white">
                  Get Started
              </button>
          </div>
          <img className="hidden md:block w-1/3 h-auto" src={Cart} alt="Cart" />
      </main>
      <footer className="text-center">
          <p>Made by KM</p>
          <p className="hidden md:block">Cart image by <a href="https://www.freepik.com/">FreePic</a></p>
      </footer>
    </>
  )
}

export default HomePage