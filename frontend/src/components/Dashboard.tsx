import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  ChevronDown,
  Sparkles,
  ClipboardList,
  Flame,
  ThumbsUp,
  BrainCircuit,
  MessageSquareCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MatchScoreCircular,
  AtsScoreGauge,
  SkillMatchPie,
  KeywordBarChart,
} from "./Charts";

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

interface DashboardProps {
  data: AnalysisData;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onBack }) => {
  // Manage state of editable resume bullets
  const [resumeText, setResumeText] = useState<string>(
    data.improved_resume_points.map((pt) => `• ${pt}`).join("\n")
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "editor" | "interview">("analysis");
  const [openSuggestion, setOpenSuggestion] = useState<number | null>(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([resumeText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "improved_resume_bullets.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Get score card colors
  const getScoreTheme = (score: number) => {
    if (score >= 80) {
      return {
        bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-700 dark:text-emerald-400",
        indicator: "bg-emerald-500",
      };
    }
    if (score >= 60) {
      return {
        bg: "bg-amber-500/5 dark:bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-700 dark:text-amber-400",
        indicator: "bg-amber-500",
      };
    }
    return {
      bg: "bg-rose-500/5 dark:bg-rose-500/10",
      border: "border-rose-500/20",
      text: "text-rose-700 dark:text-rose-400",
      indicator: "bg-rose-500",
    };
  };

  const scoreTheme = getScoreTheme(data.match_score);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Upload & Analysis
        </button>

        {/* Tab Selection buttons */}
        <div className="flex bg-secondary p-1 rounded-xl border border-border w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "analysis"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Core Analytics
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "editor"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Resume Editor
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === "interview"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquareCode className="w-4 h-4" /> Interview Prep
          </button>
        </div>
      </div>

      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Match Score Card */}
        <div className="md:col-span-3 glass-card rounded-2xl p-6 shadow-md flex flex-col items-center justify-center border border-border">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Match Rating
          </h3>
          <MatchScoreCircular score={data.match_score} />
        </div>

        {/* ATS Score Card */}
        <div className="md:col-span-3 glass-card rounded-2xl p-6 shadow-md flex flex-col items-center justify-center border border-border">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
            ATS Compatibility
          </h3>
          <AtsScoreGauge score={data.ats_score} />
        </div>

        {/* Final Recommendation Box */}
        <div className={`md:col-span-6 glass-card rounded-2xl p-6 shadow-md border ${scoreTheme.border} ${scoreTheme.bg} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${scoreTheme.indicator}`} />
              <h3 className={`text-xs font-black uppercase tracking-wider ${scoreTheme.text}`}>
                Recommendation Report
              </h3>
            </div>
            <h4 className="text-xl font-bold tracking-tight text-foreground mb-4">
              Hiring Assessment Profile
            </h4>
            <p className="text-sm text-foreground/80 dark:text-foreground/90 leading-relaxed font-medium">
              {data.final_recommendation}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-border/20 flex justify-between items-center text-[10px] font-bold text-muted-foreground">
            <span>AUDITOR: GPT-4O ENGINE</span>
            <span>VERDICT APPROVED</span>
          </div>
        </div>
      </div>

      {/* Dynamic Tab Body Render */}
      <AnimatePresence mode="wait">
        {activeTab === "analysis" && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Skill Matrix & Strengths */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Detailed Skill Charts */}
              <div className="glass-card rounded-2xl p-6 shadow-md border border-border">
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-4 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary" /> Skill & Keyword Diagnostics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
                  <div>
                    <SkillMatchPie
                      matchedCount={data.matching_skills.length}
                      missingCount={data.missing_skills.length}
                    />
                  </div>
                  <div className="pt-4 md:pt-0 md:pl-4 flex items-center">
                    <KeywordBarChart
                      presentCount={data.matching_skills.length} // estimated
                      missingCount={data.keywords_missing.length}
                    />
                  </div>
                </div>
              </div>

              {/* Skills Tags Grid */}
              <div className="glass-card rounded-2xl p-6 shadow-md border border-border">
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-6">
                  Job Description Alignment Matrix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matching Skills */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/15">
                        MATCHED
                      </span>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Skills Found
                      </h4>
                    </div>
                    {data.matching_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.matching_skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No matching skills identified.</p>
                    )}
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500/10 text-rose-500 rounded-md border border-rose-500/15">
                        GAP
                      </span>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Skills Missing
                      </h4>
                    </div>
                    {data.missing_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {data.missing_skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 dark:bg-rose-500/5 text-rose-700 dark:text-rose-400 border border-rose-500/15"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">All required skills are present!</p>
                    )}
                  </div>
                </div>

                {/* Missing Keywords Section */}
                {data.keywords_missing.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-md border border-amber-500/15">
                        ATS KEYWORDS
                      </span>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Missing Optimization Terms
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.keywords_missing.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary text-muted-foreground border border-border hover:text-foreground transition-all duration-200"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Strengths & Weaknesses Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="glass-card rounded-2xl p-6 shadow-md border border-border flex flex-col">
                  <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-emerald-500" /> Resume Strengths
                  </h3>
                  <ul className="space-y-3.5 flex-1">
                    {data.strengths.map((str, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed font-semibold text-foreground/80">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="glass-card rounded-2xl p-6 shadow-md border border-border flex flex-col">
                  <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" /> Improvement Gaps
                  </h3>
                  <ul className="space-y-3.5 flex-1">
                    {data.weaknesses.map((weak, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed font-semibold text-foreground/80">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Section Suggestions Accordion */}
            <div className="lg:col-span-5 space-y-8">
              <div className="glass-card rounded-2xl p-6 shadow-md border border-border h-full">
                <h3 className="text-lg font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" /> Section Suggestions
                </h3>
                <p className="text-xs text-muted-foreground mb-6">
                  Expand each card to inspect targeted AI improvement suggestions.
                </p>

                {/* Custom Accordion Elements */}
                <div className="space-y-4">
                  {data.rewrite_suggestions.map((sug, i) => {
                    const isOpen = openSuggestion === i;
                    // Extract headers from suggs if formatted as bold markdown **Title**: description
                    const splitIdx = sug.indexOf(":");
                    let title = `Insight Suggestion #${i + 1}`;
                    let detail = sug;
                    if (splitIdx > 0 && sug.substring(0, splitIdx).includes("**")) {
                      title = sug.substring(0, splitIdx).replace(/\*\*/g, "").trim();
                      detail = sug.substring(splitIdx + 1).trim();
                    }

                    return (
                      <div
                        key={i}
                        className={`rounded-xl border transition-all duration-300 ${
                          isOpen
                            ? "bg-secondary/40 border-primary/20 shadow-sm"
                            : "border-border hover:border-primary/20 bg-transparent"
                        }`}
                      >
                        <button
                          onClick={() => setOpenSuggestion(isOpen ? null : i)}
                          className="w-full p-4 flex justify-between items-center gap-3 text-left font-bold text-sm text-foreground focus:outline-none"
                        >
                          <span>{title}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0 ${
                              isOpen ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 border-t border-border/20 text-xs leading-relaxed text-muted-foreground font-medium">
                                {detail}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Resume Editor Tab */}
        {activeTab === "editor" && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-card rounded-2xl p-6 shadow-xl border border-border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-border pb-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" /> AI-Polished Bullet Points
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct translation of actions, metrics, and target keywords. Edit, copy, or export.
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopy}
                    className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg border border-border bg-card hover:bg-secondary text-foreground flex items-center justify-center gap-1.5 transition-all duration-200"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg border border-border bg-card hover:bg-secondary text-foreground flex items-center justify-center gap-1.5 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download TXT</span>
                  </button>
                </div>
              </div>

              {/* Mock Page Container */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-8 rounded-xl border border-border/80 relative">
                {/* Simulated Paper Sheets */}
                <div className="bg-white dark:bg-card border border-border/40 p-6 sm:p-10 shadow-lg rounded-lg min-h-[400px] flex flex-col">
                  {/* Mock resume header line */}
                  <div className="w-2/3 h-4 bg-secondary rounded mb-3" />
                  <div className="w-1/3 h-2 bg-secondary/80 rounded mb-8" />
                  <div className="w-full h-[1px] bg-border mb-8" />
                  
                  {/* Editable bullet points text area */}
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={12}
                    className="w-full flex-1 bg-transparent text-foreground text-sm font-medium leading-relaxed font-mono outline-none resize-none focus:ring-0 focus:border-transparent border-none"
                    placeholder="Enter or paste bullet points..."
                  />
                </div>
              </div>

              {/* Informative Alert */}
              <div className="mt-6 p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-blue-700 dark:text-blue-400 text-xs font-medium leading-relaxed flex gap-2">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <strong>Writing Tip:</strong> These bullet points are generated using the CAR framework (Context, Action, Result). They automatically incorporate identified keywords from the job description and simulate measurable impacts. Customize the metrics (percentages, headcount) to match your true achievements.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Interview Prep Tab */}
        {activeTab === "interview" && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500 animate-pulse" /> Interview Readiness Simulator
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
                  Get prepared for key interview questions derived from the role requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.interview_questions.map((question, i) => (
                  <motion.div
                    whileHover={{ y: -4 }}
                    key={i}
                    className="glass-card rounded-xl p-6 border border-border shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <span className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-black text-primary mb-4 shadow-sm">
                        Q{i + 1}
                      </span>
                      <h4 className="text-sm font-bold text-foreground leading-relaxed">
                        {question}
                      </h4>
                    </div>
                    
                    {/* Collapsible Suggestion Answer placeholder */}
                    <div className="mt-6 pt-4 border-t border-border/40 text-[11px] font-bold text-muted-foreground flex justify-between items-center">
                      <span>PREP CATEGORY: BEHAVIORAL</span>
                      <span className="text-primary cursor-pointer hover:underline">View Advice</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
