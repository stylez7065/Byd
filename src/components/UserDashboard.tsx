import React, { useState, useEffect, useRef } from "react";
import { MapPin, Users, Heart, Gift, ExternalLink, ShieldCheck, MailWarning, Compass, ShieldAlert, Copy, RefreshCw, Eye, EyeOff, Award, CheckCircle, Clock, Lock, Video, Flame, Shield, Monitor, Camera, Wallet, CreditCard, ArrowUpRight, Ship, Anchor, Upload, FileText, Settings } from "lucide-react";
import { DashboardData, RewardItem } from "../types";

// Import new modular custom elements
import { LiveTrackingMap } from "./map/LiveTrackingMap";
import { DelayBanner } from "./map/DelayBanner";
import { LiveWebcamGrid } from "./live/LiveWebcamGrid";
import { TransitUpdatePanel } from "./dashboard/TransitUpdatePanel";
import { CarInspectSection } from "./cars/CarInspectSection";
import { DailyCheckin } from "./gamification/DailyCheckin";
import { SpinWheel } from "./gamification/SpinWheel";
import { BYDQuiz } from "./gamification/BYDQuiz";
import { NotificationBell } from "./ui/NotificationBell";
import HelpPage from "./HelpPage";

interface UserDashboardProps {
  authToken: string;
  onNavigate: (view: "landing" | "payment" | "dashboard" | "admin" | "help", params?: any) => void;
}

const cameraUrls = [
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=400&q=80", // highway dusk
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=400&q=80", // mountain pass road
  "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=400&q=80", // aerial high road
  "https://images.unsplash.com/photo-1422405913333-f15ae8b1a907?auto=format&fit=crop&w=400&q=80", // coastal highway
];

const fakeReferralsToasts = [
  { user: "Sarah_Seal", friend: "Toby_J", amount: 50 },
  { user: "Leo_Drive", friend: "Aaron_B", amount: 50 },
  { user: "EcoRiderMax", friend: "Jenn_K", amount: 50 },
  { user: "VoltPioneer", friend: "Luke_S", amount: 50 },
];

const getAvatarUrl = (name: string) => {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const heads = [
    "1534528741775-53994a69daeb",
    "1506794778202-cad84cf45f1d",
    "1494790108377-be9c29b29330",
    "1507003211169-0a1dd7228f2d",
    "1438761681033-6461ffad8d80",
    "1500648767791-00dcc994a43e",
  ];
  return `https://images.unsplash.com/photo-${heads[hash % heads.length]}?auto=format&fit=crop&w=80&h=80&q=80`;
};

export default function UserDashboard({ authToken, onNavigate }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<"tracking" | "webcams" | "car-inspect" | "gamification" | "referrals" | "rewards" | "support" | "wallet" | "insurance" | "settings">("tracking");
  
  // KYC restriction popup
  const [kycPopupOpen, setKycPopupOpen] = useState(false);
  const [kycModalTabName, setKycModalTabName] = useState("");

  const handleTabClick = (tab: "tracking" | "webcams" | "car-inspect" | "gamification" | "referrals" | "rewards" | "support" | "wallet" | "insurance" | "settings") => {
    if (data?.user?.kyc_status !== "verified" && tab !== "tracking" && tab !== "support" && tab !== "wallet" && tab !== "settings") {
      setKycModalTabName(
        tab === "webcams" ? "Live Telepresence Grid" :
        tab === "car-inspect" ? "HD Component Inspect" :
        tab === "gamification" ? "Club Game Rewards" :
        tab === "referrals" ? "Referrals Dashboard" :
        tab === "rewards" ? "Points Rewards Store" :
        tab === "insurance" ? "Insurance Policies" : tab
      );
      setKycPopupOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rewardsList, setRewardsList] = useState<RewardItem[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [expediteLoading, setExpediteLoading] = useState(false);
  
  // Balance privacy/hashing state
  const [hideBalances, setHideBalances] = useState(() => {
    return localStorage.getItem("byd_hide_balances") === "true";
  });

  const handleToggleHideBalances = () => {
    setHideBalances(prev => {
      const next = !prev;
      localStorage.setItem("byd_hide_balances", String(next));
      return next;
    });
  };

  const formatBalance = (val: number, isCurrency = true) => {
    if (hideBalances) {
      // Deterministic technical security hash based on value representation
      const str = val.toString();
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash;
      }
      const hexHash = Math.abs(hash).toString(16).substring(0, 6).toUpperCase();
      return `[HASH:${hexHash}]`;
    }
    return isCurrency ? `$${val.toFixed(2)} USD` : `${val.toLocaleString()} pts`;
  };

  // Escrow Wallet states
  const [depositAmount, setDepositAmount] = useState<string>("250");
  const [depositCoin, setDepositCoin] = useState<string>("USDT_TRC20");
  const [depositTxHash, setDepositTxHash] = useState<string>("");
  const [depositSubmitting, setDepositSubmitting] = useState<boolean>(false);
  
  // --- USER SETTINGS CUSTOMIZATION STATES ---
  const [settingsName, setSettingsName] = useState("");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsCity, setSettingsCity] = useState("");
  const [settingsWallet, setSettingsWallet] = useState("");
  const [settingsIncognito, setSettingsIncognito] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Fake toast referral notification popup
  const [toast, setToast] = useState<{ user: string; friend: string; amount: number } | null>(null);

  // Unsplash Camera snap state
  const [camSnapshotIdx, setCamSnapshotIdx] = useState(0);
  const [camTimestamp, setCamTimestamp] = useState(new Date().toLocaleTimeString());

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const polylineInstanceRef = useRef<any>(null);

  // --- KYC BIOMETRICS WIZARD STATES ---
  const [kycFormExpanded, setKycFormExpanded] = useState(true);
  const [kycForm, setKycForm] = useState({
    name: "",
    dob: "1997-08-14",
    nationality: "RU",
    idNumber: "",
    idFront: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'><rect width='200' height='120' fill='%231e293b' rx='8'/><text x='20' y='65' fill='%2306b6d4' font-size='10' font-family='monospace' font-weight='bold'>MOCK_ID_FRONT_DEFAULT</text></svg>",
    idBack: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'><rect width='200' height='120' fill='%231e293b' rx='8'/><text x='20' y='65' fill='%2306b6d4' font-size='10' font-family='monospace' font-weight='bold'>MOCK_ID_BACK_SIGNATURE</text></svg>",
    addressProof: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'><rect width='200' height='120' fill='%231e293b' rx='8'/><text x='20' y='65' fill='%2306b6d4' font-size='10' font-family='monospace' font-weight='bold'>MOCK_ADDRESS_PROOF_BILL</text></svg>",
  });
  const [frontFileName, setFrontFileName] = useState("");
  const [backFileName, setBackFileName] = useState("");
  const [addressFileName, setAddressFileName] = useState("");

  const handleDocumentChange = (field: "idFront" | "idBack" | "addressProof", file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setKycForm(p => ({ ...p, [field]: reader.result }));
        if (field === "idFront") setFrontFileName(file.name);
        if (field === "idBack") setBackFileName(file.name);
        if (field === "addressProof") setAddressFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const [kycSelfie, setKycSelfie] = useState<string>("");
  const [kycWebcamActive, setKycWebcamActive] = useState(false);
  const [kycVideoStream, setKycVideoStream] = useState<MediaStream | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycSuccessMessage, setKycSuccessMessage] = useState<string | null>(null);
  const [kycErrorMessage, setKycErrorMessage] = useState<string | null>(null);

  // Stack of active disruptive compliance alerts
  const [kycAlerts, setKycAlerts] = useState<Array<{ id: number; text: string; sub: string }>>([]);

  // Set default name once user data is retrieved
  useEffect(() => {
    if (data && data.user && !kycForm.name) {
      setKycForm(prev => ({ ...prev, name: data.user.name }));
    }
  }, [data]);

  // Submit KYC handler
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycErrorMessage(null);
    setKycSuccessMessage(null);
    setKycLoading(true);

    if (!kycForm.name || !kycForm.idNumber) {
      setKycErrorMessage("❗ Please fill out all required fields (Full Legal Name and Document Number).");
      setKycLoading(false);
      return;
    }

    try {
      const payload = {
        name: kycForm.name,
        dob: kycForm.dob,
        nationality: kycForm.nationality,
        idNumber: kycForm.idNumber,
        idFront: kycForm.idFront,
        idBack: kycForm.idBack,
        selfie: kycSelfie || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23111827' stroke='%2300E5FF' stroke-width='2'/><path d='M50 35a15 15 0 1 0 0 30 15 15 0 0 0 0-30z M20 80c0-15 15-20 30-20s30 5 30 20' fill='none' stroke='%2300E5FF' stroke-width='2'/></svg>",
        addressProof: kycForm.addressProof
      };

      const res = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });
      const resJson = await res.json();

      if (res.ok) {
        setKycSuccessMessage("🎉 Documents submitted successfully! Your account profile is now pending KYC review.");
        loadSummaryData(); // Sync up updated kyc_status on the screen
      } else {
        setKycErrorMessage(resJson.error || "KYC submission failed.");
      }
    } catch {
      setKycErrorMessage("Could not connect to secure verification clearance server.");
    } finally {
      setKycLoading(false);
    }
  };

  // Spawning loop for hovering warnings disabled per developer request to avoid distraction.
  useEffect(() => {
    // Disabled to keep desktop interface smooth and uninterrupted
    return () => {};
  }, [data]);

  // Load Dashboard Data
  const loadSummaryData = async () => {
    try {
      const res = await fetch("/api/dashboard/summary", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const resJson = await res.json();
      
      if (res.ok) {
        setData(resJson);
      } else {
        alert(resJson.error || "Dashboard authorization failed.");
        onNavigate("landing");
      }
    } catch {
      console.error("Summary fetch connection error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummaryData();
    
    // Fetch products catalog
    fetch("/api/rewards/items")
      .then(res => res.json())
      .then(items => setRewardsList(items))
      .catch(() => {});

    // Browser Notification Permission Request
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [authToken]);

  useEffect(() => {
    if (data?.user) {
      setSettingsName(data.user.name || "");
      setSettingsPhone(data.user.phone || "");
      setSettingsCity(data.user.city || "");
      setSettingsWallet(data.user.crypto_wallet_address || "");
      setSettingsIncognito(!!data.user.is_incognito);
    }
  }, [data?.user?.id]);

  // Handle camera rotating Term Feed
  useEffect(() => {
    const timer = setInterval(() => {
      setCamSnapshotIdx(prev => (prev + 1) % cameraUrls.length);
      setCamTimestamp(new Date().toLocaleTimeString());
    }, 60000); // 1 minute
    return () => clearInterval(timer);
  }, []);

  // Fake random toast notifications loop
  useEffect(() => {
    const triggerToast = () => {
      const randomToast = fakeReferralsToasts[Math.floor(Math.random() * fakeReferralsToasts.length)];
      setToast(randomToast);
      setTimeout(() => setToast(null), 5000); // clear after 5 sec
    };

    const interval = setInterval(triggerToast, 18000); // every 18 seconds
    // trigger once on load
    const timeout = setTimeout(triggerToast, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Render maps on Tracking data loaded
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !data || !data.user || !mapContainerRef.current || activeTab !== "tracking") return;

    // Destruct user transport points
    const startLat = 33.7431;
    const startLng = -118.2673; // Port of LA
    
    const uCity = data.user.city.toLowerCase();
    const endLat = uCity.includes("seattle") ? 47.6062 :
                 uCity.includes("new york") ? 40.7128 :
                 uCity.includes("san francisco") ? 37.7749 :
                 uCity.includes("austin") ? 30.2672 : 30.2672; // Default Austin, TX
    const endLng = uCity.includes("seattle") ? -122.3321 :
                 uCity.includes("new york") ? -74.0060 :
                 uCity.includes("san francisco") ? -122.4194 :
                 uCity.includes("austin") ? -97.7431 : -97.7431;

    // Generate Route spline
    const routePoints: Array<[number, number]> = [];
    for (let i = 0; i <= 100; i++) {
      const ratio = i / 100;
      const wobbleLat = Math.sin(ratio * Math.PI) * 1.5;
      const wobbleLng = -Math.sin(ratio * Math.PI) * 1.0;
      routePoints.push([
        startLat + (endLat - startLat) * ratio + wobbleLat,
        startLng + (endLng - startLng) * ratio + wobbleLng
      ]);
    }

    const routeIndex = data.tracking ? data.tracking.route_index : 0;
    const currentPos = routePoints[routeIndex] || [startLat, startLng];

    // Initialize Map element
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView(currentPos, 4);

      // Load clean dark mode OpenStreetMap tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18
      }).addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.setView(currentPos);
    }

    // Dynamic Polyline Drawing
    if (polylineInstanceRef.current) {
      polylineInstanceRef.current.setLatLngs(routePoints);
    } else {
      polylineInstanceRef.current = L.polyline(routePoints, {
        color: "#3b82f6",
        weight: 3,
        opacity: 0.8
      }).addTo(mapInstanceRef.current);
    }

    // Dynamic Customized Marker
    const customIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-6 w-6 rounded-full bg-blue-500 opacity-60 animate-ping"></div>
          <div class="h-4 w-4 rounded-full bg-blue-600 border border-slate-950 flex items-center justify-center text-[8px] font-bold text-white">EV</div>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [24, 24]
    });

    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng(currentPos);
    } else {
      markerInstanceRef.current = L.marker(currentPos, { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`🚀 BYD Fleet Trans-Transit: Cargo stage ${routeIndex}% completed.`)
        .openPopup();
    }

    // Force map resize adjustment
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      // Keep map persisted for seamless updates but align markers
    };
  }, [data, activeTab]);

  // Request Expedite logic handler (Crypto pop)
  const handleExpedite = async () => {
    setExpediteLoading(true);
    try {
      const res = await fetch("/api/tracking/expedite", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${authToken}`
        }
      });
      const expediteRes = await res.json();
      if (res.ok) {
        alert(`Logistic clearance override broadcast! Address to settle hold fee of 49.00 USDT: ${expediteRes.wallet_address}. We have updated your transit priorities.`);
        loadSummaryData(); // refresh dashboard
      } else {
        alert(expediteRes.error || "Expedite initialization error.");
      }
    } catch {
      alert("Error bypassing logistics holds.");
    } finally {
      setExpediteLoading(false);
    }
  };

  // Redeem Reward Product
  const handleRedeemReward = async (itemId: number) => {
    setRedeemSuccess(null);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ itemId })
      });
      
      const resJson = await res.json();
      if (res.ok) {
        setRedeemSuccess(`${resJson.message} Tracking reference allocated: ${resJson.tracking_number}`);
        loadSummaryData(); // update points balances
      } else {
        alert(resJson.error || "Redemption request declined.");
      }
    } catch {
      alert("Unable to redeem item.");
    }
  };

  const handleDispatchPackage = async (redemptionId: number, fee: number) => {
    try {
      const res = await fetch("/api/dispatch/package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ redemptionId, fee })
      });
      const resJson = await res.json();
      if (res.ok) {
        alert(resJson.message || "Cargo dispatched successfully!");
        loadSummaryData();
      } else {
        if (resJson.error && resJson.error.toLowerCase().includes("insufficient")) {
          if (confirm(`${resJson.error}\n\nWould you like to open your Wallet Escrow Hub to make a quick cryptocurrency top-up?`)) {
            setActiveTab("wallet");
          }
        } else {
          alert(resJson.error || "Unable to dispatch.");
        }
      }
    } catch {
      alert("Escrow clearance dispatch execution error.");
    }
  };

  const handleDepositProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !depositTxHash) {
      alert("Please supply both a deposit amount and a blockchain transaction hash.");
      return;
    }
    setDepositSubmitting(true);
    try {
      const res = await fetch("/api/payments/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          transactionHash: depositTxHash,
          coin: depositCoin
        })
      });
      const resJson = await res.json();
      if (res.ok) {
        alert(`Deposit proof recorded! Payment ID #${resJson.paymentId || "pending"} queued. Transfer will be credited to your balance instantly once the administrator approves this hash.`);
        setDepositTxHash("");
        loadSummaryData(); // update ledger and balance states
      } else {
        alert(resJson.error || "Unable to submit crypto deposit proof.");
      }
    } catch {
      alert("Error logging cryptocurrency deposit.");
    } finally {
      setDepositSubmitting(false);
    }
  };

  const handlePurchaseInsurance = async (planName: string, premium: number, limit: number) => {
    const carModel = data?.activeVehicle?.model || "BYD Seal AWD Executive";
    if (!confirm(`Are you sure you want to purchase "${planName}" protection coverage for your vehicle (${carModel})?\n\nFirst premium of $${premium.toFixed(2)} USD will be deducted instantly from your Wallet Escrow Hub Balance.`)) {
      return;
    }
    try {
      const res = await fetch("/api/insurance/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ carModel, planName, premium, limit })
      });
      const resJson = await res.json();
      if (res.ok) {
        alert(resJson.message || "Insurance policy established successfully!");
        loadSummaryData(); // update stats, balances, and policies
      } else {
        if (resJson.error && resJson.error.toLowerCase().includes("insufficient")) {
          if (confirm(`${resJson.error}\n\nWould you like to open your Wallet Escrow Hub to make a quick cryptocurrency top-up?`)) {
            setActiveTab("wallet");
          }
        } else {
          alert(resJson.error || "Establishment of insurance plan rejected.");
        }
      }
    } catch {
      alert("Error establishing insurance policy.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Referral code copied successfully!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="font-mono text-xs text-slate-500">Decrypting Horizon Nodes...</span>
      </div>
    );
  }

  if (!data) return null;

  const userExpiryDate = data.user.membership_expiry 
    ? new Date(data.user.membership_expiry).toLocaleDateString()
    : "December 2026 (Trial Mode)";

  return (
    <div className="w-full relative" id="user-dashboard">
      
      {/* Referral toast popup */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 border border-emerald-500/30 p-4 rounded-xl shadow-2xl flex items-center space-x-3 text-xs text-slate-200 animate-bounce">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <div>
            <span className="text-emerald-400 font-bold">@{toast.user}</span> just earned <span className="text-white font-mono font-bold">$50.00</span> by referring <span className="text-blue-400">@{toast.friend}</span>!
          </div>
        </div>
      )}

      {/* Header Dashboard panel */}
      <header className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-lg mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white">Welcome, {data.user.name}</h1>
            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
              {data.user.membership_active ? "Club Member" : "Guest Account"}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1 font-mono">
            <span>Membership Active Until: {userExpiryDate}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Privacy / Balance Masking Toggle Button */}
          <button
            onClick={handleToggleHideBalances}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/30 text-slate-400 hover:text-white transition flex items-center space-x-1.5 text-[10px] uppercase font-mono tracking-wider cursor-pointer shadow-sm focus:outline-none"
            title={hideBalances ? "Show actual balances" : "Hide/Hash balances on dashboard"}
          >
            {hideBalances ? (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Decrypt UI</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Encrypt Display</span>
              </>
            )}
          </button>

          <NotificationBell authToken={authToken} />
          
          <div className="bg-slate-950 border border-slate-800 px-5 py-3 rounded-xl flex flex-col items-end">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">Your Horizon Points</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
              {formatBalance(data.user.horizon_points || 0, false)}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">1,000 points = $10 catalog value</span>
          </div>
        </div>
      </header>

      {/* Primary layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation sidebar */}
        <aside className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 sm:space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-semibold px-3 mb-2 block font-mono">Club Terminal Panel</span>
          <button 
            id="nav-tracking"
            onClick={() => handleTabClick("tracking")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "tracking" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <Compass className="w-4 h-4" />
            <span>My BYD Logistics Map</span>
          </button>

          <button 
            id="nav-webcams"
            onClick={() => handleTabClick("webcams")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "webcams" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <Video className="w-4 h-4" />
            <span>Live Telepresence Grid</span>
          </button>

          <button 
            id="nav-car-inspect"
            onClick={() => handleTabClick("car-inspect")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "car-inspect" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <Monitor className="w-4 h-4" />
            <span>HD Component Inspect</span>
          </button>

          <button 
            id="nav-gamification"
            onClick={() => handleTabClick("gamification")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "gamification" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <Flame className="w-4 h-4" />
            <span>Club Game Rewards</span>
          </button>
          
          <button 
            id="nav-referrals"
            onClick={() => handleTabClick("referrals")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "referrals" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-550/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <Users className="w-4 h-4" />
            <span>Referrals Dashboard</span>
          </button>

          <button 
            id="nav-rewards"
            onClick={() => handleTabClick("rewards")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "rewards" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <Gift className="w-4 h-4" />
            <span>Points Rewards Store</span>
          </button>

          <button 
            id="nav-wallet"
            onClick={() => handleTabClick("wallet")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "wallet" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <Wallet className="w-4 h-4" />
            <span>Wallet Escrow Hub</span>
          </button>

          <button 
            id="nav-insurance"
            onClick={() => handleTabClick("insurance")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "insurance" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Insurance Policies</span>
          </button>

          <button 
            id="nav-settings"
            onClick={() => handleTabClick("settings")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "settings" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <Settings className="w-4 h-4" />
            <span>Profile & KYC Settings</span>
          </button>

          <button 
            id="nav-support"
            onClick={() => handleTabClick("support")}
            className={`w-full py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider rounded-xl flex items-center space-x-3 transition duration-150 ${activeTab === "support" ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Support & Help FAQ</span>
          </button>
        </aside>

        {/* Dashboard Main display portal */}
        <div className="lg:col-span-9 space-y-6">

          {/* Prominent Compliance KYC Alert-Disruptor & Wizard */}
          {data && data.user && data.user.kyc_status !== "verified" && (
            <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-red-950/20">
              {/* Pulsing alarm bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pb-4 border-b border-red-500/20 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-red-950/40 p-2 rounded-lg border border-red-500/40 animate-pulse">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white tracking-tight uppercase font-mono">
                      🔴 KYC: Biometric Identity Clearance Required
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Security Level: High • Status: <span className="text-red-400 uppercase font-bold">{data.user.kyc_status || "not_submitted"}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setKycFormExpanded(!kycFormExpanded)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-[10px] rounded border border-white/10 text-slate-300 font-mono"
                >
                  {kycFormExpanded ? "Collapse Block [-]" : "Expand Block [+]"}
                </button>
              </div>

              {kycFormExpanded && (
                <div className="space-y-4 text-xs">
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    <strong>Notice:</strong> Your portfolio is currently restricted to demo sandbox protocols. Until biometric verification is audited, logistics map routing and premium redemptions remain locked. Please complete the secure terminal below to submit your details for verification.
                  </p>

                  <form onSubmit={handleKycSubmit} className="space-y-4 pt-3 border-t border-slate-800">
                    {kycSuccessMessage && (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-xl leading-relaxed text-[11px]">
                        {kycSuccessMessage}
                      </div>
                    )}
                    
                    {kycErrorMessage && (
                      <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-xl leading-relaxed text-[11px]">
                        {kycErrorMessage}
                      </div>
                    )}

                    {data.user.kyc_status === "pending" && (
                      <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-2xl flex flex-col items-center text-center space-y-2">
                        <Clock className="w-8 h-8 text-blue-400 animate-spin" />
                        <h4 className="text-xs font-bold text-blue-300 uppercase font-mono">Biometric Screening Under Audit</h4>
                        <p className="text-[11px] text-slate-400 max-w-md leading-relaxed">
                          KYC Status: <span className="font-bold text-amber-400">PENDING KYC COMPLIANCE REVIEW</span>. Your verification materials are currently queued for regulatory review. This process is typically finalized within 24 hours.
                        </p>
                      </div>
                    )}

                    {data.user.kyc_status !== "pending" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Full Legal Name (as in Passport) *</label>
                            <input
                              type="text"
                              required
                              value={kycForm.name}
                              onChange={e => setKycForm(p => ({ ...p, name: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono focus:border-red-500/40 outline-none text-xs"
                              placeholder="Johnathan Doe"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Date of Birth *</label>
                            <input
                              type="date"
                              required
                              value={kycForm.dob}
                              onChange={e => setKycForm(p => ({ ...p, dob: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono focus:border-red-500/40 outline-none text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Identity Document / Passport Number *</label>
                            <input
                              type="text"
                              required
                              placeholder="US-738201-9"
                              value={kycForm.idNumber}
                              onChange={e => setKycForm(p => ({ ...p, idNumber: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-white font-mono focus:border-red-500/40 outline-none text-xs"
                            />
                          </div>

                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={kycLoading}
                              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-red-500/10 cursor-pointer animate-pulse"
                            >
                              {kycLoading ? "Submitting Clearances..." : "Authorize and Submit KYC Case File"}
                            </button>
                          </div>
                        </div>

                        {/* Interactive Selfie Biometric Box */}
                        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col items-center justify-between min-h-[220px]">
                          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-2 text-center block w-full">Biometric Video Stream Channel</span>
                          
                          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-red-500/20 relative flex items-center justify-center bg-slate-900 shadow-inner">
                            {kycSelfie ? (
                              <img src={kycSelfie} alt="Bio Selfie" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : kycWebcamActive ? (
                              kycVideoStream ? (
                                <video 
                                  id="dashboard-webcam" 
                                  className="w-full h-full object-cover" 
                                  autoPlay 
                                  playsInline 
                                  muted 
                                  ref={el => {
                                    if (el && kycVideoStream) el.srcObject = kycVideoStream;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-2 text-center relative">
                                  <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-ping pointer-events-none" />
                                  <Camera className="w-5 h-5 text-emerald-400 animate-pulse mb-1" />
                                  <span className="text-[7px] font-mono text-cyan-300 uppercase animate-pulse">Liveness Scan-Active</span>
                                  <span className="text-[5px] font-mono text-slate-500 block leading-tight mt-0.5">SECURE SANDBOX SIMULATOR</span>
                                </div>
                              )
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-500">
                                <Video className="w-6 h-6 text-slate-600 mb-1" />
                                <span className="text-[8px] uppercase tracking-wider font-mono">Offline</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex space-x-2 w-full justify-center font-sans">
                            {!kycSelfie ? (
                              !kycWebcamActive ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setKycWebcamActive(true);
                                    try {
                                      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                                      setKycVideoStream(stream);
                                    } catch {
                                      // Fallback elegantly handled via secure visual simulator
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-mono text-[9px] uppercase font-bold rounded border border-white/5 flex items-center space-x-1.5 justify-center cursor-pointer"
                                >
                                  <Camera className="w-3 h-3 text-cyan-400" />
                                  <span>Start Local Webcam</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const videoEl = document.getElementById("dashboard-webcam") as HTMLVideoElement;
                                    if (videoEl && kycVideoStream) {
                                      const canvas = document.createElement("canvas");
                                      canvas.width = videoEl.videoWidth || 640;
                                      canvas.height = videoEl.videoHeight || 480;
                                      const ctx = canvas.getContext("2d");
                                      if (ctx) {
                                        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
                                        setKycSelfie(canvas.toDataURL("image/jpeg"));
                                      }
                                      kycVideoStream.getTracks().forEach(t => t.stop());
                                      setKycVideoStream(null);
                                      setKycWebcamActive(false);
                                    } else {
                                      // generate beautifully styled face fallback profile for secure sandbox environment
                                      setKycSelfie("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='#0f172a' stroke='#10b981' stroke-width='2'/><path d='M50 30a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M25 75c0-12 12-16 25-16s25 4 25 16' fill='none' stroke='#10b981' stroke-width='2'/></svg>");
                                      setKycWebcamActive(false);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-red-650 hover:bg-red-600 text-white font-mono text-[9px] uppercase font-bold rounded border border-red-500/30 cursor-pointer"
                                >
                                  Capture Biometric Frame
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setKycSelfie("");
                                }}
                                className="px-3 py-1.5 bg-slate-900 text-red-400 font-mono text-[9px] uppercase font-bold rounded border border-white/5 cursor-pointer"
                              >
                                Reset Captured Frame
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Legal Verification Documents Row */}
                        <div className="col-span-1 md:col-span-2 border-t border-slate-900 pt-4 mt-2">
                          <h4 className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-2.5 text-left">Legal Verification Documents (Optional Passport, Driving License & Proof of Residence files)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            
                            {/* ID Front */}
                            <label className="relative border border-dashed border-slate-800 hover:border-cyan-500/40 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[105px]">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDocumentChange("idFront", e.target.files[0]);
                                  }
                                }} 
                              />
                              <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 block">Passport / ID Front</span>
                              <span className="text-[8px] text-slate-500 mt-0.5 max-w-[120px] truncate leading-tight">
                                {frontFileName ? `✓ ${frontFileName}` : "Click to select file"}
                              </span>
                            </label>

                            {/* ID Back */}
                            <label className="relative border border-dashed border-slate-800 hover:border-cyan-500/40 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[105px]">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDocumentChange("idBack", e.target.files[0]);
                                  }
                                }} 
                              />
                              <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 block">Passport / ID Back</span>
                              <span className="text-[8px] text-slate-500 mt-0.5 max-w-[120px] truncate leading-tight">
                                {backFileName ? `✓ ${backFileName}` : "Click to select file"}
                              </span>
                            </label>

                            {/* Utility Bill Address Proof */}
                            <label className="relative border border-dashed border-slate-800 hover:border-cyan-500/40 bg-slate-950 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[105px]">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDocumentChange("addressProof", e.target.files[0]);
                                  }
                                }} 
                              />
                              <Upload className="w-5 h-5 text-slate-500 mb-1.5" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 block">Proof of Address</span>
                              <span className="text-[8px] text-slate-500 mt-0.5 max-w-[120px] truncate leading-tight">
                                {addressFileName ? `✓ ${addressFileName}` : "Click to select bill"}
                              </span>
                            </label>

                          </div>
                        </div>

                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-6">
              {/* Vehicle configuration hold summaries */}
              {data.activeVehicle ? (
                <div className="space-y-6">
                  {/* Real-time Delay Banner alerts custom module */}
                  <DelayBanner
                    authToken={authToken}
                    delaysEncountered={data.tracking ? data.tracking.delays_encountered : 0}
                    expeditePaid={data.tracking ? data.tracking.expedite_paid : false}
                    walletAddress={data.user ? data.user.crypto_wallet_address : ""}
                    onRefresh={loadSummaryData}
                  />

                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/30">In Transit Cargo</span>
                        <h3 className="font-display font-semibold text-lg sm:text-xl text-white mt-1">{data.activeVehicle.model}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-mono">
                          Global serial index: <span className="text-slate-300">#BYD-{data.user.id * 13}-HN</span>
                        </p>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 max-w-sm">
                        <span className="text-[10px] text-slate-500 uppercase font-mono font-semibold">Standard Scheduled Porting</span>
                        <span className="text-base sm:text-lg font-bold text-slate-300 font-mono block mt-0.5">
                          {data.activeVehicle.expectedDeliveryDate} 
                          {data.tracking && data.tracking.delays_encountered > 0 && !data.tracking.expedite_paid && (
                            <span className="text-[11px] text-orange-400 block sm:inline font-bold"> ★ Delayed</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-normal block italic mt-1 font-mono">Due to logistics grid congestions, expected carrier arrival dates shift.</span>
                      </div>
                    </div>
                  </div>

                  {/* Co-ownership Installment Ledger */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/60 pb-4">
                      <div>
                        <h4 className="font-display font-semibold text-xs text-slate-100 uppercase tracking-widest font-mono">Active Co-ownership Dues Ledger</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                          Track your monthly cryptocurrency fulfillment schedule and security statuses below.
                        </p>
                      </div>
                      <div className="text-right font-mono mt-2 sm:mt-0">
                        <span className="text-[10px] text-slate-500 uppercase block">Fulfillment Ratio</span>
                        <span className="text-blue-400 font-bold text-sm">
                          ${data.activeVehicle.totalPaid.toLocaleString()} / ${(data.activeVehicle.monthlyPayment * data.activeVehicle.installmentCount).toLocaleString()} USD
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto text-[11px] font-mono">
                      <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-950 border-b border-slate-800 text-slate-500">
                          <tr>
                            <th className="p-2">Settlement Index</th>
                            <th className="p-2">Scheduled Due Date</th>
                            <th className="p-2">Monthly Dues Settle</th>
                            <th className="p-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {Array.from({ length: Math.min(6, data.activeVehicle.installmentCount) }).map((_, i) => {
                            const isFirst = i === 0;
                            const indexNum = i + 1;
                            const amountForThis = data.activeVehicle.monthlyPayment;
                            const cumulNeeded = amountForThis * indexNum;
                            let statusStr = "Pending";
                            let statusColor = "text-slate-500";

                            if (data.activeVehicle.totalPaid >= cumulNeeded) {
                              statusStr = "Paid 🎉";
                              statusColor = "text-emerald-400 font-bold";
                            } else if (isFirst || data.activeVehicle.totalPaid >= cumulNeeded - amountForThis) {
                              statusStr = "Due Now (Payable)";
                              statusColor = "text-amber-400 font-bold animate-pulse";
                            } else {
                              statusStr = "Queued";
                              statusColor = "text-slate-600";
                            }

                            // Calculate mock future calendar dates
                            const mockDate = new Date(data.activeVehicle.expectedDeliveryDate);
                            mockDate.setMonth(mockDate.getMonth() - Math.min(2, 6 - i)); // stagger
                            
                            return (
                              <tr key={i} className="hover:bg-slate-950/20">
                                <td className="p-2.5">
                                  Dues {String(indexNum).padStart(2, "0")} 
                                  {isFirst && <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-1.5 py-0.5 rounded border border-blue-500/20 ml-2">Downpayment</span>}
                                </td>
                                <td className="p-2.5 font-mono text-slate-400">{mockDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                <td className="p-2.5 font-bold text-white">${amountForThis.toFixed(2)} USDT</td>
                                <td className={`p-2.5 text-right font-semibold ${statusColor}`}>{statusStr}</td>
                              </tr>
                            );
                          })}
                          {data.activeVehicle.installmentCount > 6 && (
                            <tr>
                              <td className="p-2 text-slate-500" colSpan={4}>+ {data.activeVehicle.installmentCount - 6} subsequent recurring months scheduled inside master registry ledger.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pay subsequent button */}
                    {data.activeVehicle.totalPaid < (data.activeVehicle.monthlyPayment * data.activeVehicle.installmentCount) && (
                      <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/40 p-4 rounded-xl border border-slate-850/65 gap-4">
                        <div className="flex items-center space-x-2 text-xs text-orange-400 font-bold max-w-md">
                          <MailWarning className="w-5 h-5 flex-shrink-0" />
                          <span>Attention: Timely monthly installment settlement is strictly required to hold active logistics priority.</span>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch("/api/payments/create", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "Authorization": `Bearer ${authToken}`
                                },
                                body: JSON.stringify({
                                  method: "crypto",
                                  type: "installment",
                                  amount: data!.activeVehicle!.monthlyPayment,
                                  vehicleModel: data!.activeVehicle!.model,
                                  monthlyInstallment: data!.activeVehicle!.monthlyPayment,
                                  termMonths: data!.activeVehicle!.installmentCount
                                })
                              });
                              const payData = await res.json();
                              if (res.ok) {
                                alert(`Subsequent monthly escrow wallet allocated!\n\nUSDT Deposit Address: ${payData.wallet_address}\nTransaction Memo: ${payData.transaction_hash}\n\nPay precisely $${data!.activeVehicle!.monthlyPayment} USDT. Your deposit will be fully audited and credited automatically.`);
                                loadSummaryData();
                              } else {
                                alert(payData.error);
                              }
                            } catch {
                              alert("Escrow setup connection failure.");
                            }
                          }}
                          className="py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 font-bold text-[10px] uppercase font-mono tracking-wider text-white rounded-lg shadow-lg shadow-emerald-950/20 transition flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                          <span>Settle Monthly Dues Via Crypto</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Leaflet Simulated Maps Panel - Custom modular maps list */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-[460px] relative">
                    <LiveTrackingMap
                      currentIdx={data.tracking ? data.tracking.route_index : 0}
                      destinationCity={data.activeVehicle ? data.activeVehicle.destination_city : "Chicago Hub"}
                    />
                  </div>

                  {/* Integrated Transit metrics timeline progress and logs */}
                  <TransitUpdatePanel
                    authToken={authToken}
                    routeIndex={data.tracking ? data.tracking.route_index : 0}
                    delaysEncountered={data.tracking ? data.tracking.delays_encountered : 0}
                    expeditePaid={data.tracking ? data.tracking.expedite_paid : false}
                    destinationCity={data.activeVehicle ? data.activeVehicle.destination_city : "Chicago Terminal"}
                  />
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl text-center space-y-4">
                  <Clock className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                  <div>
                    <h4 className="font-display font-bold text-slate-300">No Carrier Active</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      You do not have any vehicle hardware co-ownership installments configured yet. Settle down payment steps to initialize transit maps.
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate("payment")}
                    className="py-1.5 px-4 bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white rounded hover:bg-slate-700 transition"
                  >
                    Select Installment Plan
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "webcams" && (
            <div className="space-y-6 animate-fade-in">
              <LiveWebcamGrid authToken={authToken} />
            </div>
          )}

          {activeTab === "car-inspect" && (
            <div className="space-y-6 animate-fade-in">
              <CarInspectSection model={data.activeVehicle ? data.activeVehicle.model : "BYD Seal"} />
            </div>
          )}

          {activeTab === "gamification" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start animate-fade-in">
              <DailyCheckin
                authToken={authToken}
                points={data.user ? data.user.horizon_points : 0}
                onCheckinSuccess={(newPts) => {
                  setData((prev) => prev ? { ...prev, user: { ...prev.user, horizon_points: newPts } } : null);
                }}
              />
              <div className="space-y-6">
                <SpinWheel
                  authToken={authToken}
                  onSpinSuccess={(newPts) => {
                    setData((prev) => prev ? { ...prev, user: { ...prev.user, horizon_points: newPts } } : null);
                  }}
                />
                <BYDQuiz
                  authToken={authToken}
                  onQuizSuccess={(newPts) => {
                    setData((prev) => prev ? { ...prev, user: { ...prev.user, horizon_points: newPts } } : null);
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "referrals" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Consolidated Refer & Earn Node Program</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-normal max-w-xl">
                    Invite users to the BYD Horizon Club. Settle direct dividends of $50.00 cash securely as estimated earnings upon verified payment steps.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Referral Link copy card */}
                  <div className="sm:col-span-2 bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-500">Your Shareable Node URL Link</span>
                      <div className="text-xs text-white font-mono flex justify-between bg-slate-900 p-2.5 rounded mt-1.5 border border-slate-800 truncate">
                        <span>{window.location.origin}/?ref={data.referralStats.code}</span>
                        <button onClick={() => copyToClipboard(data.referralStats.code)} className="text-blue-400 hover:text-blue-300 font-mono text-[10px] ml-4 font-bold uppercase transition">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cash metrics balance */}
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-slate-400 block">Node Dividends</span>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1 flex items-center space-x-1">
                        <Lock className="w-4 h-4 text-amber-500" />
                        <span>{formatBalance(data.referralStats.estimatedEarnings)}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block font-mono mt-1 leading-normal">
                        Locks release automatically upon meeting threshold details.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Withdraw rules card */}
                <div className={`p-4 rounded-xl border leading-relaxed text-xs space-y-1.5 ${data.referralStats.withdrawable ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" : "bg-slate-950/50 border-slate-850/85 text-slate-400"}`}>
                  <span className="text-[10px] text-amber-500 font-bold block font-mono">⛔ DIVIDEND WITHDRAWAL PROTOCOLS LIST:</span>
                  <p>
                    Earnings balances unlock for withdrawal once:
                    <br />• Your estimated rewards account balances sum directly to <span className="font-bold text-white font-mono">$200.00 USD</span> or more.
                    <br />• You have recruited a minimum of <span className="font-bold text-white">5 active referrals</span> who has successfully processed <span className="font-bold text-white font-mono">2+ monthly co-ownership co-finance dues.</span>
                  </p>
                  <div className="pt-2 font-mono text-[9px] text-slate-500">
                    Your account progress status: <span className="text-white bg-slate-950 px-2 py-0.5 rounded font-mono font-bold">Estimated balance: {formatBalance(data.referralStats.estimatedEarnings)} / Required $200.00</span>
                  </div>
                </div>
              </div>

              {/* Leaderboards and history lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invited user list log */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest mb-3 font-mono">Simulated Invite Log ledger</h4>
                  <div className="space-y-3 overflow-y-auto max-h-[220px]">
                    {data.referrals.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-600 font-mono">
                        No registered invite nodes logged inside database.
                      </div>
                    ) : (
                      data.referrals.map((r, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold block text-white font-mono">@{r.referred_user_name || "Visitor"}</span>
                            <span className="text-[10px] text-slate-500 truncate font-mono">{r.referred_user_email}</span>
                          </div>
                          <span className={`font-mono text-[10px] p-1 px-2 rounded ${r.status === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                            {r.status === "paid" ? "Active (Paid)" : "Awaiting confirm"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Scoreboards global lists */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest mb-3 font-mono">Global Recruiter Standings</h4>
                  <div className="space-y-2">
                    {data.leaderboard.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-950/50 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono text-[10px] font-bold h-5 w-5 rounded flex items-center justify-center ${idx < 3 ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"}`}>
                            {idx + 1}
                          </span>
                          <img 
                            src={getAvatarUrl(item.name)} 
                            alt="" 
                            referrerPolicy="no-referrer"
                            className="h-6 w-6 rounded-full border border-slate-700 object-cover" 
                          />
                          <span className="font-display font-medium text-slate-300 font-mono block">@{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{item.count} nodes</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Points Horizon Rewards Storefront</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-normal">
                    Redeem complimentary Horizon Points accumulated automatically from payment authorizations. Settle orders instantly with no extra fees.
                  </p>
                </div>
              </div>

              {redeemSuccess && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="leading-relaxed">{redeemSuccess}</div>
                </div>
              )}

              {/* Items grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {rewardsList.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-950 bg-slate-950 mb-4">
                        <img 
                          referrerPolicy="no-referrer"
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover select-none group-hover:scale-105"
                        />
                      </div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-display font-semibold text-xs sm:text-sm text-white">{item.name}</h4>
                        <span className="bg-blue-950/40 text-blue-400 text-[10px] border border-blue-500/30 font-mono px-2 py-0.5 rounded ml-2 flex-shrink-0">
                          {item.points_cost} points
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between items-center">
                      <span className={`text-[10px] font-mono p-1 rounded px-2 ${item.status === 'In Stock' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                        {item.status}
                      </span>
                      <button 
                        onClick={() => handleRedeemReward(item.id)}
                        disabled={item.status === 'Out of Stock' || data.user.horizon_points < item.points_cost}
                        className="py-1 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 font-mono text-[10px] font-bold text-white rounded transition"
                      >
                        Redeem Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Ledger & Cargo Dispatch clearance section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest font-mono">My Won Rewards & Cargo Ledger</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Submit port clearances and dispatch transit routes.</p>
                  </div>
                  <div className="mt-2 sm:mt-0 bg-slate-950 px-3 py-1 rounded border border-slate-800 text-[10px] font-mono text-slate-400">
                    Active Bal: <span className="text-emerald-400 font-bold">{formatBalance(data.user.balance || 0)}</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto w-full">
                  {data.redemptions.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-600 font-mono">
                      No rewarded packages loaded on this active cargo line.
                    </div>
                  ) : (
                    data.redemptions.map((red, idx) => {
                      const dispatchFee = red.item_name.toLowerCase().includes("key fob") ? 49.00 : 150.00;
                      return (
                        <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 text-xs font-mono w-full">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-200 block text-sm">{red.item_name}</span>
                              <span className="bg-slate-900 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-800">
                                PRIZE #{red.id}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block">Transit Reference: <span className="text-slate-400 font-bold">{red.tracking_number}</span></span>
                            {red.status === "Processing" && (
                              <span className="text-[10px] text-red-400 block font-semibold">
                                ⚠️ Status: Held in Port / Lacks Freight Clearance Tariff (${dispatchFee.toFixed(2)} USD due)
                              </span>
                            )}
                            {red.status === "Shipped" && (
                              <span className="text-[10px] text-emerald-400 block font-semibold flex items-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                                Status: Cargo Cleared & Dispatched (Active GPS Transit Router)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                            {red.status === "Processing" ? (
                              <button
                                onClick={() => handleDispatchPackage(red.id, dispatchFee)}
                                className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-[10.5px] uppercase tracking-wider rounded-lg transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                              >
                                Clear Fee & Dispatch ➔
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                Clearance Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-6">
              {/* Slate header panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Wallet className="w-40 h-40" />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-white">Wallet Escrow & Customs Clearing Hub</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl leading-normal">
                      Maintain secure deposits to clear maritime freight fees, co-ownership installments, and cargo delivery insurance instantly.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 px-6 py-4 rounded-xl flex flex-col items-end shrink-0 shadow-inner">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none">Wallet Escrow Balance</span>
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">{formatBalance(data.user.balance || 0)}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">Instant Clearing Active</span>
                  </div>
                </div>
              </div>

              {/* Deposit Interface Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
                
                {/* Form column */}
                <form onSubmit={handleDepositProofSubmit} className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 w-full">
                  <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-300 pb-2 border-b border-slate-800">
                    📥 Submit Cryptocurrency Deposit Proof
                  </h4>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">1. Select Asset / Settlement Node</label>
                    <select
                      value={depositCoin}
                      onChange={e => setDepositCoin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-white font-mono text-xs focus:border-blue-500/40 outline-none cursor-pointer"
                    >
                      <option value="USDT_TRC20">USDT (TRC20 Network Node - Zero Gas Fee)</option>
                      <option value="USDT_ERC20">USDT (ERC20 Network Node - Ethereum Mainnet)</option>
                      <option value="BTC">BTC (Bitcoin Blockchain Core Ledger)</option>
                      <option value="ETH">ETH (Ethereum Global Settlement Smart Contract)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full font-mono">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">2. Amount to Deposit (USD) *</label>
                      <input
                        type="number"
                        required
                        min="5"
                        value={depositAmount}
                        onChange={e => setDepositAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-white font-mono text-xs focus:border-blue-500/40 outline-none"
                        placeholder="250"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">Current Dues Equivalent</label>
                      <div className="bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-slate-400 text-xs font-mono flex items-center h-[42px]">
                        ≈ {(parseFloat(depositAmount) || 0).toFixed(2)} USDT
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">3. Secure Escrow Wallet Address</label>
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-[11px] font-mono text-slate-300 w-full overflow-hidden">
                      <span className="truncate select-all pr-2 max-w-[200px] sm:max-w-none">
                        {depositCoin === "USDT_TRC20" ? "TLyR84jKsp78AnZ9PzLmX94Wcr1mSTvA2" :
                         depositCoin === "USDT_ERC20" ? "0x7a305fe86c2d829dc88701e9185a538cd982f1b4" :
                         depositCoin === "BTC" ? "bc1qxy2kg032g2asx4asxs3mdsu8jA7851g7" : "0x7a305fe86c2d829dc88701e9185a538cd982f1b4"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const addr = depositCoin === "USDT_TRC20" ? "TLyR84jKsp78AnZ9PzLmX94Wcr1mSTvA2" :
                                       depositCoin === "USDT_ERC20" ? "0x7a305fe86c2d829dc88701e9185a538cd982f1b4" :
                                       depositCoin === "BTC" ? "bc1qxy2kg032g2asx4asxs3mdsu8jA7851g7" : "0x7a305fe86c2d829dc88701e9185a538cd982f1b4";
                          navigator.clipboard.writeText(addr);
                          alert("Depository wallet address copied successfully!");
                        }}
                        className="py-1 px-2 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-400 rounded text-[9px] font-bold uppercase transition block flex-shrink-0 cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono mt-1 leading-normal">
                      ⚠️ Send exactly the specified asset token to this address. Balance updates are audited from the onchain block telemetry.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1.5">4. Paste Transaction Hash / Block ID *</label>
                    <input
                      type="text"
                      required
                      value={depositTxHash}
                      onChange={e => setDepositTxHash(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 px-3.5 py-2.5 rounded-xl text-white font-mono text-xs focus:border-blue-500/40 outline-none"
                      placeholder="e.g. 0xabcdef1234567890abcdef1234567890abcdef12345678"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={depositSubmitting}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-500/10 cursor-pointer text-center"
                    >
                      {depositSubmitting ? "Broadcasting Hash..." : "Broadcast Crypto Deposit Proof ➔"}
                    </button>
                  </div>
                </form>

                {/* Info and explorer redirection column */}
                <div className="md:col-span-5 space-y-6 w-full">
                  
                  {/* Ledger node redirection card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 w-full">
                    <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider font-mono">Blockchain Node Explorer Links</h5>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Confirm active ledger network blocks using real decentralized blockchain nodes. Verify deposit routing on blockchain explorers.
                    </p>
                    <a
                      href="https://tronscan.org/#/address/TLyR84jKsp78AnZ9PzLmX94Wcr1mSTvA2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-850 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 text-xs">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-mono text-slate-300">TRONSCAN Explorer Node</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                    
                    <a
                      href="https://etherscan.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-850 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 text-xs">
                        <ArrowUpRight className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="font-mono text-slate-300">ETHERSCAN Core Ledger</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </div>

                  {/* Escrow regulatory note */}
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 border-l-2 border-l-blue-500 text-left">
                    <h5 className="text-[11px] font-mono font-bold text-slate-300 uppercase shrink-0">Clearance Auditing Compliance</h5>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans mt-2">
                       Cryptocurrency deposits are logged under smart escrow tracking. If instant clearance fails, the core verification team audits submitted transaction hashes within 30 minutes to ensure secure clearance routing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Deposit History ledger */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest mb-3 font-mono">My Depository Logs</h4>
                <div className="space-y-2.5">
                  {(!data.payments || data.payments.filter((p: any) => p.type === "topup").length === 0) ? (
                    <div className="text-center py-6 text-xs text-slate-650 font-mono">
                      No deposit records registered.
                    </div>
                  ) : (
                    data.payments.filter((p: any) => p.type === "topup").map((p: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 border border-slate-900 p-3 rounded-lg flex justify-between items-center text-xs font-mono w-full">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200 text-sm">${p.amount.toFixed(2)} USD</span>
                            <span className="text-[9px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded border border-slate-800">
                              {p.currency}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono leading-relaxed block truncate max-w-[240px] sm:max-w-none mt-1">
                            Hash: {p.transaction_hash}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold py-1 px-2.5 rounded shrink-0 ${p.status === 'approved' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
                          {p.status === 'approved' ? "Cleared" : "Awaiting Audit"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "insurance" && (
            <div className="space-y-6">
              {/* Slate header panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck className="w-40 h-40" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Full Maritime Protection & Damage Cover Center</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-normal">
                    Secure comprehensive ocean shipments protection against maritime hulls cracks, battery failures, rim damage, seawater corrosion or third-party logistics errors.
                  </p>
                </div>
              </div>

              {/* Three detailed premium program cards */}
              <div>
                <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400 mb-4 block">
                  🛡️ Select Carrier Protection Cover Policy
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {/* Program 1 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between w-full">
                    <div>
                      <span className="bg-slate-950 border border-slate-850 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-2.5 inline-block">
                        LEVEL 1 COVER
                      </span>
                      <h4 className="font-display font-bold text-base text-white">Basic Transit Shield</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-sans">
                        Guarantees basic coverage for transport abrasions, minor exterior scratches, key fob loss, and freight carrier delay logistics.
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-850 text-xs font-mono text-slate-400 space-y-1">
                        <p>Liability Limit: <strong className="text-white">$15,000 USD</strong></p>
                        <p>Battery Node Coverage: <strong className="text-red-400 font-bold">None</strong></p>
                        <p>Marine Salt Corrosion: <strong className="text-red-400 font-bold">Exclusions</strong></p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center w-full">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">Premium Dues</span>
                        <span className="text-base font-bold font-mono text-emerald-405">${(19.00).toFixed(2)} <span className="text-[10px] text-slate-400">/mo</span></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePurchaseInsurance("Basic Transit Shield", 19.00, 15000)}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 font-mono text-[10px] font-bold text-white rounded transition cursor-pointer"
                      >
                        Activate cover
                      </button>
                    </div>
                  </div>

                  {/* Program 2 */}
                  <div className="bg-slate-900 border-2 border-blue-500/30 rounded-2xl p-5 flex flex-col justify-between relative w-full">
                    <div className="absolute top-2 right-2.5 bg-blue-600 text-white font-bold font-mono text-[8.5px] uppercase py-0.5 px-2 rounded-full tracking-wider animate-pulse">
                      RECOMMENDED
                    </div>
                    
                    <div>
                      <span className="bg-blue-950/40 border border-blue-800 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-2.5 inline-block">
                        LEVEL 2 COVER
                      </span>
                      <h4 className="font-display font-bold text-base text-white">Standard Executive</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-sans">
                        Comprehensive coverage for road freight collision damage, rim cracks, cockpit touchscreen failure, and mechanical loading breakages.
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-850 text-xs font-mono text-slate-400 space-y-1">
                        <p>Liability Limit: <strong className="text-white">$50,000 USD</strong></p>
                        <p>Battery Node Coverage: <strong className="text-emerald-400 font-bold">Partial</strong></p>
                        <p>Marine Salt Corrosion: <strong className="text-red-400 font-bold">Exclusions</strong></p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center w-full">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">Premium Dues</span>
                        <span className="text-base font-bold font-mono text-emerald-405">${(49.00).toFixed(2)} <span className="text-[10px] text-slate-400">/mo</span></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePurchaseInsurance("Standard Executive Cover", 49.00, 50000)}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 font-mono text-[10px] font-bold text-white rounded transition cursor-pointer"
                      >
                        Activate cover
                      </button>
                    </div>
                  </div>

                  {/* Program 3 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between w-full">
                    <div>
                      <span className="bg-slate-950 border border-slate-850 text-amber-500 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider mb-2.5 inline-block">
                        LEVEL 3 COVER
                      </span>
                      <h4 className="font-display font-bold text-base text-white">BYD Prestige Shield</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-sans">
                        Premium maritime cargo coverage. Includes battery thermal safety failure, complete body dent replacement, salt corrosion, and total loss guarantee.
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-slate-850 text-xs font-mono text-slate-400 space-y-1">
                        <p>Liability Limit: <strong className="text-white">$120,000 USD</strong></p>
                        <p>Battery Node Coverage: <strong className="text-emerald-400 font-bold">Complete</strong></p>
                        <p>Marine Salt Corrosion: <strong className="text-emerald-400 font-bold">Protected</strong></p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-850 flex justify-between items-center w-full">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono block">Premium Dues</span>
                        <span className="text-base font-bold font-mono text-emerald-405">${(89.00).toFixed(2)} <span className="text-[10px] text-slate-400">/mo</span></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePurchaseInsurance("BYD Prestige Shield", 89.00, 120000)}
                        className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 font-mono text-[10px] font-bold text-white rounded transition cursor-pointer"
                      >
                        Activate cover
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Protection Policies List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="font-display font-semibold text-xs text-slate-300 uppercase tracking-widest mb-3 font-mono">My Active Insurance Cover Policies</h4>
                <div className="space-y-2.5">
                  {(!data.insurance_policies || data.insurance_policies.length === 0) ? (
                    <div className="text-center py-6 text-xs text-slate-650 font-mono">
                      No active maritime protection covers logged for this account.
                    </div>
                  ) : (
                    data.insurance_policies.map((pol: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 border border-slate-900 p-4 rounded-xl flex justify-between items-center text-xs font-mono w-full">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200 text-sm">{pol.plan_name}</span>
                            <span className="bg-slate-900 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-800">
                              ACTIVE PROTECTION
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1 leading-relaxed">
                            Vehicle Asset: <strong className="text-slate-200">{pol.car_model}</strong> • Limit Claim: <strong className="text-white">${pol.coverage_limit.toLocaleString()} USD</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 font-bold block">COVERED</span>
                          <span className="text-[10px] text-slate-500 block">Premium: ${pol.premium.toFixed(2)} /mo</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && data && data.user && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white tracking-tight">Account & Security Node Customization</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Review and modify identity variables, manage privacy shields, and consult regulatory KYC status details below.
                  </p>
                </div>

                {/* KYC Legal Audit Status Shield */}
                <div className="p-6 rounded-2xl border bg-slate-950/80 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start space-x-4">
                    <div className={`mt-0.5 p-2.5 rounded-xl border flex items-center justify-center ${
                      data.user.kyc_status === "verified" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : data.user.kyc_status === "pending"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white font-display font-bold text-sm">Regulatory KYC Compliance Status</h4>
                      <p className="text-slate-400 text-xs leading-normal font-sans">
                        {data.user.kyc_status === "verified" 
                          ? "Congratulations, your biometric passport compliance check has succeeded. Full co-ownership transit permissions are active."
                          : data.user.kyc_status === "pending"
                          ? "Your identification dossier is currently in the dispatch queue. A compliance editor will finalize review shortly (ETA: < 2h)."
                          : "Your account is currently restricted from high-level features. Complete the identity biometric document upload pool to activate permissions."}
                      </p>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Status Shield</span>
                    <span className={`px-3.5 py-1 text-[10px] rounded-full uppercase tracking-wider font-mono font-black ${
                      data.user.kyc_status === "verified" 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" 
                        : data.user.kyc_status === "pending"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}>
                      {data.user.kyc_status || "NOT_SUBMITTED"}
                    </span>
                  </div>
                </div>

                {/* Settings Form */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSettingsSuccess(null);
                    setSettingsLoading(true);
                    try {
                      const res = await fetch("/api/user/settings/update", {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                          name: settingsName,
                          phone: settingsPhone,
                          city: settingsCity,
                          crypto_wallet_address: settingsWallet,
                          is_incognito: settingsIncognito
                        })
                      });
                      const json = await res.json();
                      if (res.ok) {
                        setSettingsSuccess("🎉 Profile and security settings synchronized successfully!");
                        loadSummaryData();
                      } else {
                        alert(json.error || "Failed to update settings.");
                      }
                    } catch {
                      alert("Network link failure.");
                    } finally {
                      setSettingsLoading(false);
                    }
                  }} 
                  className="space-y-6"
                >
                  {settingsSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-xs leading-normal font-sans">
                      {settingsSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5 font-bold">Full Legal Name (Required)</label>
                      <input 
                        required
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-blue-500 transition font-sans"
                        value={settingsName}
                        onChange={e => setSettingsName(e.target.value)}
                        placeholder="Legal Name"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5 font-bold">Contact Phone Number</label>
                      <input 
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-blue-500 transition font-sans"
                        value={settingsPhone}
                        onChange={e => setSettingsPhone(e.target.value)}
                        placeholder="+1-555-0192"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5 font-bold">Base Operational City</label>
                      <input 
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-blue-500 transition font-sans"
                        value={settingsCity}
                        onChange={e => setSettingsCity(e.target.value)}
                        placeholder="metropolis, state"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5 font-bold">Payout Reimbursement Wallet Address</label>
                      <input 
                        type="text"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white font-mono focus:outline-none focus:border-blue-500 transition"
                        value={settingsWallet}
                        onChange={e => setSettingsWallet(e.target.value)}
                        placeholder="TRX / ERC20 Address (e.g., T... or 0x...)"
                      />
                    </div>
                  </div>

                  {/* Incognito/Hidden Mode Customization */}
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition duration-300">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 pr-6 flex-1">
                        <div className="flex items-center space-x-2">
                          <EyeOff className="w-4 h-4 text-orange-400 shrink-0" />
                          <h4 className="text-white font-display font-bold text-sm">Activate Incognito Navigation Mode</h4>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed font-sans">
                          Enabling Incognito masks your interactive telemetry coordinate logs on the shared Co-Owner dashboard map, but allows full admin observation for regulatory compliance.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSettingsIncognito(!settingsIncognito)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settingsIncognito ? "bg-orange-500" : "bg-slate-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settingsIncognito ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Submission Row */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={settingsLoading || !settingsName}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-400 disabled:opacity-40 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-500/10 cursor-pointer"
                    >
                      {settingsLoading ? "Saving Settings..." : "Synchronize Profile Options"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6 animate-fade-in text-left">
              <HelpPage onNavigate={onNavigate} />
            </div>
          )}



        {/* KYC English alert blocker popup modal */}
        {kycPopupOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="max-w-md w-full bg-slate-900 border border-red-500/40 p-6 rounded-2xl shadow-2xl relative text-center">
              <div className="mx-auto w-12 h-12 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 mb-4 animate-bounce">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">Identity Audit Required</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Access to <strong className="text-red-400">"{kycModalTabName}"</strong> is currently locked. Modern vehicle networks require completed regulatory KYC compliance.
              </p>
              <div className="mt-4 bg-slate-950 p-3 rounded-lg text-left text-[11px] text-slate-400 border border-slate-800 space-y-1 font-mono">
                <p className="text-slate-300 font-semibold">How to submit details:</p>
                <p>1. Supply front/back ID copies in the Biometric Verification Wizard below.</p>
                <p>2. Complete live face snapshot capture cleanly.</p>
                <p>3. Submit, and wait for the verification network to validate your identity credentials securely.</p>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setKycPopupOpen(false);
                    // Scroll to Biometrics section
                    const section = document.getElementById("kyc-verification-wizard-panel");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold uppercase rounded-lg transition"
                >
                  Go to Biometric Form ➔
                </button>
                <button
                  onClick={() => setKycPopupOpen(false)}
                  className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-semibold"
                >
                  Dismiss Modal
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
