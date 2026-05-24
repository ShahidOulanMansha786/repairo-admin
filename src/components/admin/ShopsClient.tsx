"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ShopDetailModal from "@/components/admin/ShopDetailModal";

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

const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
        INCOMPLETE: "bg-gray-100 text-gray-800",
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-800"}`}>
            {status}
        </span>
    );
};

export default function ShopsClient() {
    const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");
    const [shops, setShops] = useState<ShopSummaryDto[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

    useEffect(() => {
        const fetchShops = async () => {
            setLoading(true);
            try {
                const url =
                    activeTab === "pending"
                        ? `/api/admin/shops/pending?page=${page}&size=10`
                        : `/api/admin/shops?page=${page}&size=10`;
                const res = await fetch(url);
                const data = await res.json();
                setShops(data.content ?? []);
                setTotalPages(data.totalPages ?? 0);
            } catch (e) {
                console.error("Failed to fetch shops", e);
            } finally {
                setLoading(false);
            }
        };

        fetchShops();
    }, [activeTab, page]);

    const handleTabChange = (tab: "pending" | "all") => {
        setActiveTab(tab);
        setPage(0);
    };

    return (
        <div>
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => handleTabChange("pending")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === "pending"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                    Pending
                </button>
                <button
                    onClick={() => handleTabChange("all")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === "all"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                    All Shops
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded-md animate-pulse" />
                    ))}
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Shop Name</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Registered Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shops.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                                    No shops found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            shops.map((shop) => (
                                <TableRow key={shop.shopId}>
                                    <TableCell className="font-medium">{shop.shopName}</TableCell>
                                    <TableCell>{shop.ownerName}</TableCell>
                                    <TableCell>{shop.ownerEmail}</TableCell>
                                    <TableCell>{shop.ownerPhone}</TableCell>
                                    <TableCell className="max-w-[150px] truncate">{shop.address}</TableCell>
                                    <TableCell>{statusBadge(shop.approvalStatus)}</TableCell>
                                    <TableCell>{new Date(shop.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => setSelectedShopId(shop.shopId)}
                                            className="px-3 py-1 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
                                        >
                                            View
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            )}

            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-600">
                    Page {page + 1} of {totalPages === 0 ? 1 : totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page + 1 >= totalPages}
                    className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>

            {selectedShopId !== null && (
                <ShopDetailModal
                    shopId={selectedShopId}
                    isOpen={selectedShopId !== null}
                    onClose={() => setSelectedShopId(null)}
                    onActionComplete={() => {
                        setSelectedShopId(null);
                        setPage(0);
                    }}
                />
            )}
        </div>
    );
}