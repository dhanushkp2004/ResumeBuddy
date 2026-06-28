import React from "react";
import { motion } from "framer-motion";

// ==========================================
// 1. MATCH SCORE PROGRESS (Circular Ring)
// ==========================================
interface MatchScoreCircularProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const MatchScoreCircular: React.FC<MatchScoreCircularProps> = ({
  score,
  size = 140,
  strokeWidth = 12,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color theme based on score
  const getColor = (s: number) => {
    if (s >= 80) return "stroke-emerald-500";
    if (s >= 60) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return "text-emerald-500/10";
    if (s >= 60) return "text-amber-500/10";
    return "text-rose-500/10";
  };

  const getTextColor = (s: number) => {
    if (s >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (s >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Track circle */}
        <circle
          className="stroke-border"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Highlight inner fill */}
        <circle
          className={`${getBgColor(score)} fill-current`}
          r={radius - strokeWidth / 2}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className={`${getColor(score)} transition-all duration-1000 ease-out`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Score Text Overlay */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-extrabold tracking-tight ${getTextColor(score)}`}>
          {score}%
        </span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
          Match
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 2. ATS SCORE GAUGE (Semi-circular Speedometer)
// ==========================================
interface AtsScoreGaugeProps {
  score: number;
  size?: number;
}

export const AtsScoreGauge: React.FC<AtsScoreGaugeProps> = ({ score, size = 160 }) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * Math.PI; // Semi-circle circumference
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getGaugeColor = (s: number) => {
    if (s >= 80) return "stroke-emerald-500";
    if (s >= 65) return "stroke-teal-500";
    if (s >= 50) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  const getTextColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 65) return "text-teal-500";
    if (s >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  // Needle angle rotation (from -90deg to 90deg, mapping to 0% to 100%)
  const needleAngle = (score / 100) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size / 1.3 }}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        {/* Background track */}
        <path
          d={`M ${strokeWidth},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${size / 2}`}
          fill="transparent"
          strokeWidth={strokeWidth}
          className="stroke-border"
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <motion.path
          d={`M ${strokeWidth},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth},${size / 2}`}
          fill="transparent"
          strokeWidth={strokeWidth}
          className={getGaugeColor(score)}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Needle pivot */}
        <circle cx={size / 2} cy={size / 2} r="6" className="fill-foreground" />
        {/* Needle pointer */}
        <motion.line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2}
          y2={strokeWidth + 4}
          className="stroke-foreground"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ originX: `${size / 2}px`, originY: `${size / 2}px` }}
          initial={{ rotate: -90 }}
          animate={{ rotate: needleAngle }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      {/* Label and numbers */}
      <div className="absolute bottom-2 flex flex-col items-center text-center">
        <span className={`text-2xl font-black ${getTextColor(score)}`}>{score}</span>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
          ATS Score
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 3. SKILL MATCH PIE CHART (Donut Chart)
// ==========================================
interface SkillMatchPieProps {
  matchedCount: number;
  missingCount: number;
}

export const SkillMatchPie: React.FC<SkillMatchPieProps> = ({ matchedCount, missingCount }) => {
  const total = matchedCount + missingCount;
  const matchedPercentage = total > 0 ? Math.round((matchedCount / total) * 100) : 50;
  const missingPercentage = total > 0 ? 100 - matchedPercentage : 50;

  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const matchedOffset = circumference - (matchedPercentage / 100) * circumference;
  const missingOffset = circumference - (missingPercentage / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Slice 1: Missing Skills (Red/Rose) */}
          <circle
            className="stroke-rose-500/20 dark:stroke-rose-500/10"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Slice 2: Matched Skills (Green/Emerald Progress) */}
          <motion.circle
            className="stroke-emerald-500"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: matchedOffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-foreground">{matchedPercentage}%</span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase">Skills Match</span>
        </div>
      </div>

      {/* Legends */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
          <div>
            <div className="text-xs font-bold text-foreground">Matching Skills</div>
            <div className="text-[11px] text-muted-foreground">
              {matchedCount} items ({matchedPercentage}%)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-rose-500/40"></div>
          <div>
            <div className="text-xs font-bold text-foreground">Gaps to Address</div>
            <div className="text-[11px] text-muted-foreground">
              {missingCount} items ({missingPercentage}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. KEYWORD COVERAGE BAR CHART
// ==========================================
interface KeywordBarProps {
  presentCount: number;
  missingCount: number;
}

export const KeywordBarChart: React.FC<KeywordBarProps> = ({ presentCount, missingCount }) => {
  const total = presentCount + missingCount;
  const coverageRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      <div className="flex justify-between items-center text-sm font-semibold">
        <span className="text-muted-foreground">Keyword Coverage Rate</span>
        <span className="text-primary font-bold">{coverageRate}%</span>
      </div>

      {/* Main Bar Progress Track */}
      <div className="relative w-full h-8 bg-secondary rounded-full overflow-hidden border border-border">
        {/* Matching keywords portion */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-end pr-3"
          initial={{ width: 0 }}
          animate={{ width: `${coverageRate}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {coverageRate > 15 && (
            <span className="text-[10px] text-white font-extrabold uppercase tracking-wider">
              {presentCount} Present
            </span>
          )}
        </motion.div>
        
        {/* Text for missing keyword count displayed when space permits */}
        {coverageRate <= 85 && (
          <div className="absolute right-3 top-0 h-full flex items-center">
            <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wider">
              {missingCount} Missing
            </span>
          </div>
        )}
      </div>

      {/* Statistics and Quick Facts */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-secondary/40 p-3 rounded-lg border border-border/40 text-center">
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{presentCount}</div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            Identified
          </div>
        </div>
        <div className="bg-secondary/40 p-3 rounded-lg border border-border/40 text-center">
          <div className="text-xl font-extrabold text-rose-500">{missingCount}</div>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
            Omitted
          </div>
        </div>
      </div>
    </div>
  );
};
