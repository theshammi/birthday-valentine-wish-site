"use client";

import { useState, useEffect } from "react";
import { getImageKitAuth, deleteImageKitFile } from "../actions";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { ref, onValue, set } from "firebase/database";
import { auth, database } from "../../lib/firebase";
import { Memory, AppConfig, DEFAULT_CONFIG } from "../../lib/db";
import { Lock, SignOut, Image as ImageIcon, Gear, Trash, UploadSimple, Sparkle, FilmStrip } from "@phosphor-icons/react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<"memories" | "settings" | "media">("memories");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);

  const [finalVideoUploading, setFinalVideoUploading] = useState(false);
  const [finalVideoFile, setFinalVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [finalVideoProgress, setFinalVideoProgress] = useState(0);

  const [audioUploading, setAudioUploading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);

  // Forms states
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [configSuccess, setConfigSuccess] = useState(false);
  const [memorySuccess, setMemorySuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        // Setup real-time listener for dashboard data
        const dbRef = ref(database, 'greetings/main');
        onValue(dbRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const mems = Array.isArray(data.memories) ? data.memories : (data.memories ? Object.values(data.memories) : []);
            setMemories(mems.sort((a: any, b: any) => a.order - b.order));
            setConfig({ ...DEFAULT_CONFIG, ...data.config });
          } else {
            setConfig(DEFAULT_CONFIG);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError(error.message || "Invalid email or password.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // ImageKit file uploader & Memory submission
  const handleMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setMemorySuccess(false);

    try {
      const authParams = await getImageKitAuth();
      if (!authParams) {
        alert("Failed to authenticate with ImageKit. Ensure you are logged in.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", selectedFile.name);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire.toString());
      formData.append("token", authParams.token);
      formData.append("folder", process.env.NEXT_PUBLIC_IMAGEKIT_FOLDER || "/birthday-valentine-wish-site");

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

      const newMemory: Memory = {
        id: Math.random().toString(36).substring(2, 9),
        imageUrl,
        videoUrl,
        caption: caption.trim() || "A beautiful memory.",
        date: date.trim() || "Memory Date",
        order: memories.length + 1,
      };

      const updatedMemories = [...memories, newMemory];
      const memRef = ref(database, 'greetings/main/memories');
      await set(memRef, updatedMemories);

      setMemorySuccess(true);
      setCaption("");
      setDate("");
      setSelectedFile(null);
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
    const updatedMemories = memories.filter((m) => m.id !== id);
    updatedMemories.forEach((m, idx) => m.order = idx + 1);
    const memRef = ref(database, 'greetings/main/memories');
    await set(memRef, updatedMemories);
  };

  // Config Update Action
  const handleConfigUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setConfigSuccess(false);
    
    const confRef = ref(database, 'greetings/main/config');
    await set(confRef, config);
    
    setConfigSuccess(true);
    setTimeout(() => setConfigSuccess(false), 3000);
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
      formData.append("folder", process.env.NEXT_PUBLIC_IMAGEKIT_FOLDER || "/birthday-valentine-wish-site");

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
      
      if (config.finalVideoFileId) {
        await deleteImageKitFile(config.finalVideoFileId);
      }
      
      const updatedConfig = { ...config, finalVideoUrl: result.url, finalVideoFileId: result.fileId };
      const confRef = ref(database, 'greetings/main/config');
      await set(confRef, updatedConfig);
      
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

  const handleAudioSubmit = async () => {
    if (!audioFile || !config) return;
    setAudioUploading(true);
    try {
      const authParams = await getImageKitAuth();
      if (!authParams) throw new Error("Not authenticated");
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("fileName", audioFile.name);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", authParams.signature);
      formData.append("expire", authParams.expire.toString());
      formData.append("token", authParams.token);
      formData.append("folder", process.env.NEXT_PUBLIC_IMAGEKIT_FOLDER || "/birthday-valentine-wish-site");

      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setAudioProgress(Math.round((event.loaded / event.total) * 100));
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
      
      if (config.backgroundMusicFileId) {
        await deleteImageKitFile(config.backgroundMusicFileId);
      }
      
      const updatedConfig = { ...config, backgroundMusicUrl: result.url, backgroundMusicFileId: result.fileId };
      const confRef = ref(database, 'greetings/main/config');
      await set(confRef, updatedConfig);
      
      setAudioFile(null);
      alert("Background Music Uploaded and Saved!");
    } catch (err) {
      console.error(err);
      alert("Audio upload failed");
    } finally {
      setAudioUploading(false);
      setAudioProgress(0);
    }
  };

  const handleDeleteFinalVideo = async () => {
    if (!config) return;
    if (!confirm("Are you sure you want to delete the final video?")) return;
    
    try {
      if (config.finalVideoFileId) {
        await deleteImageKitFile(config.finalVideoFileId);
      }
      const updatedConfig = { ...config };
      delete updatedConfig.finalVideoUrl;
      delete updatedConfig.finalVideoFileId;
      
      const confRef = ref(database, 'greetings/main/config');
      await set(confRef, updatedConfig);
      alert("Final Video Deleted!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete video");
    }
  };

  const handleDeleteAudio = async () => {
    if (!config) return;
    if (!confirm("Are you sure you want to delete the background music?")) return;
    
    try {
      if (config.backgroundMusicFileId) {
        await deleteImageKitFile(config.backgroundMusicFileId);
      }
      const updatedConfig = { ...config };
      delete updatedConfig.backgroundMusicUrl;
      delete updatedConfig.backgroundMusicFileId;
      
      const confRef = ref(database, 'greetings/main/config');
      await set(confRef, updatedConfig);
      alert("Background Music Deleted!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete audio");
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
            <p className="text-zinc-500 text-xs tracking-wider uppercase font-mono">Authentication Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 transition-colors"
            />
            <input
              type="password"
              placeholder="Admin Password"
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

      <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <aside className="lg:col-span-1 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-r border-zinc-800">
          {[
            { id: "memories", label: "Memories", icon: ImageIcon },
            { id: "settings", label: "Settings", icon: Gear },
            { id: "media", label: "Media & Finale", icon: FilmStrip },
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

        <section className="lg:col-span-3">
          {activeTab === "memories" && (
            <div className="space-y-8">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-semibold">Memories and Photo Manager</h2>
                <p className="text-zinc-500 text-xs">Upload sweet photo snapshots directly to ImageKit and write stories.</p>
              </div>

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
                      value={config.birthdayName || ""}
                      onChange={(e) => setConfig({ ...config, birthdayName: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Birth Date</label>
                    <input
                      type="date"
                      required
                      value={config.birthDate || ""}
                      onChange={(e) => setConfig({ ...config, birthDate: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Invitation Envelope Title</label>
                  <input
                    type="text"
                    required
                    value={config.envelopeTitle || ""}
                    onChange={(e) => setConfig({ ...config, envelopeTitle: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Hero Greeting (e.g. Love of my life,)</label>
                    <input
                      type="text"
                      value={config.heroGreeting || ""}
                      onChange={(e) => setConfig({ ...config, heroGreeting: e.target.value })}
                      placeholder="Love of my life,"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Hero Quote</label>
                    <textarea
                      value={config.heroQuote || ""}
                      onChange={(e) => setConfig({ ...config, heroQuote: e.target.value })}
                      placeholder={"In all the world, there is no heart for me like yours.\nIn all the world, there is no love for you like mine."}
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Memories Title</label>
                    <input
                      type="text"
                      value={config.memoriesTitle || ""}
                      onChange={(e) => setConfig({ ...config, memoriesTitle: e.target.value })}
                      placeholder="Our Memories"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Memories Description</label>
                    <textarea
                      value={config.memoriesDescription || ""}
                      onChange={(e) => setConfig({ ...config, memoriesDescription: e.target.value })}
                      placeholder="A timeline of our favorite moments..."
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Visual Theme</label>
                    <select
                      value={config.theme || "rose"}
                      onChange={(e) => setConfig({ ...config, theme: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-amber-400"
                    >
                      <option value="gold">Gold & Midnight Navy</option>
                      <option value="rose">Rose Gold & Twilight</option>
                      <option value="midnight">Deep Midnight Monochrome</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Text Reveal Effect</label>
                    <div className="flex items-center gap-4 mt-3">
                      <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.enableTextReveal ?? true}
                          onChange={(e) => setConfig({ ...config, enableTextReveal: e.target.checked })}
                          className="rounded border-zinc-800 text-amber-400 focus:ring-amber-400 bg-zinc-900 w-4 h-4 cursor-pointer"
                        />
                        Enable Reveal Animation
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Text Reveal Speed (Seconds per Character)</label>
                    <input
                      type="number"
                      step="0.005"
                      min="0.005"
                      max="0.2"
                      value={config.textRevealSpeed ?? 0.03}
                      onChange={(e) => setConfig({ ...config, textRevealSpeed: parseFloat(e.target.value) || 0.03 })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-zinc-500 font-mono">Stagger delay in seconds (default is 0.03. Smaller is faster, larger is slower).</p>
                  </div>
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

          {activeTab === "media" && config && (
            <div className="space-y-8">
              <div className="border-b border-zinc-800 pb-4">
                <h2 className="text-xl font-semibold">Media & Finale</h2>
                <p className="text-zinc-500 text-xs">Manage background music, the final reveal video, and the end screen experience.</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400 font-mono uppercase tracking-wider">Final Reveal Video</h3>
                <p className="text-xs text-zinc-500">Upload an MP4/WebM video for the grand finale. This will be preloaded on site load.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFinalVideoFile(e.target.files[0]);
                        }
                      }}
                      className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-900 file:text-amber-400 hover:file:bg-zinc-800 cursor-pointer border border-zinc-800 rounded-xl bg-zinc-900/50"
                    />
                  </div>
                  <button
                    onClick={handleFinalVideoSubmit}
                    disabled={finalVideoUploading || !finalVideoFile}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {finalVideoUploading ? `Uploading ${finalVideoProgress}%` : "Upload Video"}
                  </button>
                </div>
                {config.finalVideoUrl && (
                  <div className="flex items-center justify-between gap-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-500 font-mono truncate flex-1">
                      Current: <a href={config.finalVideoUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">{config.finalVideoUrl}</a>
                    </p>
                    <button type="button" onClick={handleDeleteFinalVideo} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors cursor-pointer">
                      <Trash className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400 font-mono uppercase tracking-wider">Background Music</h3>
                <p className="text-xs text-zinc-500">Upload an MP3/WAV file to override the default background music.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAudioFile(e.target.files[0]);
                        }
                      }}
                      className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-900 file:text-amber-400 hover:file:bg-zinc-800 cursor-pointer border border-zinc-800 rounded-xl bg-zinc-900/50"
                    />
                  </div>
                  <button
                    onClick={handleAudioSubmit}
                    disabled={audioUploading || !audioFile}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {audioUploading ? `Uploading ${audioProgress}%` : "Upload Audio"}
                  </button>
                </div>
                {config.backgroundMusicUrl && (
                  <div className="flex items-center justify-between gap-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-500 font-mono truncate flex-1">
                      Current: <a href={config.backgroundMusicUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">{config.backgroundMusicUrl}</a>
                    </p>
                    <button type="button" onClick={handleDeleteAudio} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors cursor-pointer">
                      <Trash className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleConfigUpdate} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-amber-400 font-mono uppercase tracking-wider">Media & End Screen Config</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col justify-center">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block mb-2">Enable Background Music</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={config.isMusicEnabled ?? true} 
                        onChange={(e) => setConfig({ ...config, isMusicEnabled: e.target.checked })} 
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                      <span className="ml-3 text-sm font-medium text-zinc-300">
                        {config.isMusicEnabled ?? true ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">Mute BGM during Final Video?</label>
                    <select
                      value={config.muteBgmDuringVideo || "auto"}
                      onChange={(e) => setConfig({ ...config, muteBgmDuringVideo: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-amber-400"
                    >
                      <option value="auto">Auto-detect (Mute if video has audio)</option>
                      <option value="yes">Yes (Always mute background music)</option>
                      <option value="no">No (Keep playing background music)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">End Screen Title</label>
                  <input
                    type="text"
                    value={config.endScreenTitle || ""}
                    onChange={(e) => setConfig({ ...config, endScreenTitle: e.target.value })}
                    placeholder="Forever."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">End Screen Body Text</label>
                  <textarea
                    value={config.endScreenBody || ""}
                    onChange={(e) => setConfig({ ...config, endScreenBody: e.target.value })}
                    placeholder="Every moment with you is a gift..."
                    rows={2}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-mono uppercase tracking-wider block">After-Video Phrases (One per line)</label>
                  <textarea
                    value={config.afterVideoPhrases || ""}
                    onChange={(e) => setConfig({ ...config, afterVideoPhrases: e.target.value })}
                    placeholder={"I didn't just build this to say Happy Birthday...\nI built this to remind you...\n..."}
                    rows={5}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <p className="text-[10px] text-zinc-500 font-mono">Each line will represent a text block shown sequentially after the video ends, prior to the final screen.</p>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  Save Config
                </button>
                {configSuccess && (
                  <p className="text-emerald-400 text-xs font-mono">Config successfully updated!</p>
                )}
              </form>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
