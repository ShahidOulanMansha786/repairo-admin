"use client";

import { useEffect, useState, useCallback } from "react";
import ShopDetailDrawer from "@/components/admin/ShopDetailDrawer";
import api from "@/lib/axios";


interface ShopSummaryDto {
    shopId: number;
    shopName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    address: string;
    approvalStatus: string;
    createdAt: string;
}

interface Counts {
    pending: number;
    approved: number;
    rejected: number;
}

type TabType = "PENDING" | "APPROVED" | "REJECTED";

export default function ShopsClient() {
    const [activeTab, setActiveTab]           = useState<TabType>("PENDING");
    const [shops, setShops]                   = useState<ShopSummaryDto[]>([]);
    const [counts, setCounts]                 = useState<Counts>({ pending: 0, approved: 0, rejected: 0 });
    const [page, setPage]                     = useState(0);
    const [totalPages, setTotalPages]         = useState(0);
    const [totalElements, setTotalElements]   = useState(0);
    const [loading, setLoading]               = useState(false);
    const [search, setSearch]                 = useState("");
    const [searchInput, setSearchInput]       = useState("");
    const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

    const fetchCounts = async () => {
        try {
            const res = await api.get("/admin/shops/counts");
            setCounts(res.data);
        } catch (e) {
            console.error("Failed to fetch counts", e);
        }
    };

    const fetchShops = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {
                status: activeTab,
                page: String(page),
                size: "10",
            };
            if (search) params.search = search;

            const res = await api.get("/admin/shops", { params });
            setShops(res.data.content ?? []);
            setTotalPages(res.data.totalPages ?? 0);
            setTotalElements(res.data.totalElements ?? 0);
        } catch (e) {
            console.error("Failed to fetch shops", e);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, search]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void fetchCounts(); }, []);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { void fetchShops(); }, [fetchShops]);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setPage(0);
    };

    const TABS: { key: TabType; label: string; count?: number }[] = [
        { key: "PENDING",  label: "Pending Review", count: counts.pending },
        { key: "APPROVED", label: "Approved"                              },
        { key: "REJECTED", label: "Rejected"                              },
    ];

    const startItem = page * 10 + 1;
    const endItem   = Math.min(page * 10 + shops.length, totalElements);

    return (
        <div>
            {/* ✅ Header Row: Title left, Search right — exactly as in image */}
            <div className="flex items-center gap-8 mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Shop Verification</h1>

                <div className="relative w-72">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search shops..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setSearch(searchInput);
                                setPage(0);
                            }
                        }}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.key
                                ? "border-orange-500 text-orange-500"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab.label}

                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Owner
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Date Submitted
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-48 mb-1" />
                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-36" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="h-6 bg-gray-100 rounded-full animate-pulse w-20" />
                                </td>
                            </tr>
                        ))
                    ) : shops.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center text-gray-400 py-12 text-sm">
                                No shops found.
                            </td>
                        </tr>
                    ) : (
                        shops.map((shop) => (
                            <tr
                                key={shop.shopId}
                                onClick={() => setSelectedShopId(shop.shopId)}
                                className="hover:bg-orange-50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{shop.ownerName}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{shop.ownerEmail}</p>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(shop.createdAt).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric",
                                    })}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={shop.approvalStatus} />
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && shops.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {startItem} to {endItem} of {totalElements} applications
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-8 h-8 text-sm rounded-md font-medium ${
                                        page === i
                                            ? "bg-orange-500 text-white"
                                            : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page + 1 >= totalPages}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Drawer */}
            {selectedShopId !== null && (
                <ShopDetailDrawer
                    shopId={selectedShopId}
                    onClose={() => setSelectedShopId(null)}
                    onActionComplete={() => {
                        setSelectedShopId(null);
                        void fetchShops();
                        void fetchCounts();
                    }}
                />
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PENDING:    "bg-orange-100 text-orange-600",
        APPROVED:   "bg-green-100 text-green-700",
        REJECTED:   "bg-red-100 text-red-600",
        INCOMPLETE: "bg-gray-100 text-gray-600",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
            {status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
    );
}