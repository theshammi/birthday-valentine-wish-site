"use client";

import { useState, useEffect } from "react";
import { 
  loginAdmin, 
  logoutAdmin, 
  isAdminAuthenticated, 
  getMemories, 
  getConfig, 
  updateConfig, 
  addMemory, 
  deleteMemory,
  getImageKitAuth
} from "../actions";
import { Memory, AppConfig } from "../../lib/db";
import { 
  Lock, 
  SignOut, 
  Chats, 
  Image as ImageIcon, 
  Gear, 
  Check, 
  Trash, 
  UploadSimple, 
  Sparkle 
} from "@phosphor-icons/react";


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<"memories" | "settings">("memories");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);

  const [finalVideoUploading, setFinalVideoUploading] = useState(false);
  const [finalVideoFile, setFinalVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [finalVideoProgress, setFinalVideoProgress] = useState(0);

  // Forms states
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [configSuccess, setConfigSuccess] = useState(false);
  const [memorySuccess, setMemorySuccess] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const auth = await isAdminAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        loadDashboardData();
      }
    }
    checkAuth();
  }, []);

  async function loadDashboardData() {
    try {
      const [m, c] = await Promise.all([getMemories(), getConfig()]);
      setMemories(m);
      setConfig(c);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const success = await loginAdmin(password);
    if (success) {
      setIsAuthenticated(true);
      loadDashboardData();
    } else {
      setLoginError("Invalid password. Please try again.");
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
  };


  // ImageKit file uploader & Memory submission
  const handleMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setMemorySuccess(false);

    try {
      // 1. Get Authentication Parameters from Server Action
      const authParams = await getImageKitAuth();
      if (!authParams) {
        alert("Failed to authenticate with ImageKit. Ensure you are logged in.");
        return;
      }

      // 2. Prepare Form Data for direct upload to ImageKit
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", selectedFile.name);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire.toString());
      formData.append("token", authParams.token);

      // 3. Post to ImageKit API using XMLHttpRequest for progress
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Direct ImageKit upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network Error"));
        xhr.send(formData);
      });
      const uploadedUrl = result.url;

      const isVideo = selectedFile.type.startsWith("video/");
      const imageUrl = isVideo ? "https://picsum.photos/seed/video-thumb/800/600" : uploadedUrl;
      const videoUrl = isVideo ? uploadedUrl : undefined;

      // 4. Save to local DB memory list
      const res = await addMemory(imageUrl, caption, date, videoUrl);
      if (res.success) {
        setMemorySuccess(true);
        setCaption("");
        setDate("");
        setSelectedFile(null);
        // Refresh local memory data
        const updatedMemories = await getMemories();
        setMemories(updatedMemories);
      }

    } catch (err) {
      console.error(err);
      alert("Failed to upload memory. Check console for details.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete Memory Action
  const handleDeleteMemory = async (id: string) => {
    const res = await deleteMemory(id);
    if (res.success) {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Config Update Action
  const handleConfigUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setConfigSuccess(false);
    const res = await updateConfig(config);
    if (res.success) {
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
    }
  };

  const handleFinalVideoSubmit = async () => {
    if (!finalVideoFile || !config) return;
    setFinalVideoUploading(true);
    try {
      const authParams = await getImageKitAuth();
      if (!authParams) throw new Error("Not authenticated");
      const formData = new FormData();
      formData.append("file", finalVideoFile);
      formData.append("fileName", finalVideoFile.name);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire.toString());
      formData.append("token", authParams.token);

      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setFinalVideoProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network Error"));
        xhr.send(formData);
      });
      
      const updatedConfig = { ...config, finalVideoUrl: result.url };
      setConfig(updatedConfig);
      await updateConfig(updatedConfig);
      setFinalVideoFile(null);
      alert("Final Video Uploaded and Saved!");
    } catch (err) {
      console.error(err);
      alert("Video upload failed");
    } finally {
      setFinalVideoUploading(false);
      setFinalVideoProgress(0);
    }
  };

  // Loading Screen
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#030514] text-zinc-100 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
          <p className="text-zinc-500 text-sm font-mono">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030514] text-zinc-100 flex items-center justify-center font-sans px-6">
        <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(218,165,32,0.04)_0%,_transparent_70%]" />
        
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-400 border border-amber-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-zinc-500 text-xs tracking-wider uppercase font-mono">Password Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {loginError && <p className="text-red-400 text-xs font-mono">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div className="min-h-screen bg-[#030514] text-zinc-100 font-sans pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 bg-[#030514]/80 backdrop-blur-md border-b border-zinc-800/80 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-amber-400" />
            <h1 className="font-serif text-xl font-bold">Birthday Admin Panel</h1>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-zinc-800 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <SignOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      {/* Workspace Wrapper */}
      <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav Tabs */}
        <aside className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-zinc-800">
          {[
            { id: "memories", label: "Memories", icon: ImageIcon },
            { id: "settings", label: "Settings", icon: Gear },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  active 
                    ? "bg-amber-400 text-zinc-950 shadow-md font-bold" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Action Workspace Panels */}
        <section className="lg:col-span-3">
          
          {/* Tab 1: Wishes Moderation (Removed) */}

          {/* Tab 2: Memories Manager */}
          {activeTab === "memories" && (
            <div className="space-y-8">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-semibold">Memories and Photo Manager</h2>
                <p className="text-zinc-500 text-xs">Upload sweet photo snapshots directly to ImageKit and write stories.</p>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleMemorySubmit} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400 font-mono uppercase tracking-wider">Add New Memory Card</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Memory Caption</label>
                    <input
                      type="text"
                      required
                      placeholder="Caption / Story text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Date</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. October 2025"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 text-center cursor-pointer hover:border-amber-500/40 transition-colors relative flex flex-col items-center">
                  <input
                    type="file"
                    required
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-30"
                  />

                  {selectedFile ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 pointer-events-none mb-4 bg-zinc-950">
                      {selectedFile.type.startsWith("video/") ? (
                        <video src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover" autoPlay muted loop />
                      ) : (
                        <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-contain" alt="preview" />
                      )}
                    </div>
                  ) : (
                    <UploadSimple className="w-8 h-8 text-zinc-500 mb-2" />
                  )}
                  
                  <p className="text-xs font-mono text-zinc-400 relative z-20">
                    {selectedFile ? selectedFile.name : "Click to select a photo to upload"}
                  </p>
                  
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-4 overflow-hidden relative z-20">
                      <div className="h-full bg-amber-400 transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {uploading ? "Uploading to ImageKit..." : "Save Memory"}
                </button>

                {memorySuccess && (
                  <p className="text-emerald-400 text-xs font-mono">Memory successfully uploaded and saved!</p>
                )}
              </form>

              {/* Memory List */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold font-mono uppercase tracking-wider">Current Memories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memories.map((mem) => (
                    <div 
                      key={mem.id} 
                      className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex gap-4 items-center"
                    >
                      <img 
                        src={mem.imageUrl} 
                        alt={mem.caption} 
                        className="w-16 h-16 object-cover rounded-lg border border-zinc-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-amber-400 font-mono">{mem.date}</p>
                        <p className="text-sm text-zinc-300 truncate font-serif italic">"{mem.caption}"</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(mem.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 cursor-pointer transition-colors"
                        title="Delete Memory"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: Configuration Settings */}
          {activeTab === "settings" && config && (
            <div className="space-y-6">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-semibold">General Settings</h2>
                <p className="text-zinc-500 text-xs">Configure the site configuration, names, and visual themes.</p>
              </div>

              <form onSubmit={handleConfigUpdate} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Birthday Person's Name</label>
                    <input
                      type="text"
                      required
                      value={config.birthdayName}
                      onChange={(e) => setConfig({ ...config, birthdayName: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Birth Date (YYYY-MM-DD)</label>
                    <input
                      type="text"
                      required
                      value={config.birthDate}
                      onChange={(e) => setConfig({ ...config, birthDate: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Invitation Envelope Title Text</label>
                  <input
                    type="text"
                    required
                    value={config.envelopeTitle}
                    onChange={(e) => setConfig({ ...config, envelopeTitle: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Visual Theme</label>
                    <select
                      value={config.theme}
                      onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-amber-400"
                    >
                      <option value="gold">Gold & Midnight Navy</option>
                      <option value="rose">Rose Gold & Twilight</option>
                      <option value="midnight">Deep Midnight Monochrome</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 mt-4 p-4 border border-zinc-800 rounded-2xl bg-zinc-900/50">
                  <label className="text-xs text-amber-400 font-mono uppercase tracking-wider block mb-2">Cinematic Final Stage Video</label>
                  
                  {finalVideoFile && (
                    <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-zinc-800 mb-4 bg-zinc-950">
                      <video src={URL.createObjectURL(finalVideoFile)} className="w-full h-full object-cover" autoPlay muted loop />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input type="file" accept="video/*" onChange={(e) => e.target.files && setFinalVideoFile(e.target.files[0])} className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-400 file:text-amber-950 hover:file:bg-amber-300 cursor-pointer w-full sm:w-auto" />
                    <button type="button" onClick={handleFinalVideoSubmit} disabled={finalVideoUploading || !finalVideoFile} className="px-4 py-2 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs disabled:opacity-40 cursor-pointer w-full sm:w-auto">
                      {finalVideoUploading ? `Uploading (${finalVideoProgress}%)...` : "Upload & Save Video"}
                    </button>
                  </div>
                  
                  {finalVideoProgress > 0 && finalVideoProgress < 100 && (
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-amber-400 transition-all duration-300 ease-out" style={{ width: `${finalVideoProgress}%` }} />
                    </div>
                  )}
                  
                  {config.finalVideoUrl && <p className="text-[10px] text-zinc-500 mt-2 truncate max-w-sm">Current: {config.finalVideoUrl}</p>}
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Save Settings
                </button>

                {configSuccess && (
                  <p className="text-emerald-400 text-xs font-mono">Settings successfully updated and saved!</p>
                )}
              </form>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
