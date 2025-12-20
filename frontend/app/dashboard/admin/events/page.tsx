"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { eventApi } from "@/lib/api";
import { ArrowLeft, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "sonner";

export default function AdminEventsPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

    // Modal states
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [approveReason, setApproveReason] = useState("");

    useEffect(() => {
        const t = localStorage.getItem("accessToken");
        if (t) setToken(t);
        else router.push("/login");
    }, [router]);

    const loadEvents = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await eventApi.getAdminEvents(token, activeTab === "PENDING" ? "PENDING_APPROVAL" : activeTab);
            setEvents((res as any)?.data || []);
        } catch (err) {
            console.error("Failed to load events", err);
            toast.error("Không thể tải danh sách sự kiện");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [token, activeTab]);

    const handleApprove = async () => {
        if (!selectedEventId || !token) return;
        try {
            await eventApi.approveEvent(selectedEventId, token, approveReason);
            setEvents((prev) => prev.filter((e) => e.id !== selectedEventId));
            toast.success("Đã duyệt sự kiện thành công");
            setIsApproveModalOpen(false);
            setApproveReason("");
        } catch (err) {
            console.error(err);
            toast.error("Duyệt sự kiện thất bại");
        }
    };

    const handleReject = async () => {
        if (!selectedEventId || !token) return;
        if (!rejectReason) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }
        try {
            await eventApi.rejectEvent(selectedEventId, token, rejectReason);
            setEvents((prev) => prev.filter((e) => e.id !== selectedEventId));
            toast.success("Đã từ chối sự kiện");
            setIsRejectModalOpen(false);
            setRejectReason("");
        } catch (err) {
            console.error(err);
            toast.error("Từ chối sự kiện thất bại");
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-neutral-50 py-12">
                <div className="container-custom">
                    <Toaster position="top-center" />
                    <div className="mb-8">
                        <Link
                            href="/dashboard/admin"
                            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Quay lại Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold">Quản lý duyệt sự kiện</h1>
                    </div>

                    <div className="flex gap-4 mb-6 border-b">
                        <button
                            className={`py-2 px-4 border-b-2 transition-colors ${activeTab === 'PENDING' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('PENDING')}
                        >
                            Chờ duyệt
                        </button>
                        <button
                            className={`py-2 px-4 border-b-2 transition-colors ${activeTab === 'APPROVED' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('APPROVED')}
                        >
                            Đã duyệt
                        </button>
                        <button
                            className={`py-2 px-4 border-b-2 transition-colors ${activeTab === 'REJECTED' ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('REJECTED')}
                        >
                            Đã từ chối
                        </button>
                    </div>

                    <div className="card-base p-6">
                        {loading ? (
                            <p className="text-muted text-center py-8">Đang tải...</p>
                        ) : events.length === 0 ? (
                            <p className="text-muted text-center py-8">Không có sự kiện nào trong danh sách này.</p>
                        ) : (
                            <div className="space-y-4">
                                {events.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:bg-neutral-50"
                                    >
                                        <img
                                            src={event.thumbnailUrl || "/placeholder.svg"}
                                            alt={event.title}
                                            className="w-full md:w-48 h-32 object-cover rounded-md"
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                                <div className="flex gap-2">
                                                    <Link href={`/events/${event.id}`} target="_blank">
                                                        <Button variant="outline" size="sm">
                                                            <Eye size={16} className="mr-2" /> Chi tiết
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground text-sm mb-1">
                                                Người tạo: {event.creator?.firstName} {event.creator?.lastName} ({event.creator?.email})
                                            </p>
                                            <p className="text-muted-foreground text-sm mb-1">
                                                Địa điểm: {event.location}
                                            </p>
                                            <p className="text-muted-foreground text-sm mb-3">
                                                Thời gian: {new Date(event.startDate).toLocaleString('vi-VN')}
                                            </p>

                                            {activeTab === 'PENDING' && (
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => {
                                                            setSelectedEventId(event.id);
                                                            setIsApproveModalOpen(true);
                                                        }}
                                                    >
                                                        <Check size={16} className="mr-2" /> Duyệt
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setSelectedEventId(event.id);
                                                            setIsRejectModalOpen(true);
                                                        }}
                                                    >
                                                        <X size={16} className="mr-2" /> Từ chối
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Approve Modal */}
            <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Duyệt sự kiện</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn duyệt sự kiện này không?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-semibold mb-2 block">Ghi chú (tùy chọn):</label>
                        <Textarea
                            value={approveReason}
                            onChange={(e) => setApproveReason(e.target.value)}
                            placeholder="Nhập ghi chú cho người tổ chức..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsApproveModalOpen(false)}>Hủy</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>Xác nhận Duyệt</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối sự kiện</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập lý do từ chối sự kiện này.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm font-semibold mb-2 block">Lý do từ chối:</label>
                        <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do..."
                            className={!rejectReason ? "border-red-300 focus-visible:ring-red-300" : ""}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleReject}>Xác nhận Từ chối</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </>
    );
}
