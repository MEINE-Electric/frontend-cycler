"use client"
import { useEffect, useRef } from "react";
import { useChannelStore } from "./store";

const cyclerWS = () => {
    const wsRef = useRef(null);

    useEffect(() => {
        const { setChannelValue } = useChannelStore.getState();

        function connect() {
            if (wsRef.current) return;

            const ws = new WebSocket("ws://192.168.0.50:8000/ws");
            wsRef.current = ws; 

            ws.onmessage = (e) => {
                const msg = JSON.parse(e.data);

                Object.keys(msg.data).forEach((key) => {
                    setChannelValue(key, {
                        state: msg.data[key]["state"],
                        data: msg.data[key],
                        status: msg.status[key]
                    });
                })  
            };

            ws.onclose = () => {
                wsRef.current = null;  
                setTimeout(connect, 1000);
            };
        }

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);
};

export default cyclerWS;