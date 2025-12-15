import React, { useState, useRef, useEffect, useMemo } from 'react';
import { EmployeeData, User } from '../types';
import { ChevronDown, Search, X } from 'lucide-react';

interface Props {
  data: EmployeeData;
  onChange: (field: keyof EmployeeData, value: string) => void;
  hideSearch?: boolean;
  employeeList: any[];
  currentUser?: User; // Pass current user for permission check
  forbiddenIds?: string[];
}

const EmployeeInfo: React.FC<Props> = ({ data, onChange, hideSearch = false, employeeList, currentUser, forbiddenIds = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const selectClass = "w-full border-b border-gray-300 focus:border-primary outline-none px-2 py-1 bg-transparent text-gray-700 transition-colors appearance-none cursor-pointer font-medium";
  const labelClass = "text-primary font-bold text-base w-32 shrink-0";
  const inputClass = "w-full border-b border-gray-300 outline-none px-2 py-1 bg-transparent text-gray-700 transition-colors";
  const lockedClass = "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200";

  // Compute unique Departments from the passed employeeList and FILTER by permissions
  const JOB_TYPES = useMemo(() => {
    const allTypes = Array.from(new Set(employeeList.map(e => e.jobType).filter(Boolean)));
    
    if (!currentUser || currentUser.role === 'admin' || currentUser.allowedDepartments.includes('ALL')) {
      return allTypes;
    }

    return allTypes.filter(type => currentUser.allowedDepartments.includes(type));
  }, [employeeList, currentUser]);

  // Filter employees based on selected Department (JobType)
  const availableEmployees = useMemo(() => {
    if (!data.jobType) return [];
    let filtered = employeeList.filter(emp => emp.jobType === data.jobType);
    // Hide forbidden employees for users with only 'ฝ่ายปฏิบัติการ' permissions
    if (currentUser && currentUser.allowedDepartments.length === 1 && currentUser.allowedDepartments[0] === 'ฝ่ายปฏิบัติการ') {
      filtered = filtered.filter(emp => !forbiddenIds.includes(emp.id));
    }
    return filtered;
  }, [data.jobType, employeeList, currentUser, forbiddenIds]);

  // Helper to update all fields
  const updateEmployeeFields = (emp: any) => {
    onChange('jobType', emp.jobType);
    onChange('id', emp.id);
    onChange('name', emp.name);
    onChange('position', emp.position || '');
  };

  const handleJobTypeChange = (newType: string) => {
    onChange('jobType', newType);
    onChange('name', '');
    onChange('id', '');
    onChange('position', '');
  };

  const handleNameChange = (newName: string) => {
    const employee = employeeList.find(emp => emp.name === newName);
    if (employee) {
      updateEmployeeFields(employee);
    } else {
      onChange('name', newName);
      onChange('id', '');
      onChange('position', '');
    }
  };

  const handleSearchSelect = (emp: any) => {
    updateEmployeeFields(emp);
    setSearchTerm('');
    setShowSearchDropdown(false);
  };

  // Filter employees for global search bar (also apply permissions)
  const searchResults = employeeList.filter(emp => {
    // Check permission first
    const hasPermission = !currentUser || currentUser.role === 'admin' || currentUser.allowedDepartments.includes('ALL') || currentUser.allowedDepartments.includes(emp.jobType);
    if (!hasPermission) return false;

    // Hide forbidden employees for users with only 'ฝ่ายปฏิบัติการ' permissions
    if (currentUser && currentUser.allowedDepartments.length === 1 && currentUser.allowedDepartments[0] === 'ฝ่ายปฏิบัติการ' && forbiddenIds.includes(emp.id)) return false;

    return emp.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           emp.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (hideSearch) {
    // PDF / Print View
    return (
      <div className="mb-2 break-inside-avoid border-b border-black pb-4">
         <h2 className="text-[11px] font-bold text-black mb-3 uppercase">ข้อมูลพนักงาน (EMPLOYEE INFORMATION)</h2>
         <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px]">
            <div className="flex items-end">
              <span className="font-bold text-black min-w-[70px]">รหัสพนักงาน:</span>
              <span className="text-black border-b border-dotted border-black flex-1 pl-2 pb-0.5">{data.id}</span>
            </div>
            <div className="flex items-end">
              <span className="font-bold text-black min-w-[70px]">ชื่อ-นามสกุล:</span>
              <span className="text-black border-b border-dotted border-black flex-1 pl-2 pb-0.5">{data.name}</span>
            </div>
            <div className="flex items-end">
              <span className="font-bold text-black min-w-[70px]">แผนก:</span>
              <span className="text-black border-b border-dotted border-black flex-1 pl-2 pb-0.5">{data.jobType}</span>
            </div>
            <div className="flex items-end">
              <span className="font-bold text-black min-w-[70px]">ตำแหน่ง:</span>
              <span className="text-black border-b border-dotted border-black flex-1 pl-2 pb-0.5">{data.position}</span>
            </div>
            <div className="flex items-end col-span-2">
              <span className="font-bold text-black min-w-[70px]">วันที่ประเมิน:</span>
              <span className="text-black border-b border-dotted border-black flex-1 pl-2 pb-0.5">{data.date}</span>
            </div>
         </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="bg-white p-6 rounded-b-lg shadow-sm border-x border-b border-gray-200 mb-6 break-inside-avoid">
      
      {!hideSearch && (
        <div className="mb-8 relative max-w-2xl mx-auto print:hidden" ref={searchRef}>
            <label className="block text-gray-500 text-sm mb-2 font-medium">ค้นหาด่วน (Search Employee):</label>
            <div className="relative group">
              <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm group-hover:border-blue-300"
                  placeholder="พิมพ์รหัสพนักงาน หรือ ชื่อ-นามสกุล..."
              />
              <Search className="absolute left-3 top-3 text-gray-400 group-hover:text-primary transition-colors" size={18} />
              {searchTerm && (
                  <button 
                      onClick={() => { setSearchTerm(''); setShowSearchDropdown(false); }}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                      <X size={18} />
                  </button>
              )}
            </div>
            
            {showSearchDropdown && searchTerm && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto ring-1 ring-black ring-opacity-5">
                    {searchResults.length > 0 ? (
                        searchResults.map(emp => (
                            <div 
                                key={emp.id}
                                onClick={() => handleSearchSelect(emp)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center transition-colors"
                            >
                                <div>
                                  <div className="text-gray-800 font-medium">{emp.name}</div>
                                  <div className="text-xs text-gray-500">{emp.jobType} - {emp.position || '-'}</div>
                                </div>
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-mono">{emp.id}</span>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-4 text-gray-400 text-center text-sm italic">ไม่พบข้อมูลพนักงานที่ค้นหา (หรือไม่มีสิทธิ์เข้าถึง)</div>
                    )}
                </div>
            )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        
        <div className="flex items-center relative">
          <label className={labelClass}>แผนก:</label>
          <div className="relative w-full">
            <select 
              value={data.jobType} 
              onChange={(e) => handleJobTypeChange(e.target.value)}
              className={`${selectClass} text-primary font-bold`}
            >
              <option value="">กรุณาเลือกแผนก...</option>
              {JOB_TYPES.map(type => (
                <option key={type as string} value={type as string}>{type as string}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1.5 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex items-center relative">
          <label className={labelClass}>ชื่อ-นามสกุล:</label>
          <div className="relative w-full">
             <select 
              value={data.name} 
              onChange={(e) => handleNameChange(e.target.value)}
              className={`${selectClass} ${!data.jobType ? 'text-gray-400' : 'text-gray-800'}`}
              disabled={!data.jobType}
            >
              <option value="">{data.jobType ? 'กรุณาเลือกพนักงาน...' : 'กรุณาเลือกแผนกก่อน'}</option>
              {availableEmployees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1.5 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex items-center relative">
          <label className={labelClass}>รหัสพนักงาน:</label>
          <input
            type="text"
            value={data.id}
            readOnly
            className={`${inputClass} ${lockedClass}`}
            placeholder="แสดงอัตโนมัติ"
          />
        </div>

        <div className="flex items-center relative">
          <label className={labelClass}>ตำแหน่ง:</label>
          <input
            type="text"
            value={data.position}
            readOnly
            className={`${inputClass} ${lockedClass}`}
            placeholder="แสดงอัตโนมัติ"
          />
        </div>

        <div className="flex items-center">
          <label className={labelClass}>วันที่:</label>
          <input 
            type="text" 
            value={data.date} 
            onChange={(e) => onChange('date', e.target.value)}
            className={`${inputClass} focus:border-primary`}
          />
        </div>

      </div>
    </div>
  );
};

export default EmployeeInfo;
