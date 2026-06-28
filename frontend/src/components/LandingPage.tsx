import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, FileCode2, Sparkles, Brain, Award, ShieldAlert, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LandingPageProps {
  onAnalyze: (resumeText: string, jobDescription: string) => void;
  onUploadFile: (file: File) => Promise<{ text: string; filename: string }>;
  isAnalyzing: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onAnalyze,
  onUploadFile,
  isAnalyzing,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;
  const charCount = jobDescription.length;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndUploadFile = async (selectedFile: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
    
    // Check type
    if (!validTypes.includes(selectedFile.type) && fileExt !== "pdf" && fileExt !== "docx") {
      setUploadStatus("error");
      setUploadError("Invalid file type. Please upload a PDF or DOCX file.");
      return;
    }

    // Check size (10 MB = 10 * 1024 * 1024 bytes)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setUploadError("File is too large. Maximum size allowed is 10 MB.");
      return;
    }

    setFile(selectedFile);
    setUploadStatus("uploading");
    setUploadError("");

    try {
      const response = await onUploadFile(selectedFile);
      setExtractedText(response.text);
      setUploadStatus("success");
    } catch (err: any) {
      setUploadStatus("error");
      setUploadError(err.response?.data?.detail || "Failed to extract text. Please check if the document is readable.");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await validateAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await validateAndUploadFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyzeClick = () => {
    if (uploadStatus !== "success" || !extractedText) {
      setUploadStatus("error");
      setUploadError("Please upload a valid resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste a job description to perform the analysis.");
      return;
    }
    onAnalyze(extractedText, jobDescription);
  };

  const features = [
    {
      icon: <Award className="w-5 h-5 text-emerald-500" />,
      title: "Match Score",
      description: "Get an overall percentage indicating your relevance to the role based on skills, experience, and education.",
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-500" />,
      title: "ATS Compatibility",
      description: "Receive a check on standard ATS parser constraints and learn what keywords might cause filtration.",
    },
    {
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      title: "Skills Gap Analysis",
      description: "Visualize matching credentials and identify missing technical competencies requested by recruiters.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      title: "AI Resume Rewrite",
      description: "Transform weak, passive work history statements into impact-driven achievements using action verbs.",
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
      title: "Strategic Suggestions",
      description: "Section-by-section guidelines outlining structural errors, content omissions, and spelling improvements.",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-6"
        >
          <Sparkles className="w-3.5 h-3.5" /> Powered by OpenAI GPT-4o
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary/80"
        >
          ResumeBuddy
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed"
        >
          Upload your resume and compare it with any job description using AI. Get instant scoring, skills gap mapping, and professional rewrites.
        </motion.p>
      </div>

      {/* Main Grid: Upload & Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
        
        {/* Left Hand: Upload Box */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-5 h-full"
        >
          <div className="glass-card rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-2 text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> 1. Upload Resume
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                Drag and drop your PDF or DOCX file (up to 10MB).
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-secondary/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileInputChange}
              />

              <AnimatePresence mode="wait">
                {uploadStatus === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary mb-4 shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Click to upload or drag file here
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, DOCX formats supported
                    </p>
                  </motion.div>
                )}

                {uploadStatus === "uploading" && (
                  <motion.div
                    key="uploading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-bounce">
                      <FileCode2 className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Extracting resume content...
                    </p>
                    <div className="w-32 bg-secondary h-1.5 rounded-full overflow-hidden mt-3">
                      <div className="bg-primary h-full w-2/3 animate-infinite-loading rounded-full" />
                    </div>
                  </motion.div>
                )}

                {uploadStatus === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-foreground max-w-[200px] truncate">
                      {file?.name}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      Ready for analysis ({Math.round(extractedText.length / 100) / 10}k characters parsed)
                    </p>
                  </motion.div>
                )}

                {uploadStatus === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center p-4 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 animate-shake">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-rose-500">
                      Upload failed
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[240px]">
                      {uploadError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Quick Upload Action Buttons */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={triggerFileInput}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg border border-border bg-card text-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
              >
                Choose File
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Hand: Job Description Box */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-7"
        >
          <div className="glass-card rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-2 text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> 2. Job Description
              </h2>
              <p className="text-xs text-muted-foreground mb-6">
                Paste the requirement specifications or job scope below.
              </p>
            </div>

            <div className="relative">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                rows={10}
                className="w-full bg-secondary/30 text-foreground border border-border rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 outline-none resize-none font-sans"
              />
              {/* Counters */}
              <div className="absolute right-4 bottom-4 flex gap-4 text-[10px] font-bold text-muted-foreground bg-background/80 dark:bg-card/80 py-1 px-2.5 rounded-full border border-border/40 backdrop-blur-sm">
                <span>{wordCount} Words</span>
                <span>{charCount} Characters</span>
              </div>
            </div>

            {/* Launch Button */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-muted-foreground">
                Make sure to upload a resume before hitting analyze.
              </div>
              <button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing || uploadStatus !== "success" || !jobDescription.trim()}
                className={`w-full sm:w-auto px-8 py-3.5 font-bold rounded-xl text-white bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 hover:from-primary/95 hover:to-indigo-500 shadow-lg shadow-primary/20 hover:shadow-primary/45 transition-all duration-300 flex items-center justify-center gap-2 group ${
                  (isAnalyzing || uploadStatus !== "success" || !jobDescription.trim()) &&
                  "opacity-50 cursor-not-allowed"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Evaluating Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    <span>Analyze Compatibility</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h3 className="text-2xl font-bold tracking-tight text-center text-foreground mb-12">
          Comprehensive Evaluation Suite
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feat, index) => (
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              key={index}
              className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h4 className="text-sm font-bold text-foreground tracking-tight mb-2">
                {feat.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
