"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/lib/axios";

// ─── Types ───────────────────────────────────────────
interface DashboardStats {
    totalShops: number;
    pendingVerifications: number;
    carOwners: number;
    monthlyRevenue: number;
}

interface RecentShop {
    id: number;
    shopName: string;
    address: string;
    approvalStatus: string;
    createdAt: string;
}

interface ActivityLog {
    id: number;
    activityType: string;
    description: string;
    userName: string;
    createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────
function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    return `${Math.floor(hrs / 24)} days ago`;
}

function formatRevenue(amount: number): string {
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
    return `$${amount}`;
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        PENDING:  "bg-orange-100 text-orange-500",
        APPROVED: "bg-green-100  text-green-600",
        REJECTED: "bg-red-100    text-red-500",
    };
    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                map[status] ?? "bg-gray-100 text-gray-500"
            }`}
        >
      {status}
    </span>
    );
}

function ActivityIcon({ type }: { type: string }) {
    const isAlert =
        type === "ACCOUNT_BLOCKED" || type === "LEAD_CANCELLED";

    return isAlert ? (
        // warning triangle
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-500" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.29 3.86L1.82
             18a2 2 0 001.71 3h16.94a2 2 0
             001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
        </div>
    ) : (
        // check circle
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-500" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5 13l4 4L19 7"/>
            </svg>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────
export default function DashboardPage() {
    const [stats, setStats]       = useState<DashboardStats | null>(null);
    const [shops, setShops]       = useState<RecentShop[]>([]);
    const [activity, setActivity] = useState<ActivityLog[]>([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        async function fetchAll() {
            try {
                const [statsRes, shopsRes, activityRes] = await Promise.all([
                    axios.get("/admin/dashboard/stats"),
                    axios.get("/admin/dashboard/recent-shops"),
                    axios.get("/admin/activity/recent"),
                ]);
                setStats(statsRes.data);
                setShops(shopsRes.data);
                setActivity(activityRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-4 border-orange-500
          border-t-transparent rounded-full animate-spin"/>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">

            {/* ── Heading ── */}
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                {/* Total Shops */}
                <div className="bg-white rounded-xl p-5 flex items-center
          justify-between shadow-sm border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500">Total Shops</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {stats?.totalShops.toLocaleString()}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full
            flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M3 9l9-7 9 7v11a2 2 0
                   01-2 2H5a2 2 0 01-2-2V9z"/>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M9 22V12h6v10"/>
                        </svg>
                    </div>
                </div>

                {/* Pending Verifications */}
                <div className="bg-white rounded-xl p-5 flex items-center
          justify-between shadow-sm border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500">Pending Verifications</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {stats?.pendingVerifications}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full
            flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-500" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955
                   11.955 0 0112 2.944a11.955 11.955
                   0 01-8.618 3.04A12.02 12.02 0
                   003 9c0 5.591 3.824 10.29 9
                   11.622 5.176-1.332 9-6.03
                   9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                    </div>
                </div>

                {/* Car Owners */}
                <div className="bg-white rounded-xl p-5 flex items-center
          justify-between shadow-sm border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500">Car Owners</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {stats?.carOwners.toLocaleString()}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-full
            flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-500" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M17 20h5v-2a4 4 0 00-3-3.87
                   M9 20H4v-2a4 4 0 013-3.87
                   m9-4a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-xl p-5 flex items-center
          justify-between shadow-sm border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {formatRevenue(stats?.monthlyRevenue ?? 0)}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full
            flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-500" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343
                   2 3 2 3 .895 3 2-1.343 2-3
                   2m0-8c1.11 0 2.08.402 2.599
                   1M12 8V7m0 1v8m0 0v1m0-1c-1.11
                   0-2.08-.402-2.599-1M21 12a9 9
                   0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* ── Bottom Section ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

                {/* Recent Shop Verifications */}
                <div className="xl:col-span-2 bg-white rounded-xl
          shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-800">
                            Recent Shop Verifications
                        </h2>
                        <Link
                            href="/dashboard/shops"
                            className="text-sm font-medium text-orange-500
                hover:text-orange-600 transition-colors"
                        >
                            View All
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-semibold
                    text-gray-400 uppercase pb-3 pr-4">
                                    Shop Details
                                </th>
                                <th className="text-left text-xs font-semibold
                    text-gray-400 uppercase pb-3 pr-4">
                                    Location
                                </th>
                                <th className="text-left text-xs font-semibold
                    text-gray-400 uppercase pb-3">
                                    Status
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {shops.length === 0 ? (
                                <tr>
                                    <td colSpan={3}
                                        className="text-center text-gray-400 py-8">
                                        No pending shops
                                    </td>
                                </tr>
                            ) : (
                                shops.map((shop) => (
                                    <tr key={shop.id} className="hover:bg-gray-50
                      transition-colors">
                                        <td className="py-3 pr-4">
                                            <p className="font-medium text-gray-800">
                                                {shop.shopName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Submitted {timeAgo(shop.createdAt)}
                                            </p>
                                        </td>
                                        <td className="py-3 pr-4 text-gray-500">
                                            {shop.address}
                                        </td>
                                        <td className="py-3">
                                            <StatusBadge status={shop.approvalStatus} />
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm
          border border-gray-100 p-5 flex flex-col">
                    <h2 className="text-base font-semibold text-gray-800 mb-4">
                        Recent Activity
                    </h2>

                    <div className="flex-1 space-y-4 overflow-y-auto">
                        {activity.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">
                                No recent activity
                            </p>
                        ) : (
                            activity.map((log) => (
                                <div key={log.id} className="flex items-start gap-3">
                                    <ActivityIcon type={log.activityType} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800
                      leading-snug">
                                            {log.description}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {timeAgo(log.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100">
                        <Link href="/dashboard/activity">
                            <button className="w-full py-2 rounded-lg border
                border-gray-200 text-sm font-semibold text-gray-700
                hover:bg-gray-50 transition-colors">
                                View All Activity
                            </button>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}