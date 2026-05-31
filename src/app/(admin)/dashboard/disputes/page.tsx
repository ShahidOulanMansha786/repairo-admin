"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

interface Dispute {
    id: number;
    leadId: number;
    carOwnerId: number;
    repairShopId: number;
    reason: string;
    status: string;
    resolution: string | null;
    adminNote: string | null;
    imageUrls: string | null;
    createdAt: string;
    resolvedAt: string | null;
}

export default function DisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selected, setSelected] = useState<Dispute | null>(null);
    const [adminNote, setAdminNote] = useState("");
    const [resolving, setResolving] = useState(false);

    const fetchDisputes = async (p = 0) => {
        setLoading(true);
        try {
            const res = await axios.get(`/admin/disputes?page=${p}&size=10`);
            setDisputes(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDisputes(page); }, [page]);

    const resolve = async (resolution: string) => {
        if (!selected) return;
        setResolving(true);
        try {
            await axios.post(`/admin/disputes/${selected.id}/resolve`, {
                resolution,
                adminNote
            });
            setSelected(null);
            setAdminNote("");
            fetchDisputes(page);
        } catch (e) {
            console.error(e);
        } finally {
            setResolving(false);
        }
    };

    const statusBadge = (status: string) => {
        const colors: Record<string, string> = {
            OPEN: "bg-yellow-100 text-yellow-800",
            RESOLVED: "bg-green-100 text-green-800"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Disputes</h1>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading...</div>
            ) : disputes.length === 0 ? (
                <div className="text-center py-20 text-gray-400">No disputes found</div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Lead ID</th>
                            <th className="px-4 py-3 text-left">Reason</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Created</th>
                            <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {disputes.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-mono">#{d.id}</td>
                                <td className="px-4 py-3 font-mono">#{d.leadId}</td>
                                <td className="px-4 py-3 max-w-xs truncate">{d.reason}</td>
                                <td className="px-4 py-3">{statusBadge(d.status)}</td>
                                <td className="px-4 py-3 text-gray-400">{d.createdAt?.slice(0, 10)}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => { setSelected(d); setAdminNote(d.adminNote || ""); }}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-500">
                        <span>Page {page + 1} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-3 py-1 rounded border disabled:opacity-40"
                            >Prev</button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-3 py-1 rounded border disabled:opacity-40"
                            >Next</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Drawer */}
            {selected && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40" onClick={() => setSelected(null)} />
                    <div className="w-full max-w-md bg-white shadow-xl flex flex-col overflow-y-auto">
                        <div className="p-6 border-b flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold">Dispute #{selected.id}</h2>
                                <p className="text-sm text-gray-400">Lead #{selected.leadId}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>

                        <div className="p-6 flex flex-col gap-5 flex-1">
                            {/* Status */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Status:</span>
                                {statusBadge(selected.status)}
                                {selected.resolution && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                        {selected.resolution}
                                    </span>
                                )}
                            </div>

                            {/* Reason */}
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Reason</p>
                                <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{selected.reason}</p>
                            </div>

                            {/* Images */}
                            {selected.imageUrls && selected.imageUrls.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Evidence Photos</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selected.imageUrls.split(",").filter(Boolean).map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noreferrer">
                                                <img src={url} alt={`evidence-${i}`} className="w-20 h-20 object-cover rounded-lg border" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dates */}
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>Created: {selected.createdAt?.slice(0, 16).replace("T", " ")}</p>
                                {selected.resolvedAt && (
                                    <p>Resolved: {selected.resolvedAt?.slice(0, 16).replace("T", " ")}</p>
                                )}
                            </div>

                            {/* Admin Note */}
                            {selected.status === "OPEN" && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Admin Note</p>
                                    <textarea
                                        value={adminNote}
                                        onChange={e => setAdminNote(e.target.value)}
                                        rows={3}
                                        placeholder="Add a note about this resolution..."
                                        className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {selected.adminNote && selected.status === "RESOLVED" && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Admin Note</p>
                                    <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{selected.adminNote}</p>
                                </div>
                            )}
                        </div>

                        {/* Resolve Buttons */}
                        {selected.status === "OPEN" && (
                            <div className="p-6 border-t flex flex-col gap-3">
                                <button
                                    onClick={() => resolve("RELEASED_TO_SHOP")}
                                    disabled={resolving}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
                                >
                                    {resolving ? "Processing..." : "Release to Shop"}
                                </button>
                                <button
                                    onClick={() => resolve("RETURNED_TO_OWNER")}
                                    disabled={resolving}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
                                >
                                    {resolving ? "Processing..." : "Return to Owner"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}