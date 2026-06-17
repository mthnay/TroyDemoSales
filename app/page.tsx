"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { Settings } from "lucide-react";

interface DeviceData {
  id: string;
  name: string;
  price: number;
  batteryHealth: number;
  grade: "A" | "B" | "C";
  warranty: string;
  category: string;
  stock: number;
  description: string;
  imageUrl: string;
}

export default function Home() {
  const { user, loading, role, logout } = useAuth();
  const router = useRouter();
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const categories = ["Tümü", "iPhone", "iPad", "Mac", "Apple Watch", "AirPods", "Aksesuar"];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "devices"));
        const list: DeviceData[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as DeviceData);
        });
        setDevices(list);
      } catch (error) {
        console.error("Error fetching devices", error);
      } finally {
        setFetching(false);
      }
    };

    if (user) {
      fetchDevices();
    }
  }, [user]);

  if (loading || !user) return <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Yükleniyor...</div>;

  const filteredDevices = devices.filter(d => selectedCategory === "Tümü" || d.category === selectedCategory);

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px" }}> Troy Demo Cihazları</h1>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "14px", color: "#666", display: "none" }}>
            {user.email}
          </span>
          {role === "admin" && (
            <Link href="/admin" className="btn-primary" style={{ background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Settings size={16} /> Admin Paneli
            </Link>
          )}
          <Link href="/requests" className="btn-primary" style={{ background: "rgba(0,0,0,0.05)", color: "var(--foreground)", padding: "8px 16px", fontSize: "13px" }}>
            Taleplerim
          </Link>
          <button className="btn-primary" onClick={logout} style={{ padding: "8px 16px", fontSize: "13px", background: "rgba(255, 59, 48, 0.1)", color: "var(--danger)" }}>
            Çıkış Yap
          </button>
        </div>
      </header>

      {fetching ? (
        <div style={{ textAlign: "center", color: "#666", padding: "40px" }}>Cihazlar yükleniyor...</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "20px", marginBottom: "20px", scrollbarWidth: "none" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "20px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: selectedCategory === cat ? "var(--foreground)" : "rgba(0,0,0,0.05)",
                  color: selectedCategory === cat ? "var(--background)" : "var(--foreground)",
                  transition: "all 0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}
          >
            {filteredDevices.length === 0 ? (
              <div className="glass-panel" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 20px", color: "#666", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--foreground)", marginBottom: "8px" }}>Bu kategoride ürün bulunamadı</h2>
                <p style={{ fontSize: "15px", maxWidth: "400px", lineHeight: "1.5" }}>Şu anda <b>{selectedCategory}</b> kategorisinde stoğumuzda satılık demo cihaz bulunmamaktadır.</p>
                <button onClick={() => setSelectedCategory("Tümü")} className="btn-primary" style={{ marginTop: "24px", background: "rgba(0,0,0,0.05)", color: "var(--foreground)", padding: "10px 20px" }}>
                  Tüm Cihazları Göster
                </button>
              </div>
            ) : (
              filteredDevices.map((d) => (
                <div key={d.id} className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden", transition: "transform 0.2s", opacity: d.stock <= 0 ? 0.6 : 1 }}>
                  <div style={{ position: "relative", width: "100%", height: "220px", background: "#f5f5f7", overflow: "hidden" }}>
                    {d.stock <= 0 && (
                      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10, background: "rgba(255, 59, 48, 0.9)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                        Tükendi
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={
                        d.category === "iPhone" ? "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=500&q=80" :
                        d.category === "iPad" ? "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80" :
                        d.category === "Mac" ? "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80" :
                        d.category === "Apple Watch" ? "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=500&q=80" :
                        d.category === "AirPods" ? "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=500&q=80" :
                        "https://images.unsplash.com/photo-1588156979402-15f5a8cb5d94?auto=format&fit=crop&w=500&q=80"
                      } 
                      alt={d.category} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  </div>
                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{d.name}</h3>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--foreground)", marginBottom: "16px" }}>
                      {d.price.toLocaleString("tr-TR")} ₺
                    </div>
                    
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                      <span style={{ fontSize: "12px", padding: "4px 10px", background: "rgba(0,0,0,0.05)", borderRadius: "10px", fontWeight: 500 }}>🔋 %{d.batteryHealth} Pil</span>
                      <span style={{ fontSize: "12px", padding: "4px 10px", background: "rgba(0,0,0,0.05)", borderRadius: "10px", fontWeight: 500 }}>✨ Grade {d.grade}</span>
                      <span style={{ fontSize: "12px", padding: "4px 10px", background: "rgba(0,0,0,0.05)", borderRadius: "10px", fontWeight: 500 }}>🛡 {d.warranty}</span>
                      <span style={{ fontSize: "12px", padding: "4px 10px", background: "rgba(0,0,0,0.05)", borderRadius: "10px", fontWeight: 500 }}>📦 Stok: {d.stock || 0}</span>
                    </div>
                    
                    <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {d.description || "Ekstra açıklama yok."}
                    </p>

                    <Link href={`/device/${d.id}`} className="btn-primary" style={{ marginTop: "auto", textAlign: "center", display: "block" }}>
                      İncele ve Talep Et
                    </Link>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
