"use client";

import { useEffect, useState, useRef } from "react";
import axios from "@/lib/axios";
import {
    X, MapPin, Mail, Phone, ShieldOff, ShieldCheck,
    Clock, Car, Wrench
} from "lucide-react";

interface ActivityLog {
    activityType: string;
    description: string;
    entityId: number | null;
    createdAt: string;
}

interface UserDetail {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    active: boolean;
    blocked: boolean;
    createdAt: string;
    statsCount: number | null;
    shopAddress: string | null;
    latitude: number | null;
    longitude: number | null;
    recentActivity: ActivityLog[];
}

interface Props {
    userId: number | null;
    open: boolean;
    onClose: () => void;
    onUserUpdated: () => void;
}

const ACTIVITY_LABELS: Record<string, string> = {
    LEAD_POSTED: "Posted a Lead",
    QUOTE_SUBMITTED: "Submitted a Quote",
    QUOTE_ACCEPTED: "Quote Accepted",
    LEAD_CANCELLED: "Lead Cancelled",
    ACCOUNT_BLOCKED: "Account Blocked",
    ACCOUNT_UNBLOCKED: "Account Unblocked",
};

const ACTIVITY_COLORS: Record<string, string> = {
    LEAD_POSTED: "bg-blue-500",
    QUOTE_SUBMITTED: "bg-orange-500",
    QUOTE_ACCEPTED: "bg-green-500",
    LEAD_CANCELLED: "bg-gray-400",
    ACCOUNT_BLOCKED: "bg-red-500",
    ACCOUNT_UNBLOCKED: "bg-green-500",
};

function formatRole(role: string) {
    if (role === "CAR_OWNER") return "Car Owner";
    if (role === "SHOP_OWNER") return "Shop Owner";
    if (role === "ADMIN") return "Admin";
    return role;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDateTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return formatDate(dateStr);
}

export function UserDetailDrawer({ userId, open, onClose, onUserUpdated }: Props) {
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    // FIX: For smooth animation — track visible state separately from open
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (open) {
            // Small delay so the browser paints the element before transitioning
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open || !userId) return;

        let isMounted = true;
        setUser(null);
        setLoading(true);

        axios.get(`/admin/users/${userId}`)
            .then((res) => {
                if (isMounted) setUser(res.data);
            })
            .catch((err) => {
                console.error("Failed to fetch user details:", err);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [userId, open]);

    async function handleBlock() {
        if (!user) return;
        setActionLoading(true);
        try {
            await axios.post(`/admin/users/${user.id}/block`);
            setUser((prev) => prev ? { ...prev, blocked: true } : prev);
            onUserUpdated();
        } catch (err) {
            console.error("Failed to block user:", err);
        } finally {
            setActionLoading(false);
        }
    }

    async function handleUnblock() {
        if (!user) return;
        setActionLoading(true);
        try {
            await axios.post(`/admin/users/${user.id}/unblock`);
            setUser((prev) => prev ? { ...prev, blocked: false } : prev);
            onUserUpdated();
        } catch (err) {
            console.error("Failed to unblock user:", err);
        } finally {
            setActionLoading(false);
        }
    }

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
                    visible ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 h-full w-[480px] bg-white z-50 shadow-2xl flex flex-col
                    transition-transform duration-300 ease-out
                    ${visible ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">User Details</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                            Loading...
                        </div>
                    ) : !user ? null : (
                        <>
                            {/* Profile */}
                            <div className="flex flex-col items-center py-8 px-6 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                                    <span className="text-orange-600 text-xl font-semibold">
                                        {user.fullName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{user.fullName}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                                        {formatRole(user.role)}
                                    </span>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                        user.blocked
                                            ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                    }`}>
                                        {user.blocked ? "Blocked" : "Active"}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Joined {formatDate(user.createdAt)}
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div className="px-6 py-5 border-b border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                    Contact Information
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-sm">Email</span>
                                        </div>
                                        <span className="text-sm text-gray-900">{user.email}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-sm">Phone</span>
                                        </div>
                                        <span className="text-sm text-gray-900">{user.phone}</span>
                                    </div>
                                    {user.role === "SHOP_OWNER" && user.shopAddress && (
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-2 text-gray-500 shrink-0">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">Location</span>
                                            </div>
                                            <span className="text-sm text-gray-900 text-right">{user.shopAddress}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            {user.statsCount !== null && user.role !== "ADMIN" && (
                                <div className="px-6 py-5 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                        Platform Stats
                                    </p>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                {user.role === "CAR_OWNER"
                                                    ? <Car className="w-5 h-5 text-orange-600" />
                                                    : <Wrench className="w-5 h-5 text-orange-600" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-orange-500">{user.statsCount}</p>
                                                <p className="text-xs text-gray-500">
                                                    {user.role === "CAR_OWNER" ? "Total Leads Posted" : "Total Quotes Submitted"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Activity */}
                            {user.recentActivity.length > 0 && (
                                <div className="px-6 py-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Recent Activity
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        {user.recentActivity.map((activity, index) => (
                                            <div key={index} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ACTIVITY_COLORS[activity.activityType] ?? "bg-gray-400"}`} />
                                                    {index < user.recentActivity.length - 1 && (
                                                        <div className="w-px flex-1 bg-gray-100 mt-1" />
                                                    )}
                                                </div>
                                                <div className="pb-4">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {ACTIVITY_LABELS[activity.activityType] ?? activity.activityType}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(activity.createdAt)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                {user && user.role !== "ADMIN" && (
                    <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                        {user.blocked ? (
                            <button
                                onClick={handleUnblock}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                {actionLoading ? "Processing..." : "Unblock User"}
                            </button>
                        ) : (
                            <button
                                onClick={handleBlock}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                <ShieldOff className="w-4 h-4" />
                                {actionLoading ? "Processing..." : "Block User"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}