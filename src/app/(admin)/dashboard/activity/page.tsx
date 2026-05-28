"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

// ─── Types ───────────────────────────────────────────
interface ActivityLog {
    id: number;
    activityType: string;
    description: string;
    userName: string;
    entityId: number | null;
    createdAt: string;
}

interface PageResponse {
    content: ActivityLog[];
    totalElements: number;
    totalPages: number;
    number: number;
}

// ─── Helpers ─────────────────────────────────────────
const ACTIVITY_TYPES = [
    { value: "",                label: "All Types"       },
    { value: "LEAD_POSTED",     label: "Lead Posted"     },
    { value: "QUOTE_SUBMITTED", label: "Quote Submitted" },
    { value: "QUOTE_ACCEPTED",  label: "Quote Accepted"  },
    { value: "LEAD_CANCELLED",  label: "Lead Cancelled"  },
    { value: "ACCOUNT_BLOCKED", label: "Account Blocked" },
    { value: "ACCOUNT_UNBLOCKED", label: "Account Unblocked" },
];

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-US", {
        month:  "short",
        day:    "numeric",
        year:   "numeric",
        hour:   "2-digit",
        minute: "2-digit",
    });
}

function ActivityTypeBadge({ type }: { type: string }) {
    const map: Record<string, string> = {
        LEAD_POSTED:        "bg-blue-100   text-blue-600",
        QUOTE_SUBMITTED:    "bg-purple-100 text-purple-600",
        QUOTE_ACCEPTED:     "bg-green-100  text-green-600",
        LEAD_CANCELLED:     "bg-gray-100   text-gray-500",
        ACCOUNT_BLOCKED:    "bg-red-100    text-red-500",
        ACCOUNT_UNBLOCKED:  "bg-orange-100 text-orange-500",
    };

    const label = type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold
      ${map[type] ?? "bg-gray-100 text-gray-500"}`}>
      {label}
    </span>
    );
}

export default function ActivityPage() {
    const router = useRouter();

    const [data, setData]           = useState<PageResponse | null>(null);
    const [loading, setLoading]     = useState(true);
    const [page, setPage]           = useState(0);
    const [filterType, setFilter]   = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const PAGE_SIZE = 10;

    const fetchActivity = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                size: String(PAGE_SIZE),
            });
            if (filterType) params.append("type", filterType);

            const res = await axios.get(`/admin/activity?${params}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, filterType]);

    useEffect(() => {
        fetchActivity();
    }, [fetchActivity]);

    // filter change → page reset
    function handleFilterChange(val: string) {
        setFilter(val);
        setPage(0);
    }

    const totalPages    = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;
    const from          = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
    const to            = Math.min((page + 1) * PAGE_SIZE, totalElements);

    return (
        <div className="p-6 space-y-5">

            {/* ── Header ── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="w-8 h-8 flex items-center justify-center
            rounded-lg border border-gray-200 hover:bg-gray-50
            transition-colors"
                >
                    <svg className="w-4 h-4 text-gray-600" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">
                    Activity Log
                </h1>
            </div>

            {/* ── Filter Button ── */}
            <div className="flex justify-end relative">
                <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg
      border border-gray-200 bg-white text-sm text-gray-600
      hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 4h18M7 8h10M10 12h4"/>
                    </svg>
                    Filters
                </button>

                {dropdownOpen && (
                    <div className="absolute top-10 right-0 z-10 bg-white
      rounded-xl shadow-lg border border-gray-100 py-2 w-52">
                        {ACTIVITY_TYPES.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => {
                                    handleFilterChange(t.value);
                                    setDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm
            transition-colors
            ${filterType === t.value
                                    ? "bg-orange-50 text-orange-500 font-semibold"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-xl border border-gray-100
        shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-semibold
                  text-gray-800 uppercase px-5 py-3">
                                User
                            </th>
                            <th className="text-left text-xs font-semibold
                  text-gray-800 uppercase px-5 py-3">
                                Activity Type
                            </th>
                            <th className="text-left text-xs font-semibold
                  text-gray-800 uppercase px-5 py-3">
                                Description
                            </th>
                            <th className="text-left text-xs font-semibold
                  text-gray-800 uppercase px-5 py-3">
                                Date & Time
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-16">
                                    <div className="flex justify-center">
                                        <div className="w-7 h-7 border-4
                        border-orange-500 border-t-transparent
                        rounded-full animate-spin"/>
                                    </div>
                                </td>
                            </tr>
                        ) : data?.content.length === 0 ? (
                            <tr>
                                <td colSpan={4}
                                    className="text-center text-gray-400 py-16 text-sm">
                                    No activity found
                                </td>
                            </tr>
                        ) : (
                            data?.content.map((log) => (
                                <tr key={log.id}
                                    className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-gray-800">
                                        {log.userName}
                                    </td>
                                    <td className="px-5 py-3">
                                        <ActivityTypeBadge type={log.activityType} />
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">
                                        {log.description}
                                    </td>
                                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                                        {formatDateTime(log.createdAt)}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {!loading && totalElements > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100
            flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                            Showing {from} to {to} of {totalElements} activities
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-4 py-1.5 text-sm rounded-lg border
                  border-gray-200 text-gray-600 hover:bg-gray-50
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-4 py-1.5 text-sm rounded-lg border
                  border-gray-200 text-gray-700 font-medium
                  hover:bg-gray-50 disabled:opacity-40
                  disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}