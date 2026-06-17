"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyRequests() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "requests"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Sort in memory because Firestore requires index for where + orderBy
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequests(list);
      } catch (error) {
        console.error("Hata", error);
      } finally {
        setFetching(false);
      }
    };
    fetchRequests();
  }, [user]);

  if (loading || fetching) return <div style={{ padding: 40, textAlign: "center" }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#666", marginBottom: "30px", fontWeight: 500 }}>
        <ArrowLeft size={20} /> Kataloğa Dön
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "24px", letterSpacing: "-0.5px" }}>Taleplerim</h1>
        
        <div className="glass-panel" style={{ padding: "24px" }}>
          {requests.length === 0 ? (
            <p style={{ color: "#666" }}>Henüz bir satın alma talebiniz bulunmuyor.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {requests.map((req) => (
                <div key={req.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{req.deviceName}</h3>
                    <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Tarih: {new Date(req.createdAt).toLocaleDateString("tr-TR")}</div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--primary)" }}>{req.devicePrice.toLocaleString("tr-TR")} ₺</div>
                  </div>
                  
                  <div>
                    {req.status === "pending" && (
                      <span style={{ padding: "6px 12px", background: "rgba(255, 149, 0, 0.1)", color: "var(--warning)", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>Cevap Bekleniyor</span>
                    )}
                    {req.status === "approved" && (
                      <span style={{ padding: "6px 12px", background: "rgba(52, 199, 89, 0.1)", color: "var(--success)", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>Onaylandı</span>
                    )}
                    {req.status === "rejected" && (
                      <span style={{ padding: "6px 12px", background: "rgba(255, 59, 48, 0.1)", color: "var(--danger)", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>Reddedildi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
