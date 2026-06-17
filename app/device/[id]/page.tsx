"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DeviceDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [device, setDevice] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDevice = async () => {
      if (!params.id) return;
      try {
        const docRef = doc(db, "devices", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDevice({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Hata", error);
      } finally {
        setFetching(false);
      }
    };
    if (user) fetchDevice();
  }, [params.id, user]);

  const handleRequest = async () => {
    if (device.stock <= 0) {
      alert("Bu ürün maalesef tükendi.");
      return;
    }
    if (!confirm("Bu cihaz için satın alma talebi oluşturmak istediğinize emin misiniz?")) return;
    
    setRequesting(true);
    try {
      // 1. Stoğu 1 düşür
      await updateDoc(doc(db, "devices", device.id), {
        stock: increment(-1)
      });

      // 2. Talebi oluştur
      await addDoc(collection(db, "requests"), {
        deviceId: device.id,
        deviceName: device.name,
        devicePrice: device.price,
        userId: user!.uid,
        userEmail: user!.email,
        status: "pending", // pending, approved, rejected
        createdAt: new Date().toISOString()
      });

      // Local state güncelle
      setDevice({ ...device, stock: device.stock - 1 });
      setMessage("Talebiniz başarıyla oluşturuldu! Yöneticiler en kısa sürede dönüş yapacaktır.");
    } catch (error) {
      setMessage("Hata: Talep oluşturulamadı.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading || fetching) return <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Yükleniyor...</div>;
  if (!device) return <div style={{ padding: 40, textAlign: "center" }}>Cihaz bulunamadı.</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#666", marginBottom: "30px", fontWeight: 500 }}>
        <ArrowLeft size={20} /> Kataloğa Dön
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel"
        style={{ display: "flex", flexWrap: "wrap", overflow: "hidden" }}
      >
        <div style={{ flex: "1 1 400px", background: "white", position: "relative", minHeight: "400px" }}>
          <Image src={device.imageUrl} alt={device.name} fill style={{ objectFit: "contain", padding: "40px" }} />
        </div>
        
        <div style={{ flex: "1 1 400px", padding: "40px", display: "flex", flexDirection: "column" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px", letterSpacing: "-0.5px" }}>{device.name}</h1>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--foreground)", marginBottom: "30px" }}>
            {device.price.toLocaleString("tr-TR")} ₺
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "10px" }}>
              <span style={{ color: "#666" }}>Kategori</span>
              <span style={{ fontWeight: 600 }}>{device.category}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "10px" }}>
              <span style={{ color: "#666" }}>Stok Durumu</span>
              <span style={{ fontWeight: 600, color: device.stock <= 0 ? "var(--danger)" : "inherit" }}>
                {device.stock > 0 ? `${device.stock} Adet` : "Tükendi"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "10px" }}>
              <span style={{ color: "#666" }}>Kozmetik Durumu</span>
              <span style={{ fontWeight: 600 }}>Grade {device.grade}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "10px" }}>
              <span style={{ color: "#666" }}>Pil Sağlığı</span>
              <span style={{ fontWeight: 600 }}>%{device.batteryHealth}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "10px" }}>
              <span style={{ color: "#666" }}>Garanti</span>
              <span style={{ fontWeight: 600 }}>{device.warranty}</span>
            </div>
            
            {device.description && (
              <div style={{ marginTop: "10px" }}>
                <span style={{ color: "#666", display: "block", marginBottom: "8px" }}>Açıklama</span>
                <p style={{ fontSize: "14px", lineHeight: 1.6 }}>{device.description}</p>
              </div>
            )}
          </div>

          {message ? (
            <div style={{ padding: "16px", background: message.startsWith("Hata") ? "rgba(255,59,48,0.1)" : "rgba(52,199,89,0.1)", color: message.startsWith("Hata") ? "var(--danger)" : "var(--success)", borderRadius: "12px", textAlign: "center", fontWeight: 500 }}>
              {message}
            </div>
          ) : (
            <button 
              className="btn-primary" 
              style={{ 
                width: "100%", 
                padding: "16px", 
                fontSize: "16px", 
                marginTop: "auto", 
                background: device.stock <= 0 ? "rgba(0,0,0,0.05)" : "", 
                color: device.stock <= 0 ? "#999" : "", 
                cursor: device.stock <= 0 ? "not-allowed" : "pointer" 
              }}
              onClick={handleRequest}
              disabled={requesting || device.stock <= 0}
            >
              {device.stock <= 0 ? "Tükendi" : requesting ? "Talep İletiliyor..." : "Satın Alma Talebi Oluştur"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
