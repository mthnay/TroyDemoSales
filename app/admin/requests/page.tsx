"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

interface RequestData {
  id: string;
  deviceId: string;
  deviceName: string;
  devicePrice: number;
  userId: string;
  userEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: RequestData[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as RequestData);
      });
      setRequests(list);
    } catch (error) {
      console.error("Hata", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, deviceId: string, newStatus: "approved" | "rejected") => {
    if (!confirm(`Bu talebi ${newStatus === "approved" ? "onaylamak" : "reddetmek"} istediğinize emin misiniz?`)) return;
    try {
      await updateDoc(doc(db, "requests", id), { status: newStatus });
      
      // Talebi reddederse stoğu geri ekle
      if (newStatus === "rejected") {
        await updateDoc(doc(db, "devices", deviceId), {
          stock: increment(1)
        });
      }

      fetchRequests();
    } catch (error) {
      alert("Hata oluştu.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>Cihaz Talepleri</h1>
      
      <div className="glass-panel" style={{ padding: "24px" }}>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : requests.length === 0 ? (
          <p>Henüz hiçbir talep bulunmuyor.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {requests.map((req) => (
              <div key={req.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(0,0,0,0.02)", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>{req.deviceName}</h3>
                  <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>Talep Eden: {req.userEmail} | Tarih: {new Date(req.createdAt).toLocaleDateString("tr-TR")}</div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--primary)" }}>{req.devicePrice.toLocaleString("tr-TR")} ₺</div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {req.status === "pending" && (
                    <span style={{ padding: "4px 10px", background: "rgba(255, 149, 0, 0.1)", color: "var(--warning)", borderRadius: "8px", fontSize: "12px", fontWeight: 600 }}>Bekliyor</span>
                  )}
                  {req.status === "approved" && (
                    <span style={{ padding: "4px 10px", background: "rgba(52, 199, 89, 0.1)", color: "var(--success)", borderRadius: "8px", fontSize: "12px", fontWeight: 600 }}>Onaylandı</span>
                  )}
                  {req.status === "rejected" && (
                    <span style={{ padding: "4px 10px", background: "rgba(255, 59, 48, 0.1)", color: "var(--danger)", borderRadius: "8px", fontSize: "12px", fontWeight: 600 }}>Reddedildi</span>
                  )}

                  {req.status === "pending" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => handleUpdateStatus(req.id, req.deviceId, "approved")}
                        style={{ padding: "8px 16px", background: "var(--success)", color: "white", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}
                      >
                        Onayla
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(req.id, req.deviceId, "rejected")}
                        style={{ padding: "8px 16px", background: "rgba(255,59,48,0.1)", color: "var(--danger)", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
