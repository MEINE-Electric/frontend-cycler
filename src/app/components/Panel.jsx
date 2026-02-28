import React, { useEffect } from 'react';
import { useState } from 'react';
import { useChannelStore  } from '../store/store';
import Experiment from './Experiment';

const State = ({ state, label }) => {
  const map = {
    charging: "bg-green-400",
    idle: "bg-stone-400",
    discharging: "bg-red-400",
    hold: "bg-yellow-400",
    rest: "bg-blue-400",
    paused: "bg-orange-400", 
  };

  const color = map[state?.toLowerCase()] || "bg-stone-400";

  return (
    <div className="flex flex-row justify-between items-start transition-all duration-100 ease-in-out">
        <div className={`font-semibold ${color} w-fit text-surface text-xs px-2 py-1 rounded-lg self-start`}>
            {state}
        </div>

        <div className="w-fit text-xs px-2 py-1 rounded-full aspect-square border font-semibold flex items-center justify-center self-start">
            {label}
        </div>
    </div>
  );
};

const ProgressBar = ({ progress, state }) => {

    const map = {
        charging: "bg-green-400",
        idle: "bg-stone-400",
        discharging: "bg-red-400",
        hold: "bg-yellow-400",
        rest: "bg-blue-400",
        paused: "bg-orange-400",
    };

    const color = map[state?.toLowerCase()] || "bg-stone-400";

  return (
    <div className="relative w-full h-[1.8vh] bg-muted/20 rounded overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-100 ease-in-out`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const UnplugIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={48}
    height={48}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#555555"
    strokeWidth={1.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m19 5 3-3" />
    <path d="m2 22 3-3" />
    <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" />
    <path d="M7.5 13.5 10 11" />
    <path d="M10.5 16.5 13 14" />
    <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z" />
  </svg>
);

const Panel = ({ label }) => {
  const channel = useChannelStore((s) => s.channels[label])
  const state = channel["state"]
  const data = channel["data"]
  const status = channel["status"]

  const [prev_state, setPrevState] = useState(null);
  
  const curr_voltage =
    (state === "CHARGING" || (state === "PAUSED" && prev_state === "CHARGING"))
      ? data["psu_voltage_actual"]
      : ((state === "DISCHARGING" || (state === "PAUSED" && prev_state === "DISCHARGING")) || (state === "HOLD" || (state === "PAUSED" && prev_state === "HOLD")))
        ? data["load_voltage_actual"] 
        : state === "IDLE" || state === "DISCONNECTED" 
            ? 0
              : "...";    
  
  const thresh_voltage = 
    (state === "CHARGING" || (state === "PAUSED" && prev_state === "CHARGING")) ? data["vmax"]
      : (state === "DISCHARGING" || (state === "PAUSED" && prev_state === "DISCHARGING")) ? data["vmin"]
        : (state === "HOLD" || (state === "PAUSED" && prev_state === "HOLD")) ? data["hold_threshold"]
          : (state === "IDLE" || state === "DISCONNECTED") ? 0
              : "...";

  const voltage_progress =
    (state === "IDLE" || state === "DISCONNECTED" || state === "REST") ? 0
      : (state === "CHARGING" || (state === "PAUSED" && prev_state === "CHARGING")) ? Math.min(100, Math.round((curr_voltage / thresh_voltage) * 100))
        : (state === "DISCHARGING"  || (state === "PAUSED" && prev_state === "DISCHARGING")) ? Math.min(100, Math.round(((thresh_voltage) / curr_voltage) * 100))
          : 0 

  const elapsed_time = data["current_time"]
  const time_limit =  (state === "CHARGING"  || (state === "PAUSED" && prev_state === "CHARGING")) 
                        ? data["charge_time_limit"]
                        : (state === "DISCHARGING" || (state === "PAUSED" && prev_state === "DISCHARGING")) 
                          ? data["discharge_time_limit"]
                          : (state === "HOLD" || (state === "PAUSED" && prev_state === "HOLD")) 
                            ? data["hold_time_limit"]
                            : (state === "REST"  || (state === "PAUSED" && prev_state === "REST"))
                            ? data["rest_time_limit"]
                              : 0
  
  const time_progress = (state === "IDLE" || state === "DISCONNECTED" || time_limit <= 0) ? 0
                            : Math.min(100, Math.round((elapsed_time / time_limit) * 100));

  const elapsed_in_format = Number.isFinite(Number(elapsed_time)) ? new Date(elapsed_time * 1000).toISOString().slice(11, 19)
                              : "00.00.00"

  const limit_in_format = Number.isFinite(Number(time_limit)) ? new Date(time_limit * 1000).toISOString().slice(11, 19)
                              : "00.00.00"
                           
  const [open, setOpen] = useState(false);                          
  const [action, setAction] = useState(false);

  useEffect(() => {
    if (!action) return;

    if (
      (action === "Starting" && state !== "IDLE") ||
      (action === "Pausing" && state === "PAUSED") ||
      (action === "Resuming" && state !== "PAUSED") ||
      (action === "Stopping" && state === "IDLE") ||
      (action === "Skipping")
    ) {
      setAction(false);
    }
  }, [state]);
  

  if (state === "DISCONNECTED" || state === undefined) {
    return (
      <div className="bg-surface rounded-xl flex items-center justify-center aspect-square transition-all duration-100 ease-in-out">
        <span className="text-muted font-bold">
            <UnplugIcon className="w-6 h-6" />
        </span>
      </div>
        )
  };

  return (
    <div className="group relative bg-surface hover:bg-background border-transparent border hover:border-foreground transition-color duration-100 ease-in-out rounded-xl gap-2 aspect-square p-3 flex flex-col justify-between">
      <div className='pb-2'>
          <State state={ (state === "DISCONNECTED" || state === undefined) ? "Disconnected" : state} label={label} />
      </div>
      
      <div className="text-left flex flex-col gap-2 py-2 px-1">
          <div className='flex flex-col items-center justify-center'>
              <ProgressBar progress={voltage_progress} state={state}/>
          </div>
          <div className="flex flex-row justify-between px-px mb-2">
              <span className="text-muted font-medium text-[0.8vw] whitespace-nowrap">Threshold</span>
              <span className="text-[0.8vw] font-medium"><span className='text-muted'>{curr_voltage} V |</span> {thresh_voltage} V</span>
          </div>
          <div className="flex flex-col items-center justify-center">
              <ProgressBar progress={time_progress} state={state} />
          </div>
          <div className="flex flex-row justify-between px-px">
              <span className="text-muted font-medium text-[0.8vw] whitespace-nowrap">Time Limit</span>
              <span className="text-[0.8vw] font-medium"><span className='text-muted'>{elapsed_in_format} |</span> {limit_in_format}</span>
          </div>
      </div>

      <div className='grid grid-cols-3 text-left w-full gap-x-8 gap-y-4 border-t-[0.5px] border-stone-400/30 pt-[1vw] px-1 place-items-center'>
          <div className="flex flex-col">
              <span className="text-[1.22vw] font-semibold whitespace-nowrap">{data["load_voltage_actual"]} V</span>
              <span className="text-muted font-medium text-[0.75vw] whitespace-nowrap transition-all duration-100 ease-in-out">Load Voltage</span>
          </div>

          <div className="flex flex-col">
              <span className="text-[1.22vw] font-semibold whitespace-nowrap">{data["load_current_actual"]} A</span>
              <span className="text-muted font-medium text-[0.75vw] whitespace-nowrap transition-all duration-100 ease-in-out">Load Current</span>
          </div>

          <div className="flex flex-col">
              <span className="text-[1.22vw] font-semibold whitespace-nowrap">{(data["load_voltage_actual"] * data["load_current_actual"]).toFixed(3)} W</span>
              <span className="text-muted font-medium text-[0.75vw] whitespace-nowrap transition-all duration-100 ease-in-out">Load Power</span>
          </div>

          <div className="flex flex-col">
              <span className="text-[1.22vw] font-semibold whitespace-nowrap">{data["psu_voltage_actual"]} V</span>
              <span className="text-muted font-medium text-[0.75vw] whitespace-nowrap transition-all duration-100 ease-in-out">PSU Voltage</span>
          </div>

          <div className="flex flex-col">
              <span className="text-[1.22vw] font-semibold whitespace-nowrap">{data["psu_current_actual"]} A</span>
              <span className="text-muted font-medium text-[0.75vw] whitespace-nowrap transition-all duration-100 ease-in-out">PSU Current</span>
          </div>

          <div className="flex flex-col">
              <span className="text-[1.22vw] font-semibold whitespace-nowrap">{(data["psu_current_actual"] * data["psu_voltage_actual"]).toFixed(3)} W</span>
              <span className="text-muted font-medium text-[0.75vw] whitespace-nowrap transition-all duration-100 ease-in-out">PSU Power</span>
          </div>
      </div>

      {/* Control Panel */}
      <div className='bg-surface/30 backdrop-blur-2xl absolute top-3 right-1/2 translate-x-1/2 z-100 rounded-lg flex flex-row opacity-0 border-foreground/400 border overflow-hidden group-hover:opacity-100 transition-all duration-100 ease-out'>
        
        {/* Start */}
        <div className={`py-2 pl-2 pr-2 rounded-l ${status.state != "running" ? "hover:bg-[#32a852]/30 active:scale-95" : "cursor-not-allowed"}`} 
        onClick={
          async () => {
            if(status.state != "running"){
              setAction("Starting");

              await fetch(`http://192.168.0.50:8000/start/${label}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
            }
          }
        }>

          <svg
            xmlns="http://www.w3.org/2000/svg"            
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={` ${status.state != "running" ? "#ffffff" : "#32a852" } `}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-play "
          >
            <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
          </svg>
        </div>

        {/* Pause */}
        {state != "PAUSED" && 
          (
            <div className='disabled py-2 px-2 hover:bg-[#ebc313]/30' 
              onClick={
                async () => {
                  if(status.state === "running"){

                    setAction("Pausing");

                    await fetch(`http://192.168.0.50:8000/control/PAUSE/${label}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    });

                  setPrevState(state);
                  }
                }
              }
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pause active:scale-95" 
              >
                <rect x="14" y="3" width="5" height="18" rx="1" />
                <rect x="5" y="3" width="5" height="18" rx="1" />
              </svg>
            </div>
          )
        }

        {/* Resume */}
        {state === "PAUSED" && 
          (
            <div className='disabled py-2 px-2 hover:bg-[#FFA726]/30' 
              onClick={
                async () => {
                  if(status.state === "running"){

                    setAction("Resuming");

                    await fetch(`http://192.168.0.50:8000/control/RESUME/${label}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    });

                    setPrevState(null);
                  }
                }
              }
              >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFA726"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-diamond-icon lucide-diamond"
              >
                <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
              </svg>
            </div>
          )
        }        

        {/* Stop */}
        <div className='disabled py-2 pl-2 pr-2 hover:bg-[#eb3a13]/30 rounded-r '
          onClick={
            async () => {
              if(status.state === "running"){
                setAction("Stopping");

                await fetch(`http://192.168.0.50:8000/control/STOP/${label}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                });
              }
            }
          }>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-square active:scale-95"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
          </svg>
        </div>

        {/* Skip */}
        <div className='disabled py-2 pl-2 pr-2 hover:bg-[#51a2ff]/30 rounded-r '
          onClick={
            async () => {
              if(status.state === "running"){
                setAction("Skipping");

                await fetch(`http://192.168.0.50:8000/control/SKIP/${label}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                });
              }
            }
          }>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-fast-forward"
          >
            <path d="M12 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 12 18z" />
            <path d="M2 6a2 2 0 0 1 3.414-1.414l6 6a2 2 0 0 1 0 2.828l-6 6A2 2 0 0 1 2 18z" />
          </svg>
        </div>
        
      </div>

      {/* Experiments Expand */}
      <div onClick={() => setOpen(true)} className={`absolute bottom-1/2 right-0 translate-y-1/2 z-100 rounded-l-lg flex flex-row gap-3 origin-right scale-x-0 group-hover:scale-x-100 transition-all duration-100 ease-in-out bg-foreground py-2 px-1 active:scale-x-85 active:bg-foreground/60 `}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0F0F0F"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-chevron-up-icon lucide-chevron-up rotate-90"
        >
          <path d="M18 15 L12 9 L6 15" />
        </svg>
      </div>

      {open && <Experiment onClose={() => setOpen(false)} label={label}/>}

      {action && (
        <div className="absolute inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-xl transition-all ease-in-out duration-100">
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-8 w-8">
              <div className="absolute inset-0 border-4 border-foreground border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-sm font-medium text-foreground/80">
              {
                action === "Starting" ? "Preparing Experiment..."
                  : action === "Stopping" ? "Stopping Experiment..."
                    : action === "Pausing" ? "Pausing Experiment..."
                      : action === "Resuming" ? "Resuming Experiment..."
                        : action === "Skipping" ? "Skipping Step..."
                          : ""
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Panel;