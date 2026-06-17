"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ devices: 0, pendingRequests: 0, users: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [devicesSnap, pendingSnap, usersSnap, recentSnap] = await Promise.all([
          getDocs(collection(db, "devices")),
          getDocs(query(collection(db, "requests"), where("status", "==", "pending"))),
          getDocs(collection(db, "users")),
          getDocs(query(collection(db, "requests"), orderBy("createdAt", "desc"), limit(5)))
        ]);

        setStats({
          devices: devicesSnap.size,
          pendingRequests: pendingSnap.size,
          users: usersSnap.size
        });

        const recentList: any[] = [];
        recentSnap.forEach((doc) => recentList.push({ id: doc.id, ...doc.data() }));
        setRecentRequests(recentList);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: "40px", color: "#666" }}>Yükleniyor...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>Genel Bakış</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>Toplam Cihaz</h3>
          <p style={{ fontSize: "32px", fontWeight: 700 }}>{stats.devices}</p>
        </div>
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>Bekleyen Talepler</h3>
          <p style={{ fontSize: "32px", fontWeight: 700, color: stats.pendingRequests > 0 ? "var(--warning)" : "inherit" }}>
            {stats.pendingRequests}
          </p>
        </div>
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>Personel Sayısı</h3>
          <p style={{ fontSize: "32px", fontWeight: 700 }}>{stats.users}</p>
        </div>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>Son Talepler</h2>
      <div className="glass-panel" style={{ padding: "24px" }}>
        {recentRequests.length === 0 ? (
          <p style={{ color: "#666" }}>Henüz talep yok.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentRequests.map(req => (
              <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(0,0,0,0.02)", borderRadius: "12px" }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: "15px" }}>{req.deviceName}</h4>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>{req.userEmail}</div>
                </div>
                <div>
                  {req.status === "pending" && <span style={{ fontSize: "12px", background: "rgba(255, 149, 0, 0.1)", color: "var(--warning)", padding: "4px 10px", borderRadius: "8px", fontWeight: 600 }}>Bekliyor</span>}
                  {req.status === "approved" && <span style={{ fontSize: "12px", background: "rgba(52, 199, 89, 0.1)", color: "var(--success)", padding: "4px 10px", borderRadius: "8px", fontWeight: 600 }}>Onaylandı</span>}
                  {req.status === "rejected" && <span style={{ fontSize: "12px", background: "rgba(255, 59, 48, 0.1)", color: "var(--danger)", padding: "4px 10px", borderRadius: "8px", fontWeight: 600 }}>Reddedildi</span>}
                </div>
              </div>
            ))}
            <Link href="/admin/requests" style={{ marginTop: "12px", textAlign: "center", fontSize: "14px", color: "var(--primary)", fontWeight: 500 }}>
              Tüm Talepleri Gör →
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
