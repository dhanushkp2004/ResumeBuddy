import React, { useState, useEffect } from "react";
import { Sparkles, Terminal, ShieldCheck, AlertCircle, AlertTriangle, Moon, Sun } from "lucide-react";
import axios from "axios";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { ThemeToggle } from "./components/ThemeToggle";

// API Base URL - default to localhost:8000
const API_BASE = "http://localhost:8000";

interface AnalysisData {
  match_score: number;
  ats_score: number;
  matching_skills: string[];
  missing_skills: string[];
  keywords_missing: string[];
  strengths: string[];
  weaknesses: string[];
  rewrite_suggestions: string[];
  improved_resume_points: string[];
  interview_questions: string[];
  final_recommendation: string;
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  
  // API Connection Diagnostics
  const [apiStatus, setApiStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [apiMode, setApiMode] = useState<"production" | "mock-fallback" | "unknown">("unknown");
  
  // Custom Error Alert System
  const [errorToast, setErrorToast] = useState<{ message: string; type: "error" | "warning" } | null>(null);

  // Initialize Theme and verify Backend Health on startup
  useEffect(() => {
    // 1. Theme Configuration
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.add("dark");
    }

    // 2. Health check connection poll
    const checkHealth = async () => {
      try {
        const response = await axios.get(`${API_BASE}/health`, { timeout: 3000 });
        if (response.data.status === "healthy") {
          setApiStatus("connected");
          setApiMode(response.data.mode);
        }
      } catch (err) {
        setApiStatus("disconnected");
        setApiMode("unknown");
        showToast("Backend API server is offline. Run 'uvicorn app:app' in the backend directory.", "warning");
      }
    };
    
    checkHealth();
  }, []);

  const showToast = (message: string, type: "error" | "warning" = "error") => {
    setErrorToast({ message, type });
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setErrorToast(null);
    }, 6000);
  };

  // Upload Resume handler (PDF/DOCX)
  const handleUploadFile = async (file: File): Promise<{ text: string; filename: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return {
        text: response.data.text,
        filename: response.data.filename,
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to upload and parse document. Is the server running?";
      showToast(errorMsg, "error");
      throw err;
    }
  };

  // Analyze Resume + Job Description handler
  const handleAnalyze = async (resumeText: string, jobDescription: string) => {
    setIsAnalyzing(true);
    setErrorToast(null);

    try {
      const response = await axios.post(`${API_BASE}/analyze`, {
        resume_text: resumeText,
        job_description: jobDescription,
      });
      
      setAnalysisResult(response.data);
      setView("dashboard");
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "OpenAI Analysis request timed out or returned invalid format.";
      showToast(errorMsg, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 bg-grid-pattern relative overflow-hidden flex flex-col justify-between">
      
      {/* Background cyber glowing bubbles (glassmorphic ambient spots) */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Slide-in Alert System */}
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full">
        {errorToast && (
          <div
            className={`p-4 rounded-xl border shadow-lg flex gap-3 animate-slide-up backdrop-blur-md ${
              errorToast.type === "error"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }`}
          >
            {errorToast.type === "error" ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              <span className="font-extrabold uppercase block mb-1">
                {errorToast.type === "error" ? "System Error" : "Connection Alert"}
              </span>
              {errorToast.message}
            </div>
            <button
              onClick={() => setErrorToast(null)}
              className="text-xs font-bold hover:underline shrink-0 text-foreground/40 hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Main Top Navigation Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-foreground">
              ResumeBuddy
            </span>
            
            {/* Status indicator pill */}
            <div className="hidden sm:flex items-center gap-1.5 ml-4 px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-secondary/80">
              {apiStatus === "connecting" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-muted-foreground">Connecting API</span>
                </>
              )}
              {apiStatus === "connected" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    API Connected {apiMode === "mock-fallback" && "(Mock)"}
                  </span>
                </>
              )}
              {apiStatus === "disconnected" && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-rose-500">API Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Theme & Profile controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex items-center">
        {view === "landing" ? (
          <LandingPage
            onAnalyze={handleAnalyze}
            onUploadFile={handleUploadFile}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          analysisResult && (
            <Dashboard
              data={analysisResult}
              onBack={() => setView("landing")}
            />
          )
        )}
      </main>

      {/* Page Footer */}
      <footer className="border-t border-border bg-card/40 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} ResumeBuddy. Premium AI Optimization.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
