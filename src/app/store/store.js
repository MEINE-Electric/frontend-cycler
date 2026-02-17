// store/useStore.js
"use client"
import { create } from 'zustand';

const null_data = {
  charge_threshold: 0,
  charge_cycles_done: 0,
  charge_time_limit: 0,

  discharge_threshold: 0,
  discharge_cycles_done: 0,
  discharge_time_limit: 0,

  hold_threshold: 0,
  hold_time_limit: 0,

  load_channel: "1",
  load_mode: "CURR",
  load_current_set: 1.2,
  load_current_actual: 0,
  load_voltage_set: 0.2,
  load_voltage_actual: 0,

  psu_voltage_set: 12,
  psu_voltage_actual: 0,
  psu_current_set: 2,
  psu_current_actual: 0,
  psu_ovp_limit: 20,
  psu_ocp_limit: 20,

  start_time: null,
  current_time: null,
  state: "DISCONNECTED",

  vmax: 0,
  vmin: 0,
}

export const useChannelStore = create((set) => ({
  channels: {
    11: { state: "DISCONNECTED", data: null_data, status: null },
    12: { state: "DISCONNECTED", data: null_data, status: null },
    21: { state: "DISCONNECTED", data: null_data, status: null },
    22: { state: "DISCONNECTED", data: null_data, status: null },
    31: { state: "DISCONNECTED", data: null_data, status: null },
    32: { state: "DISCONNECTED", data: null_data, status: null },
    41: { state: "DISCONNECTED", data: null_data, status: null },
    42: { state: "DISCONNECTED", data: null_data, status: null },
    51: { state: "DISCONNECTED", data: null_data, status: null },
    52: { state: "DISCONNECTED", data: null_data, status: null },
  },

  setChannelValue: (id, value) =>
    set((s) => ({
      channels: {
        ...s.channels,
        [id]: {
          state: value.state,
          data: value.data,
          status: value.status
        }
      }
    })),

}));