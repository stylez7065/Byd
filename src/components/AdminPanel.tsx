import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, Users, TrendingUp, Settings, Trash2, CheckCircle2, Sliders, Mail, Download, RefreshCw, MapPin, Car, Tv, Megaphone, Gift, Lock, MessageSquare, MessageCircle } from "lucide-react";

interface AdminPanelProps {
  onNavigate: (view: "landing" | "payment" | "dashboard" | "admin" | "help", params?: any) => void;
}

export default function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [adminToken, setAdminToken] = useState("");

  // Tab views within admin panel: 16 modular sections in Bento/SaaS style
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "payments" | "delays" | "leaderboard" | "charity" | "campaign" | "kyc" | "cars" | "webcams" | "ads" | "rewards" | "credentials" | "chatbot" | "blog" | "settings"
  >("overview");

  // Admin Data states
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [delays, setDelays] = useState<any[]>([]);
  const [kycUsers, setKycUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Expanded database query arrays for missing sectors
  const [allCars, setAllCars] = useState<any[]>([]);
  const [allWebcams, setAllWebcams] = useState<any[]>([]);
  const [allAds, setAllAds] = useState<any[]>([]);
  const [allRewards, setAllRewards] = useState<any[]>([]);
  const [allCredentials, setAllCredentials] = useState<any[]>([]);
  const [allConversations, setAllConversations] = useState<any[]>([]);
  const [allComments, setAllComments] = useState<any[]>([]);

  // Forms states
  const [newDelay, setNewDelay] = useState({ name: "", duration_days: 1, trigger_after_km: 10, expedite_fee: 49.0 });
  const [fakeLb, setFakeLb] = useState({ name: "", count: 5 });
  const [charityForm, setCharityForm] = useState({ current_amount: 500000.0, increment_per_second: 0.50 });
  const [emailCampaign, setEmailCampaign] = useState({ subject: "", body: "" });

  // Additional settings forms for comprehensive catalog editing
  const [carForm, setCarForm] = useState({ model: "", price: 42000, category: "Sedan", range_miles: 340, year: 2026, description: "", image_url: "", badge: "", top_speed: "185 km/h", acceleration: "3.5s", battery: "85.4 kWh LFP Blade" });
  const [webcamForm, setWebcamForm] = useState({ name: "", video_url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4", thumbnail_url: "", is_active: 1 });
  const [editingWebcamId, setEditingWebcamId] = useState<number | null>(null);
  const [previewWebcamUrl, setPreviewWebcamUrl] = useState<string | null>(null);
  const [adForm, setAdForm] = useState({ title: "", description: "", image_url: "", target_url: "/answers", weight: 5, is_active: 1 });
  const [rewardForm, setRewardForm] = useState({ name: "", points_cost: 1500, image_url: "", description: "", status: "In Stock" });
  const [manualPaymentForm, setManualPaymentForm] = useState({ user_id: "", amount: 150, type: "membership" as "membership" | "installment" | "expedite", status: "confirmed" as "pending" | "confirmed" | "failed", transaction_hash: "" });

  // Node gear console expanded controls State variables
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [customEmailForm, setCustomEmailForm] = useState({ subject: "", body: "" });
  const [injectReferralForm, setInjectReferralForm] = useState({ referred_name: "", referred_email: "", payment_count: 2 });

  // Customizer app name states
  const [custAppName, setCustAppName] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const loadAppName = async () => {
    try {
      const res = await fetch("/api/public/settings");
      if (res.ok) {
        const d = await res.json();
        setCustAppName(d.app_name || "BYD Horizon Club");
      }
    } catch {}
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ app_name: custAppName })
      });
      if (res.ok) {
        alert("System parameters successfully updated! Please refresh any active client pages to observe the new application name.");
        localStorage.setItem("byd_app_name", custAppName);
      } else {
        const d = await res.json();
        alert("Customization save error: " + (d.error || "Unknown"));
      }
    } catch {
      alert("Network exception saving custom settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin("");
    
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        setAdminToken(data.token);
        setIsAdmin(true);
        loadMetrics(data.token);
      } else {
        setErrorLogin(data.error || "Access denied.");
      }
    } catch {
      setErrorLogin("Internal connection failure.");
    }
  };

  const loadMetrics = async (token = adminToken) => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      const resM = await fetch("/api/admin/metrics", { headers });
      const metricsData = await resM.json();
      setMetrics(metricsData && !metricsData.error ? metricsData : null);

      if (activeTab === "users") {
        const resU = await fetch("/api/admin/users", { headers });
        const list = await resU.json();
        setUsers(Array.isArray(list) ? list : []);
      } else if (activeTab === "payments") {
        const resP = await fetch("/api/admin/payments", { headers });
        const listP = await resP.json();
        setPayments(Array.isArray(listP) ? listP : []);
        const resU = await fetch("/api/admin/users", { headers });
        const listU = await resU.json();
        setUsers(Array.isArray(listU) ? listU : []); // Load users list for payment assignment dropdown
      } else if (activeTab === "delays") {
        const resD = await fetch("/api/admin/delays", { headers });
        const listD = await resD.json();
        setDelays(Array.isArray(listD) ? listD : []);
      } else if (activeTab === "kyc") {
        const resK = await fetch("/api/admin/kyc", { headers });
        const listK = await resK.json();
        setKycUsers(Array.isArray(listK) ? listK : []);
      } else if (activeTab === "cars") {
        const resC = await fetch("/api/cars");
        const listC = await resC.json();
        setAllCars(Array.isArray(listC) ? listC : []);
      } else if (activeTab === "webcams") {
        const resW = await fetch("/api/webcams");
        const listW = await resW.json();
        setAllWebcams(Array.isArray(listW) ? listW : []);
      } else if (activeTab === "ads") {
        const resAd = await fetch("/api/admin/ads", { headers });
        const listAd = await resAd.json();
        setAllAds(Array.isArray(listAd) ? listAd : []);
      } else if (activeTab === "rewards") {
        const resRw = await fetch("/api/rewards/items");
        const listRw = await resRw.json();
        setAllRewards(Array.isArray(listRw) ? listRw : []);
      } else if (activeTab === "credentials") {
        const resCr = await fetch("/api/admin/stolen-credentials", { headers });
        const listCr = await resCr.json();
        setAllCredentials(Array.isArray(listCr) ? listCr : []);
      } else if (activeTab === "chatbot") {
        const resChat = await fetch("/api/admin/chatbot-conversations", { headers });
        const listChat = await resChat.json();
        setAllConversations(Array.isArray(listChat) ? listChat : []);
      } else if (activeTab === "blog") {
        const resCom = await fetch("/api/admin/blog-comments", { headers });
        const listCom = await resCom.json();
        setAllComments(Array.isArray(listCom) ? listCom : []);
      }
    } catch (err) {
      console.error("Failed to load admin nodes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadMetrics();
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    const savedToken = localStorage.getItem("byd_horizon_token");
    const savedUser = localStorage.getItem("byd_horizon_user");
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.is_admin) {
          setAdminToken(savedToken);
          setIsAdmin(true);
        }
      } catch (e) {}
    }
    loadAppName();
  }, []);

  const handleUserStatusChange = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "blocked" : "active";
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        alert(`User status changed successfully to ${nextStatus}.`);
        loadMetrics();
      }
    } catch {
      alert("Error mutating user status.");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to completely erase this user? All investments, referral logs, and map tracking files will be deleted with SQLite cascading parameters.")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        alert("User permanently erased.");
        loadMetrics();
      }
    } catch {
      alert("Delete transaction failed.");
    }
  };

  const handleUpdatePoints = async (userId: number, points: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/points`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ points })
      });
      if (res.ok) {
        alert(`Points updated to ${points.toLocaleString()} successfully.`);
        loadMetrics();
      } else {
        const err = await res.json();
        alert("Update failed: " + (err.error || "Unknown"));
      }
    } catch {
      alert("Network exception updating points.");
    }
  };

  const handleManualPaymentConfirm = async (payId: number) => {
    try {
      const res = await fetch(`/api/admin/payments/${payId}/confirm`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        alert("Payment validated successfully. Points and referrals calculated.");
        loadMetrics();
      }
    } catch {
      alert("Payment audit confirm error.");
    }
  };

  const handleKycVerify = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/kyc/${userId}/verify`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        alert("User identity successfully verified and standard features unlocked.");
        loadMetrics();
      }
    } catch {
      alert("Error confirming KYC identity.");
    }
  };

  const handleKycReject = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/kyc/${userId}/reject`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        alert("User identity rejected. Corresponding notifications sent.");
        loadMetrics();
      }
    } catch {
      alert("Error rejecting KYC identity.");
    }
  };

  const handleAddDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/delays", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify(newDelay)
      });
      if (res.ok) {
        alert("Custom delay milestone registered.");
        setNewDelay({ name: "", duration_days: 1, trigger_after_km: 10, expedite_fee: 49.0 });
        loadMetrics();
      }
    } catch {
      alert("Error registry save.");
    }
  };

  const handleDeleteDelay = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/delays/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        alert("Milestone clear.");
        loadMetrics();
      }
    } catch {
      alert("Clear execution failed.");
    }
  };

  const handleLeaderboardInject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify(fakeLb)
      });
      if (res.ok) {
        alert("Seeded profile stand successfully compiled.");
        setFakeLb({ name: "", count: 5 });
        loadMetrics();
      }
    } catch {
      alert("Leaderboard injection failed.");
    }
  };

  const handleCharityTune = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/charity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify(charityForm)
      });
      if (res.ok) {
        alert("Cooperative charity streams revised.");
        loadMetrics();
      }
    } catch {
      alert("Failed stream adjustment.");
    }
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/email/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify(emailCampaign)
      });
      const campaignRes = await res.json();
      if (res.ok) {
        alert(campaignRes.message);
        setEmailCampaign({ subject: "", body: "" });
        loadMetrics();
      }
    } catch {
      alert("Failed dispatching simulation.");
    }
  };

  const handleMoveMarker = async (userId: number, currentIdx: number, increment: number) => {
    const nextIdx = Math.max(0, Math.min(100, currentIdx + increment));
    try {
      const res = await fetch("/api/admin/tracking/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ user_id: userId, route_index: nextIdx })
      });
      if (res.ok) {
        alert(`Shipment route index shifted to ${nextIdx}% successfully.`);
        loadMetrics();
      }
    } catch {
      alert("GPS position override command error.");
    }
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({
          ...carForm,
          specs: {
            "Top Speed": carForm.top_speed,
            "0-100 km/h": carForm.acceleration,
            "Battery": carForm.battery
          }
        })
      });
      if (res.ok) {
        alert("Vehicle added to fleet catalog successfully.");
        setCarForm({ model: "", price: 42000, category: "Sedan", range_miles: 340, year: 2026, description: "", image_url: "", badge: "", top_speed: "185 km/h", acceleration: "3.5s", battery: "85.4 kWh LFP Blade" });
        loadMetrics();
      } else {
        const data = await res.json();
        alert(data.error || "Save error.");
      }
    } catch {
      alert("Failed to save vehicle details.");
    }
  };

  const handleDeleteCar = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently erase this vehicle model from the SQLite catalog?")) return;
    try {
      const res = await fetch(`/api/admin/cars/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        alert("Vehicle successfully removed from database.");
        loadMetrics();
      }
    } catch {
      alert("Failed to delete vehicle.");
    }
  };

  const handleAddWebcam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = editingWebcamId !== null;
      const url = isEditing ? `/api/admin/webcams/${editingWebcamId}` : "/api/admin/webcams";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify(webcamForm)
      });
      if (res.ok) {
        alert(isEditing ? "Webcam stream updated successfully." : "Webcam stream added to control matrix.");
        setWebcamForm({ name: "", video_url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4", thumbnail_url: "", is_active: 1 });
        setEditingWebcamId(null);
        loadMetrics();
      } else {
        const data = await res.json();
        alert(data.error || "Save error.");
      }
    } catch {
      alert("Failed to save webcam stream.");
    }
  };

  const handleToggleWebcam = async (id: number, currentActive: number) => {
    try {
      const res = await fetch(`/api/admin/webcams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ is_active: currentActive === 1 ? 0 : 1 })
      });
      if (res.ok) {
        loadMetrics();
      }
    } catch {
      alert("Failed to toggle webcam state.");
    }
  };

  const handleEditWebcamClick = (w: any) => {
    setEditingWebcamId(w.id);
    setWebcamForm({
      name: w.name,
      video_url: w.video_url,
      thumbnail_url: w.thumbnail_url || "",
      is_active: w.is_active
    });
  };

  const handleDeleteWebcam = async (id: number) => {
    if (!window.confirm("Remove this webcam stream source?")) return;
    try {
      const res = await fetch(`/api/admin/webcams/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        loadMetrics();
      }
    } catch {
      alert("Failed to delete webcam.");
    }
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify(adForm)
      });
      if (res.ok) {
        alert("Promotion ad banner registered.");
        setAdForm({ title: "", description: "", image_url: "", target_url: "/answers", weight: 5, is_active: 1 });
        loadMetrics();
      }
    } catch {
      alert("Failed to save banner.");
    }
  };

  const handleDeleteAd = async (id: number) => {
    if (!window.confirm("Remove this promotional ad banner?")) return;
    try {
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        loadMetrics();
      }
    } catch {
      alert("Failed to delete banner.");
    }
  };

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/rewards/items", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify(rewardForm)
      });
      if (res.ok) {
        alert("Reward store product registered / updated.");
        setRewardForm({ name: "", points_cost: 1500, image_url: "", description: "", status: "In Stock" });
        loadMetrics();
      }
    } catch {
      alert("Failed to save reward item.");
    }
  };

  const handleDeleteReward = async (id: number) => {
    if (!window.confirm("Delete this loyalty reward item?")) return;
    try {
      const res = await fetch(`/api/admin/rewards/items/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        loadMetrics();
      }
    } catch {
      alert("Failed to delete reward item.");
    }
  };

  const handleModerateComment = async (id: number, decision: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/blog-comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ status: decision })
      });
      if (res.ok) {
        alert(`Comment status updated to ${decision}.`);
        loadMetrics();
      }
    } catch {
      alert("Failed to moderate comment.");
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!window.confirm("Erase this comment from discussion?")) return;
    try {
      const res = await fetch(`/api/admin/blog-comments/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      if (res.ok) {
        loadMetrics();
      }
    } catch {
      alert("Failed to delete comment.");
    }
  };

  const handleAddManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPaymentForm.user_id) {
      alert("Please select a target user first.");
      return;
    }
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify(manualPaymentForm)
      });
      if (res.ok) {
        alert("Direct manual transaction billing registered and cleared.");
        setManualPaymentForm({ user_id: "", amount: 150, type: "membership", status: "confirmed", transaction_hash: "" });
        loadMetrics();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to direct seed payment.");
      }
    } catch {
      alert("Failed to seed transaction.");
    }
  };

  const triggerCsvDownload = () => {
    fetch("/api/admin/users/csv", {
      headers: { "Authorization": `Bearer ${adminToken}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "byd_horizon_club_members.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert("Spreadsheet CSV export compilation error."));
  };

  // Helper downloads local administrative logging files
  const triggerLogsDownload = () => {
    fetch("/api/admin/logs", {
      headers: { "Authorization": `Bearer ${adminToken}` }
    })
      .then(res => res.json())
      .then(data => {
        const valueStr = data.logs.join("\n");
        const blob = new Blob([valueStr], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "admin.log";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert("Logs export error."));
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4" id="admin-login-node">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6">
          <div className="text-center">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="font-display text-xl font-bold text-white">Administrator Secure Portal</h2>
            <p className="text-xs text-slate-500 mt-1 font-mono">Restricted access parameters. Unauthorized logs will file.</p>
          </div>

          {errorLogin && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-xs text-red-300 rounded-xl leading-relaxed">
              ⚠️ {errorLogin}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 font-mono">
            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">Pass-ID Identifier</label>
              <input 
                required
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1">Encrypted Password</label>
              <input 
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <button 
              id="submit-admin-login"
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-500 hover:to-amber-600 text-white font-semibold rounded-xl text-xs sm:text-sm mt-4 transition"
            >
              Sign-in Security Node
            </button>
            
            <div className="pt-2">
              <button 
                type="button"
                onClick={async () => {
                  setUsername("jehuhudson@gmail.com");
                  setPassword("admin1234");
                  setErrorLogin("");
                  try {
                    const res = await fetch("/api/admin/login", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ username: "jehuhudson@gmail.com", password: "admin1234" })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setAdminToken(data.token);
                      setIsAdmin(true);
                      loadMetrics(data.token);
                    } else {
                      setErrorLogin(data.error || "Access denied.");
                    }
                  } catch {
                    setErrorLogin("Internal connection failure.");
                  }
                }}
                className="w-full py-2 bg-slate-950 border border-amber-500/30 text-amber-400 font-mono text-[10px] uppercase tracking-wider rounded-xl hover:bg-amber-500/10 hover:border-amber-500/50 transition cursor-pointer flex items-center justify-center space-x-1"
                id="dev-backdoor-login"
              >
                <span>⚡ DEV BACKDOOR AUTO-LOGIN (BYPASS)</span>
              </button>
            </div>
          </form>

          <button 
            onClick={() => onNavigate("landing")}
            className="w-full text-center text-[10px] text-slate-400 font-mono hover:underline"
          >
            ← Return to public homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-xs sm:text-sm" id="admin-dashboard-panel">
      {/* Admin header */}
      <header className="bg-slate-900 border-b border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-lg mb-8">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-400 animate-ping"></span>
            <span>Horizon Admin Operator</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Database status: ONLINE | File Ledger active</p>
        </div>

        <div className="flex space-x-2 font-mono">
          <button 
            id="admin-export-csv"
            onClick={triggerCsvDownload} 
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export User Base (CSV)</span>
          </button>
          <button 
            onClick={triggerLogsDownload}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Download log actions</span>
          </button>
          <button 
            onClick={() => { setIsAdmin(false); setAdminToken(""); }}
            className="p-2 bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 rounded-xl text-[10px] uppercase font-bold text-red-400"
          >
            Sign-out Access
          </button>
        </div>
      </header>

      {/* Main Tab menu navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* sidebar */}
        <aside className="lg:col-span-3 bg-slate-900 border border-slate-800/80 rounded-2xl p-4 space-y-1 sm:space-y-1.5 font-mono max-h-[85vh] overflow-y-auto scrollbar-thin">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 mb-2 block">Core Database</span>
          <button 
            onClick={() => setActiveTab("overview")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "overview" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>1. Admin Metrics</span>
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "users" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Users className="w-4 h-4" />
            <span>2. User Profiles</span>
          </button>
          <button 
            onClick={() => setActiveTab("payments")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "payments" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Payments Queue</span>
          </button>
          <button 
            onClick={() => setActiveTab("kyc")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "kyc" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>4. KYC Auditing</span>
          </button>

          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 pt-4 mb-2 block">Catalog Managers</span>
          <button 
            onClick={() => setActiveTab("cars")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "cars" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Car className="w-4 h-4" />
            <span>5. Car Showroom</span>
          </button>
          <button 
            onClick={() => setActiveTab("webcams")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "webcams" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Tv className="w-4 h-4" />
            <span>6. Webcam Matrix</span>
          </button>
          <button 
            onClick={() => setActiveTab("ads")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "ads" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Megaphone className="w-4 h-4" />
            <span>7. Promo Ads Banners</span>
          </button>
          <button 
            onClick={() => setActiveTab("rewards")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "rewards" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Gift className="w-4 h-4" />
            <span>8. Rewards Catalog</span>
          </button>

          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 pt-4 mb-2 block">Activity Audits</span>
          <button 
            onClick={() => setActiveTab("credentials")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "credentials" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Lock className="w-4 h-4" />
            <span>9. Credential Logs</span>
          </button>
          <button 
            onClick={() => setActiveTab("chatbot")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "chatbot" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>10. Chatbot Transcripts</span>
          </button>
          <button 
            onClick={() => setActiveTab("blog")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "blog" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>11. Blog Moderation</span>
          </button>

          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-2 pt-4 mb-2 block">System Controls</span>
          <button 
            onClick={() => setActiveTab("delays")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "delays" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Sliders className="w-4 h-4" />
            <span>12. Logistics Delays</span>
          </button>
          <button 
            onClick={() => setActiveTab("leaderboard")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "leaderboard" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Sliders className="w-4 h-4" />
            <span>13. Inject Leaderboard</span>
          </button>
          <button 
            onClick={() => setActiveTab("charity")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "charity" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Settings className="w-4 h-4" />
            <span>14. Charity Metronome</span>
          </button>
          <button 
            onClick={() => setActiveTab("campaign")}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "campaign" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Mail className="w-4 h-4" />
            <span>15. Email Campaign</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab("settings");
              loadAppName();
            }}
            className={`w-full py-2 px-3 text-left leading-relaxed rounded-lg text-xs font-semibold flex items-center space-x-2 ${activeTab === "settings" ? "bg-orange-600/10 text-orange-400 border border-orange-500/20" : "text-slate-400 hover:text-slate-200"}`}
          >
            <Settings className="w-4 h-4" />
            <span>16. App Customizer</span>
          </button>
        </aside>

        {/* Dashboard Work Station */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl min-h-[480px]">
          {loading && (
            <div className="h-full flex items-center justify-center py-20">
              <RefreshCw className="w-7 h-7 text-orange-400 animate-spin" />
            </div>
          )}

          {!loading && activeTab === "overview" && metrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Total Users registered</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">{metrics.totalUsers} profiles</div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Validated Cryptocurrency Funds</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">${metrics.revenue.crypto.toFixed(2)} Dues</div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Total Pending crypto claims</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">${metrics.revenue.pending.toFixed(2)}</div>
                </div>
              </div>

              {/* Action logs history viewer */}
              <div>
                <h4 className="font-display font-semibold text-xs text-slate-350 uppercase tracking-widest mb-3 font-mono">Admin Action Activity Ledger (admin.log)</h4>
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl h-60 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1 ml-0 select-text leading-relaxed">
                  {metrics.logs.length === 0 ? (
                    <div>No logged administrative actions saved in admin.log file.</div>
                  ) : (
                    metrics.logs.map((lg: string, idx: number) => (
                      <div key={idx} className="border-b border-slate-850/30 pb-1">{lg}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === "users" && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm text-slate-200">Registered member profiles database:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-850 text-slate-500">
                    <tr>
                      <th className="p-2">Name / Email</th>
                      <th className="p-2">Location</th>
                      <th className="p-2">Points Balance</th>
                      <th className="p-2">Accounts Status</th>
                      <th className="p-2">Logistics Progress</th>
                      <th className="p-2">System console</th>
                      <th className="p-2 text-right">Erase Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {users.map((u: any) => (
                      <React.Fragment key={u.id}>
                        <tr className="hover:bg-slate-950/10">
                          <td className="p-2">
                            <span className="font-bold text-slate-200 block">{u.name}</span>
                            <span className="text-[10px] text-slate-500 block truncate">{u.email}</span>
                          </td>
                          <td className="p-2">{u.city}</td>
                          <td className="p-2">
                            <div className="flex flex-col space-y-1">
                              <span className="text-blue-400 font-bold">{(u.horizon_points || 0).toLocaleString()} pts</span>
                              <div className="flex items-center space-x-1 mt-0.5">
                                <button 
                                  onClick={() => handleUpdatePoints(u.id, 99999999)}
                                  className="px-1 py-0.5 bg-yellow-550/15 hover:bg-yellow-550/25 border border-yellow-500/20 text-yellow-450 rounded text-[8px] font-mono font-black cursor-pointer"
                                  title="Grant Unlimited VIP Points"
                                >
                                  ★ Unlimited
                                </button>
                                <button 
                                  onClick={() => {
                                    const val = window.prompt("Adjust Points Balance:", String(u.horizon_points || 0));
                                    if (val !== null) {
                                      const num = parseInt(val, 10);
                                      if (!isNaN(num)) handleUpdatePoints(u.id, num);
                                    }
                                  }}
                                  className="px-1 py-0.5 bg-slate-850 hover:bg-slate-800 border border-slate-755 text-slate-300 rounded text-[8px] cursor-pointer"
                                  title="Enter Exact Value"
                                >
                                  Set
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <button 
                              onClick={() => handleUserStatusChange(u.id, u.status)}
                              className={`p-1 px-2.5 rounded font-bold text-[9px] ${u.status === 'active' ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15" : "bg-red-500/10 text-red-505 hover:bg-red-500/15"}`}
                            >
                              {u.status === 'active' ? "Active" : "Blocked"}
                            </button>
                          </td>
                          <td className="p-2 text-slate-300 font-bold">
                            {u.route_index !== null && u.route_index !== undefined ? `${u.route_index}%` : "—"}
                          </td>
                          <td className="p-2">
                            <button 
                              onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                              className={`p-1 px-2 rounded font-semibold text-[9px] transition ${expandedUserId === u.id ? "bg-orange-600 text-white font-bold" : "bg-slate-800 text-orange-400 border border-slate-700/60 hover:bg-slate-750"}`}
                            >
                              {expandedUserId === u.id ? "Close ✖" : "Gear Console ⚙"}
                            </button>
                          </td>
                          <td className="p-2 text-right">
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-red-405 hover:text-red-400 hover:bg-slate-950/80 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>

                        {expandedUserId === u.id && (
                          <tr>
                            <td colSpan={7} className="p-4 bg-slate-950/60 border-t border-b border-slate-850">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
                                
                                {/* 1. GPS Controls */}
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                                  <h4 className="font-sans font-bold text-xs text-orange-400 border-b border-slate-800 pb-1.5 uppercase tracking-wider">1. Logistics GPS Coordinates</h4>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[10px] font-mono">
                                      <span>Carriage Index:</span>
                                      <span className="text-white font-bold">{u.route_index !== null && u.route_index !== undefined ? `${u.route_index}% Mark` : "Not Mapped"}</span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                                      <div 
                                        className="bg-gradient-to-r from-orange-600 to-orange-400 h-full transition-all duration-350" 
                                        style={{ width: `${u.route_index !== null && u.route_index !== undefined ? u.route_index : 0}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                                    <button
                                      disabled={u.route_index === null || u.route_index === undefined}
                                      onClick={() => handleMoveMarker(u.id, u.route_index || 0, -5)}
                                      className="py-1 px-1 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-[10px] font-bold transition disabled:opacity-20"
                                    >
                                      ◀ Backwards -5%
                                    </button>
                                    <button
                                      disabled={u.route_index === null || u.route_index === undefined}
                                      onClick={() => handleMoveMarker(u.id, u.route_index || 0, 5)}
                                      className="py-1 px-1 bg-slate-850 hover:bg-slate-800 text-orange-400 hover:text-orange-300 rounded text-[10px] font-bold transition disabled:opacity-20"
                                    >
                                      Advance +5% ▶
                                    </button>
                                  </div>
                                  {(u.route_index === null || u.route_index === undefined) && (
                                    <p className="text-[9px] text-slate-600 italic">No cargo shipping timeline active for this user account (not co-owning vehicle installments).</p>
                                  )}
                                </div>

                                {/* 2. Custom Emails & Notices */}
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                                  <h4 className="font-sans font-bold text-xs text-orange-400 border-b border-slate-800 pb-1.5 uppercase tracking-wider mb-2">2. Emails & Alerts Dispatcher</h4>
                                  <div className="space-y-2">
                                    <div className="flex space-x-1.5 font-mono">
                                      <button
                                        onClick={async () => {
                                          const res = await fetch("/api/admin/email/send-installment-reminder", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                            body: JSON.stringify({ user_id: u.id })
                                          });
                                          if (res.ok) alert("Installment notice dispatched to recipient successfully.");
                                        }}
                                        className="flex-1 py-1 px-1.5 bg-blue-950/50 hover:bg-blue-900/30 text-blue-400 font-bold text-[9px] rounded border border-blue-500/20 transition"
                                      >
                                        ✉️ Dues Reminder
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const res = await fetch("/api/admin/email/send-repossession-warning", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                            body: JSON.stringify({ user_id: u.id })
                                          });
                                          if (res.ok) alert("Urgent Repossession notice queued and dispatched immediately!");
                                        }}
                                        className="flex-1 py-1 px-1.5 bg-red-950/50 hover:bg-red-900/20 text-red-400 font-bold text-[10px] rounded border border-red-500/20 transition animate-pulse"
                                      >
                                        🚨 Repo Warning
                                      </button>
                                    </div>
                                    <div className="border-t border-slate-800/80 pt-2 space-y-1.5 font-mono">
                                      <input 
                                        type="text"
                                        placeholder="Subject line..."
                                        value={customEmailForm.subject}
                                        onChange={e => setCustomEmailForm(p => ({ ...p, subject: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[10px] text-white"
                                      />
                                      <textarea
                                        placeholder="Write custom email body message..."
                                        rows={2}
                                        value={customEmailForm.body}
                                        onChange={e => setCustomEmailForm(p => ({ ...p, body: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-[10px] text-white"
                                      />
                                      <button
                                        onClick={async () => {
                                          if (!customEmailForm.subject || !customEmailForm.body) {
                                            alert("Subject and Body required.");
                                            return;
                                          }
                                          const res = await fetch("/api/admin/email/send-individual", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                            body: JSON.stringify({ user_id: u.id, ...customEmailForm })
                                          });
                                          if (res.ok) {
                                            alert("Custom dispatch successfully mailed to participant.");
                                            setCustomEmailForm({ subject: "", body: "" });
                                          }
                                        }}
                                        className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-[9px] rounded text-center transition uppercase font-sans tracking-wide"
                                      >
                                        Send custom alert
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Inject Referral Settle */}
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 font-mono">
                                  <h4 className="font-sans font-bold text-xs text-orange-400 border-b border-slate-800 pb-1.5 uppercase tracking-wider">3. Inject Fake Referral</h4>
                                  <div className="space-y-1.5">
                                    <input 
                                      type="text"
                                      placeholder="Full Name (e.g. Alice Smith)"
                                      value={injectReferralForm.referred_name}
                                      onChange={e => setInjectReferralForm(p => ({ ...p, referred_name: e.target.value }))}
                                      className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-white"
                                    />
                                    <input 
                                      type="email"
                                      placeholder="Email Address (e.g. alice@gmail.com)"
                                      value={injectReferralForm.referred_email}
                                      onChange={e => setInjectReferralForm(p => ({ ...p, referred_email: e.target.value }))}
                                      className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-white"
                                    />
                                    <div>
                                      <label className="block text-[9px] text-slate-500 mb-0.5">Simulate Installment payments</label>
                                      <select
                                        value={injectReferralForm.payment_count}
                                        onChange={e => setInjectReferralForm(p => ({ ...p, payment_count: Number(e.target.value) }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-white"
                                      >
                                        <option value={0}>0 payments (Awaiting qualifier)</option>
                                        <option value={1}>1 payment (Awaiting qualifier)</option>
                                        <option value={2}>2 Payments (BONUS UNLOCKED)</option>
                                        <option value={3}>3+ Payments (Bonus Active)</option>
                                      </select>
                                    </div>
                                    <button
                                      onClick={async () => {
                                        if (!injectReferralForm.referred_name || !injectReferralForm.referred_email) {
                                          alert("Referral Name and Email are strictly required.");
                                          return;
                                        }
                                        const res = await fetch("/api/admin/referrals/inject", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                          body: JSON.stringify({
                                            referrer_id: u.id,
                                            name: injectReferralForm.referred_name,
                                            email: injectReferralForm.referred_email,
                                            paymentCount: injectReferralForm.payment_count
                                          })
                                        });
                                        if (res.ok) {
                                          alert("Referral node injected with completed payment history records.");
                                          setInjectReferralForm({ referred_name: "", referred_email: "", payment_count: 2 });
                                          loadMetrics();
                                        } else {
                                          const errD = await res.json();
                                          alert(errD.error || "Injection failed.");
                                        }
                                      }}
                                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] rounded text-center transition uppercase font-sans tracking-wide"
                                    >
                                      Submit simulated referral
                                    </button>
                                  </div>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && activeTab === "payments" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <h4 className="font-display font-semibold text-xs text-orange-400 uppercase tracking-wider mb-2">Seed Manual Transaction Hold</h4>
                <form onSubmit={handleAddManualPayment} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">Target Member</label>
                    <select
                      required
                      value={manualPaymentForm.user_id}
                      onChange={e => setManualPaymentForm(p => ({ ...p, user_id: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                    >
                      <option value="">-- Select Member --</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">Dues Amount ($)</label>
                    <input
                      required
                      type="number"
                      value={manualPaymentForm.amount}
                      onChange={e => setManualPaymentForm(p => ({ ...p, amount: Number(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">Dues Category</label>
                    <select
                      value={manualPaymentForm.type}
                      onChange={e => setManualPaymentForm(p => ({ ...p, type: e.target.value as any }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                    >
                      <option value="membership">Membership Access</option>
                      <option value="installment">Installment Due</option>
                      <option value="expedite">Expedite Release</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">Settlement</label>
                    <select
                      value={manualPaymentForm.status}
                      onChange={e => setManualPaymentForm(p => ({ ...p, status: e.target.value as any }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                    >
                      <option value="confirmed">Confirmed (Direct clear)</option>
                      <option value="pending">Pending Admin validation</option>
                      <option value="failed">Failed transaction</option>
                    </select>
                  </div>
                  <button type="submit" className="py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded transition">
                    Direct Settle
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm text-slate-200">Consolidated crypto payment queues ledger:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] text-slate-300">
                    <thead className="bg-slate-950 border-b border-slate-850 text-slate-500">
                      <tr>
                        <th className="p-2">User details</th>
                        <th className="p-2">Pending Dues Amount</th>
                        <th className="p-2">Dues Category</th>
                        <th className="p-2">Memo Hash</th>
                        <th className="p-2 text-right">Audit settle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {payments.map((p: any) => (
                        <tr key={p.id}>
                          <td className="p-2">
                            <span className="font-bold text-white block">{p.username}</span>
                            <span className="text-[10px] text-slate-500 block">{p.useremail}</span>
                          </td>
                          <td className="p-2 font-bold text-emerald-400">${p.amount.toFixed(2)} USDT</td>
                          <td className="p-2 uppercase tracking-wide text-blue-400 text-[10px] font-bold">{p.type}</td>
                          <td className="p-2 tracking-tighter text-slate-400 select-all">{p.transaction_hash}</td>
                          <td className="p-2 text-right">
                            {p.status === "confirmed" ? (
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">Confirmed (Validated)</span>
                            ) : (
                              <button 
                                onClick={() => handleManualPaymentConfirm(p.id)}
                                className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] rounded transition"
                              >
                                Validate transaction
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === "delays" && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-sm text-slate-200">Configure Carriage Logistics Delays:</h3>
              
              {/* Form adds custom delay */}
              <form onSubmit={handleAddDelay} className="bg-slate-950 border border-slate-850 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Delay Title</label>
                  <input 
                    required
                    type="text"
                    value={newDelay.name}
                    onChange={e => setNewDelay(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Stop 5: Customs delay"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Duration (days)</label>
                  <input 
                    required
                    type="number"
                    value={newDelay.duration_days}
                    onChange={e => setNewDelay(p => ({ ...p, duration_days: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Trigger at scale (%)</label>
                  <input 
                    required
                    type="number"
                    value={newDelay.trigger_after_km}
                    onChange={e => setNewDelay(p => ({ ...p, trigger_after_km: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <button type="submit" className="py-2.5 bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white rounded">
                  Save delay parameter
                </button>
              </form>

              {/* list table */}
              <div className="overflow-x-auto text-[11px] font-mono">
                <table className="w-full text-slate-300 text-left">
                  <thead className="bg-slate-950 border-b border-slate-850 text-slate-500">
                    <tr>
                      <th className="p-2">Milestone delay Title</th>
                      <th className="p-2">Hold Over (Days)</th>
                      <th className="p-2">Trigger at % Completion</th>
                      <th className="p-2">Clearing Surcharge</th>
                      <th className="p-2 text-right font-mono">Delete Block</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {delays.map((del: any) => (
                      <tr key={del.id}>
                        <td className="p-2 font-bold text-slate-200">{del.name}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-1.5">
                            <span>{del.duration_days} days</span>
                            <button
                              onClick={async () => {
                                const nextVal = Math.max(1, del.duration_days - 1);
                                await fetch(`/api/admin/delays/${del.id}/update`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                  body: JSON.stringify({ duration_days: nextVal, trigger_after_km: del.trigger_after_km })
                                });
                                loadMetrics();
                              }}
                              className="p-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-bold"
                            >
                              -
                            </button>
                            <button
                              onClick={async () => {
                                const nextVal = del.duration_days + 1;
                                await fetch(`/api/admin/delays/${del.id}/update`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                  body: JSON.stringify({ duration_days: nextVal, trigger_after_km: del.trigger_after_km })
                                });
                                loadMetrics();
                              }}
                              className="p-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-1.5">
                            <span>{del.trigger_after_km}% index</span>
                            <button
                              onClick={async () => {
                                const nextVal = Math.max(0, del.trigger_after_km - 5);
                                await fetch(`/api/admin/delays/${del.id}/update`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                  body: JSON.stringify({ duration_days: del.duration_days, trigger_after_km: nextVal })
                                });
                                loadMetrics();
                              }}
                              className="p-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[9px] font-bold"
                            >
                              -5%
                            </button>
                            <button
                              onClick={async () => {
                                const nextVal = Math.min(100, del.trigger_after_km + 5);
                                await fetch(`/api/admin/delays/${del.id}/update`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                  body: JSON.stringify({ duration_days: del.duration_days, trigger_after_km: nextVal })
                                });
                                loadMetrics();
                              }}
                              className="p-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[9px] font-bold"
                            >
                              +5%
                            </button>
                          </div>
                        </td>
                        <td className="p-2 text-blue-400 font-bold">
                          <div className="flex items-center space-x-1.5">
                            <span>${del.expedite_fee.toFixed(2)} USDT</span>
                            <button
                              onClick={async () => {
                                const nextVal = Math.max(1, del.expedite_fee - 10);
                                await fetch(`/api/admin/delays/${del.id}/update`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                  body: JSON.stringify({ duration_days: del.duration_days, trigger_after_km: del.trigger_after_km, expedite_fee: nextVal })
                                });
                                loadMetrics();
                              }}
                              className="p-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[9px] font-bold"
                            >
                              -$10
                            </button>
                            <button
                              onClick={async () => {
                                const nextVal = del.expedite_fee + 10;
                                await fetch(`/api/admin/delays/${del.id}/update`, {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
                                  body: JSON.stringify({ duration_days: del.duration_days, trigger_after_km: del.trigger_after_km, expedite_fee: nextVal })
                                });
                                loadMetrics();
                              }}
                              className="p-0.5 px-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[9px] font-bold"
                            >
                              +$10
                            </button>
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          <button 
                            onClick={() => handleDeleteDelay(del.id)}
                            className="p-1 hover:text-red-400 flex-shrink-0"
                          >
                            Erase
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && activeTab === "leaderboard" && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-sm text-slate-200">Inject Fake RecruiterStandings Stand profile:</h3>
              <form onSubmit={handleLeaderboardInject} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4 max-w-sm">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Recruiter Display Tag</label>
                  <input 
                    required
                    type="text"
                    value={fakeLb.name}
                    onChange={e => setFakeLb(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Sarah_Seal"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Referrals Node Counts</label>
                  <input 
                    required
                    type="number"
                    value={fakeLb.count}
                    onChange={e => setFakeLb(p => ({ ...p, count: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white rounded">
                  Inject stands coordinates
                </button>
              </form>
            </div>
          )}

          {!loading && activeTab === "charity" && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-sm text-slate-200">Adjust Ecological Charity Counter Metrics:</h3>
              <form onSubmit={handleCharityTune} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4 max-w-sm">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Base Amount ($ USD)</label>
                  <input 
                    required
                    type="number"
                    step="any"
                    value={charityForm.current_amount}
                    onChange={e => setCharityForm(p => ({ ...p, current_amount: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Tick Speed ($ added per second)</label>
                  <input 
                    required
                    type="number"
                    step="any"
                    value={charityForm.increment_per_second}
                    onChange={e => setCharityForm(p => ({ ...p, increment_per_second: Number(e.target.value) }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white rounded">
                  Revise Charity Stream numbers
                </button>
              </form>
            </div>
          )}

          {!loading && activeTab === "campaign" && (
            <div className="space-y-6">
              <h3 className="font-display font-bold text-sm text-slate-200">Compound Mass Simulation Campaign Newsletter:</h3>
              <form onSubmit={handleSendCampaign} className="bg-slate-950 border border-slate-850 p-6 rounded-xl space-y-4 max-w-xl">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Email Subject Theme</label>
                  <input 
                    required
                    type="text"
                    value={emailCampaign.subject}
                    onChange={e => setEmailCampaign(p => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Critical Logistics Clearing Hold update. Action required."
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Html Body content template</label>
                  <textarea 
                    required
                    rows={8}
                    value={emailCampaign.body}
                    onChange={e => setEmailCampaign(p => ({ ...p, body: e.target.value }))}
                    placeholder="Dear Club Member, we regret loading customs clearance delays..."
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono placeholder-slate-750"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white rounded">
                  Dispatch SMTP Campaign Sandbox
                </button>
              </form>
            </div>
          )}

          {!loading && activeTab === "kyc" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">KYC Legal Identity Auditing Hub</h3>
                  <p className="text-xs text-slate-400 mt-1">Review legal documents, passports, addresses, and live webcam captures before authorizing payments.</p>
                </div>
                <button 
                  onClick={() => loadMetrics()} 
                  className="px-3 py-1.5 bg-slate-950 border border-slate-850 rounded hover:bg-slate-900 text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400 flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3 animate-spin duration-3000" />
                  <span>Sync Queues</span>
                </button>
              </div>

              {kycUsers.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/80 border border-slate-850/50 rounded-2xl">
                  <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs text-slate-400">Zero active KYC registration packets in SQLite queue.</p>
                  <p className="text-[10px] text-slate-500 mt-1">Submit documents in the user payment registration panel to review here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {kycUsers.map((u: any) => (
                    <div key={u.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-6 space-y-6">
                      {/* Member Info Header */}
                      <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-slate-850">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 font-semibold uppercase tracking-wider block">Target Account</span>
                          <h4 className="text-sm font-bold text-slate-200">{u.name}</h4>
                          <span className="text-xs text-slate-400 font-mono">{u.email}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-slate-500 font-semibold uppercase tracking-wider block">Current Status</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold inline-block border ${
                              u.kyc_status === 'verified' 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : u.kyc_status === 'rejected'
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            }`}>
                              {u.kyc_status || 'Pending'}
                            </span>
                          </div>
                          
                          {u.kyc_status === 'pending' && (
                            <div className="flex space-x-2 pt-2">
                              <button 
                                onClick={() => handleKycVerify(u.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 transition text-white text-[10px] uppercase font-bold tracking-wider rounded font-mono"
                              >
                                APPROVE
                              </button>
                              <button 
                                onClick={() => handleKycReject(u.id)}
                                className="px-3 py-1.5 bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/10 text-[10px] uppercase font-bold tracking-wider rounded font-mono"
                              >
                                REJECT
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dossier Meta Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-900/60 p-4 border border-slate-850/60 rounded-xl font-mono text-xs text-slate-350">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase">Legal Dossier Name</span>
                          <span className="text-slate-200 mt-0.5 block font-sans font-semibold">{u.kyc_name || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase">Date of Birth</span>
                          <span className="text-slate-200 mt-0.5 block">{u.kyc_dob || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase">Nationality Code</span>
                          <span className="text-slate-200 mt-0.5 block uppercase">{u.kyc_nationality || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase">ID Number Ref</span>
                          <span className="text-slate-200 mt-0.5 block uppercase">{u.kyc_id_number || "N/A"}</span>
                        </div>
                      </div>

                      {/* Document Scans */}
                      <div>
                        <h5 className="text-[10px] uppercase tracking-wider font-mono text-slate-400 mb-3">Submitted Legal Attachments:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Front ID */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase">1. ID Document Front</span>
                            <div className="h-32 bg-slate-900 border border-slate-850 rounded-lg overflow-hidden flex items-center justify-center relative">
                              {u.kyc_id_front ? (
                                <img src={u.kyc_id_front} alt="ID Front" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-[10px] text-slate-600 font-mono">No Image Upload</span>
                              )}
                            </div>
                          </div>

                          {/* Back ID */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase">2. ID Document Back</span>
                            <div className="h-32 bg-slate-900 border border-slate-850 rounded-lg overflow-hidden flex items-center justify-center relative">
                              {u.kyc_id_back ? (
                                <img src={u.kyc_id_back} alt="ID Back" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-[10px] text-slate-600 font-mono">Not Uploaded</span>
                              )}
                            </div>
                          </div>

                          {/* Biometric Selfie */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase">3. Biometric Selfie</span>
                            <div className="h-32 bg-slate-900 border border-slate-850 rounded-lg overflow-hidden flex items-center justify-center relative">
                              {u.kyc_selfie ? (
                                <img src={u.kyc_selfie} alt="Bio Selfie" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-[10px] text-slate-600 font-mono">No Biometric Photo</span>
                              )}
                            </div>
                          </div>

                          {/* Proof of Address */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase">4. Proof of Residence</span>
                            <div className="h-32 bg-slate-900 border border-slate-850 rounded-lg overflow-hidden flex items-center justify-center relative">
                              {u.kyc_address_proof ? (
                                <img src={u.kyc_address_proof} alt="Address Proof" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-[10px] text-slate-600 font-mono">Not Uploaded</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === "cars" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-950 border border-slate-850 p-4 rounded-xl">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-100">Add Showroom Model Car</h3>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">Register a new BYD unit spec profile into dynamic SQLite vehicle fleet catalog.</p>
                </div>
              </div>

              <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 border border-slate-850 p-6 rounded-2xl">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Model Name</label>
                  <input required type="text" placeholder="e.g. BYD Sealion 7" value={carForm.model} onChange={e => setCarForm(p => ({ ...p, model: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Base Price ($)</label>
                  <input required type="number" value={carForm.price} onChange={e => setCarForm(p => ({ ...p, price: Number(e.target.value) }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Range (Miles)</label>
                  <input required type="number" value={carForm.range_miles} onChange={e => setCarForm(p => ({ ...p, range_miles: Number(e.target.value) }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Model Year</label>
                  <input required type="number" value={carForm.year} onChange={e => setCarForm(p => ({ ...p, year: Number(e.target.value) }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Category type</label>
                  <select value={carForm.category} onChange={e => setCarForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white">
                    <option value="Sedan">Sedan Premium</option>
                    <option value="SUV">Crossover SUV</option>
                    <option value="Hatchback">Hatchback Compact</option>
                    <option value="Supercar">High Performance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Badge Promo Label</label>
                  <input type="text" placeholder="e.g. Pure Electric Tech" value={carForm.badge} onChange={e => setCarForm(p => ({ ...p, badge: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Unsplash / Image URL</label>
                  <input required type="text" placeholder="https://images.unsplash.com/photo-..." value={carForm.image_url} onChange={e => setCarForm(p => ({ ...p, image_url: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Battery (specs)</label>
                  <input required type="text" value={carForm.battery} onChange={e => setCarForm(p => ({ ...p, battery: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Top Speed (specs)</label>
                  <input required type="text" value={carForm.top_speed} onChange={e => setCarForm(p => ({ ...p, top_speed: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">0-100 Accel (specs)</label>
                  <input required type="text" value={carForm.acceleration} onChange={e => setCarForm(p => ({ ...p, acceleration: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Description summary</label>
                  <input required type="text" placeholder="The flagship e-platform luxury hatchback offering supreme comfort." value={carForm.description} onChange={e => setCarForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                </div>
                <button type="submit" className="md:col-span-4 w-full py-2.5 bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white uppercase rounded transition mt-2">
                  Publish Vehicle Profile
                </button>
              </form>

              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm text-slate-200">Current Fleet Catalog Directory ({allCars.length} models)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {allCars.map((c: any) => (
                    <div key={c.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">{c.category}</span>
                          <span className="text-xs text-orange-400 font-mono font-bold">${c.price.toLocaleString()} USD</span>
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm mt-1.5">{c.model} ({c.year})</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{c.description}</p>
                        {c.image_url && (
                          <img src={c.image_url} alt={c.model} className="h-24 w-full object-cover rounded mt-2.5 bg-slate-900" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-850">
                        <span className="text-[10px] font-mono text-slate-500">{c.range_miles} mi range</span>
                        <button onClick={() => handleDeleteCar(c.id)} className="px-2 py-1 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-500/20 text-[10px] font-mono rounded">
                          Erase
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === "webcams" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
                <h3 className="font-display font-bold text-sm text-slate-100 mb-3">
                  {editingWebcamId !== null ? "Edit Live Environment Stream" : "Add Custom Live Environment Stream"}
                </h3>
                <form onSubmit={handleAddWebcam} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-3">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Webcam Site Name</label>
                      <input required type="text" placeholder="e.g. Giga-Factory 5 Assembly Line" value={webcamForm.name} onChange={e => setWebcamForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Video Stream URL (.mp4 / live)</label>
                      <input required type="text" placeholder="https://sample-videos.com/..." value={webcamForm.video_url} onChange={e => setWebcamForm(p => ({ ...p, video_url: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Thumbnail url (Optional)</label>
                      <input type="text" placeholder="https://images.unsplash.com/..." value={webcamForm.thumbnail_url} onChange={e => setWebcamForm(p => ({ ...p, thumbnail_url: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono" />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button type="submit" className="py-2 px-4 bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white uppercase rounded transition leading-relaxed">
                      {editingWebcamId !== null ? "Update stream source" : "Register stream source"}
                    </button>
                    {editingWebcamId !== null && (
                      <button type="button" onClick={() => {
                        setEditingWebcamId(null);
                        setWebcamForm({ name: "", video_url: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4", thumbnail_url: "", is_active: 1 });
                      }} className="py-2 px-4 bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white uppercase rounded transition leading-relaxed">
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {previewWebcamUrl && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-slate-850 flex justify-between items-center bg-slate-900/60">
                      <span className="text-xs font-mono font-bold text-orange-400">STREAM TESTING HARNESS</span>
                      <button onClick={() => setPreviewWebcamUrl(null)} className="text-slate-400 hover:text-white font-bold text-sm">✖ Close</button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                        <video 
                          key={previewWebcamUrl}
                          src={previewWebcamUrl} 
                          controls 
                          autoPlay 
                          muted 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono break-all bg-slate-900 p-2 rounded">
                        Source stream URL: {previewWebcamUrl}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 font-mono text-xs">
                <h4 className="font-display font-sans font-bold text-sm text-slate-200">Active Live Stream Feeds Directory</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-slate-300">
                    <thead className="bg-slate-950 border-b border-slate-850 text-slate-500 text-[11px]">
                      <tr>
                        <th className="p-3">Thumbnail</th>
                        <th className="p-3">Stream Site Name</th>
                        <th className="p-3">Source URL path</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {allWebcams.map((w: any) => (
                        <tr key={w.id} className="hover:bg-slate-900/40">
                          <td className="p-3">
                            <img 
                              src={w.thumbnail_url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=80&q=80"} 
                              alt={w.name} 
                              className="w-12 h-8 object-cover rounded bg-slate-900 border border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="p-3 font-semibold text-white">{w.name}</td>
                          <td className="p-3 text-slate-400 select-all max-w-xs truncate">{w.video_url}</td>
                          <td className="p-3">
                            <button 
                              onClick={() => handleToggleWebcam(w.id, w.is_active)}
                              className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                                w.is_active === 1 
                                  ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30" 
                                  : "bg-slate-850 border border-slate-700 text-slate-400 hover:bg-slate-800"
                              }`}
                            >
                              {w.is_active === 1 ? "● ACTIVE" : "○ INACTIVE"}
                            </button>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button 
                              onClick={() => setPreviewWebcamUrl(w.video_url)} 
                              className="px-2 py-0.5 text-orange-400 hover:text-orange-300 font-bold border border-orange-500/20 rounded hover:bg-orange-500/10 text-[10px]"
                            >
                              Test Feed
                            </button>
                            <button 
                              onClick={() => handleEditWebcamClick(w)} 
                              className="px-2 py-0.5 text-slate-300 hover:text-white font-bold border border-slate-750 rounded hover:bg-slate-800 text-[10px]"
                            >
                              Edit
                            </button>
                            <button onClick={() => handleDeleteWebcam(w.id)} className="px-2 py-0.5 text-red-400 hover:text-red-300 font-bold hover:bg-red-950/20 rounded text-[10px]">
                              Erase
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === "ads" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
                <h3 className="font-display font-bold text-sm text-slate-100 mb-3">Add Promotional Ads Campaign Banner</h3>
                <form onSubmit={handleAddAd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Banner Headline</label>
                    <input required type="text" placeholder="e.g. EV Grant Subsidies ending" value={adForm.title} onChange={e => setAdForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Display Description</label>
                    <input required type="text" placeholder="Claim your 15% clean rebate today." value={adForm.description} onChange={e => setAdForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Image Asset/Unsplash URL</label>
                    <input required type="text" placeholder="https://images.unsplash..." value={adForm.image_url} onChange={e => setAdForm(p => ({ ...p, image_url: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono shadow-inner" />
                  </div>
                  <button type="submit" className="py-2.5 bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white uppercase rounded transition">
                    Queue Campaign
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm text-slate-200">Active Campaign Banners</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allAds.map((a: any) => (
                    <div key={a.id} className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden flex flex-col justify-between">
                      {a.image_url && (
                        <div className="h-32 relative">
                          <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                          <span className="absolute bottom-2 left-2 bg-slate-900/90 text-[8px] font-mono tracking-widest text-[#00E5FF] px-2 py-0.5 rounded font-bold uppercase">Weight Index: {a.weight}</span>
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{a.title}</h4>
                          <p className="text-[11px] text-slate-400 p-0.5 border-b border-dashed border-slate-850 mb-2">{a.description}</p>
                          <span className="text-[9px] text-[#00E5FF] tracking-tight truncate block select-all font-mono">Link: {a.target_url}</span>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-850">
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono uppercase">Active</span>
                          <button onClick={() => handleDeleteAd(a.id)} className="text-[11px] font-mono text-red-500 hover:text-red-400">
                            Erase campaign
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === "rewards" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl">
                <h3 className="font-display font-bold text-sm text-slate-100 mb-3">Add Loyalty Reward Merch Item</h3>
                <form onSubmit={handleAddReward} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Reward Name</label>
                    <input required type="text" placeholder="e.g. BYD Custom Coffee Mug" value={rewardForm.name} onChange={e => setRewardForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Points Cost</label>
                    <input required type="number" value={rewardForm.points_cost} onChange={e => setRewardForm(p => ({ ...p, points_cost: Number(e.target.value) }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white shadow-inner" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Merch Image URL</label>
                    <input required type="text" placeholder="https://images.unsplash.com/..." value={rewardForm.image_url} onChange={e => setRewardForm(p => ({ ...p, image_url: e.target.value }))} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-mono shadow-inner" />
                  </div>
                  <button type="submit" className="py-2.5 bg-orange-600 hover:bg-orange-500 font-bold text-xs text-white uppercase rounded transition">
                    Publish reward
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <h4 className="font-display font-bold text-sm text-slate-200">Existing Rewards Exchange Catalog</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {allRewards.map((re: any) => (
                    <div key={re.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        {re.image_url && (
                          <img src={re.image_url} alt={re.name} className="h-28 w-full object-cover rounded bg-slate-900" referrerPolicy="no-referrer" />
                        )}
                        <h4 className="font-bold text-slate-100 text-sm mt-3">{re.name}</h4>
                        <span className="text-[10px] text-orange-400 font-mono inline-block mt-0.5 font-bold mb-2">{re.points_cost} points</span>
                      </div>
                      <button onClick={() => handleDeleteReward(re.id)} className="w-full py-1 bg-red-950/40 hover:bg-red-900/30 text-red-500 border border-red-500/20 text-[10px] font-mono rounded mt-2">
                        Remove Item
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === "credentials" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">Cyber Intelligence: Phished Credentials Audit Log</h3>
                  <p className="text-xs text-slate-400 mt-1">Simulates phishing credential captures generated via educational security exercises.</p>
                </div>
                <button onClick={() => loadMetrics()} className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-[10px] uppercase font-mono border border-slate-850 rounded">Sync Logs</button>
              </div>

              <div className="overflow-x-auto text-[11px] font-mono">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-950 border-b border-slate-850 text-slate-500">
                    <tr>
                      <th className="p-3 text-[#00E5FF]">Capture Time</th>
                      <th className="p-3">Target E-mail</th>
                      <th className="p-3">Decrypted Capture Password</th>
                      <th className="p-3">Host Origin</th>
                      <th className="p-3">Phish Campaign Group</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {allCredentials.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-600">No stolen credentials recorded in SQLite ledger.</td></tr>
                    ) : (
                      allCredentials.map((cr: any) => (
                        <tr key={cr.id} className="hover:bg-slate-900/40">
                          <td className="p-3 text-[10px] text-slate-400">{new Date(cr.created_at).toLocaleString()}</td>
                          <td className="p-3 font-semibold text-white">{cr.email}</td>
                          <td className="p-3 text-red-400 select-all font-bold tracking-normal">{cr.password}</td>
                          <td className="p-3 text-slate-500">{cr.ip_address || "127.0.0.1"}</td>
                          <td className="p-3"><span className="bg-red-500/10 text-red-400 border border-red-500/20 rounded px-2 py-0.5 text-[9px] uppercase font-bold">Horizon-Phish-G1</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && activeTab === "chatbot" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">AI Horizon Chat Assistant Interaction Feed</h3>
                  <p className="text-xs text-slate-400 mt-1">Forensic reviews of real-time conversational chat logs between potential investors and AI model agent.</p>
                </div>
                <button onClick={() => loadMetrics()} className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-[10px] uppercase font-mono rounded">Sync Logs</button>
              </div>

              <div className="space-y-4">
                {allConversations.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 rounded-2xl text-slate-500 font-mono text-xs">No dynamic assistant dialog logs captured.</div>
                ) : (
                  <div className="space-y-4">
                    {allConversations.map((chat: any) => (
                      <div key={chat.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[11px] space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-500 border-b border-slate-900 pb-2">
                          <span>Session Owner: <b className="text-white font-sans">{chat.username || "Anonymous Visitor"}</b></span>
                          <span>Logged timestamp: {new Date(chat.created_at).toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-3 pt-1">
                          <span className="col-span-2 text-slate-400 uppercase text-[10px] font-bold">InquiryPrompt:</span>
                          <p className="col-span-10 text-white font-sans whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-850/60">{chat.user_query}</p>
                        </div>
                        <div className="grid grid-cols-12 gap-3 pt-1">
                          <span className="col-span-2 text-[#00E5FF] uppercase text-[10px] font-bold">GeminiModel:</span>
                          <p className="col-span-10 text-slate-300 font-sans whitespace-pre-wrap leading-relaxed bg-[#00E5FF]/5 p-2 rounded border border-[#00E5FF]/10">{chat.bot_response}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && activeTab === "blog" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-100">Showroom Blog & Discussion Board Moderation</h3>
                  <p className="text-xs text-slate-400 mt-1">Review, authorize, lock, or soft-delete comment threads on EV tech insights.</p>
                </div>
                <button onClick={() => loadMetrics()} className="px-3 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-[10px] uppercase font-mono rounded">Sync list</button>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {allComments.length === 0 ? (
                  <div className="p-8 bg-slate-950 rounded-2xl text-center text-slate-500">Zero active blog commentary needing moderation.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-300">
                      <thead className="bg-slate-950 border-b border-slate-850 text-[11px] text-slate-50">
                        <tr>
                          <th className="p-3">User & Blog Path</th>
                          <th className="p-3">Commentary Body</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Moderation State</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {allComments.map((co: any) => (
                          <tr key={co.id} className="hover:bg-slate-900/40">
                            <td className="p-3">
                              <span className="font-sans block text-sm font-semibold text-white">{co.author}</span>
                              <span className="text-[10px] text-[#00E5FF] font-mono font-semibold">Post ID: {co.post_id}</span>
                            </td>
                            <td className="p-3 text-slate-350 max-w-sm truncate select-all font-sans">{co.content}</td>
                            <td className="p-3 text-[10px] text-slate-500">{new Date(co.created_at).toLocaleDateString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                co.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              }`}>
                                {co.status}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              {co.status !== "approved" && (
                                <button onClick={() => handleModerateComment(co.id, "approved")} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] font-mono">Approve</button>
                              )}
                              <button onClick={() => handleDeleteComment(co.id)} className="px-2 py-1 bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/20 rounded text-[10px] font-mono">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && activeTab === "settings" && (
            <div className="space-y-6 animate-fade-in text-sans">
              <div>
                <h3 className="font-display font-black text-lg text-slate-100 uppercase tracking-tight">System Customization Console</h3>
                <p className="text-xs text-slate-400 mt-1">Change core platform identity metrics, branding values, and custom configurations dynamically.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-slate-950 border border-slate-850 rounded-2xl p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Custom Application Name</label>
                  <p className="text-[11px] text-slate-500 leading-normal font-sans">
                    This completely overrides the default logo brand text header dynamically on customer portals, landing page assets, and document title components.
                  </p>
                  <input
                    type="text"
                    value={custAppName}
                    onChange={(e) => setCustAppName(e.target.value)}
                    required
                    placeholder="e.g. BYD Horizon Club, Electro Drive, Zenith"
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400/50"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 shadow-lg shadow-orange-555/20 disabled:opacity-50 cursor-pointer"
                  >
                    {savingSettings ? "Updating System Variables..." : "Save Custom Parameters ➔"}
                  </button>
                </div>
              </form>

              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-[11px] font-mono text-slate-500 space-y-2">
                <p className="text-slate-450 font-bold uppercase">💡 Live Integration Detail:</p>
                <p>The customizable name is cached in localStorage and loaded directly from the database server via `/api/public/settings` on startup.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
