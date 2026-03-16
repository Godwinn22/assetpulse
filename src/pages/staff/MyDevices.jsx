import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import DeviceTypeChart from "../../components/shared/charts/DeviceTypeChart";
import DeviceStatusOverview from "../../components/shared/charts/DeviceStatusOverview";
import {
    Cpu,
    Laptop,
    Printer,
    Mouse,
    Monitor,
    ScanLine,
    Package,
} from "lucide-react";

// Create a device lookup
function DeviceIcon({ type }) {
    const map = {
        Laptop: Laptop,
        Desktop: Monitor,
        Printer: Printer,
        Scanner: ScanLine,
        Mouse: Mouse,
        Keyboard: Package,
        Other: Package,
    };
    const Icon = map[type] || Cpu;
    return <Icon className="w-4 h-4" />;
}

export default function MyDevices() {
    const { profile } = useAuth();
    const [devices, setDevices] = useState([]);
    const [typeChartData, setTypeChartData] = useState([]);
    const [returnChartData, setReturnChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.id) return;

        const fetchDevices = async () => {
            try {
                const { data, error } = await supabase
                    .from("devices")
                    .select("*")
                    .eq("assigned_to", profile.id)
                    .eq("status", "assigned")
                    .order("updated_at", { ascending: false });

                if (error) throw error;
                setDevices(data || []);
                // Transform devices into chart data
                // Same reduce() pattern we used in Overview.jsx
                if (data && data.length > 0) {
                    const typeCounts = data.reduce((tally, device) => {
                        tally[device.type] = (tally[device.type] || 0) + 1;
                        return tally;
                    }, {});

                    const chartData = Object.entries(typeCounts)
                        .map(([name, value]) => ({ name, value }))
                        .sort((a, b) => b.value - a.value);

                    setTypeChartData(chartData);
                }
            } catch (err) {
                console.error("Could not fetch devices:", err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchReturnStats = async () => {
            try {
                const { data, error } = await supabase
                    .from("assignment_history")
                    .select("returned_at")
                    .eq("assigned_to", profile.id);

                if (error) throw error;

                // Count active vs returned
                const active = data.filter(
                    (h) => h.returned_at === null,
                ).length;
                const returned = data.filter(
                    (h) => h.returned_at !== null,
                ).length;

                setReturnChartData([
                    { name: "Active", value: active },
                    { name: "Returned", value: returned },
                ]);
            } catch (err) {
                console.error("Could not fetch return stats:", err.message);
            }
        };

        fetchDevices();
        fetchReturnStats();
    }, [profile]);

    // Format Currency
    const fmt = (n) =>
        "₦" +
        Number(n).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    // Format date
    const fmtDate = (d) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    return (
        <div>
            {/* ── Page header ── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Devices</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Devices currently assigned to you
                </p>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                {/* Total devices */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">
                        Assigned Devices
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {devices.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Currently in your possession
                    </p>
                </div>

                {/* Total value */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm font-medium">
                        Total Value
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {fmt(
                            devices.reduce(
                                (sum, d) =>
                                    sum + (Number(d.purchase_price) || 0),
                                0,
                            ),
                        )}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Combined value of your devices
                    </p>
                </div>
            </div>

            {/* ── My Devices by Type chart ── */}
            {typeChartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                    <h2 className="font-semibold text-gray-900 mb-1">
                        My Devices by Type
                    </h2>
                    <p className="text-gray-400 text-xs mb-4">
                        Breakdown of your assigned devices
                    </p>
                    <DeviceTypeChart data={typeChartData} />
                </div>
            )}

            {/* ── Active vs Returned chart ── */}
            {returnChartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                    <h2 className="font-semibold text-gray-900 mb-1">
                        Active vs Returned
                    </h2>
                    <p className="text-gray-400 text-xs mb-4">
                        Your device assignment history overview
                    </p>
                    <DeviceStatusOverview data={returnChartData} />
                </div>
            )}

            {/* ── Devices table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : devices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Cpu className="w-10 h-10 mb-3 opacity-20" />
                        <p className="font-semibold">No devices assigned</p>
                        <p className="text-sm mt-1">
                            Contact your IT administrator to get a device
                            assigned
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Device
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Serial No.
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Assigned On
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {devices.map((device) => (
                                    <tr
                                        key={device.id}
                                        className="hover:bg-gray-50/80 transition-colors"
                                    >
                                        {/* Device name + brand/model */}
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {device.name}
                                            </p>
                                            {(device.brand || device.model) && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {[
                                                        device.brand,
                                                        device.model,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                            )}
                                        </td>

                                        {/* Type with icon */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <DeviceIcon
                                                    type={device.type}
                                                />
                                                <span>{device.type}</span>
                                            </div>
                                        </td>

                                        {/* Serial number */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                {device.serial_number || "—"}
                                            </span>
                                        </td>

                                        {/* Date assigned */}
                                        <td className="px-6 py-4 text-gray-600">
                                            {fmtDate(device.updated_at)}
                                        </td>

                                        {/* Value */}
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {device.purchase_price ? (
                                                fmt(device.purchase_price)
                                            ) : (
                                                <span className="text-gray-300">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
