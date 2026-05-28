"use client";

import { useEffect, useState } from "react";

interface ShopDetailDto {
    shopId: number;
    shopName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    address: string;
    approvalStatus: string;
    rejectionReason: string | null;
    createdAt: string;
    logoUrl: string | null;
    cnicUrl: string | null;
    businessDocUrl: string | null;
}

interface Document {
    label: string;
    url: string | null;
    icon: "doc" | "shield" | "badge";
}

interface Props {
    shopId: number;
    onClose: () => void;
    onActionComplete: () => void;
}

export default function ShopDetailDrawer({
                                             shopId,
                                             onClose,
                                             onActionComplete,
                                         }: Props) {
    const [shop, setShop] = useState<ShopDetailDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [error, setError] = useState("");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
        });
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    useEffect(() => {
        const fetchShop = async () => {
            setLoading(true);
            setError("");

            try {
                const res = await fetch(`/api/admin/shops/${shopId}`);

                if (!res.ok) {
                    setError("Failed to load shop details.");
                    return;
                }

                const data = await res.json();
                setShop(data);
            } catch {
                setError("Failed to load shop details.");
            } finally {
                setLoading(false);
            }
        };

        void fetchShop();
    }, [shopId]);

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
                setError("Failed to approve shop.");
                return;
            }

            onActionComplete();
        } catch {
            setError("Failed to approve shop.");
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
                body: JSON.stringify({
                    action: "reject",
                    rejectionReason,
                }),
            });

            if (!res.ok) {
                setError("Failed to reject shop.");
                return;
            }

            onActionComplete();
        } catch {
            setError("Failed to reject shop.");
        } finally {
            setActionLoading(false);
        }
    };

    const getFileExt = (url: string) =>
        url.split("?")[0].split(".").pop()?.toUpperCase() ?? "FILE";

    const documents: Document[] = [
        {
            label: "CNIC Document",
            url: shop?.cnicUrl ?? null,
            icon: "shield",
        },
        {
            label: "Business Document",
            url: shop?.businessDocUrl ?? null,
            icon: "doc",
        },
        {
            label: "Shop Logo",
            url: shop?.logoUrl ?? null,
            icon: "badge",
        },
    ];

    const statusStyles: Record<string, string> = {
        PENDING: "bg-orange-100 text-orange-600",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-600",
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
                    visible ? "opacity-100" : "opacity-0"
                }`}
                onClick={handleClose}
            />

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 h-full w-[480px] bg-white z-50 shadow-2xl flex flex-col
                    transform transition-transform duration-300 ease-in-out ${
                    visible ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 mt-1"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    {shop && (
                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                statusStyles[shop.approvalStatus] ??
                                "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {shop.approvalStatus === "PENDING"
                                ? "VERIFICATION PENDING"
                                : shop.approvalStatus}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-8 bg-gray-100 rounded animate-pulse"
                                />
                            ))}
                        </div>
                    ) : shop ? (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {shop.shopName}
                                </h2>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                                    Shop Details
                                </p>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Owner Name
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {shop.ownerName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Phone Number
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {shop.ownerPhone}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Email Address
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {shop.ownerEmail}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Address
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {shop.address}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {shop.approvalStatus === "REJECTED" &&
                                shop.rejectionReason && (
                                    <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-100">
                                        <p className="text-xs text-red-500 font-semibold mb-1">
                                            Rejection Reason
                                        </p>
                                        <p className="text-sm text-red-700">
                                            {shop.rejectionReason}
                                        </p>
                                    </div>
                                )}

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                        Submitted Documents
                                    </p>

                                    <span className="text-xs font-semibold text-orange-500">
                                        {
                                            documents.filter((d) => d.url)
                                                .length
                                        }{" "}
                                        Total
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {documents.map((doc) =>
                                        doc.url ? (
                                            <div
                                                key={doc.label}
                                                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <DocIcon
                                                        type={doc.icon}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {doc.label}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {getFileExt(
                                                                doc.url
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-bold text-orange-500 hover:text-orange-600"
                                                >
                                                    VIEW
                                                </a>
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </div>

                {/* Actions */}
                {shop?.approvalStatus === "PENDING" && !loading && (
                    <div className="p-6 border-t border-gray-100 space-y-3">
                        {error && (
                            <p className="text-xs text-red-500">
                                {error}
                            </p>
                        )}

                        {!showRejectForm ? (
                            <>
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Approve Shop
                                </button>

                                <button
                                    onClick={() =>
                                        setShowRejectForm(true)
                                    }
                                    disabled={actionLoading}
                                    className="w-full py-3 border border-gray-200 text-orange-500 hover:bg-orange-50 text-sm font-semibold rounded-xl transition-colors"
                                >
                                    Reject
                                </button>
                            </>
                        ) : (
                            <>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) =>
                                        setRejectionReason(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter rejection reason..."
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                                />

                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl"
                                >
                                    Confirm Rejection
                                </button>

                                <button
                                    onClick={() => {
                                        setShowRejectForm(false);
                                        setRejectionReason("");
                                        setError("");
                                    }}
                                    className="w-full py-2 text-sm text-gray-500"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

function DocIcon({ type }: { type: "doc" | "shield" | "badge" }) {
    const base = "w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100";
    if (type === "shield") return (
        <div className={base}>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        </div>
    );
    if (type === "badge") return (
        <div className={base}>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
    );
    return (
        <div className={base}>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
    );
}