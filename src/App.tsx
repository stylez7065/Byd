import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import PaymentFlow from "./components/PaymentFlow";
import UserDashboard from "./components/UserDashboard";
import AdminPanel from "./components/AdminPanel";
import HelpPage from "./components/HelpPage";
import SupportWidget from "./components/SupportWidget";
import { VehiclesPage } from "./components/pages/VehiclesPage";
import { Compass, KeyRound, Hammer, ShieldX, Home, LogOut, HelpCircle, User, ShieldCheck } from "lucide-react";

const getMoodStyles = (activeMood: "light" | "dark" | "blue") => {
  switch (activeMood) {
    case "light":
      return `
        #applet-viewport {
          --color-blue-600: #1d4ed8 !important;
          --color-blue-500: #3b82f6 !important;
          --color-blue-400: #60a5fa !important;
          --color-cyan-400: #0891b2 !important;
          --color-cyan-300: #22d3ee !important;
          --color-cyan-550: #0d9488 !important;
          --color-slate-900: #f8fafc !important;
          --color-slate-950: #ffffff !important;
          background-color: #f8fafc !important;
          color: #1e293b !important;
        }
        #applet-viewport, 
        #applet-viewport main, 
        #applet-viewport nav, 
        #applet-viewport footer, 
        #applet-viewport .bg-slate-900, 
        #applet-viewport .bg-slate-950, 
        #applet-viewport .bg-[#111111], 
        #applet-viewport .bg-[#1A1A1A], 
        #applet-viewport .bg-[#121212],
        #applet-viewport .bg-slate-900\/50,
        #applet-viewport .bg-slate-900\/40,
        #applet-viewport .bg-slate-900\/80,
        #applet-viewport .bg-[#1e293b],
        #applet-viewport .bg-slate-950\/40,
        #applet-viewport .bg-slate-950\/80,
        #applet-viewport .bg-slate-900\/90 {
          background-color: #ffffff !important;
          color: #1e293b !important;
          border-color: #e2e8f0 !important;
        }
        #applet-viewport main {
          background-color: #f8fafc !important;
        }
        #applet-viewport .border-white\/5, 
        #applet-viewport .border-white\/10, 
        #applet-viewport .border-slate-800, 
        #applet-viewport .border-slate-850, 
        #applet-viewport .border-slate-900, 
        #applet-viewport .border-slate-800\/60 {
          border-color: #e2e8f0 !important;
        }
        #applet-viewport input, 
        #applet-viewport select, 
        #applet-viewport textarea {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }
        #applet-viewport .text-white, 
        #applet-viewport .text-slate-100, 
        #applet-viewport .text-slate-200 {
          color: #0f172a !important;
        }
        #applet-viewport .text-slate-300, 
        #applet-viewport .text-slate-400, 
        #applet-viewport .text-slate-500 {
          color: #475569 !important;
        }
        #applet-viewport .bg-white\/5, 
        #applet-viewport .bg-white\/10 {
          background-color: #e2e8f0 !important;
          color: #1e293b !important;
        }
        #applet-viewport table thead {
          background-color: #f1f5f9 !important;
          color: #475569 !important;
        }
        #applet-viewport table tbody tr:hover {
          background-color: #f8fafc !important;
        }
        #applet-viewport .bg-yellow-500\/10 {
          background-color: #fefbeb !important;
          border-color: #fde047 !important;
        }
        #applet-viewport .bg-red-500\/10 {
          background-color: #fef2f2 !important;
          border-color: #fca5a5 !important;
        }
      `;
    case "blue":
      return `
        #applet-viewport {
          --color-blue-600: #2563eb !important;
          --color-blue-500: #3b82f6 !important;
          --color-blue-400: #60a5fa !important;
          --color-cyan-400: #06b6d4 !important;
          --color-cyan-300: #67e8f9 !important;
          --color-cyan-550: #0891b2 !important;
          background-color: #020617 !important;
          color: #e2e8f0 !important;
        }
        #applet-viewport, 
        #applet-viewport main, 
        #applet-viewport nav, 
        #applet-viewport footer, 
        #applet-viewport .bg-slate-900, 
        #applet-viewport .bg-slate-950, 
        #applet-viewport .bg-[#111111], 
        #applet-viewport .bg-[#1A1A1A], 
        #applet-viewport .bg-[#121212],
        #applet-viewport .bg-slate-900\/50,
        #applet-viewport .bg-slate-900\/40,
        #applet-viewport .bg-slate-900\/80,
        #applet-viewport .bg-[#1e293b],
        #applet-viewport .bg-slate-950\/40,
        #applet-viewport .bg-slate-950\/80,
        #applet-viewport .bg-slate-900\/90 {
          background-color: #070e24 !important;
          color: #cbd5e1 !important;
          border-color: #1e293b !important;
        }
        #applet-viewport main {
          background-color: #030818 !important;
        }
        #applet-viewport .bg-slate-900, 
        #applet-viewport .bg-slate-950, 
        #applet-viewport .bg-[#1A1A1A],
        #applet-viewport .bg-[#121212] {
          background-color: #0c152e !important;
          border-color: #1e3a8a/40 !important;
        }
        #applet-viewport .border-white\/5, 
        #applet-viewport .border-white\/10, 
        #applet-viewport .border-slate-800, 
        #applet-viewport .border-slate-850, 
        #applet-viewport .border-slate-900, 
        #applet-viewport .border-slate-800\/60 {
          border-color: #1e293b !important;
        }
        #applet-viewport input, 
        #applet-viewport select, 
        #applet-viewport textarea {
          background-color: #020716 !important;
          color: #67e8f9 !important;
          border-color: #1e293b !important;
        }
        #applet-viewport table thead {
          background-color: #0b1329 !important;
          color: #38bdf8 !important;
        }
        #applet-viewport table tbody tr:hover {
          background-color: #0f172a !important;
        }
        #applet-viewport .text-white {
          color: #ffffff !important;
        }
        #applet-viewport .text-slate-350, 
        #applet-viewport .text-slate-400 {
          color: #94a3b8 !important;
        }
      `;
    case "dark":
    default:
      return `
        #applet-viewport {
          --color-blue-600: #ea580c !important;
          --color-blue-500: #f97316 !important;
          --color-blue-400: #fb923c !important;
          --color-cyan-400: #f97316 !important;
          --color-cyan-300: #fdba74 !important;
          --color-cyan-550: #c2410c !important;
          background-color: #09090b !important;
          color: #f4f4f5 !important;
        }
        #applet-viewport, 
        #applet-viewport main, 
        #applet-viewport nav, 
        #applet-viewport footer, 
        #applet-viewport .bg-slate-900, 
        #applet-viewport .bg-slate-950, 
        #applet-viewport .bg-[#111111], 
        #applet-viewport .bg-[#1A1A1A], 
        #applet-viewport .bg-[#121212],
        #applet-viewport .bg-slate-900\/50,
        #applet-viewport .bg-slate-900\/40,
        #applet-viewport .bg-slate-900\/80,
        #applet-viewport .bg-[#1e293b],
        #applet-viewport .bg-slate-950\/40,
        #applet-viewport .bg-slate-950\/80,
        #applet-viewport .bg-slate-900\/90 {
          background-color: #09090b !important;
          color: #f4f4f5 !important;
          border-color: #1f1f23 !important;
        }
        #applet-viewport main {
          background-color: #030303 !important;
        }
        #applet-viewport .bg-slate-900, 
        #applet-viewport .bg-slate-950, 
        #applet-viewport .bg-[#1A1A1A],
        #applet-viewport .bg-[#121212] {
          background-color: #121214 !important;
          border-color: #27272a !important;
        }
        #applet-viewport .border-white\/5, 
        #applet-viewport .border-white\/10, 
        #applet-viewport .border-slate-800, 
        #applet-viewport .border-slate-850, 
        #applet-viewport .border-slate-900, 
        #applet-viewport .border-slate-800\/60 {
          border-color: #27272a !important;
        }
        #applet-viewport input, 
        #applet-viewport select, 
        #applet-viewport textarea {
          background-color: #020202 !important;
          color: #ffffff !important;
          border-color: #27272a !important;
        }
        #applet-viewport table thead {
          background-color: #020202 !important;
          color: #a1a1aa !important;
        }
        #applet-viewport table tbody tr:hover {
          background-color: #18181b !important;
        }
      `;
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "vehicles" | "payment" | "dashboard" | "admin" | "help">("landing");
  const [viewParams, setViewParams] = useState<any>(null);
  const [adminClickCount, setAdminClickCount] = useState<number>(0);

  // Authentication State
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  // Shared Global Charity metrics state
  const [charityAmount, setCharityAmount] = useState<number>(500450.0);

  // Global moods state: light, dark, blue
  const [mood, setMood] = useState<"light" | "dark" | "blue">(() => {
    const saved = localStorage.getItem("byd_mood");
    if (saved === "light" || saved === "dark" || saved === "blue") {
      return saved;
    }
    return "dark";
  });

  // Dynamic App Customization Name
  const [appName, setAppName] = useState<string>("BYD Horizon Club");

  const handleMoodChange = (newMood: "light" | "dark" | "blue") => {
    setMood(newMood);
    localStorage.setItem("byd_mood", newMood);
  };

  // Fetch app name customization on init
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const r = await fetch("/api/public/settings");
        if (r.ok) {
          const d = await r.json();
          if (d && d.app_name) {
            setAppName(d.app_name);
            localStorage.setItem("byd_app_name", d.app_name);
          }
        }
      } catch {}
    };
    const cached = localStorage.getItem("byd_app_name");
    if (cached) {
      setAppName(cached);
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    document.title = appName;
  }, [appName]);

  // Check existing session token on initialization
  useEffect(() => {
    const savedToken = localStorage.getItem("byd_horizon_token");
    const savedUser = localStorage.getItem("byd_horizon_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("byd_horizon_token");
        localStorage.removeItem("byd_horizon_user");
      }
    }
  }, []);

  const handleNavigate = (view: "landing" | "vehicles" | "payment" | "dashboard" | "admin" | "help", params: any = null) => {
    setViewParams(params);
    
    // Auth route guard
    if (view === "dashboard" && !token) {
      setCurrentView("payment");
    } else {
      setCurrentView(view);
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("byd_horizon_token", newToken);
    localStorage.setItem("byd_horizon_user", JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("byd_horizon_token");
    localStorage.removeItem("byd_horizon_user");
    setCurrentView("landing");
  };

  return (
    <div className="min-h-screen bg-[#111111] font-sans text-[#F5F5F0] flex flex-col justify-between relative transition-all duration-300" id="applet-viewport">
      
      {/* Inline dynamic style injection */}
      <style dangerouslySetInnerHTML={{ __html: getMoodStyles(mood) }} />

      {/* Top Live Updates Marquee Ticker */}
      <div className="h-8 bg-[#1A1A1A] flex items-center px-4 overflow-hidden border-b border-white/5 select-none z-50">
        <div className="w-full overflow-hidden whitespace-nowrap">
          <div className="text-[10px] uppercase tracking-widest font-bold font-mono whitespace-nowrap animate-marquee inline-block text-cyan-400">
            ✦ {appName.toUpperCase()} PORTAL • ACTIVE TELEMATICS LINK ONLINE • VEHICLE PERFORMANCE AUTO-SYNC STABLE • GLOBAL TRANSIT HUB LOGISTICS ENCRYPTED • &nbsp;
            ✦ {appName.toUpperCase()} PORTAL • ACTIVE TELEMATICS LINK ONLINE • VEHICLE PERFORMANCE AUTO-SYNC STABLE • GLOBAL TRANSIT HUB LOGISTICS ENCRYPTED • &nbsp;
          </div>
        </div>
      </div>

      {/* Top Application Navigation header */}
      <nav className="border-b border-slate-800 bg-[#1A1A1A]/90 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
          
          {/* Logo brand */}
          <button 
            id="brand-logo"
            onClick={() => {
              if (token && currentView === "dashboard") {
                handleNavigate("dashboard");
              } else {
                handleNavigate("landing");
              }
            }}
            disabled={!!(token && currentView === "dashboard")}
            className={`flex items-center space-x-3 outline-none border-none transition-all ${token && currentView === "dashboard" ? "cursor-default opacity-100" : "hover:opacity-85 cursor-pointer"}`}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center font-bold italic shadow-lg shadow-cyan-400/20 text-white font-display text-sm">
              BYD
            </div>
            <div className="text-left font-display">
              <span className="text-xl font-black tracking-tighter uppercase text-white block">
                {appName}
              </span>
              {token && currentView === "dashboard" && (
                <span className="text-[9px] uppercase font-mono tracking-widest text-cyan-400 font-bold block -mt-1">
                  [ SECURED CONSOLE ]
                </span>
              )}
            </div>
          </button>

          {/* Navigation Links and Atmosphere */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {!(token && currentView === "dashboard") && (
              <>
                <button 
                  id="nav-home"
                  onClick={() => handleNavigate("landing")}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition ${currentView === "landing" ? "bg-white/10 text-cyan-400 border border-white/10 font-bold" : "text-white/60 hover:text-white"}`}
                >
                  <span className="hidden sm:inline">Home</span>
                  <Home className="w-4 h-4 sm:hidden inline" />
                </button>
                <button 
                  id="nav-vehicles"
                  onClick={() => handleNavigate("vehicles")}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition ${currentView === "vehicles" ? "bg-white/10 text-cyan-400 border border-white/10 font-bold" : "text-white/60 hover:text-white"}`}
                >
                  <span className="hidden sm:inline font-bold text-cyan-300">Fleet Showroom</span>
                  <Compass className="w-4 h-4 sm:hidden inline" />
                </button>
                <button 
                  id="nav-answers"
                  onClick={() => handleNavigate("help")}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition ${currentView === "help" ? "bg-white/10 text-cyan-400 border border-white/10 font-bold" : "text-white/60 hover:text-white"}`}
                >
                  <span className="hidden sm:inline">Answers</span>
                  <HelpCircle className="w-4 h-4 sm:hidden inline" />
                </button>
              </>
            )}

            {/* Premium Mature Light/Dark Select Bar */}
            <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-xl" id="mood-selector-segment">
              <button
                onClick={() => handleMoodChange("light")}
                className={`px-3 py-1 text-[10px] font-mono tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${mood === "light" ? "bg-white text-slate-950 font-semibold shadow-md border border-slate-200" : "text-slate-400 hover:text-white"}`}
                title="Matured Light Mode"
              >
                LIGHT
              </button>
              <button
                onClick={() => handleMoodChange("dark")}
                className={`px-3 py-1 text-[10px] font-mono tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${mood === "dark" ? "bg-slate-800 text-amber-400 font-semibold shadow-md" : "text-slate-400 hover:text-white"}`}
                title="Sleek Dark Mode"
              >
                DARK
              </button>
            </div>
          </div>

          {/* Right hand Action trigger links */}
          <div className="flex items-center space-x-2">
            {token ? (
              <>
                {currentView === "dashboard" ? (
                  <div className="flex items-center space-x-2 font-mono text-[9px] bg-cyan-400/10 border border-cyan-400/20 px-3 py-1.5 rounded-xl text-cyan-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="hidden sm:inline uppercase text-slate-400">OPERATOR:</span>
                    <span className="font-bold uppercase tracking-wide">{user?.name || "Active"}</span>
                  </div>
                ) : (
                  <button 
                    id="nav-user-portal"
                    onClick={() => handleNavigate("dashboard")}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition flex items-center space-x-1 ${currentView === "dashboard" ? "bg-white/10 text-cyan-400 border border-white/10 font-bold" : "text-cyan-400 border border-cyan-500/20 font-bold"}`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>
                )}
                <button 
                  id="nav-logout"
                  onClick={handleLogout}
                  className="py-1.5 px-3 hover:bg-red-950/20 text-red-500 hover:text-red-400 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider transition cursor-pointer"
                >
                  <span className="hidden sm:inline font-bold">Sign Out</span>
                  <LogOut className="w-4 h-4 sm:hidden inline" />
                </button>
              </>
            ) : (
              <>
                <button 
                  id="nav-portal-login"
                  onClick={() => handleNavigate("payment")}
                  className="py-1.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md shadow-cyan-400/10 cursor-pointer"
                >
                  Sign In / Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container viewport */}
      <main className="flex-1 w-full bg-[#111111]">
        {currentView === "landing" && (
          <LandingPage 
            onNavigate={handleNavigate}
            charityAmount={charityAmount}
            setCharityAmount={setCharityAmount}
          />
        )}

        {currentView === "vehicles" && (
          <VehiclesPage 
            onNavigate={handleNavigate}
          />
        )}
        
        {currentView === "payment" && (
          <PaymentFlow 
            initialPlan={viewParams?.planType}
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {currentView === "dashboard" && (
          <UserDashboard 
            authToken={token!}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === "admin" && (
          <AdminPanel 
            onNavigate={handleNavigate}
          />
        )}

        {currentView === "help" && (
          <HelpPage 
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Dynamic App Footer and Control Bar */}
      {token && currentView === "dashboard" ? (
        <footer className="border-t border-slate-800 bg-slate-950/80 py-4 px-6 text-[10px] text-slate-400 font-mono flex flex-col md:flex-row justify-between items-center gap-3" id="dashboard-status-control-bar">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-emerald-400 font-bold">BYD_TELEMETRY_LINK: SECURED</span>
            </div>
            <span className="text-slate-600">|</span>
            <span>MOCK CRYPTO STORAGE: ESCROW ACTIVE</span>
            <span className="text-slate-600">|</span>
            <span>SQLITE LEDGER DATABASE: STABLE</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-400 uppercase tracking-widest text-[9px]">SESSION EXPEDITE NODE ENABLED</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">&copy; {new Date().getFullYear()} {appName} App Experience</span>
          </div>
        </footer>
      ) : (
        /* Complete Premium Footer */
        <footer className="border-t border-white/5 bg-[#121212]/80 backdrop-blur-md pt-12 pb-8 px-4" id="portal-bento-footer">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-cyan-400 rounded flex items-center justify-center font-bold italic text-black font-display text-xs">BYD</div>
                <span className="text-sm font-bold tracking-tight text-white uppercase">{appName}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                Experience fractional Co-Ownership and smart transport logistics tracking powered by secure cloud telemetry.
              </p>
            </div>
            <div>
              <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#94A3B8] font-bold">Showroom</h5>
              <div className="mt-3 space-y-1.5 flex flex-col text-[11px] text-slate-400 font-sans">
                <button onClick={() => handleNavigate("vehicles")} className="hover:text-cyan-400 text-left cursor-pointer transition bg-transparent border-none p-0">BYD Seal AWD</button>
                <button onClick={() => handleNavigate("vehicles")} className="hover:text-cyan-400 text-left cursor-pointer transition bg-transparent border-none p-0">Yangwang U8 Supercar</button>
                <button onClick={() => handleNavigate("vehicles")} className="hover:text-cyan-400 text-left cursor-pointer transition bg-transparent border-none p-0">Denza D9 Premium</button>
              </div>
            </div>
            <div>
              <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#94A3B8] font-bold">Resources</h5>
              <div className="mt-3 space-y-1.5 flex flex-col text-[11px] text-slate-400 font-sans">
                <button onClick={() => handleNavigate("help")} className="hover:text-cyan-400 text-left cursor-pointer transition bg-transparent border-none p-0">System Answers</button>
                <button onClick={() => handleNavigate("landing")} className="hover:text-cyan-400 text-left cursor-pointer transition bg-transparent border-none p-0">Global Charity Ledger</button>
                <button onClick={() => handleNavigate("dashboard")} className="hover:text-cyan-400 text-left cursor-pointer transition bg-transparent border-none p-0">Member Workspace</button>
              </div>
            </div>
            <div className="flex flex-col justify-between items-start md:items-end font-sans">
              {currentView === "landing" && (
                <div className="text-left md:text-right">
                  <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#94A3B8] font-bold">Studio Node</h5>
                  <button 
                    onClick={() => {
                      const nextCount = adminClickCount + 1;
                      if (nextCount >= 5) {
                        setAdminClickCount(0);
                        handleNavigate("admin");
                      } else {
                        setAdminClickCount(nextCount);
                      }
                    }}
                    className="text-[10px] text-orange-400 hover:text-orange-300 font-mono font-bold mt-1 block tracking-wider uppercase hover:underline decoration-orange-500/30 cursor-pointer text-left md:text-right w-full bg-transparent border-none p-0 outline-none"
                    id="footer-admin-door"
                  >
                    ● {adminClickCount > 0 ? `Jadai Studios [${adminClickCount}/5]` : "Jadai Studios"}
                  </button>
                </div>
              )}
              <div className="mt-4 md:mt-0">
                <div className="flex items-center space-x-2 text-slate-500 hover:text-slate-400 transition" id="powered-by-google-badge">
                  <span className="text-[10px] uppercase font-mono tracking-widest font-black">POWERED BY</span>
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.21.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span className="font-display font-medium text-xs tracking-tight text-white/80">Google Cloud</span>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-mono space-y-2 md:space-y-0">
            <span>&copy; {new Date().getFullYear()} {appName} Club. All rights reserved. Registered under regulatory sandbox guidelines.</span>
            <div className="flex space-x-4">
              <a href="#privacy" className="hover:text-[#22d3ee]">Security Clearance</a>
              <a href="#terms" className="hover:text-[#22d3ee]">Escrow Policies</a>
            </div>
          </div>
        </footer>
      )}

      {/* Floating Globally accessible Help Desk */}
      <SupportWidget />
    </div>
  );
}
