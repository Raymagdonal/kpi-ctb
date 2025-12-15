import React from 'react';
import { Settings, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface Props {
  isPdf?: boolean;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  currentUser?: User;
}

const KPIHeader: React.FC<Props> = ({ isPdf = false, onOpenAdmin, onLogout, isAdmin = false, currentUser }) => {
  if (isPdf) {
    return (
      <div className="bg-white text-black border-b-2 border-black pb-2 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold uppercase mb-1">บริษัท เจ้าพระยาทัวร์ริสท์โบ๊ท จำกัด</h1>
            <h2 className="text-sm font-bold uppercase text-gray-600">แบบประเมินผลการปฏิบัติงาน</h2>
            <p className="text-xs font-medium">Performance Appraisal Form (KPIs)</p>
          </div>
          <div className="text-right">
             <div className="border border-black px-2 py-0.5 text-[10px] font-bold uppercase inline-block mb-1">
              CONFIDENTIAL
            </div>
            <p className="text-[10px]">เอกสารภายใน (Internal Use Only)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary text-white p-6 rounded-t-lg shadow-md relative overflow-hidden print:hidden">
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-2 tracking-wide">บริษัท เจ้าพระยาทัวร์ริสท์โบ๊ท จำกัด</h1>
          <div className="flex flex-col">
            <span className="text-lg font-semibold opacity-90">แบบประเมินผลการปฏิบัติงาน</span>
            <span className="text-blue-200 text-sm">Performance Appraisal Form (KPIs)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          
          {currentUser && (
            <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-sm">
               <UserIcon size={18} />
               <span className="text-sm font-bold max-w-[120px] truncate">{currentUser.username}</span>
            </div>
          )}

          <div className="hidden sm:block">
            <div className="border border-white/30 bg-white/10 px-4 py-1.5 rounded text-sm font-semibold tracking-wider uppercase backdrop-blur-sm">
              Confidential
            </div>
          </div>

          {onLogout && (
            <button 
              onClick={onLogout}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm text-white border border-white/20 shadow-sm"
              title="ออกจากระบบ (Logout)"
            >
              <LogOut size={20} />
            </button>
          )}
          
          {isAdmin && onOpenAdmin && (
            <button 
              onClick={onOpenAdmin}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm text-white border border-white/20 shadow-sm group"
              title="ตั้งค่าระบบ"
            >
              <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
            </button>
          )}
        </div>
      </div>
      {/* Decorative background element */}
      <div className="absolute -right-10 -top-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    </div>
  );
};

export default KPIHeader;
