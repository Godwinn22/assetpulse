import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import { History } from "lucide-react";

export default function MyHistory() {
    const { profile } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.id) return;
        const fetchHistory = async () => {
            try {
                const { data, error } = await supabase
                    .from("assignment_history")
                    .select(
                        `
				id, assigned_at, returned_at, notes, device: devices(name, type),
				assigner:profiles!assignment_history_assigned_by_fkey(full_name)`,
                    )
                    .eq("assigned_to", profile.id)
                    .order("assigned_at", {ascending:false});
                if (error) throw error;
                setHistory(data || []);
            } catch (err) {
                console.error(`Could not fetch History ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [profile]);

    // format date
    const fmtDate = (d) =>
        d
            ? new Date(d).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              })
            : "-";
    return (
        <div>
            {/* ── Page header ── */}
            <div className="mb-8">
                <h1 className="text-2l font-bold text-gray-900">My History</h1>
                <p className="text-gray-500 text-sm mt-1">
                    All devices that have been assigned to you
                </p>
            </div>
            {/* ── Summary stat ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                <p className="text-gray-500 text-sm font-medium">
                    Total Assignments
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                    {history.length}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Across your time at the company
                </p>
            </div>
            {/* ── History table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <History className="w-10 h-10 mb-3 opacity-20" />
                        <p className="font-semibold">No history yet</p>
                        <p className="text-sm mt-1">
                            Your device assignment history will appear here
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
                                        Assigned By
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Date Assigned
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Date Returned
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Notes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.map((h) => (
                                    <tr
                                        key={h.id}
                                        className="hover:bg-gray-50/80 transition-colors"
                                    >
                                        {/* Device */}
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-900">
                                                {h.device?.name || "—"}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {h.device?.type}
                                            </p>
                                        </td>

                                        {/* Assigned by */}
                                        <td className="px-6 py-4 text-gray-600">
                                            {h.assigner?.full_name || "—"}
                                        </td>

                                        {/* Date assigned */}
                                        <td className="px-6 py-4 text-gray-600">
                                            {fmtDate(h.assigned_at)}
                                        </td>

                                        {/* Date returned */}
                                        <td className="px-6 py-4 text-gray-600">
                                            {fmtDate(h.returned_at)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {h.returned_at ? (
                                                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    Returned
                                                </span>
                                            ) : (
                                                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </td>

                                        {/* Notes */}
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {h.notes || (
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
