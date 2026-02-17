"use client"

import React from 'react'
import { useState, useEffect } from 'react'

const Peripherals = () => {

    const [data, setData] = useState([])

    useEffect(() => {
        const fetchPeripherals = async () => {
            try {
                const res = await fetch("http://192.168.0.50:8000/heartbeat");

                if (!res.ok) {
                    console.log("Request failed:", res.status);
                return;
                }

                const data = await res.json();  
                setData(data);             
                console.log(data) 
            } catch (err) {
                console.log("Failed to load heartbeats:", err);
            }
        }

        fetchPeripherals();
    }, [])

    return (
        <section className='py-8'>
            <div className='border-b border-muted flex flex-row justify-between items-center '>
                <div className="py-2 text-xs font-semibold">Components</div>
                <div className='hover:bg-accent-info active:scale-95 transition-all duration-100 ease-in-out p-1 rounded-sm '
                        onClick={async () => {
                            try {
                                const res = await fetch("http://192.168.0.50:8000/heartbeat");

                                if (!res.ok) {
                                    console.log("Request failed:", res.status);
                                    return;
                                }

                                const data = await res.json();   
                                setData(data);              
                            } catch (err) {
                                console.log("Failed to load heartbeats:", err);
                            }
                        }}
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`lucide lucide-rotate-ccw active:-rotate-180 transition-all duration-100 ease-in-out`}
                    >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                </div>
            </div>
            <div>
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="mb-4 text-sm py-2 rounded">
                    <div className="font-semibold">Channel {key}</div>

                    <div>Load: {value.load}</div>
                    <div>Supply 1: {value.supply_1}</div>
                    <div>Supply 2: {value.supply_2}</div>
                    <div>Module 1: {value.module_1}</div>
                    <div>Module 2: {value.module_2}</div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Peripherals