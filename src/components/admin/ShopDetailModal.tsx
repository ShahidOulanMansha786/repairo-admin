"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/axios";

interface ShopDetailDto {
    shopId: number;
    shopName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    address: string;
    latitude: number;
    longitude: number;
    approvalStatus: string;
    rejectionReason: string | null;
    createdAt: string;
    logoUrl: string;
    cnicUrl: string;
    businessDocUrl: string;
}

interface Props {
    shopId: number;
    isOpen: boolean;
    onClose: () => void;
    onActionComplete: () => void;
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

export default function ShopDetailModal({ shopId, isOpen, onClose, onActionComplete }: Props) {
    const [shop, setShop] = useState<ShopDetailDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        const fetchShop = async () => {
            setLoading(true);
            setError("");
            setShowRejectForm(false);
            setRejectionReason("");

            try {
                const res = await api.get(`/admin/shops/${shopId}`);
                setShop(res.data);
            } catch {
                setError("Failed to load shop details.");
            } finally {
                setLoading(false);
            }
        };

        void fetchShop();
    }, [isOpen, shopId]);

    const handleApprove = async () => {
        setActionLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/admin/shops/${shopId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "approve" }),
            });
            if (!res.ok) {
                setError("Failed to approve shop. Please try again.");
                return;
            }
            onActionComplete();
            onClose();
        } catch {
            setError("Failed to approve shop. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setError("Rejection reason is required.");
            return;
        }

        setActionLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/admin/shops/${shopId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reject", rejectionReason }),
            });
            if (!res.ok) {
                setError("Failed to reject shop. Please try again.");
                return;
            }
            onActionComplete();
            onClose();
        } catch {
            setError("Failed to reject shop. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const isPdf = (url: string) => url?.toLowerCase().endsWith(".pdf");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger className="hidden" aria-hidden="true" />
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {loading ? "Loading..." : shop?.shopName ?? "Shop Details"}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-3 py-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-8 bg-gray-100 rounded-md animate-pulse" />
                        ))}
                    </div>
                ) : shop ? (
                    <div className="grid grid-cols-2 gap-8 mt-4">
                        {/* Left Column — Details */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Owner Name</p>
                                <p className="text-sm font-medium">{shop.ownerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                                <p className="text-sm font-medium">{shop.ownerEmail}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                                <p className="text-sm font-medium">{shop.ownerPhone}</p>
                            </div>

                            {shop.latitude && shop.longitude && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Location</p>
                                    <iframe
                                        width="100%"
                                        height="220"
                                        style={{ border: 0, borderRadius: "8px" }}
                                        loading="lazy"
                                        allowFullScreen
                                        src={`https://www.google.com/maps?q=${shop.latitude},${shop.longitude}&z=15&output=embed`}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        {shop.latitude.toFixed(6)}, {shop.longitude.toFixed(6)}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                                <p className="text-sm font-medium">{shop.address}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                                {statusBadge(shop.approvalStatus)}
                            </div>
                            {shop.approvalStatus === "REJECTED" && shop.rejectionReason && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rejection Reason</p>
                                    <p className="text-sm text-red-600">{shop.rejectionReason}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Registered Date</p>
                                <p className="text-sm font-medium">{new Date(shop.createdAt).toLocaleDateString()}</p>
                            </div>

                        </div>

                        {/* Right Column — Documents */}
                        <div className="space-y-6">
                            {shop.logoUrl && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Logo</p>
                                    <a href={shop.logoUrl} target="_blank" rel="noopener noreferrer">
                                        <Image
                                            src={shop.logoUrl}
                                            alt="Shop Logo"
                                            width={120}
                                            height={120}
                                            unoptimized
                                            className="object-cover rounded-md border"
                                        />
                                    </a>
                                </div>
                            )}
                            {shop.cnicUrl && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">CNIC</p>
                                    <a href={shop.cnicUrl} target="_blank" rel="noopener noreferrer">
                                        <Image
                                            src={shop.cnicUrl}
                                            alt="CNIC"
                                            width={200}
                                            height={120}
                                            unoptimized
                                            className="object-cover border rounded-md"
                                        />
                                    </a>
                                </div>
                            )}
                            {shop.businessDocUrl && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                                        Business Document
                                    </p>

                                    {isPdf(shop.businessDocUrl) ? (
                                        <a
                                            href={shop.businessDocUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 underline hover:text-blue-800"
                                        >
                                            View Document
                                        </a>
                                    ) : (
                                        <a
                                            href={shop.businessDocUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Image
                                                src={shop.businessDocUrl}
                                                alt="Business Document"
                                                width={200}
                                                height={120}
                                                unoptimized
                                                className="object-cover border rounded-md"
                                            />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Action Buttons */}
                {shop?.approvalStatus === "PENDING" && !loading && (
                    <div className="mt-6 border-t pt-4">
                        {error && (
                            <p className="text-sm text-red-600 mb-3">{error}</p>
                        )}
                        {!showRejectForm ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {actionLoading ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : null}
                                    Approve
                                </button>
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Reject
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                    rows={3}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleReject}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {actionLoading ? (
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : null}
                                        Confirm Rejection
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowRejectForm(false);
                                            setRejectionReason("");
                                            setError("");
                                        }}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}