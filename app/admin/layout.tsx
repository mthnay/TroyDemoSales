"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { LayoutDashboard, Users, Smartphone, ShoppingCart, LogOut, Home } from "lucide-react";
import styles from "./layout.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.push("/");
    }
  }, [user, role, loading, router]);

  if (loading || role !== "admin") return null;

  return (
    <div className={styles.adminContainer}>
      <aside className={`${styles.sidebar} glass-panel`}>
        <div className={styles.sidebarHeader}>
          <h2> Troy Admin</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={styles.navLink}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/users" className={styles.navLink}>
            <Users size={20} />
            <span>Kullanıcılar</span>
          </Link>
          <Link href="/admin/devices" className={styles.navLink}>
            <Smartphone size={20} />
            <span>Cihazlar</span>
          </Link>
          <Link href="/admin/requests" className={styles.navLink}>
            <ShoppingCart size={20} />
            <span>Talepler</span>
          </Link>
          <div style={{ height: "1px", background: "rgba(0,0,0,0.05)", margin: "10px 0" }}></div>
          <Link href="/" className={styles.navLink}>
            <Home size={20} />
            <span>Kataloğa Dön</span>
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={logout} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <div style={{ marginLeft: "40px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
