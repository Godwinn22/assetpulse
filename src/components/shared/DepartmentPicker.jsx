import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { ChevronDown, Plus, Check, Loader2 } from "lucide-react";

export default function DepartmentPicker({ value, onChange }) {
    // Full list of departments for dropdown
    const [departments, setDepartments] = useState([]);
    // what the admin is typing in the search box
    const [search, setSearch] = useState("");
    // is the dropdown open?
    const [isOpen, setIsOpen] = useState(false);
    // is the component still loading departments from the server?
    const [loading, setLoading] = useState(true);
    // are we saving a new department to the server?
    const [creating, setCreating] = useState(false);

    // Fetch departments from Supabase on mount
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const { data, error } = await supabase
                    .from("departments")
                    .select("id, name")
                    .order("name");

                if (error) throw error;
                setDepartments(data || []);
            } catch (err) {
                console.error("Error fetching departments:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    // useRef lets us detect clicks outside the dropdown
    // so we can close it when admin clicks elsewhere
    const dropdownRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            // containerRef.current is our outer div
            // .contains(e.target) checks if the clicked element
            // is inside our div or not

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
                // set search back to empty when closing dropdown
                // so that next time admin opens it, they see the full list
                setSearch("");
            }
            // Listen for clicks on the entire document
            document.addEventListener("mousedown", handleClickOutside);

            // Cleanup: remove listener when component unmounts
            // WHY: Without this, the listener keeps running even
            // after the modal closes — causes memory leaks
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Department
            </label>
            <p>DepartmentPicker Coming Soon</p>
        </div>
    );
}
