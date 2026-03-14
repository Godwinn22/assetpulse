// src/pages/admin/Users.jsx
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import DepartmentPicker from "../../components/shared/DepartmentPicker";
import { supabase } from "../../lib/supabase";
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    X,
    AlertCircle,
    ShieldCheck,
    Search,
} from "lucide-react";

// ─────────────────────────────────────────────
// These are the same values used by the main
// supabase client in lib/supabase.js
// We read them here to create a temp client
// for staff account creation
// ─────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ─────────────────────────────────────────────
// REUSABLE: Form input component
// Same pattern used across all pages for consistency
// ─────────────────────────────────────────────
function FormInput({
    label,
    type = "text",
    value,
    onChange,
    required,
    placeholder,
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-gray-50 focus:bg-white transition"
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// MODAL 1: Create Staff Account
//
// ORDER OF OPERATIONS:
// 1. Check email doesn't already exist in profiles
// 2. Create auth user via temp client
// 3. Insert profile row via main client (admin session)
// 4. If step 3 fails → log orphan user for manual cleanup
// ─────────────────────────────────────────────
function CreateStaffModal({ onClose, onCreated }) {
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        department_id: "",
        role: "staff",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Helper: update a single form field without touching the others
    // e.g. set('email')('john@company.com') updates only email
    const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        let createdUserId = null;

        try {
            // Check duplicate email first
            const { data: existing } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", form.email)
                .maybeSingle();

            if (existing) {
                throw new Error(
                    "A staff member with this email already exists.",
                );
            }

            // Step 1: Create auth user via temp client with memory-only storage
            // Memory-only storage prevents admin logout (our earlier fix)
            const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                    storage: {
                        getItem: () => null,
                        setItem: () => {},
                        removeItem: () => {},
                    },
                },
            });

            const { data: authData, error: authError } =
                await tempClient.auth.signUp({
                    email: form.email,
                    password: form.password,
                });

            if (authError) throw authError;
            if (!authData.user)
                throw new Error("Account creation failed. Please try again.");

            createdUserId = authData.user.id;

            // Step 2: Insert profile using the real UUID from auth
            const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                    id: createdUserId,
                    full_name: form.full_name,
                    email: form.email,
                    role: form.role,
                    department_id: form.department_id || null,
                });

            if (profileError) throw profileError;

            onCreated();
        } catch (err) {
            // Log orphan if auth succeeded but profile failed
            if (createdUserId) {
                console.error(
                    `⚠️ ORPHAN USER DETECTED\n` +
                        `UUID: ${createdUserId}\n` +
                        `Email: ${form.email}\n` +
                        `Action: Remove manually from Supabase Auth dashboard.`,
                );
            }

            if (err.message.includes("already exists")) {
                setError("A staff member with this email already exists.");
            } else if (err.message.includes("password")) {
                setError("Password must be at least 6 characters.");
            } else if (err.message.includes("valid email")) {
                setError("Please enter a valid email address.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Create Staff Account
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Creates login credentials and a staff profile
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <FormInput
                        label="Full Name"
                        value={form.full_name}
                        onChange={set("full_name")}
                        required
                        placeholder="e.g. John Adeyemi"
                    />

                    <FormInput
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        required
                        placeholder="e.g. john@company.com"
                    />

                    <FormInput
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={set("password")}
                        required
                        placeholder="Minimum 6 characters"
                    />

                    <DepartmentPicker
                        value={form.department_id}
                        onChange={set("department_id")}
                    />

                    {/* Role selector */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.role}
                            onChange={(e) => set("role")(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         bg-gray-50 focus:bg-white transition"
                        >
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>

                        {/* Warning only shown when admin role is selected */}
                        {form.role === "admin" && (
                            <p className="text-amber-600 text-xs mt-1.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                This person will have full admin access to all
                                devices and data
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700
                         rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                         disabled:bg-blue-400 disabled:cursor-not-allowed
                         text-white rounded-xl text-sm font-semibold transition"
                        >
                            {loading ? "Creating..." : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MODAL 2: Edit Staff Profile
//
// WHY this is separate from Create:
// Edit ONLY touches the profiles table.
// No auth operations, no temp client needed.
// Mixing both into one modal adds unnecessary
// complexity — separation keeps things clear.
// ─────────────────────────────────────────────
function EditStaffModal({ staff, onClose, onUpdated }) {
    const [form, setForm] = useState({
        full_name: staff.full_name || "",
        department_id: staff.department_id || "",
        role: staff.role || "staff",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: form.full_name,
                    department_id: form.department_id || null,
                    role: form.role,
                })
                .eq("id", staff.id);

            if (error) throw error;
            onUpdated();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Edit Staff Member
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {staff.email}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <FormInput
                        label="Full Name"
                        value={form.full_name}
                        onChange={set("full_name")}
                        required
                        placeholder="Full name"
                    />

                    <DepartmentPicker
                        value={form.department_id}
                        onChange={set("department_id")}
                    />

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Role
                        </label>
                        <select
                            value={form.role}
                            onChange={(e) => set("role")(e.target.value)}
                            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         bg-gray-50 focus:bg-white transition"
                        >
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700
                         rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700
                         disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MODAL 3: Delete Staff
//
// WHY we check devices on mount (not on click):
// The admin sees the warning BEFORE deciding to
// delete. No surprises after pressing the button.
//
// WHY we only delete the profile row:
// Deleting the auth user requires the service
// role key which can't be in frontend code safely.
// Deleting the profile is enough — without a
// profile row, the app shows "Setting things up..."
// and the person can never access the dashboard.
// ─────────────────────────────────────────────
function DeleteStaffModal({ staff, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [assignedDevices, setAssignedDevices] = useState([]);
    const [checking, setChecking] = useState(true);

    // Check for assigned devices immediately when modal opens
    // We don't want to let the admin delete someone with active devices
    useEffect(() => {
        const checkDevices = async () => {
            try {
                const { data, error } = await supabase
                    .from("devices")
                    .select("id, name")
                    .eq("assigned_to", staff.id)
                    .eq("status", "assigned");

                if (error) throw error;
                setAssignedDevices(data || []);
            } catch (err) {
                setError("Could not check assigned devices: " + err.message);
            } finally {
                setChecking(false);
            }
        };
        checkDevices();
    }, [staff.id]);

    const handleDelete = async () => {
        setLoading(true);
        setError("");

        try {
            const { error } = await supabase
                .from("profiles")
                .delete()
                .eq("id", staff.id);

            if (error) throw error;
            onDeleted();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Remove Staff Member
                        </h2>
                        <p className="text-sm text-gray-400">
                            {staff.full_name} · {staff.email}
                        </p>
                    </div>
                </div>

                {/* Show spinner while checking */}
                {checking ? (
                    <div className="flex items-center justify-center py-6">
                        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : assignedDevices.length > 0 ? (
                    // Block deletion — show which devices need to be returned first
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <p className="text-amber-800 font-semibold text-sm mb-2">
                            ⚠️ Cannot delete — {assignedDevices.length} device
                            {assignedDevices.length > 1 ? "s" : ""} still
                            assigned:
                        </p>
                        <ul className="space-y-1">
                            {assignedDevices.map((d) => (
                                <li
                                    key={d.id}
                                    className="text-amber-700 text-sm"
                                >
                                    · {d.name}
                                </li>
                            ))}
                        </ul>
                        <p className="text-amber-600 text-xs mt-2">
                            Return all devices first, then remove this account.
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-600">
                        This will remove <strong>{staff.full_name}</strong>'s
                        profile and revoke their access to AssetPulse
                        immediately. Their auth account will remain in Supabase
                        but they will not be able to use the app.
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-3 py-2.5 rounded-xl text-sm mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700
                       rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={
                            loading || checking || assignedDevices.length > 0
                        }
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700
                       disabled:bg-red-300 disabled:cursor-not-allowed
                       text-white rounded-xl text-sm font-semibold transition"
                    >
                        {loading ? "Removing..." : "Remove Access"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE: Staff Members
// ─────────────────────────────────────────────
export default function UsersPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [deletingStaff, setDeletingStaff] = useState(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select(
                    `
          id, full_name, email, role, department_id, created_at,
		  department:departments(id, name),
          assigned_devices:devices(count)
        `,
                )
                .order("created_at", { ascending: false });

            if (error) throw error;
            setStaff(data || []);
        } catch (err) {
            console.error("Fetch staff error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const filtered = staff.filter((s) => {
        const q = search.toLowerCase();
        return (
            s.full_name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.department?.toLowerCase().includes(q)
        );
    });

    const onCreated = () => {
        setShowCreate(false);
        fetchStaff();
    };
    const onUpdated = () => {
        setEditingStaff(null);
        fetchStaff();
    };
    const onDeleted = () => {
        setDeletingStaff(null);
        fetchStaff();
    };

    return (
        <div>
            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Staff Members
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {staff.length} account{staff.length !== 1 ? "s" : ""} in
                        the system
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700
                     text-white px-5 py-2.5 rounded-xl text-sm font-semibold
                     transition shadow-sm shadow-blue-200 w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Create Staff Account
                </button>
            </div>

            {/* ── Search ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, or department..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       bg-gray-50 focus:bg-white transition"
                    />
                </div>
            </div>

            {/* ── Staff table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Users className="w-10 h-10 mb-3 opacity-20" />
                        <p className="font-semibold">No staff members found</p>
                        <p className="text-sm mt-1">
                            {search
                                ? "Try a different search term"
                                : 'Click "Create Staff Account" to add someone'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Devices
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-gray-50/80 transition-colors"
                                    >
                                        {/* Avatar + name + email */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                                    <span className="text-blue-700 font-bold text-sm">
                                                        {member.full_name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {member.full_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Department */}
                                        <td className="px-6 py-4 text-gray-600">
                                            {member.department?.name || (
                                                <span className="text-gray-300">
                                                    —
                                                </span>
                                            )}
                                        </td>

                                        {/* Role badge */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${
                            member.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                                            >
                                                {member.role === "admin" && (
                                                    <ShieldCheck className="w-3 h-3" />
                                                )}
                                                {member.role === "admin"
                                                    ? "Admin"
                                                    : "Staff"}
                                            </span>
                                        </td>

                                        {/* Device count from the joined query */}
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {member.assigned_devices?.[0]
                                                ?.count ?? 0}{" "}
                                            device
                                            {member.assigned_devices?.[0]
                                                ?.count !== 1
                                                ? "s"
                                                : ""}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() =>
                                                        setEditingStaff(member)
                                                    }
                                                    title="Edit"
                                                    className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setDeletingStaff(member)
                                                    }
                                                    title="Remove access"
                                                    className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            {showCreate && (
                <CreateStaffModal
                    onClose={() => setShowCreate(false)}
                    onCreated={onCreated}
                />
            )}
            {editingStaff && (
                <EditStaffModal
                    staff={editingStaff}
                    onClose={() => setEditingStaff(null)}
                    onUpdated={onUpdated}
                />
            )}
            {deletingStaff && (
                <DeleteStaffModal
                    staff={deletingStaff}
                    onClose={() => setDeletingStaff(null)}
                    onDeleted={onDeleted}
                />
            )}
        </div>
    );
}
