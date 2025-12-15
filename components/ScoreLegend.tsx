import React from 'react';

const ScoreLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-end gap-4 text-xs sm:text-sm text-gray-600 mb-4 px-2">
      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> 5-ดีเลิศ</div>
      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600"></span> 4-ดีมาก</div>
      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-400"></span> 3-ดี</div>
      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> 2-พอใช้</div>
      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> 1-ปรับปรุง</div>
    </div>
  );
};

export default ScoreLegend;