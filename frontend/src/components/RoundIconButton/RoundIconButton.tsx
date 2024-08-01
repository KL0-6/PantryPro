import React from "react"

import "./RoundIconButton.css"

interface Props
{
    children?: any
}

const RoundedButton = ( { children } : Props) => 
{
    return (
        <button className="m-5 w-[50px] h-[50px] border-[#B6465F] border-2 rounded-full hover:bg-[#e44a6b]">
            {children}
        </button>
    )
}

export default RoundedButton