"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import Image from "next/image";

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
  createdAt: string;
}

export default function DevicesManagement() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [batteryHealth, setBatteryHealth] = useState("");
  const [grade, setGrade] = useState<"A" | "B" | "C">("A");
  const [warranty, setWarranty] = useState("Devam Ediyor");
  const [category, setCategory] = useState("iPhone");
  const [stock, setStock] = useState("1");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchDevices = async () => {
    const querySnapshot = await getDocs(collection(db, "devices"));
    const list: DeviceData[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as DeviceData);
    });
    setDevices(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600; // Small width to ensure under 1MB Firestore limit
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.6); // 60% quality
            resolve(dataUrl);
          } else {
            reject(new Error("Canvas context bulunamadı."));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage("Hata: Lütfen bir fotoğraf seçin.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      // 1. Sıkıştır ve Base64'e çevir
      const base64Image = await compressImage(imageFile);

      // 2. Doğrudan Firestore'a kaydet (Storage kullanmadan)
      await addDoc(collection(db, "devices"), {
        name,
        price: Number(price),
        batteryHealth: Number(batteryHealth),
        grade,
        warranty,
        category,
        stock: Number(stock),
        description,
        imageUrl: base64Image,
        createdAt: new Date().toISOString()
      });

      setMessage("Cihaz başarıyla eklendi.");
      // Reset form
      setName("");
      setPrice("");
      setBatteryHealth("");
      setGrade("A");
      setWarranty("Devam Ediyor");
      setCategory("iPhone");
      setStock("1");
      setDescription("");
      setImageFile(null);
      
      fetchDevices();
    } catch (error: any) {
      setMessage("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu cihazı silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "devices", id));
        fetchDevices();
      } catch (error) {
        alert("Silinirken hata oluştu.");
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>Cihaz Yönetimi</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
        {/* Form */}
        <div className="glass-panel" style={{ padding: "24px", height: "fit-content" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>Yeni Cihaz Ekle</h2>
          <form onSubmit={handleAddDevice} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {message && (
              <div style={{ 
                padding: "10px", 
                borderRadius: "8px", 
                fontSize: "14px",
                background: message.startsWith("Hata") ? "rgba(255, 59, 48, 0.1)" : "rgba(52, 199, 89, 0.1)",
                color: message.startsWith("Hata") ? "var(--danger)" : "var(--success)"
              }}>
                {message}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Fotoğraf</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                required
                style={{ fontSize: "14px" }}
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Cihaz Adı (Model)</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: iPhone 14 Pro Max 256GB"
                required
                className="input-base"
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
                  <option value="iPhone">iPhone</option>
                  <option value="iPad">iPad</option>
                  <option value="Mac">Mac</option>
                  <option value="Apple Watch">Apple Watch</option>
                  <option value="AirPods">AirPods</option>
                  <option value="Aksesuar">Aksesuar</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Stok Adedi</label>
                <input 
                  type="number" 
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="1"
                  min="0"
                  required
                  className="input-base"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Fiyat (₺)</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="input-base"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Pil Sağlığı (%)</label>
                <input 
                  type="number" 
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(e.target.value)}
                  placeholder="100"
                  max="100"
                  min="0"
                  required
                  className="input-base"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Kozmetik Grade</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value as any)} className="input-base">
                  <option value="A">Grade A (Kusursuz)</option>
                  <option value="B">Grade B (Hafif Çizik)</option>
                  <option value="C">Grade C (Görünür Hasar)</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <label style={{ fontSize: "13px", fontWeight: 500 }}>Garanti</label>
                <select value={warranty} onChange={(e) => setWarranty(e.target.value)} className="input-base">
                  <option value="Devam Ediyor">Devam Ediyor</option>
                  <option value="Sona Erdi">Sona Erdi</option>
                  <option value="AppleCare+">AppleCare+</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Açıklama (Opsiyonel)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ekstra detaylar..."
                rows={3}
                className="input-base"
                style={{ resize: "none" }}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "10px" }}>
              {loading ? "Yükleniyor..." : "Cihazı Ekle"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>Eklenen Cihazlar</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
            {devices.map((d) => (
              <div key={d.id} style={{ background: "rgba(255,255,255,0.5)", borderRadius: "14px", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", width: "100%", height: "150px", background: "white" }}>
                  <Image src={d.imageUrl} alt={d.name} fill style={{ objectFit: "contain", padding: "10px" }} />
                </div>
                <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{d.name}</h3>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--foreground)", marginBottom: "10px" }}>
                    {d.price.toLocaleString("tr-TR")} ₺
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                    <span style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(0,0,0,0.05)", borderRadius: "10px" }}>Pil: %{d.batteryHealth}</span>
                    <span style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(0,0,0,0.05)", borderRadius: "10px" }}>Grade {d.grade}</span>
                    <span style={{ fontSize: "11px", padding: "2px 8px", background: "rgba(0,0,0,0.05)", borderRadius: "10px" }}>Stok: {d.stock}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(d.id)}
                    style={{ marginTop: "auto", padding: "8px", background: "rgba(255, 59, 48, 0.1)", color: "var(--danger)", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: "none" }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
            {devices.length === 0 && <p style={{ color: "#666", gridColumn: "1 / -1" }}>Henüz cihaz eklenmemiş.</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
