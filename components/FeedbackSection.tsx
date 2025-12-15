import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  isLocked?: boolean;
  forcePrintMode?: boolean;
}

const FeedbackSection: React.FC<Props> = ({ value, onChange, isLocked = false, forcePrintMode = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 ${forcePrintMode ? 'border-none shadow-none mb-2' : ''}`}>
      <div className={`bg-gray-100 p-4 border-b border-gray-200 ${forcePrintMode ? 'bg-transparent p-0 border-none mb-1' : ''}`}>
        <h3 className={`font-bold ${forcePrintMode ? 'text-black text-xs' : 'text-gray-800'}`}>ส่วนที่ 4 : ความคิดเห็นเพิ่มเติม (Feedback)</h3>
      </div>
      <div className={`p-4 ${forcePrintMode ? 'p-0' : ''}`}>
        {forcePrintMode ? (
           <div className="border border-black rounded p-2 min-h-[60px] text-black whitespace-pre-line text-[10px] bg-white">
             {value || "-"}
           </div>
        ) : (
          <textarea
            className={`w-full border border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none shadow-inner ${isLocked ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
            rows={10}
            placeholder="กรอกรายละเอียดความคิดเห็นเพิ่มเติม จุดอ่อน จุดแข็ง หรือการพัฒนาที่ควรได้รับ..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLocked}
          />
        )}
      </div>
    </div>
  );
};

export default FeedbackSection;
