// src/pages/admin/Overview.jsx
// The first page admins see — shows key stats and recent activity.

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import DeviceTypeChart from "../../components/shared/charts/DeviceTypeChart";
import DevicesByDepartment from "../../components/shared/charts/DevicesByDepartment";
import AssignmentTrend from "../../components/shared/charts/AssignmentTrend";
import DeviceStatusOverview from "../../components/shared/charts/DeviceStatusOverview";
import {
    Cpu,
    CheckCircle2,
    ArrowRightLeft,
    Wallet,
    Clock,
    TrendingUp,
} from "lucide-react";

// ── Reusable stat card component ──
function StatCard({ label, value, icon, bgColor, iconColor, sub }) {
    const Icon = icon;
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1 truncate">
                        {value}
                    </p>
                    {sub && (
                        <p className="text-xs text-gray-400 mt-1.5">{sub}</p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ml-4 ${bgColor}`}
                >
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}

export default function Overview() {
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        assigned: 0,
        underRepair: 0,
        totalValue: 0,
        assignedValue: 0,
    });
    const [recentAssignments, setRecentAssignments] = useState([]);
    const [deviceTypeData, setDeviceTypeData] = useState([]);
    const [deptChartData, setDeptChartData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [deviceStatusOverviewData, setDeviceStatusOverviewData] = useState(
        [],
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all devices in one call
            const { data: devices, error: devErr } = await supabase
                .from("devices")
                .select("*");
            if (devErr) throw devErr;

            // Fetch assigned devices with department info
            const { data: deptDevices, error: deptErr } = await supabase
                .from("devices")
                .select(
                    `
    id,
    assignee:profiles!devices_assigned_to_fkey(
      department:departments(name)
    )
  `,
                )
                .eq("status", "assigned");

            if (deptErr) throw deptErr;

            if (deptDevices) {
                // Count devices per department
                const deptCounts = deptDevices.reduce((tally, device) => {
                    const dept = device.assignee?.department?.name;
                    if (!dept) return tally;
                    tally[dept] = (tally[dept] || 0) + 1;
                    return tally;
                }, {});

                // Convert to chart shape, sorted highest first
                const deptData = Object.entries(deptCounts)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);

                setDeptChartData(deptData);
            }

            // ── Fetch assignment trend (last 6 months) ──

            // Step 1: Generate last 6 months as labels
            // We do this in JavaScript so months with
            // zero assignments still appear on the chart
            const getLast6Months = () => {
                const months = [];
                for (let i = 5; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    months.push({
                        // Short month name e.g. "Jan", "Feb"
                        label: date.toLocaleDateString("en-GB", {
                            month: "short",
                            year: "2-digit",
                        }),
                        // Full year-month for matching e.g. "2026-01"
                        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
                    });
                }
                return months;
            };

            // Step 2: Fetch assignment counts from DB
            // We use a date filter to only get last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const { data: trendRaw, error: trendErr } = await supabase
                .from("assignment_history")
                .select("assigned_at")
                .gte("assigned_at", sixMonthsAgo.toISOString());

            if (trendErr) throw trendErr;

            // Step 3: Count assignments per month from DB results
            const trendCounts = (trendRaw || []).reduce((tally, row) => {
                // Extract year-month key e.g. "2026-03"
                const key = row.assigned_at.slice(0, 7);
                tally[key] = (tally[key] || 0) + 1;
                return tally;
            }, {});

            // Step 4: Merge with our 6 month labels
            // Months with no assignments get count: 0
            const trend = getLast6Months().map((month) => ({
                month: month.label,
                count: trendCounts[month.key] || 0,
            }));

            setTrendData(trend);

            // Fetch the 6 most recent assignment history entries
            const { data: recent, error: histErr } = await supabase
                .from("assignment_history")
                .select(
                    `
          id, assigned_at, returned_at,
          device:devices(name, type),
          assignee:profiles!assignment_history_assigned_to_fkey(full_name, department)
        `,
                )
                .order("assigned_at", { ascending: false })
                .limit(6);
            if (histErr) throw histErr;

            if (devices) {
                const assigned = devices.filter((d) => d.status === "assigned");
                setStats({
                    total: devices.length,
                    available: devices.filter((d) => d.status === "available")
                        .length,
                    assigned: assigned.length,
                    underRepair: devices.filter(
                        (d) => d.status === "under_repair",
                    ).length,
                    // Total value of ALL devices
                    totalValue: devices.reduce(
                        (sum, d) => sum + (Number(d.purchase_price) || 0),
                        0,
                    ),
                    // Value of only ASSIGNED devices
                    assignedValue: assigned.reduce(
                        (sum, d) => sum + (Number(d.purchase_price) || 0),
                        0,
                    ),
                });

                // ── Transform devices into chart data ──
                // Step 1: Count devices by type using reduce()
                const typeCounts = devices.reduce((tally, device) => {
                    const type = device.type;
                    tally[type] = (tally[type] || 0) + 1;
                    return tally;
                }, {});

                // Step 2: Convert to array shape Recharts needs
                const chartData = Object.entries(typeCounts).map(
                    ([name, value]) => ({
                        name,
                        value,
                    }),
                );

                setDeviceTypeData(chartData);
                setDeviceStatusOverviewData([
                    {
                        name: "Assigned",
                        value: devices.filter((d) => d.status === "assigned")
                            .length,
                    },
                    {
                        name: "Available",
                        value: devices.filter((d) => d.status === "available")
                            .length,
                    },
                    {
                        name: "Under Repair",
                        value: devices.filter(
                            (d) => d.status === "under_repair",
                        ).length,
                    },
                    {
                        name: "Retired",
                        value: devices.filter((d) => d.status === "retired")
                            .length,
                    },
                ]);
            }

            setRecentAssignments(recent || []);
        } catch (err) {
            console.error("Overview fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // Format currency in Nigerian Naira
    const fmt = (n) =>
        "₦" +
        Number(n).toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    // Format date to readable form
    const fmtDate = (d) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* ── Page header ── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Your IT asset summary at a glance
                </p>
            </div>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                <StatCard
                    label="Total Devices"
                    value={stats.total}
                    icon={Cpu}
                    bgColor="bg-blue-50"
                    iconColor="text-blue-600"
                    sub={`${stats.underRepair} under repair`}
                />
                <StatCard
                    label="Available"
                    value={stats.available}
                    icon={CheckCircle2}
                    bgColor="bg-emerald-50"
                    iconColor="text-emerald-600"
                    sub="Ready to be assigned"
                />
                <StatCard
                    label="Currently Assigned"
                    value={stats.assigned}
                    icon={ArrowRightLeft}
                    bgColor="bg-indigo-50"
                    iconColor="text-indigo-600"
                    sub="Active assignments"
                />
                <StatCard
                    label="Total Fleet Value"
                    value={fmt(stats.totalValue)}
                    icon={Wallet}
                    bgColor="bg-amber-50"
                    iconColor="text-amber-600"
                    sub="All devices combined"
                />
                <StatCard
                    label="Assigned Value"
                    value={fmt(stats.assignedValue)}
                    icon={TrendingUp}
                    bgColor="bg-rose-50"
                    iconColor="text-rose-600"
                    sub="Value of devices in use"
                />
            </div>

            {/* ── Charts section ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="font-semibold text-gray-900 mb-1">
                    Devices by Type
                </h2>
                <p className="text-gray-400 text-xs mb-6">
                    Distribution of all devices in inventory
                </p>
                <DeviceTypeChart data={deviceTypeData} />
            </div>

            {/* ── Charts section for Device status overview ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="font-semibold text-gray-900 mb-1">
                    Device Status Overview
                </h2>
                <p className="text-gray-400 text-xs mb-6">
                    Full breakdown of all device statuses
                </p>
                <DeviceStatusOverview data={deviceStatusOverviewData} />
            </div>

            {/* ── Devices by Department ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="font-semibold text-gray-900 mb-1">
                    Devices by Department
                </h2>
                <p className="text-gray-400 text-xs mb-6">
                    Number of active devices per department
                </p>
                <DevicesByDepartment data={deptChartData} />
            </div>

            {/* ── Device Assignments from last 6 months ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="font-semibold text-gray-900 mb-1">
                    Assignment Trend
                </h2>
                <p className="text-gray-400 text-xs mb-6">
                    Device assignments over the last 6 months
                </p>
                <AssignmentTrend data={trendData} />
            </div>

            {/* ── Recent Assignments table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <h2 className="font-semibold text-gray-900">
                        Recent Assignment Activity
                    </h2>
                </div>

                {recentAssignments.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
                        No assignment activity yet. Assign a device to get
                        started.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {recentAssignments.map((entry) => (
                            <div
                                key={entry.id}
                                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Device type icon bubble */}
                                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Cpu className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {entry.device?.name ||
                                                "Unknown Device"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Assigned to{" "}
                                            <span className="font-medium text-gray-600">
                                                {entry.assignee?.full_name ||
                                                    "—"}
                                            </span>
                                            {entry.assignee?.department &&
                                                ` · ${entry.assignee.department}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <p className="text-xs text-gray-400">
                                        {fmtDate(entry.assigned_at)}
                                    </p>
                                    {entry.returned_at ? (
                                        <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
                                            Returned
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-blue-50 text-blue-600 font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
                                            Active
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
