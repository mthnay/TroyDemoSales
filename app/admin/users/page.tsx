"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { secondaryAuth, db } from "@/lib/firebase";
import { motion } from "framer-motion";

interface UserData {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList: UserData[] = [];
    querySnapshot.forEach((doc) => {
      usersList.push({ id: doc.id, ...doc.data() } as UserData);
    });
    setUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@artitroy.com")) {
      setMessage("Hata: Sadece @artitroy.com uzantılı e-posta eklenebilir.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUserId = userCredential.user.uid;
      
      await setDoc(doc(db, "users", newUserId), {
        email: email,
        role: role,
        createdAt: new Date().toISOString()
      });

      await signOut(secondaryAuth);

      setMessage("Kullanıcı başarıyla oluşturuldu.");
      setEmail("");
      setPassword("");
      fetchUsers();
    } catch (error: any) {
      setMessage("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>Kullanıcı Yönetimi</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
        {/* Form */}
        <div className="glass-panel" style={{ padding: "24px", height: "fit-content" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>Yeni Kullanıcı Ekle</h2>
          <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
              <label style={{ fontSize: "13px", fontWeight: 500 }}>E-posta</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="isim@artitroy.com"
                required
                style={{ padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", outline: "none" }}
              />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Şifre</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Geçici şifre (min 6 karakter)"
                required
                minLength={6}
                style={{ padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500 }}>Rol</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "user")}
                style={{ padding: "12px", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", outline: "none", background: "white" }}
              >
                <option value="user">Personel (User)</option>
                <option value="admin">Yönetici (Admin)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "10px" }}>
              {loading ? "Ekleniyor..." : "Kullanıcıyı Kaydet"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "20px" }}>Sistemdeki Kullanıcılar</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {users.map((u) => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.5)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.email}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>Katılım: {new Date(u.createdAt).toLocaleDateString("tr-TR")}</div>
                </div>
                <div style={{ 
                  padding: "4px 12px", 
                  borderRadius: "20px", 
                  fontSize: "12px", 
                  fontWeight: 600,
                  background: u.role === "admin" ? "rgba(0, 113, 227, 0.1)" : "rgba(0,0,0,0.05)",
                  color: u.role === "admin" ? "var(--primary)" : "#666"
                }}>
                  {u.role === "admin" ? "Yönetici" : "Personel"}
                </div>
              </div>
            ))}
            {users.length === 0 && <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>Sadece siz varsınız.</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
