import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";

const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Users", href: "/dashboard/users" },
    { label: "Leads", href: "/dashboard/leads" },
    { label: "Shops", href: "/dashboard/shops" },
    { label: "Disputes", href: "/dashboard/disputes" },
    { label: "Plans", href: "/dashboard/plans" },
    { label: "Notifications", href: "/dashboard/notifications" },
];

export default function Sidebar() {
    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0">

            <div className="p-6 border-b border-gray-700">
                <h1 className="text-xl font-bold">Car Repair Admin</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-700">
                <LogoutButton />
            </div>

        </div>
    );
}