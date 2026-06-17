"use client";

import { motion } from "framer-motion";

export default function AdminDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>Genel Bakış</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>Toplam Cihaz</h3>
          <p style={{ fontSize: "32px", fontWeight: 700 }}>0</p>
        </div>
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>Bekleyen Talepler</h3>
          <p style={{ fontSize: "32px", fontWeight: 700 }}>0</p>
        </div>
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>Personel Sayısı</h3>
          <p style={{ fontSize: "32px", fontWeight: 700 }}>0</p>
        </div>
      </div>
    </motion.div>
  );
}
