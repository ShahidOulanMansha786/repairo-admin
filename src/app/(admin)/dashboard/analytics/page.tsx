"use client";

import { useEffect, useState, useCallback } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell
} from "recharts";
import axios from "@/lib/axios";


interface AnalyticsStats {
    totalLeads: number;
    totalLeadsChange: number;
    activeShops: number;
    activeShopsChange: number;
    totalQuotes: number;
    totalQuotesChange: number;
    totalGMV: number;
    gmvChange: number;
}

interface TrendPoint { date: string; count: number; }

interface StatusDistribution {
    completed: number;
    cancelled: number;
    other: number;
    total: number;
}

interface TopShop {
    shopId: number;
    shopName: string;
    location: string;
    bookings: number;
    gmv: number;
    rating: number;
    status: string;
}

interface RecentActivity {
    id: number;
    activityType: string;
    description: string;
    createdAt: string;
}

interface AnalyticsResponse {
    stats: AnalyticsStats;
    trend: TrendPoint[];
    statusDistribution: StatusDistribution;
    topShops: TopShop[];
}

type Period = "7D" | "30D" | "12M" | "CUSTOM";

const CalendarIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="16" rx="3" stroke="#E8541A" strokeWidth="1.8"/>
        <path d="M7 2v4M15 2v4" stroke="#E8541A" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M2 9h18" stroke="#E8541A" strokeWidth="1.8"/>
        <rect x="6" y="13" width="3" height="3" rx="0.5" fill="#E8541A"/>
        <rect x="11" y="13" width="3" height="3" rx="0.5" fill="#E8541A"/>
    </svg>
);

const WalletIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="6" width="18" height="13" rx="3" stroke="#0EA5E9" strokeWidth="1.8"/>
        <path d="M2 10h18" stroke="#0EA5E9" strokeWidth="1.8"/>
        <path d="M6 3h10a2 2 0 012 2v1H4V5a2 2 0 012-2z" stroke="#0EA5E9" strokeWidth="1.8"/>
        <circle cx="15.5" cy="15" r="1.5" fill="#0EA5E9"/>
    </svg>
);

const ShopIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="#6366F1" strokeWidth="1.8"/>
        <path d="M8 20v-7h6v7" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M7 9h2v2H7zM13 9h2v2h-2z" fill="#6366F1"/>
    </svg>
);


const QuoteIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="3" width="18" height="16" rx="3"
              stroke="#10B981" strokeWidth="1.8"/>
        <path d="M6 8h10M6 11h7M6 14h5"
              stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="17" cy="14" r="3" fill="#10B981"/>
        <path d="M16 14l.8.8 1.4-1.6"
              stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
);

// ─────────────────────────────────────────────
//  STAT CARD
// ─────────────────────────────────────────────
function StatCard({
                      label, value, change, icon, prefix = "",
                  }: {
    label: string;
    value: number;
    change: number;
    icon: React.ReactNode;
    prefix?: string;
}) {
    const isPositive = change >= 0;
    const isFlat = change === 0;

    const formattedValue =
        prefix === "$"
            ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
            : value.toLocaleString();

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
        <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
          {label}
        </span>
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <span className="text-[2rem] font-bold text-gray-900 leading-none">
        {formattedValue}
      </span>
            <div className="flex items-center gap-1.5">
                {isFlat ? (
                    <span className="text-gray-400 text-xs font-medium">— 0.0% vs last period</span>
                ) : isPositive ? (
                    <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 2l5 5H8.5v5h-3V7H3L7 2z" fill="#16a34a"/>
                        </svg>
                        <span className="text-green-600 text-xs font-semibold">
              +{change}% vs last period
            </span>
                    </>
                ) : (
                    <>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 12L2 7h3.5V2h3v5H12L7 12z" fill="#dc2626"/>
                        </svg>
                        <span className="text-red-500 text-xs font-semibold">
              {change}% vs last period
            </span>
                    </>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
//  PERIOD BUTTON
// ─────────────────────────────────────────────
function PeriodBtn({
                       label, active, onClick,
                   }: {
    label: string; active: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                active
                    ? "bg-[#E8541A] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
            }`}
        >
            {label}
        </button>
    );
}

// ─────────────────────────────────────────────
//  SHOP INITIALS AVATAR
// ─────────────────────────────────────────────
function ShopAvatar({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    const colors = [
        "bg-orange-100 text-orange-600",
        "bg-blue-100 text-blue-600",
        "bg-purple-100 text-purple-600",
        "bg-green-100 text-green-600",
        "bg-rose-100 text-rose-600",
    ];
    const color = colors[name.charCodeAt(0) % colors.length];

    return (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${color}`}>
            {initials}
        </div>
    );
}

// ─────────────────────────────────────────────
//  STAR RATING
// ─────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
    return (
        <span className="text-amber-500 font-semibold text-sm">
      {rating.toFixed(1)} ★
    </span>
    );
}

// ─────────────────────────────────────────────
//  CUSTOM DONUT LABEL
// ─────────────────────────────────────────────
function DonutCenter({ total }: { total: number }) {
    return (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan
                x="50%" dy="-0.3em"
                fontSize="26"
                fontWeight="700"
                fill="#111827"
            >
                {total.toLocaleString()}
            </tspan>
            <tspan
                x="50%" dy="1.5em"
                fontSize="11"
                fill="#9CA3AF"
                letterSpacing="2"
            >
                TOTAL
            </tspan>
        </text>
    );
}

// ─────────────────────────────────────────────
//  ACTIVITY ICON
// ─────────────────────────────────────────────
function ActivityDot({ type }: { type: string }) {
    const map: Record<string, string> = {
        QUOTE_ACCEPTED: "bg-green-500",
        LEAD_POSTED: "bg-blue-500",
        QUOTE_SUBMITTED: "bg-orange-400",
        LEAD_CANCELLED: "bg-red-400",
        ACCOUNT_BLOCKED: "bg-gray-500",
        ACCOUNT_UNBLOCKED: "bg-teal-500",
    };
    return (
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${map[type] ?? "bg-gray-300"}`} />
    );
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function getPeriodLabel(
    period: Period, start?: string, end?: string
): string {
    if (period === "CUSTOM" && start && end) {
        const fmt = (d: string) =>
            new Date(d).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric"
            });
        return `${fmt(start)} – ${fmt(end)}`;
    }
    const now = new Date();
    const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (period === "7D") {
        const s = new Date(now); s.setDate(s.getDate() - 7);
        return `${fmt(s)} – ${fmt(now)}`;
    }
    if (period === "30D") {
        const s = new Date(now); s.setDate(s.getDate() - 30);
        return `${fmt(s)} – ${fmt(now)}`;
    }
    const s = new Date(now); s.setMonth(s.getMonth() - 12);
    return `${fmt(s)} – ${fmt(now)}`;
}

// ─────────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
    );
}

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
export default function AnalyticsPage() {
    const [period, setPeriod] = useState<Period>("30D");
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [activity, setActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate]     = useState("");

    const DONUT_COLORS = ["#E8541A", "#0EA5E9", "#E5E7EB"];

    const fetchData = useCallback(async (
        p: Period,
        start?: string,
        end?: string
    ) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (p === "CUSTOM" && start && end) {
                params.set("startDate", start);
                params.set("endDate", end);
            } else {
                params.set("period", p);
            }

            const [analyticsRes, activityRes] = await Promise.all([
                axios.get<AnalyticsResponse>(`/admin/analytics?${params}`),
                axios.get<RecentActivity[]>("/admin/activity/recent"),
            ]);
            setData(analyticsRes.data);
            setActivity(activityRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

// useEffect update karo
    useEffect(() => {
        if (period !== "CUSTOM") fetchData(period);
    }, [period, fetchData]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await axios.get(`/admin/analytics/export?period=${period}`, {
                responseType: "blob",
            });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `analytics-trend-${period.toLowerCase()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export error:", err);
        } finally {
            setExporting(false);
        }
    };

    const donutData = data
        ? [
            { name: "Completed", value: data.statusDistribution.completed },
            { name: "Cancelled", value: data.statusDistribution.cancelled },
            { name: "Other", value: data.statusDistribution.other },
        ]
        : [];

    return (
        <div className="p-6 space-y-6 bg-[#F8F8F8] min-h-screen">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
                {/* Period Buttons — Custom button update karo */}
                <div className="flex items-center gap-1 bg-white border
     border-gray-200 rounded-xl p-1 shadow-sm">
                    {(["7D", "30D", "12M"] as Period[]).map((p) => (
                        <PeriodBtn key={p} label={p} active={period === p}
                                   onClick={() => {
                                       setPeriod(p);
                                       setShowDatePicker(false);
                                   }}
                        />
                    ))}
                    <PeriodBtn
                        label="Custom"
                        active={period === "CUSTOM"}
                        onClick={() => {
                            setPeriod("CUSTOM");
                            setShowDatePicker(true);
                        }}
                    />
                </div>

                {/* Date Picker — period selector ke neeche add karo */}
                {showDatePicker && (
                    <div className="flex items-center gap-3 bg-white border
         border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                From
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-sm text-gray-700 border border-gray-200
                           rounded-lg px-3 py-1.5 outline-none
                           focus:ring-2 focus:ring-orange-200
                           focus:border-[#E8541A] transition-all"
                            />
                        </div>
                        <span className="text-gray-300">→</span>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                To
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                max={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-sm text-gray-700 border border-gray-200
                           rounded-lg px-3 py-1.5 outline-none
                           focus:ring-2 focus:ring-orange-200
                           focus:border-[#E8541A] transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (startDate && endDate) {
                                    fetchData("CUSTOM", startDate, endDate);
                                }
                            }}
                            disabled={!startDate || !endDate}
                            className="px-4 py-1.5 bg-[#E8541A] text-white text-sm
                       font-semibold rounded-lg hover:opacity-80
                       transition-opacity disabled:opacity-40"
                        >
                            Apply
                        </button>
                    </div>
                )}
            </div>

            {/* ── Stats Cards ── */}
            {loading ? (
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
                </div>
            ) : data ? (
                <div className="grid grid-cols-4 gap-4">
                    <StatCard
                        label="Total Leads"
                        value={data.stats.totalLeads}
                        change={data.stats.totalLeadsChange}
                        icon={<CalendarIcon />}
                    />
                    <StatCard
                        label="Total GMV"
                        value={data.stats.totalGMV}
                        change={data.stats.gmvChange}
                        icon={<WalletIcon />}
                        prefix="$"
                    />
                    <StatCard
                        label="Active Shops"
                        value={data.stats.activeShops}
                        change={data.stats.activeShopsChange}
                        icon={<ShopIcon />}
                    />
                    <StatCard
                        label="Total Quotes"
                        value={data.stats.totalQuotes}
                        change={data.stats.totalQuotesChange}
                        icon={<QuoteIcon />}
                    />
                </div>
            ) : null}

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-3 gap-4">

                {/* Line Chart */}
                <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Leads Trend</h2>
                            <p className="text-xs text-gray-400 mt-0.5">{getPeriodLabel(period, startDate, endDate)}</p>
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#E8541A] hover:opacity-70 transition-opacity disabled:opacity-40"
                        >
                            {exporting ? "EXPORTING..." : "EXPORT CSV"}
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 2v7M4 6l3 3 3-3" stroke="#E8541A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 11h10" stroke="#E8541A" strokeWidth="1.6" strokeLinecap="round"/>
                            </svg>
                        </button>
                    </div>

                    {loading ? (
                        <Skeleton className="h-56 mt-4" />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={data?.trend ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                                    tickFormatter={(v) => {
                                        if (period === "12M") return v.slice(0, 7);
                                        return v.slice(5);
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: "#9CA3AF" }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "10px",
                                        border: "1px solid #E5E7EB",
                                        fontSize: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                    }}
                                    itemStyle={{ color: "#E8541A", fontWeight: 600 }}
                                    labelStyle={{ color: "#6B7280", marginBottom: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#E8541A"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: "#E8541A", strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Donut Chart */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Status Distribution</h2>

                    {loading ? (
                        <Skeleton className="flex-1" />
                    ) : (
                        <>
                            <div className="flex-1 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie
                                            data={donutData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={58}
                                            outerRadius={82}
                                            paddingAngle={3}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {donutData.map((_, idx) => (
                                                <Cell key={idx} fill={DONUT_COLORS[idx]} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <DonutCenter total={data?.statusDistribution.total ?? 0} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-2 mt-2">
                                {[
                                    { label: "Completed", pct: data?.statusDistribution.completed ?? 0, color: "#E8541A" },
                                    { label: "Cancelled",  pct: data?.statusDistribution.cancelled ?? 0,  color: "#0EA5E9" },
                                    { label: "Other",     pct: data?.statusDistribution.other ?? 0,     color: "#E5E7EB" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                            <span className="text-sm text-gray-600">{item.label}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">{item.pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Bottom Row ── */}
            <div className="grid grid-cols-3 gap-4">

                {/* Top Performing Shops */}
                <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-900">Top Performing Shops</h2>
                        <a
                            href="/dashboard/shops"
                            className="text-xs font-bold text-[#E8541A] hover:opacity-70 transition-opacity"
                        >
                            View All Shops
                        </a>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-100">
                                {["Shop Name", "Bookings", "GMV", "Rating", "Status"].map((h) => (
                                    <th
                                        key={h}
                                        className="pb-2 text-left text-[10px] font-semibold tracking-widest text-gray-400 uppercase"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {(data?.topShops ?? []).map((shop) => (
                                <tr key={shop.shopId} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                                    <td className="py-3 pr-4">
                                        <div className="flex items-center gap-3">
                                            <ShopAvatar name={shop.shopName} />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 leading-tight">
                                                    {shop.shopName}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate max-w-[140px]">
                                                    {shop.location}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 text-sm text-gray-700 font-medium">{shop.bookings}</td>
                                    <td className="py-3 text-sm text-gray-700 font-medium">
                                        ${shop.gmv.toLocaleString()}
                                    </td>
                                    <td className="py-3">
                                        <StarRating rating={shop.rating} />
                                    </td>
                                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          shop.status === "ACTIVE"
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-500"
                      }`}>
                        {shop.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            {(data?.topShops ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                                        No shop data for this period
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Recent Activity</h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
                        </div>
                    ) : (
                        <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
                            {activity.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-6">No recent activity</p>
                            )}
                            {activity.map((item) => (
                                <div key={item.id} className="flex gap-3 group">
                                    <ActivityDot type={item.activityType} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-700 leading-snug">{item.description}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(item.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}