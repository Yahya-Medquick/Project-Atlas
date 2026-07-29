import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  BarChart3,
  RefreshCw,
  Trash2,
  Plus,
  Zap,
  Activity,
  Layers,
  Cpu,
  Search,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { AdminStats, Entity } from "../types";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshEntityData?: (slug: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "entities" | "cache">("overview");
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // New entity form state
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAliases, setNewAliases] = useState("");
  const [newPopularity, setNewPopularity] = useState(85);

  const [adminToken, setAdminToken] = useState<string>(() => {
    return localStorage.getItem("admin_token") || "";
  });

  const handleTokenChange = (token: string) => {
    setAdminToken(token);
    localStorage.setItem("admin_token", token);
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const authHeaders = { "X-Admin-Token": adminToken };
      const [statsRes, entitiesRes] = await Promise.all([
        fetch("/api/admin/stats", { headers: authHeaders }),
        fetch("/api/admin/entities", { headers: authHeaders }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (entitiesRes.ok) {
        const entitiesData = await entitiesRes.json();
        setEntities(entitiesData.entities || []);
      }
    } catch (err) {
      console.warn("Error fetching admin stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen, adminToken]);

  const handleClearCache = async () => {
    try {
      const res = await fetch("/api/admin/cache/clear", {
        method: "POST",
        headers: { "X-Admin-Token": adminToken },
      });
      if (res.ok) {
        setRefreshMessage("Cache cleared successfully!");
        fetchAdminData();
        setTimeout(() => setRefreshMessage(null), 3000);
      }
    } catch (err) {
      console.warn("Failed to clear cache:", err);
    }
  };

  const handleTriggerRefresh = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/entities/${slug}/refresh`, {
        method: "POST",
        headers: { "X-Admin-Token": adminToken },
      });
      if (res.ok) {
        const data = await res.json();
        setRefreshMessage(`Entity "${slug}" refreshed! Freshness: 100%`);
        fetchAdminData();
        setTimeout(() => setRefreshMessage(null), 3000);
      }
    } catch (err) {
      console.warn("Failed to refresh entity:", err);
    }
  };

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) return;

    try {
      const aliasArray = newAliases
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/entities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim().toLowerCase(),
          description: newDesc.trim(),
          aliases: aliasArray,
          popularityScore: newPopularity,
        }),
      });

      if (res.ok) {
        setRefreshMessage(`Entity "${newTitle}" registered in Project Atlas database!`);
        setNewTitle("");
        setNewSlug("");
        setNewDesc("");
        setNewAliases("");
        fetchAdminData();
        setTimeout(() => setRefreshMessage(null), 3000);
      }
    } catch (err) {
      console.warn("Failed to create entity:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Project Atlas System Dashboard
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-pulse" /> Node Cluster Active
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time entity management, multi-tier cache metrics, and background jobs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Navigation */}
        <div className="px-6 pt-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 text-sm font-medium bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Telemetry & Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab("entities")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "entities"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Entity & Keyword Registry ({entities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("cache")}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "cache"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Redis & Memory Cache</span>
          </button>
        </div>

        {/* Notification Banner */}
        {refreshMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-6 py-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{refreshMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
          
          {/* TAB 1: TELEMETRY OVERVIEW */}
          {activeTab === "overview" && stats && (
            <div className="space-y-6">
              {/* Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Total Searches</span>
                    <Search className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {stats.totalSearches}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Live telemetry tracked</div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Cache Hit Rate</span>
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {stats.cacheHitRate}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {stats.totalCachedKeys} active cached keys
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Heap Memory</span>
                    <Layers className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {stats.memoryUsageMb} <span className="text-sm font-normal text-slate-400">MB</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Node container heap</div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Background Jobs</span>
                    <Activity className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-4 h-4" /> Interval Active
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {stats.backgroundJobsStatus.entitiesRefreshed} entity syncs complete
                  </div>
                </div>
              </div>

              {/* API Calls Breakdown & Top Queries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* API Node Calls */}
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    External API Integrations Telemetry
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">OpenAlex Scientific API (Research Papers)</span>
                        <span className="font-bold text-indigo-600">{stats.apiCalls.openAlex} calls</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, stats.apiCalls.openAlex * 10)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Wikipedia Knowledge Engine</span>
                        <span className="font-bold text-emerald-600">{stats.apiCalls.wikipedia} calls</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, stats.apiCalls.wikipedia * 10)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Google Gemini AI Synthesis</span>
                        <span className="font-bold text-cyan-600">{stats.apiCalls.gemini} calls</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, stats.apiCalls.gemini * 10)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">GitHub Open Source API</span>
                        <span className="font-bold text-purple-600">{stats.apiCalls.github} calls</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, stats.apiCalls.github * 10)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Searched Queries */}
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Top Queries & Search Ranking
                  </h3>

                  <div className="space-y-2">
                    {stats.topQueries.map((q, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                            #{i + 1}
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white capitalize">
                            {q.query}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-300">
                          {q.count} searches
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: ENTITIES MANAGER */}
          {activeTab === "entities" && (
            <div className="space-y-6">
              {/* Register New Entity Form */}
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-500" />
                  Register New Lightweight Entity
                </h3>
                <form onSubmit={handleCreateEntity} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Quantum Gravity"
                      value={newTitle}
                      onChange={(e) => {
                        setNewTitle(e.target.value);
                        if (!newSlug) {
                          setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Slug</label>
                    <input
                      type="text"
                      placeholder="quantum-gravity"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Description</label>
                    <input
                      type="text"
                      placeholder="Brief entity overview description..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Aliases / Synonyms (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="loop quantum gravity, string theory, graviton"
                      value={newAliases}
                      onChange={(e) => setNewAliases(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      Initial Popularity Score ({newPopularity}/100)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={newPopularity}
                      onChange={(e) => setNewPopularity(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Save Entity
                    </button>
                  </div>
                </form>
              </div>

              {/* Entity Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Registered Lightweight Entities ({entities.length})</span>
                  <span className="text-xs font-medium text-slate-500">Synonym Supported & Auto-Ranked</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[11px]">
                        <th className="p-3.5">Entity / Slug</th>
                        <th className="p-3.5">Popularity</th>
                        <th className="p-3.5">Authority</th>
                        <th className="p-3.5">Freshness</th>
                        <th className="p-3.5">Aliases / Synonyms</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {entities.map((ent) => (
                        <tr key={ent.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{ent.title}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{ent.slug}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                              {ent.popularityScore}/100
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                            {ent.authorityScore}/100
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                              {ent.freshnessScore}%
                            </span>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {ent.aliases.map((al, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]"
                                >
                                  {al}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleTriggerRefresh(ent.slug)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                              title="Force background entity update"
                            >
                              <RefreshCw className="w-3 h-3" /> Refresh
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

          {/* TAB 3: CACHE MANAGEMENT */}
          {activeTab === "cache" && stats && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Multi-Tier Redis-Style Memory Cache
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    1-Hour TTL with background automated pruning and hit-counter telemetry
                  </p>
                </div>

                <button
                  onClick={handleClearCache}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Clear All Cache
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Cached Keys Count</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {stats.totalCachedKeys}
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Cache Hit Rate</div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {stats.cacheHitRate}%
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Process Memory</div>
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    {stats.memoryUsageMb} MB
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
