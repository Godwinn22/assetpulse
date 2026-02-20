import React from "react";
import { useState } from "react";

const AdminDevices = () => {
    const [name, setName] = useState("");
    const [serial, setSerial] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [value, setValue] = useState("");
    return (
        <div>
            <h2>Device Management</h2>
            <form action="">
				{/* In a real application, this form would submit to
				the backend to create a new device.
				For this demo, we're just managing local state. */}
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
        </div>
    );
};

export default AdminDevices;
