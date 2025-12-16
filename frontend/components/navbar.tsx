"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationPopover from "@/components/notification-popover";
import { userApi } from "@/lib/api";

type AppUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  avatarUrl?: string;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const at = localStorage.getItem("accessToken");
      const u = localStorage.getItem("user");
      if (u) setUser(JSON.parse(u));
      if (at) setAccessToken(at);
    } catch (_) {
      // ignore parsing errors
    } finally {
      setHydrated(true);
    }
  }, []);

  // Rehydrate token when storage changes or window gains focus (handles login in other tabs / same tab without reload)
  useEffect(() => {
    const syncToken = () => {
      try {
        const at = localStorage.getItem("accessToken");
        const u = localStorage.getItem("user");
        if (u) setUser(JSON.parse(u));
        setAccessToken(at);
      } catch (_) {
        // ignore
      }
    };
    window.addEventListener("storage", syncToken);
    window.addEventListener("focus", syncToken);
    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("focus", syncToken);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return;
      try {
        const res = await userApi.getProfile(accessToken);
        if (res?.data) {
          setUser(res.data as AppUser);
          try {
            localStorage.setItem("user", JSON.stringify(res.data));
          } catch (_) {
            // ignore storage write
          }
        }
      } catch (err) {
        console.error("Navbar: failed to load profile", err);
        // keep existing user if any
      }
    };
    fetchProfile();
  }, [accessToken]);

  const isAuthenticated = !!accessToken && !!user;

  const dashboardHref = useMemo(() => {
    const role = user?.role?.toLowerCase();
    if (!role) return "/dashboard/volunteer";
    if (["admin", "manager", "volunteer"].includes(role)) return `/dashboard/${role}`;
    return "/dashboard/volunteer";
  }, [user]);

  const displayName = useMemo(() => {
    if (!user) return "";
    const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
    return full || user.email || "";
  }, [user]);

  const initial = useMemo(() => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  }, [displayName, user]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } catch (_) {
      // ignore
    }
    setUser(null);
    setAccessToken(null);
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-2xl text-primary flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            VolunteerHub
          </Link>

          <div className="hidden md:flex gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition">
              Trang chủ
            </Link>
            <Link href="/events" className="text-foreground hover:text-primary transition">
              Sự kiện
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition">
              Liên hệ
            </Link>
          </div>

          <div className="hidden md:flex gap-3 items-center">
            {!hydrated ? null : isAuthenticated ? (
              <>
                <NotificationPopover />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:opacity-80 transition">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} alt={displayName} />
                        <AvatarFallback>{initial}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{displayName || "Tài khoản"}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={dashboardHref}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Hồ sơ</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/events">Sự kiện của tôi</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Đăng xuất</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90">Đăng ký</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? "✕" : "☰"}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/" className="block text-foreground hover:text-primary">
              Trang chủ
            </Link>
            <Link href="/events" className="block text-foreground hover:text-primary">
              Sự kiện
            </Link>
            <Link href="/contact" className="block text-foreground hover:text-primary">
              Liên hệ
            </Link>
            {hydrated ? (
              isAuthenticated ? (
                <>
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} alt={displayName} />
                          <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{displayName || "Tài khoản"}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <NotificationPopover />
                    </div>
                  </div>
                  <Link href={dashboardHref} className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/profile" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Hồ sơ
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full bg-transparent">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90">Đăng ký</Button>
                  </Link>
                </>
              )
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}
