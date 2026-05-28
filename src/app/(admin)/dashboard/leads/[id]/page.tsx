"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";

interface AcceptedQuote {
    quoteId: number;
    price: number;
    message: string;
    shopName: string;
}

interface LeadDetail {
    id: number;
    title: string;
    description: string;
    status: "OPEN" | "CLOSED" | "CANCELLED";
    createdAt: string;
    carMake: string;
    carModel: string;
    carYear: number;
    address: string;
    customerName: string;
    imageUrls: string[];
    acceptedQuote: AcceptedQuote | null;
}

const STATUS_STYLES: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-800",
    CLOSED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
    OPEN: "Open",
    CLOSED: "Completed",
    CANCELLED: "Cancelled",
};

export default function LeadDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [lead, setLead] = useState<LeadDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const res = await axios.get(`/admin/leads/${id}`);
                setLead(res.data);
            } catch (err: any) {
                setError("Failed to load lead details.");
            } finally {
                setLoading(false);
            }
        };

        fetchLead();
    }, [id]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !lead) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-red-500 text-sm">{error ?? "Lead not found."}</p>
                <button
                    onClick={() => router.back()}
                    className="text-sm text-orange-600 hover:underline"
                >
                    ← Go back
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Go back"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Lead #LD-{lead.id}
                        </h1>
                        <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[lead.status]}`}
                        >
              {STATUS_LABELS[lead.status]}
            </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Created on {formatDate(lead.createdAt)}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Column */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                    {/* Issue Description */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="mt-0.5 w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-orange-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-sm font-semibold text-gray-900">
                                Full Issue Description
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {lead.description}
                        </p>
                    </div>

                    {/* Lead Photos */}
                    {lead.imageUrls.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Lead Photos
                                </h2>
                                <span className="text-xs text-gray-400">
                  {lead.imageUrls.length}{" "}
                                    {lead.imageUrls.length === 1 ? "Photo" : "Photos"} attached
                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {lead.imageUrls.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(url)}
                                        className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-orange-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    >
                                        <img
                                            src={url}
                                            alt={`Lead photo ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-5">
                    {/* Lead Details */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">
                            Lead Details
                        </h2>

                        {/* Vehicle */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="mt-0.5 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-8 h-8"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                >
                                    <path
                                        d="M0 10C0 4.47715 4.47715 0 10 0H22C27.5228 0 32 4.47715 32 10V22C32 27.5228 27.5228 32 22 32H10C4.47715 32 0 27.5228 0 22V10Z"
                                        fill="#F9FAFB"
                                    />

                                    <path
                                        d="M20.6668 19.3332H22.0002C22.4002 19.3332 22.6668 19.0665 22.6668 18.6665V16.6665C22.6668 16.0665 22.2002 15.5332 21.6668 15.3998C20.4668 15.0665 18.6668 14.6665 18.6668 14.6665C18.6668 14.6665 17.8002 13.7332 17.2002 13.1332C16.8668 12.8665 16.4668 12.6665 16.0002 12.6665H11.3335C10.9335 12.6665 10.6002 12.9332 10.4002 13.2665L9.46683 15.1998C9.37855 15.4573 9.3335 15.7276 9.3335 15.9998V18.6665C9.3335 19.0665 9.60016 19.3332 10.0002 19.3332H11.3335"
                                        stroke="#6A7282"
                                        strokeWidth="1.33333"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    <path
                                        d="M12.6668 20.6667C13.4032 20.6667 14.0002 20.0697 14.0002 19.3333C14.0002 18.597 13.4032 18 12.6668 18C11.9304 18 11.3335 18.597 11.3335 19.3333C11.3335 20.0697 11.9304 20.6667 12.6668 20.6667Z"
                                        stroke="#6A7282"
                                        strokeWidth="1.33333"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    <path
                                        d="M14 19.3335H18"
                                        stroke="#6A7282"
                                        strokeWidth="1.33333"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    <path
                                        d="M19.3333 20.6667C20.0697 20.6667 20.6667 20.0697 20.6667 19.3333C20.6667 18.597 20.0697 18 19.3333 18C18.597 18 18 18.597 18 19.3333C18 20.0697 18.597 20.6667 19.3333 20.6667Z"
                                        stroke="#6A7282"
                                        strokeWidth="1.33333"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                                    Vehicle
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {lead.carYear} {lead.carMake} {lead.carModel}
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-3" />

                        {/* Location */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="mt-0.5 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                                    Location
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {lead.address}
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-3" />

                        {/* Customer */}
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                                    Customer
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {lead.customerName}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Accepted Quote */}
                    {lead.acceptedQuote ? (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden">
                            <div className="bg-orange-500 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Selected Offer
                </span>
                                <span className="text-xs text-orange-100">
                  #OFF-{lead.acceptedQuote.quoteId}
                </span>
                            </div>
                            <div className="p-4">
                                <p className="text-sm font-semibold text-gray-900 mb-3">
                                    {lead.acceptedQuote.shopName}
                                </p>
                                <div className="border-t border-orange-200 pt-3">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                        Est. Cost
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        PKR {lead.acceptedQuote.price.toLocaleString()}
                                    </p>
                                </div>
                                {lead.acceptedQuote.message && (
                                    <div className="mt-3 border-t border-orange-200 pt-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                            Message
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {lead.acceptedQuote.message}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                            <p className="text-sm text-gray-400">No offer selected yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                        onClick={() => setSelectedImage(null)}
                        aria-label="Close image"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    <img
                        src={selectedImage}
                        alt="Lead photo enlarged"
                        className="max-w-full max-h-[90vh] rounded-xl object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}