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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminLeadResponseDto {
    id: number;
    title: string;
    carMake: string;
    carModel: string;
    carYear: number;
    address: string;
    status: string;
    ownerName: string;
    ownerEmail: string;
    createdAt: string;
    expiresAt: string;
    imageCount: number;
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        OPEN: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
        CLOSED: "bg-blue-100 text-blue-800",
    };
    return (
        <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                styles[status] ?? "bg-gray-100 text-gray-800"
            }`}
        >
      {status}
    </span>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function LeadsClient() {
    const [leads, setLeads] = useState<AdminLeadResponseDto[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    size: "10",
                });
                if (statusFilter) params.append("status", statusFilter);

                const res = await fetch(`/api/admin/leads?${params.toString()}`);
                const data = await res.json();

                if (!cancelled) {
                    setLeads(data.content ?? []);
                    setTotalPages(data.totalPages ?? 0);
                }
            } catch (err) {
                console.error("Failed to fetch leads", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [page, statusFilter]);

    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        setPage(0);
    };

    const statusOptions = [
        { label: "All", value: "" },
        { label: "Open", value: "OPEN" },
        { label: "Cancelled", value: "CANCELLED" },
    ];

    return (
        <div className="space-y-4">
            {/* Filter Row */}
            <div className="flex gap-2">
                {statusOptions.map((opt) => (
                    <Button
                        key={opt.value}
                        variant={statusFilter === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStatusChange(opt.value)}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Car</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Images</TableHead>
                            <TableHead>Posted</TableHead>
                            <TableHead>Expires</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : leads.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center text-muted-foreground py-10"
                                >
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium max-w-[160px] truncate">
                                        {lead.title}
                                    </TableCell>
                                    <TableCell>
                                        {lead.carMake} {lead.carModel} ({lead.carYear})
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium">{lead.ownerName}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {lead.ownerEmail}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[160px] truncate text-sm">
                                        {lead.address}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={lead.status} />
                                    </TableCell>
                                    <TableCell className="text-center">{lead.imageCount}</TableCell>
                                    <TableCell className="text-sm whitespace-nowrap">
                                        {formatDate(lead.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-sm whitespace-nowrap">
                                        {formatDate(lead.expiresAt)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages === 0 ? 1 : totalPages}
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page === 0}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= totalPages - 1 || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>
            </div>

        </div>
    );
}