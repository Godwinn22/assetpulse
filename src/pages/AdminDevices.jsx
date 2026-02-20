import React from "react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

const AdminDevices = () => {
    // Form State
    const [name, setName] = useState("");
    const [serial, setSerial] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [value, setValue] = useState("");

    // Device List State
    const [devices, setDevices] = useState([]);

    // Function to fetch devices from the database
    const fetchDevices = useCallback(async () => {
        const { data, error } = await supabase
            .from("devices")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error) {
            setDevices(data);
        }
    }, []);

    // Load devices on page load
    useEffect(() => {
        const fetch = async () => {
            await fetchDevices();
        };

		fetch()
    }, [fetchDevices]);

    // Handler for submitting the form to add a new device
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default form submission behavior
        const { error } = await supabase.from("devices").insert([
            // This code is inserting a new record into the
            // "devices" table in the Supabase database.
            {
                name,
                serial_number: serial,
                category,
                condition,
                estimated_value: Number(value), // Ensure value is stored as a number
            },
        ]);
        if (error) {
            alert(`Error adding device: ${error.message}`);
        } else {
            alert("Device added successfully!");
            // Reset form
            setName("");
            setSerial("");
            setCategory("");
            setCondition("");
            setValue("");

            // Refresh the device list after adding a new device
            fetchDevices();
        }
    };

    return (
        <div>
            <h2>Device Management</h2>
            <form action="" onSubmit={handleSubmit}>
                {/* This form would submit to
				the backend to create a new device.*/}
                <input
                    type="text"
                    placeholder="Device name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Serial number"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                />
                <button type="submit">Add Device</button>
            </form>

			<h3>All Devices</h3>
			<ul>
				{devices.map((device) => (
					<li key={device.id}>
						{device.name} - {device.serial_number} - {device.category} - {device.condition} - ${device.estimated_value}
					</li>
				))}
			</ul>
        </div>
    );
};

export default AdminDevices;
