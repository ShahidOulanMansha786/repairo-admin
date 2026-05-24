import LeadsClient from "@/components/admin/LeadsClient";

export default function LeadsPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Lead Management</h1>
            <LeadsClient />
        </div>
    );
}