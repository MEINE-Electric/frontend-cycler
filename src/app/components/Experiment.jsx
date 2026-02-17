'use client'

import { createPortal } from 'react-dom'
import { useChannelStore  } from '../store/store';
import { useState, useRef, useEffect } from "react";

const Dropdown = ({ options, value, onSelect }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const display = value === "None" ? "Select" : value;

  return (
    <div ref={ref} className="relative w-32">
      <div
        onClick={() => setOpen((o) => !o)}
        className="bg-accent/15 hover:bg-accent/25 px-4 py-1 flex items-center rounded-full cursor-pointer text-xs font-semibold"
      >
        <div className="flex justify-between w-full">
          <span className={display === "Select" ? "text-muted" : ""}>
            {display}
          </span>
          <span>▾</span>
        </div>
      </div>

      {open && (
        <div className="absolute mt-2 w-full bg-accent-info rounded-lg shadow-lg p-2 z-50">
          {options.map((el, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(el);
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-xs font-semibold hover:bg-white/10 rounded"
            >
              <span className={value === el ? "text-white" : "text-muted"}>
                {el}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Row = ({ count, data, highlight, onChange }) => {
  return (
    <div className={`grid grid-cols-7 gap-2 py-1 items-center text-center mx-2 ${highlight ? 'bg-accent-info/40 py-2 rounded-lg' : ''}`}>
        <div className='text-xs font-semibold'>{count-1}</div>

        <div className='flex items-center justify-center'>
            <Dropdown
                options={["None", "Charge", "Discharge", "Rest", "Hold", "GOTO"]}
                value={data.action}
                onSelect={(v) => onChange('action', v)}
            />
        </div>

        <div>
            <input
                value={data.voltage}
                onChange={(e) => onChange('voltage', e.target.value)}
                className="border-b text-center border-accent/25 w-16 outline-none"
            />
        </div>

        <div>
            <input
                value={data.current}
                onChange={(e) => onChange('current', e.target.value)}
                className="border-b text-center border-accent/25 w-16 outline-none"
            />
        </div>

        <div>
            <input
                value={data.time}
                onChange={(e) => onChange('time', e.target.value)}
                className="border-b text-center border-accent/25 w-16 outline-none"
            />
        </div>

        <div>
            <input
                value={data.repeat}
                onChange={(e) => onChange('repeat', e.target.value)}
                className="border-b text-center border-accent/25 w-16 outline-none"
            />
        </div>

        <div>
            <input
                value={data.target}
                onChange={(e) => onChange('target', e.target.value)}
                className="border-b text-center border-accent/25 w-16 outline-none"
            />
        </div>

    </div>
  )
}

const Experiment = ({ onClose, label }) => {
  const [root, setRoot] = useState(null)
  const channel = useChannelStore((s) => s.channels[label])
  const status = channel["status"]
  const row_number = parseInt(status["step"])/2

  // 8 controlled rows
  const [rows, setRows] = useState([
    {
      action: "Rest",
      voltage: "1.0",
      current: "0.0",
      time: "20",
      repeat: "",
      target: ""
    },
    {
      action: "GOTO",
      voltage: "",
      current: "",
      time: "",
      repeat: "0",
      target: "0"
    }
  ])

  const create_JSON = (rows, label) => {
    const command = []
    
    rows.forEach(r => {

      if (r.action === "Charge") {
        command.push({
          command: "CONFIG",
          config_updates: {
            psu_voltage_set: parseFloat(r.voltage, 10),
            psu_current_set: parseFloat(r.current, 10),
            psu_ovp_limit: 20.0,
            psu_ocp_limit: 20.0,
            load_current_set: 0.0,
            load_voltage_set: 0.0,
            load_channel: String(label)[1],
            load_mode: "CURR"
          },
        })

        command.push({
          command: "CHARGE",
          charge_time_limit: parseInt(r.time, 10),
          charge_threshold: parseFloat(r.voltage,10)
        })

      } else if (r.action === "Discharge") {

        command.push({
          command: "CONFIG",
          config_updates: {
            psu_voltage_set: 0.0,
            psu_current_set: 0.0,
            psu_ovp_limit: 20.0,
            psu_ocp_limit: 20.0,
            load_current_set: parseFloat(r.current, 10),
            load_voltage_set: parseFloat(r.voltage, 10),
            load_channel: String(label)[1],
            load_mode: "CURR"
          },
        })

        command.push({
          command: "DISCHARGE",
          discharge_time_limit: parseInt(r.time, 10),
          discharge_threshold: parseFloat(r.voltage,10)
        })

      } else if (r.action === "Hold") {

        command.push({
          command: "CONFIG",
          config_updates: {
            psu_voltage_set: 0.0,
            psu_current_set: 0.0,
            psu_ovp_limit: 20.0,
            psu_ocp_limit: 20.0,
            load_current_set: 0.0,
            load_voltage_set: 0.0,
            load_channel: String(label)[1],
            load_mode: "CURR"
          },
        })

        command.push({
          command: "HOLD",
          hold_time_limit: parseInt(r.time, 10),
          hold_threshold: parseFloat(r.voltage,10)
        })

      } else if (r.action === "Rest") {

        command.push({
          command: "CONFIG",
          config_updates: {
            psu_voltage_set: 0.0,
            psu_current_set: 0.0,
            psu_ovp_limit: 20.0,
            psu_ocp_limit: 20.0,
            load_current_set: 0.0,
            load_voltage_set: 0.0,
            load_channel: String(label)[1],
            load_mode: "CURR"
          },
        })

        command.push({
          command: "REST",
          rest_time_limit: parseInt(r.time, 10)
        })

      } else if (r.action === "GOTO") {

        command.push({
          command: "GOTO",
          target: parseInt(r.target),
          repeat: parseInt(r.repeat)
        })
      }
    })
    return command
  }

  useEffect(() => {
    setRoot(document.getElementById('portal-root'))

    // Close when outside the modal
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    // Fetch saved rows
    const fetchRows = async () => {
      try {
        const res = await fetch(`http://192.168.0.50:8000/rows/${label}`)
        if (!res.ok) return
        
        const savedRows = await res.json()
        if (Array.isArray(savedRows)) {
          setRows(savedRows)
        }
      } catch (err) {
        console.log("Failed to laod rows:", err)
      }
    }

    fetchRows()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [label])

  if (!root) return null

  return createPortal(
    <div
      className="fixed inset-0 z-1000 bg-black/40 flex items-center justify-center text-white"
      onClick={onClose}
    >
      <div className="w-5xl bg-surface rounded-xl p-8 relative" onClick={(e) => e.stopPropagation()}>

        <div className="cursor-pointer absolute top-5 right-5 text-xs active:scale-95 ease-in-out hover:font-semibold" onClick={() => onClose()}>Close</div>
        <h2 className="mb-8 font-semibold">Experiment Builder</h2>
        
        {/* Header */}
        <div className='mx-2 grid grid-cols-7 text-xs text-accent/55 font-semibold mb-6 text-center'>
          <div>Sr. No.</div>
          <div>Action</div>
          <div>Voltage (V)</div>
          <div>Current (A)</div>
          <div>Time Limit (Secs)</div>
          <div>Repeat</div>
          <div>Target</div>
        </div>

        {/* Rows */}
        <div className='space-y-4 overflow-y-scroll h-96 webkit-scrollbar-thumb'>
          {rows.map((row, i) => (
                <Row
                  key={i}
                  count={i + 1}
                  highlight={row_number === i+1}
                  data={row}
                  onChange={(field, value) => {
                          setRows(r => {
                          const copy = [...r]
                          copy[i][field] = value
                          return copy
                      })
                  }}
                />
          ))}

          {console.log(row_number)}
        </div>

        {/* Submit */}
        <div className='flex justify-end mt-10'>
          <button
            onClick={
              async () => {
                if(status.state != "running"){
                  const commands = create_JSON(rows, label)
                  const bdy = {
                    "rows": rows,
                    "commands": commands
                  }

                  await fetch(`http://192.168.0.50:8000/set/${label}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bdy)
                  })

                  onClose()
                }
              }
            }
            className={` px-6 py-2 text-surface rounded-lg text-xs font-semibold ${status.state != "running" ? "transition-all duration-200 ease-in-out bg-foreground active:scale-97 active:bg-accent cursor-pointer" : "bg-accent cursor-not-allowed"}`}
          >
            Submit
          </button>
        </div>
      </div>
      
    </div>,
    root
  )
}

export default Experiment