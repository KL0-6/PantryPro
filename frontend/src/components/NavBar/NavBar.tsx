import React from "react"
import RoundedButton from "../RoundIconButton"

const NavBar = () => 
{
    const hash = window.crypto.randomUUID();

    return (
        <div className="shadow flex items-center p-[10px] w-full h-[100px] md:h-[75px]">

            <h1 className="text-[30px] font-rubik text-[#B6465F]">PantryPro</h1>
            
            <ul className="w-full flex flex-col md:flex-row list-none text-center md:flex-1">
                <li className="h-full inline text-[20px] p-[10px] hover:text-[#e44a6b]"><a href="/">Home</a></li>
                <li className="h-full inline text-[20px] p-[10px] hover:text-[#e44a6b]"><a onClick={() => { if(window.location.pathname.includes("/tracker")) location.reload(); else location.href = "/tracker?hash=" + hash } }>Tracker</a></li>
            </ul>
            
        </div>
    )
}

export default NavBar