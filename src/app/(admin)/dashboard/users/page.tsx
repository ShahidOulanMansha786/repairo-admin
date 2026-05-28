"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "@/lib/axios";
import {
    Search, ChevronLeft, ChevronRight
} from "lucide-react";
import { UserDetailDrawer } from "@/components/users/UserDetailDrawer";

interface User {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    active: boolean;
    blocked: boolean;
    createdAt: string;
}

interface PageResponse {
    content: User[];
    totalElements: number;
    totalPages: number;
    number: number;
}

interface Counts {
    all: number;
    carOwners: number;
    shopOwners: number;
    admins: number;
}

const TABS = [
    { label: "All", key: "", countKey: "all" },
    { label: "Car Owners", key: "CAR_OWNER", countKey: "carOwners" },
    { label: "Shop Owners", key: "SHOP_OWNER", countKey: "shopOwners" },
    { label: "Admins", key: "ADMIN", countKey: "admins" },
] as const;

const STATUS_BADGE: Record<string, string> = {
    active: "bg-green-50 text-green-700 ring-1 ring-green-200",
    blocked: "bg-red-50 text-red-700 ring-1 ring-red-200",
    inactive: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
};

function getUserStatus(user: User) {
    if (user.blocked) return "blocked";
    return "active";
}

function formatRole(role: string) {
    if (role === "CAR_OWNER") return "Car Owner";
    if (role === "SHOP_OWNER") return "Shop Owner";
    if (role === "ADMIN") return "Admin";
    return role;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [counts, setCounts] = useState<Counts | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [activeTab, setActiveTab] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const fetchCounts = useCallback(async () => {
        const res = await axios.get("/admin/users/counts");
        setCounts(res.data);
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, size: 10 };
            if (activeTab) params.role = activeTab;
            if (search) params.search = search;
            const res = await axios.get<PageResponse>("/admin/users", { params });
            setUsers(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } finally {
            setLoading(false);
        }
    }, [page, activeTab, search]);

    useEffect(() => { fetchCounts(); }, [fetchCounts]);
    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleUserUpdated = useCallback(() => {
        fetchUsers();
        fetchCounts();
    }, [fetchUsers, fetchCounts]);

    function handleTabChange(key: string) {
        setActiveTab(key);
        setPage(0);
    }

    function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            setSearch(searchInput);
            setPage(0);
        }
    }

    function openDrawer(id: number) {
        setSelectedUserId(id);
        setDrawerOpen(true);
    }

    function closeDrawer() {
        setDrawerOpen(false);
    }

    function getCount(countKey: string) {
        if (!counts) return null;
        return counts[countKey as keyof Counts];
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and verify platform users</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-6">
                {TABS.map((tab) => {
                    const count = getCount(tab.countKey);
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                isActive
                                    ? "border-orange-500 text-orange-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                            {count !== null && (
                                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                                    isActive
                                        ? "bg-orange-100 text-orange-600"
                                        : "bg-gray-100 text-gray-500"
                                }`}>
                                    {count.toLocaleString()}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                </div>
                {/*<button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">*/}
                {/*    <SlidersHorizontal className="w-4 h-4" />*/}
                {/*    Filter*/}
                {/*</button>*/}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td>
                        </tr>
                    ) : users.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-12 text-gray-400">No users found</td>
                        </tr>
                    ) : (
                        users.map((user) => {
                            const status = getUserStatus(user);
                            return (
                                <tr
                                    key={user.id}
                                    onClick={() => openDrawer(user.id)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td>
                                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 text-gray-700">{formatRole(user.role)}</td>
                                    <td className="px-6 py-4 text-gray-500">{user.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[status]}`}>
                                            {status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && users.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {page * 10 + 1} to {Math.min((page + 1) * 10, totalElements)} of {totalElements.toLocaleString()} users
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => p - 1)}
                                disabled={page === 0}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map((i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`px-3 py-1.5 text-sm border rounded-lg ${
                                        page === i
                                            ? "bg-orange-500 text-white border-orange-500"
                                            : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            {totalPages > 5 && <span className="px-2 text-gray-400">...</span>}
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= totalPages - 1}
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UserDetailDrawer
                userId={selectedUserId}
                open={drawerOpen}
                onClose={closeDrawer}
                onUserUpdated={handleUserUpdated}
            />
        </div>
    );
}