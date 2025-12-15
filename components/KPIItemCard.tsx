import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { KPIItemData } from '../types';

interface Props {
  item: KPIItemData;
  score: number;
  comment: string;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
  isLocked?: boolean;
  forceExpand?: boolean; // New prop for PDF generation
}

const KPIItemCard: React.FC<Props> = ({ item, score, comment, onScoreChange, onCommentChange, isLocked = false, forceExpand = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // If forceExpand is true, treat as expanded regardless of state
  const expanded = forceExpand || isExpanded;

  const calculateResult = (s: number, w: number) => {
    if (s === 0) return 0;
    return ((s / 5) * w).toFixed(2);
  };

  const getScoreColor = (val: number) => {
    switch (val) {
      case 5: return 'text-green-600 font-semibold';
      case 4: return 'text-blue-700 font-semibold';
      case 3: return 'text-sky-500 font-semibold';
      case 2: return 'text-yellow-600 font-semibold';
      case 1: return 'text-red-600 font-semibold';
      default: return 'text-gray-500';
    }
  };

  const getButtonClass = (btnVal: number) => {
    const base = "w-10 h-10 rounded border text-lg font-medium transition-all duration-200 flex items-center justify-center ";
    
    // In Print/PDF mode, change style to simple circle or text if needed, but let's keep button look for now with optimization
    if (forceExpand) {
        if (score === btnVal) {
            return "w-8 h-8 rounded-full bg-black text-white font-bold border border-black text-sm flex items-center justify-center mx-1";
        } else {
            return "w-8 h-8 rounded-full bg-white text-gray-300 font-normal border border-gray-200 text-sm flex items-center justify-center mx-1";
        }
    }

    if (score === btnVal) {
      // Active state styling
      let activeStyle = "bg-primary text-white border-primary shadow-md transform scale-105";
      if (isLocked) {
         // Locked & Active
         activeStyle = "bg-primary/80 text-white border-primary/50 cursor-not-allowed";
      }
      return base + activeStyle;
    }

    // Inactive state
    if (isLocked) {
      return base + "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed";
    }

    return base + "bg-white text-gray-400 border-gray-200 hover:border-primary hover:text-primary";
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden break-inside-avoid ${forceExpand ? 'border-b-2 border-gray-300' : ''}`}>
      {/* Header Row */}
      <div className={`p-4 flex flex-col md:flex-row md:items-start gap-4 border-b border-gray-100 bg-white ${forceExpand ? 'p-3 border-none' : ''}`}>
        
        {/* Toggle & Title */}
        <div className="flex-1 flex gap-3 cursor-pointer" onClick={() => !forceExpand && setIsExpanded(!isExpanded)}>
          {!forceExpand && (
            <button className="mt-1 text-primary hover:text-blue-600 transition-colors">
                {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
          <div className="flex-1">
            <h3 className={`font-bold text-gray-800 leading-snug ${forceExpand ? 'text-base' : 'text-lg'}`}>
              {item.title}
            </h3>
            <p className={`text-gray-500 mt-1 leading-relaxed pr-4 ${forceExpand ? 'text-xs' : 'text-sm'}`}>
              {item.description}
            </p>
          </div>
        </div>

        {/* Controls: Weight & Score */}
        <div className={`flex flex-col items-end gap-3 min-w-[280px] ${forceExpand ? 'min-w-[150px] gap-1' : ''}`}>
           {/* Weight Badge */}
           <div className="flex items-center gap-4 w-full justify-between md:justify-end">
               <span className={`text-gray-500 font-medium md:hidden ${forceExpand ? 'text-xs' : 'text-sm'}`}>น้ำหนัก:</span>
               <span className={`px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full ${forceExpand ? 'text-xs px-2 py-0.5 bg-gray-100 text-gray-600' : 'text-sm'}`}>
                {item.weight}%
               </span>
           </div>
           
           {/* Score Buttons */}
           <div className="flex items-center gap-1">
             {[1, 2, 3, 4, 5].map((val) => (
               <button
                 key={val}
                 onClick={() => !isLocked && !forceExpand && onScoreChange(val)}
                 disabled={isLocked || forceExpand}
                 className={getButtonClass(val)}
               >
                 {val}
               </button>
             ))}
           </div>
           
           {/* Result Text */}
           <div className="text-right text-sm">
             <span className="text-gray-400 mr-2">ผลลัพธ์:</span>
             <span className={`font-bold ${score > 0 ? 'text-primary' : 'text-gray-300'} ${forceExpand ? 'text-black' : 'text-lg'}`}>
                {calculateResult(score, item.weight)}
             </span>
             <span className="text-gray-400 ml-1">คะแนน</span>
           </div>
        </div>
      </div>

      {/* Expanded Content: Criteria & Comments */}
      {expanded && (
        <div className={`grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 bg-secondary/30 ${forceExpand ? 'bg-white border-t border-gray-100' : ''}`}>
          
          {/* Left: Criteria List */}
          <div className={`p-5 ${forceExpand ? 'p-3 lg:col-span-2' : ''}`}>
             {!forceExpand && <h4 className="text-primary font-bold text-sm mb-3">เกณฑ์การวัดผล (Criteria):</h4>}
             {forceExpand ? (
                 // In Print mode, only show the selected criteria description or a summary
                 <div className="text-sm text-gray-600">
                    <span className="font-bold text-gray-800">เกณฑ์ที่เลือก ({score}): </span>
                    {item.criteria.find(c => c.score === score)?.description || "-"}
                 </div>
             ) : (
                <div className="space-y-3">
                {item.criteria.map((crit) => (
                    <div key={crit.score} className="flex items-start gap-3 text-sm">
                    <span className={`font-bold min-w-[1.5rem] ${getScoreColor(crit.score)}`}>
                        {crit.score}:
                    </span>
                    <span className="text-gray-600 leading-relaxed">
                        {crit.description}
                    </span>
                    </div>
                ))}
                </div>
             )}
          </div>

          {/* Right: Comments */}
          <div className={`p-5 flex flex-col h-full ${forceExpand ? 'p-3 border-t border-gray-100 lg:col-span-2 lg:border-t-0' : ''}`}>
            {!forceExpand && (
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                <Info size={16} />
                <h4>หมายเหตุ / ความคิดเห็นเพิ่มเติม:</h4>
                </div>
            )}
            {forceExpand ? (
                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 min-h-[40px]">
                    <span className="font-bold text-xs text-gray-500 block mb-1">ความคิดเห็นเพิ่มเติม:</span>
                    {comment || "-"}
                </div>
            ) : (
                <textarea
                className={`flex-1 w-full border border-gray-300 rounded-md p-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none bg-white shadow-inner ${isLocked ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                rows={5}
                placeholder={isLocked ? "ไม่ได้ระบุความคิดเห็น" : "กรอกรายละเอียดผลการปฏิบัติงาน หรือเหตุผลประกอบการให้คะแนน (2-3 บรรทัด)"}
                value={comment}
                onChange={(e) => onCommentChange(e.target.value)}
                disabled={isLocked}
                />
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default KPIItemCard;