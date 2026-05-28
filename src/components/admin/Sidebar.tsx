"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, ChevronRight } from "lucide-react";
import {
    DashboardIcon,
    ShopVerificationIcon,
    UsersIcon,
    LeadsIcon,
    PaymentsIcon,
    DisputesIcon,
    AnalyticsIcon,
} from "@/components/admin/Icons";
import LogoutButton from "@/components/admin/LogoutButton";

const navLinks = [
    { label: "Dashboard",         href: "/dashboard",            icon: DashboardIcon },
    { label: "Shop Verification", href: "/dashboard/shops",      icon: ShopVerificationIcon },
    { label: "Users",             href: "/dashboard/users",      icon: UsersIcon },
    { label: "Leads",             href: "/dashboard/leads",      icon: LeadsIcon },
    { label: "Payments",          href: "/dashboard/payments",   icon: PaymentsIcon },
    { label: "Disputes",          href: "/dashboard/disputes",   icon: DisputesIcon },
    { label: "Analytics",         href: "/dashboard/analytics",  icon: AnalyticsIcon },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="h-screen w-[260px] bg-[#fcfcfc] border-r border-gray-100 flex flex-col fixed left-0 top-0 font-sans select-none z-40">

            {/* Logo Section */}
            <div className="p-6 mb-4 flex items-center gap-3">
                <div className="bg-[#f97316] p-2 rounded-lg shadow-sm">
                    <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">
                    Repairo
                </h1>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                                isActive
                                    ? "bg-[rgba(255,243,240,1)] text-[#f97316]"
                                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                        >
                            <Icon className="w-[18px] h-[18px]" />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Admin User Profile Footer Section */}
            <div className="p-4 border-t border-gray-100 bg-[#fcfcfc] relative" ref={dropdownRef}>

                {isDropdownOpen && (
                    <div className="absolute bottom-[80px] left-4 right-4 bg-white border border-gray-100 rounded-xl shadow-lg p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                        <LogoutButton />
                    </div>
                )}

                {/* Clickable Profile Card */}
                <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer group ${
                        isDropdownOpen ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-gray-200">
                            <span className="text-white text-xs font-bold">ADM</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[14px] font-bold text-gray-800 leading-tight">
                                Admin User
                            </span>
                            <span className="text-[11px] font-medium text-gray-400">
                                admin@repairo.com
                            </span>
                        </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-90 text-gray-700" : "text-gray-400 group-hover:text-gray-600"
                    }`} />
                </div>

            </div>
        </div>
    );
}