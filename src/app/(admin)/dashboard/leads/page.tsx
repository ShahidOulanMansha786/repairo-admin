"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Search, Filter, Download } from "lucide-react";
import { useRouter } from "next/navigation";

interface Lead {
    id: number;
    title: string;
    carMake: string;
    carModel: string;
    carYear: number;
    address: string;
    status: "OPEN" | "CLOSED" | "CANCELLED";
    ownerName: string;
    ownerEmail: string;
    createdAt: string;
}

interface LeadsPage {
    content: Lead[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// ─── Status Badge ─────────────────────────────────────────
const STATUS_CONFIG = {
    OPEN: {
        label: "OPEN",
        classes: "bg-yellow-100 text-yellow-700",
    },
    CLOSED: {
        label: "COMPLETED",
        classes: "bg-green-100 text-green-700",
    },
    CANCELLED: {
        label: "CANCELLED",
        classes: "bg-gray-100 text-gray-500",
    },
} as const;

function StatusBadge({ status }: { status: Lead["status"] }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;

    return (
        <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}
        >
            {cfg.label}
        </span>
    );
}

// ─── Main Page ────────────────────────────────────────────
export default function LeadsPage() {

    const router = useRouter();

    const [data, setData] = useState<LeadsPage | null>(null);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // ─── Fetch Leads ──────────────────────────────────────
    useEffect(() => {
        let active = true;

        const load = async () => {
            setLoading(true);

            try {
                const params: Record<string, string | number> = { page };

                if (search) params.search = search;
                if (status) params.status = status;

                const res = await axios.get<LeadsPage>("/admin/leads", {
                    params,
                });

                if (active) {
                    setData(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch leads", err);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [search, status, page]);

    // ─── Export ───────────────────────────────────────────
    const handleExport = async () => {
        try {
            const res = await axios.get("/admin/leads/export", {
                params: { format: "csv" },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "leads.csv");

            document.body.appendChild(link);

            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
        }
    };

    // ─── Pagination Helpers ───────────────────────────────
    const from = data ? data.number * data.size + 1 : 0;

    const to = data
        ? Math.min(from + data.size - 1, data.totalElements)
        : 0;

    const total = data?.totalElements ?? 0;

    // ─── Render ───────────────────────────────────────────
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Leads
            </h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                {/* ─── Toolbar ─── */}
                <div className="flex items-center gap-3 mb-6">

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

                        <input
                            type="text"
                            placeholder="Search by car, owner name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setSearch(searchInput);
                                    setPage(0);
                                }
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg
               text-sm text-gray-700 outline-none focus:ring-2
               focus:ring-orange-300 focus:border-orange-400"
                        />
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200
                            rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>

                        {showFilter && (
                            <div
                                className="absolute right-0 mt-2 w-44 bg-white border border-gray-200
                                rounded-xl shadow-lg z-10 p-2"
                            >
                                {[
                                    {
                                        value: "",
                                        label: "All Statuses",
                                    },
                                    {
                                        value: "OPEN",
                                        label: "Open",
                                    },
                                    {
                                        value: "CLOSED",
                                        label: "Completed",
                                    },
                                    {
                                        value: "CANCELLED",
                                        label: "Cancelled",
                                    },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            setStatus(opt.value);
                                            setPage(0);
                                            setShowFilter(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm
                                        ${
                                            status === opt.value
                                                ? "bg-orange-50 text-orange-600 font-medium"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Export */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200
                        rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                {/* ─── Table ─── */}
                <table className="w-full text-sm table-fixed">
                    <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                        <th className="text-left pb-3 font-medium w-[100px]">Car Owner</th>
                        <th className="text-left pb-3 font-medium w-[130px]">Car</th>
                        <th className="text-left pb-3 font-medium w-[150px]">Issue Description</th>
                        <th className="text-left pb-3 font-medium w-[150px]">Location</th>
                        <th className="text-left pb-3 font-medium w-[120px] pl-10">
                            Status
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="text-center py-12 text-gray-400"
                            >
                                Loading...
                            </td>
                        </tr>
                    ) : data?.content.length === 0 ? (
                        <tr>
                            <td
                                colSpan={5}
                                className="text-center py-12 text-gray-400"
                            >
                                No leads found.
                            </td>
                        </tr>
                    ) : (
                        data?.content.map((lead) => (
                            <tr
                                key={lead.id}
                                className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                            >

                                {/* Car Owner */}
                                <td className="py-4">
                                    <p className="font-semibold text-gray-800 truncate">
                                        {lead.ownerName}
                                    </p>
                                </td>

                                {/* Car */}
                                <td className="py-4">
                                    <p className="text-gray-800 font-medium truncate">
                                        {lead.carMake} {lead.carModel}
                                    </p>

                                    <p className="text-sm text-gray-400 truncate">
                                        {lead.carYear}
                                    </p>
                                </td>

                                {/* Issue */}
                                <td className="py-4 text-gray-400 max-w-[200px] truncate">
                                    {lead.title}
                                </td>

                                {/* Location */}
                                <td
                                    className="py-4 text-gray-700 max-w-[100px] truncate"
                                    title={lead.address}
                                >
                                    {lead.address}
                                </td>

                                {/* Status */}
                                <td className="py-4 pl-8">
                                    <StatusBadge status={lead.status} />
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>

                {/* ─── Pagination ─── */}
                {data && (
                    <div className="flex items-center justify-between mt-6">

                        <p className="text-sm text-gray-400">
                            Showing{" "}
                            <span className="font-medium text-gray-600">
                                {from}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium text-gray-600">
                                {to}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-gray-600">
                                {total}
                            </span>{" "}
                            leads
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(p - 1, 0))
                                }
                                disabled={page === 0}
                                className="px-4 py-2 text-sm border border-gray-200 rounded-lg
                                text-gray-600 hover:bg-gray-50
                                disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <button
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(
                                            p + 1,
                                            data.totalPages - 1
                                        )
                                    )
                                }
                                disabled={page >= data.totalPages - 1}
                                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg
                                hover:bg-gray-700
                                disabled:opacity-40 disabled:cursor-not-allowed"
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