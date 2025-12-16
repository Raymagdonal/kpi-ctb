import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Save, Plus, Trash2, User as UserIcon, Shield, Check, RefreshCw, Download, Upload, FileJson, Briefcase } from 'lucide-react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  setEmployees: (data: any[]) => void;
  sectionWeights: { part1: number; part2: number; part3: number };
  setSectionWeights: (weights: { part1: number; part2: number; part3: number }) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  evaluations: Record<string, any>;
  setEvaluations: (data: Record<string, any>) => void;
}

// --- Internal Components ---

// Custom Button Component for Long Press Action
const LongPressDeleteButton = ({ onClick, disabled = false, label }: { onClick: () => void, disabled?: boolean, label?: React.ReactNode }) => {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const DURATION = 2000; // 2 Seconds for better UX

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setPressing(true);
    let startTs = Date.now();
    
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTs;
      const p = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(p);
      
      if (elapsed >= DURATION) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onClick();
        setPressing(false);
        setProgress(0);
      }
    }, 16);
  };

  const cancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPressing(false);
    setProgress(0);
  };

  return (
    <button
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={start}
      onTouchEnd={cancel}
      disabled={disabled}
      className={`relative overflow-hidden transition-colors select-none ${
        disabled 
          ? 'text-gray-300 cursor-not-allowed' 
          : 'text-red-600 hover:bg-red-50'
      } ${label ? 'px-3 py-1.5 rounded flex items-center gap-1 text-xs font-bold border border-transparent' : 'p-1 rounded'}`}
      title="กดค้างไว้ 2 วินาทีเพื่อลบข้อมูล"
    >
      {/* Background fill progress */}
      <div 
        className="absolute inset-0 bg-red-200 transition-none origin-left z-0"
        style={{ 
          width: `${progress}%`,
          display: pressing ? 'block' : 'none'
        }} 
      />
      <div className="relative z-10 flex items-center gap-1">
        <Trash2 size={label ? 14 : 16} />
        {label}
      </div>
    </button>
  );
};

// Permission Selector Component (Tags + Add Dropdown)
const PermissionSelector = ({ 
  selected, 
  options, 
  onAdd, 
  onRemove, 
  tagColorClass,
  btnColorClass,
  btnLabel
}: {
  selected: string[],
  options: string[],
  onAdd: (val: string) => void,
  onRemove: (val: string) => void,
  tagColorClass: string,
  btnColorClass: string,
  btnLabel: string
}) => {
  const availableOptions = options.filter(o => !selected.includes(o));
  
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      {/* Selected Tags */}
      {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1 w-full">
            {selected.map((item) => (
              <span key={item} className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border shadow-sm animate-fadeIn ${tagColorClass}`}>
                {item}
                <button 
                    onClick={() => onRemove(item)} 
                    className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
      )}

      {/* Add Button with Hidden Select */}
      {availableOptions.length > 0 ? (
        <div className="relative group">
          <select
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            value=""
            onChange={(e) => {
              if (e.target.value) onAdd(e.target.value);
            }}
          >
            <option value="" disabled>เลือกรายการ...</option>
            {availableOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border border-dashed transition-all whitespace-nowrap ${btnColorClass}`}>
            <Plus size={14} /> {btnLabel}
          </button>
        </div>
      ) : (
         <span className="text-[10px] text-gray-400 italic">เลือกครบทุกรายการแล้ว</span>
      )}
    </div>
  );
};

// --- Main Component ---

const AdminSettings: React.FC<Props> = ({ 
  isOpen, onClose, employees, setEmployees, sectionWeights, setSectionWeights, users, setUsers, evaluations, setEvaluations
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'weights' | 'users' | 'backup'>('employees');
  const [localEmployees, setLocalEmployees] = useState(employees);
  const [localWeights, setLocalWeights] = useState(sectionWeights);
  const [localUsers, setLocalUsers] = useState(users);

  // Modal State for Adding User
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState<User>({
    username: '',
    password: '',
    role: 'user',
    allowedDepartments: [],
    allowedPositions: []
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        setLocalEmployees(employees);
        setLocalWeights(sectionWeights);
        setLocalUsers(users);
    }
  }, [isOpen, employees, sectionWeights, users]);

  const allDepartments = useMemo(() => {
    return Array.from(new Set(localEmployees.map(e => e.jobType).filter(Boolean)));
  }, [localEmployees]);

  const allPositions = useMemo(() => {
    return Array.from(new Set(localEmployees.map(e => e.position).filter(Boolean))).sort();
  }, [localEmployees]);

  if (!isOpen) return null;

  const handleSave = () => {
    setEmployees(localEmployees);
    setSectionWeights(localWeights);
    setUsers(localUsers);
    onClose();
  };

  const handleResetData = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะ "คืนค่าเริ่มต้น" ทั้งหมด? ข้อมูลพนักงาน, ผู้ใช้งาน และคะแนนที่ประเมินไว้ทั้งหมดจะหายไป และระบบจะรีเฟรชหน้าจอ')) {
        localStorage.removeItem('kpi_employees');
        localStorage.removeItem('kpi_weights');
        localStorage.removeItem('kpi_users');
        localStorage.removeItem('kpi_evaluations');
        window.location.reload();
    }
  };

  // --- Export / Import Handlers ---
  const handleExportData = () => {
    const dataToExport = {
        employees: localEmployees,
        weights: localWeights,
        users: localUsers,
        evaluations: evaluations, 
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `kpi_system_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsedData = JSON.parse(content);
            
            if (parsedData.employees && parsedData.users && parsedData.weights && parsedData.evaluations !== undefined) {
                const evalCount = Object.keys(parsedData.evaluations).length;
                const confirmMsg = `พบข้อมูลเมื่อวันที่: ${new Date(parsedData.exportedAt).toLocaleString()}\n\n` +
                                   `- พนักงาน: ${parsedData.employees.length} คน\n` +
                                   `- ผู้ใช้งาน: ${parsedData.users.length} คน\n` +
                                   `- ผลการประเมินที่บันทึกไว้: ${evalCount} รายการ\n\n` +
                                   `ต้องการนำเข้าและ "ทับข้อมูลปัจจุบันทั้งหมด" หรือไม่?`;

                if(window.confirm(confirmMsg)) {
                    setLocalEmployees(parsedData.employees);
                    setLocalUsers(parsedData.users);
                    setLocalWeights(parsedData.weights);
                    
                    setEmployees(parsedData.employees);
                    setUsers(parsedData.users);
                    setSectionWeights(parsedData.weights);
                    setEvaluations(parsedData.evaluations);
                    
                    alert("นำเข้าข้อมูลเรียบร้อยแล้ว!");
                    onClose(); 
                }
            } else {
                alert("รูปแบบไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ที่ Export มาจากระบบนี้เท่านั้น");
            }
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(fileObj);
  };

  // Employee Handlers
  const handleEmployeeChange = (index: number, field: string, value: string) => {
    const updated = [...localEmployees];
    updated[index] = { ...updated[index], [field]: value };
    setLocalEmployees(updated);
  };

  const handleDeleteEmployee = (index: number) => {
    const updated = localEmployees.filter((_, i) => i !== index);
    setLocalEmployees(updated);
  };

  const handleAddEmployee = () => {
    setLocalEmployees([
      { id: "New ID", name: "New Employee", position: "ระบุตำแหน่ง", jobType: "ระบุแผนก" },
      ...localEmployees
    ]);
  };

  // User Handlers
  const handleUserChange = (index: number, field: keyof User, value: any) => {
    const updated = [...localUsers];
    updated[index] = { ...updated[index], [field]: value };
    setLocalUsers(updated);
  };

  const toggleUserPermission = (index: number, dept: string) => {
    const updated = [...localUsers];
    const user = updated[index];
    
    if (dept === 'ALL') {
       if (user.allowedDepartments.includes('ALL')) {
           user.allowedDepartments = []; 
       } else {
           user.allowedDepartments = ['ALL']; 
       }
    } else {
        if (user.allowedDepartments.includes(dept)) {
            user.allowedDepartments = user.allowedDepartments.filter(d => d !== dept);
        } else {
            user.allowedDepartments = [...user.allowedDepartments.filter(d => d !== 'ALL'), dept];
        }
    }
    setLocalUsers(updated);
  };

  const toggleUserPositionPermission = (index: number, pos: string) => {
    const updated = [...localUsers];
    const user = updated[index];
    const currentPositions = user.allowedPositions || [];
    
    if (currentPositions.includes(pos)) {
        user.allowedPositions = currentPositions.filter(p => p !== pos);
    } else {
        user.allowedPositions = [...currentPositions, pos];
    }
    setLocalUsers(updated);
  };

  // --- Add User Modal Logic ---
  const startAddUser = () => {
    setNewUser({
      username: '',
      password: '',
      role: 'user',
      allowedDepartments: [],
      allowedPositions: []
    });
    setShowAddUserModal(true);
  };

  const toggleNewUserPermission = (dept: string) => {
    let updatedDepts = [...newUser.allowedDepartments];
    
    if (dept === 'ALL') {
       if (updatedDepts.includes('ALL')) {
           updatedDepts = []; 
       } else {
           updatedDepts = ['ALL']; 
       }
    } else {
        if (updatedDepts.includes(dept)) {
            updatedDepts = updatedDepts.filter(d => d !== dept);
        } else {
            updatedDepts = [...updatedDepts.filter(d => d !== 'ALL'), dept];
        }
    }
    setNewUser({ ...newUser, allowedDepartments: updatedDepts });
  };

  const toggleNewUserPositionPermission = (pos: string) => {
     let currentPositions = newUser.allowedPositions || [];
     if (currentPositions.includes(pos)) {
        currentPositions = currentPositions.filter(p => p !== pos);
     } else {
        currentPositions = [...currentPositions, pos];
     }
     setNewUser({ ...newUser, allowedPositions: currentPositions });
  }

  const confirmAddUser = () => {
    if (!newUser.username.trim() || !newUser.password.trim()) {
      alert("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน");
      return;
    }
    if (localUsers.some(u => u.username === newUser.username)) {
      alert("ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว");
      return;
    }
    
    setLocalUsers([newUser, ...localUsers]);
    setShowAddUserModal(false);
  };

  const handleDeleteUser = (index: number) => {
    if (localUsers[index].username === 'admin') {
      alert('ไม่สามารถลบ User: admin ได้');
      return;
    }
    const updated = localUsers.filter((_, i) => i !== index);
    setLocalUsers(updated);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-white text-black px-6 py-4 flex justify-between items-center border-b border-gray-300">
            <h2 className="text-xl font-bold flex items-center gap-2">
              ตั้งค่าระบบ (Admin Settings)
            </h2>
            <button onClick={onClose} className="text-black hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-300 bg-gray-50 overflow-x-auto shrink-0">
            <button 
              onClick={() => setActiveTab('employees')}
              className={`px-4 md:px-6 py-3 font-bold text-xs md:text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'employees' ? 'text-black border-primary bg-white' : 'text-black/60 border-transparent hover:text-black hover:bg-gray-100'}`}
            >
              จัดการข้อมูลพนักงาน
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 md:px-6 py-3 font-bold text-xs md:text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'users' ? 'text-black border-primary bg-white' : 'text-black/60 border-transparent hover:text-black hover:bg-gray-100'}`}
            >
              จัดการผู้ใช้งาน
            </button>
            <button 
              onClick={() => setActiveTab('weights')}
              className={`px-4 md:px-6 py-3 font-bold text-xs md:text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'weights' ? 'text-black border-primary bg-white' : 'text-black/60 border-transparent hover:text-black hover:bg-gray-100'}`}
            >
              กำหนดน้ำหนัก
            </button>
            <button 
              onClick={() => setActiveTab('backup')}
              className={`px-4 md:px-6 py-3 font-bold text-xs md:text-sm whitespace-nowrap transition-colors border-b-2 ${activeTab === 'backup' ? 'text-black border-primary bg-white' : 'text-black/60 border-transparent hover:text-black hover:bg-gray-100'}`}
            >
              <div className="flex items-center gap-1">
                 <FileJson size={14} /> สำรอง/กู้คืนข้อมูล
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white min-h-0">
            
            {/* --- TAB 1: EMPLOYEES --- */}
            {activeTab === 'employees' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-black">สามารถแก้ไข รหัส, ชื่อ, แผนก, ตำแหน่ง ได้โดยตรงจากตาราง (กดรูปถังขยะค้าง 2 วินาทีเพื่อลบ)</p>
                  <button onClick={handleAddEmployee} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition-colors">
                    <Plus size={16} /> เพิ่มพนักงาน
                  </button>
                </div>
                
                <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-black font-bold uppercase text-xs border-b border-gray-300">
                      <tr>
                        <th className="px-4 py-3">รหัส</th>
                        <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3">แผนก (jobType)</th>
                        <th className="px-4 py-3">ตำแหน่ง</th>
                        <th className="px-4 py-3 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {localEmployees.map((emp, idx) => (
                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                          <td className="px-2 py-1">
                            <input 
                              type="text" 
                              value={emp.id} 
                              onChange={(e) => handleEmployeeChange(idx, 'id', e.target.value)}
                              className="w-full border-b border-transparent focus:border-black outline-none bg-transparent px-2 py-1 text-black"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input 
                              type="text" 
                              value={emp.name} 
                              onChange={(e) => handleEmployeeChange(idx, 'name', e.target.value)}
                              className="w-full border-b border-transparent focus:border-black outline-none bg-transparent px-2 py-1 font-medium text-black"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input 
                              type="text" 
                              value={emp.jobType} 
                              onChange={(e) => handleEmployeeChange(idx, 'jobType', e.target.value)}
                              className="w-full border-b border-transparent focus:border-black outline-none bg-transparent px-2 py-1 text-black"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input 
                              type="text" 
                              value={emp.position} 
                              onChange={(e) => handleEmployeeChange(idx, 'position', e.target.value)}
                              className="w-full border-b border-transparent focus:border-black outline-none bg-transparent px-2 py-1 text-black"
                            />
                          </td>
                          <td className="px-2 py-1 text-center">
                            <LongPressDeleteButton onClick={() => handleDeleteEmployee(idx)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- TAB 2: USERS --- */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-black">
                      <Shield className="text-primary" />
                      <span className="font-bold">จัดการผู้ใช้งานและสิทธิ์การเข้าถึง</span>
                  </div>
                  <button onClick={startAddUser} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors">
                      <Plus size={16} /> เพิ่มผู้ใช้งาน (Add User)
                  </button>
                </div>

                <div className="grid gap-6">
                  {localUsers.map((user, idx) => (
                    <div key={idx} className="bg-white border border-gray-300 rounded-lg shadow-sm p-5 animate-fadeIn">
                      <div className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-4 mb-4">
                        {/* User Credentials */}
                        <div className="flex-1 space-y-4 min-w-[250px]">
                          <div className="flex items-center gap-2 text-black font-bold mb-2">
                              <UserIcon size={18} className="text-black" />
                              ข้อมูลบัญชี
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold text-black uppercase">Username</label>
                                <input 
                                    type="text" 
                                    value={user.username}
                                    onChange={(e) => handleUserChange(idx, 'username', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none text-black font-medium bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold text-black uppercase">Password</label>
                                <input 
                                    type="text" 
                                    value={user.password}
                                    onChange={(e) => handleUserChange(idx, 'password', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black outline-none font-mono text-black bg-white"
                                />
                              </div>
                          </div>
                        </div>

                        {/* Permissions */}
                        <div className="flex-[2] space-y-4">
                          {/* Department Permissions */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-black font-bold text-sm">
                                    <Shield size={16} className="text-black" />
                                    แผนก (Departments)
                                </div>
                                <button 
                                    onClick={() => toggleUserPermission(idx, 'ALL')}
                                    className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all border ${
                                      user.allowedDepartments.includes('ALL') 
                                      ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                                      : 'bg-white text-black border-gray-300 hover:border-green-500 hover:text-green-600'
                                    }`}
                                >
                                    เข้าถึงทุกแผนก (Admin)
                                </button>
                            </div>
                            
                            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[50px]">
                                {user.allowedDepartments.includes('ALL') ? (
                                  <div className="text-green-700 font-medium text-xs flex items-center gap-2 h-full">
                                      <Check size={14} /> เป็น Admin เข้าถึงได้ทุกแผนกและตำแหน่ง
                                  </div>
                                ) : (
                                  <PermissionSelector
                                    selected={user.allowedDepartments}
                                    options={allDepartments}
                                    onAdd={(val) => toggleUserPermission(idx, val)}
                                    onRemove={(val) => toggleUserPermission(idx, val)}
                                    tagColorClass="bg-blue-100 text-blue-800 border-blue-200"
                                    btnColorClass="text-blue-600 border-blue-300 hover:bg-blue-50"
                                    btnLabel="เพิ่มสิทธิ์แผนก"
                                  />
                                )}
                            </div>
                          </div>

                          {/* Position Permissions (Only if not Admin/ALL) */}
                          {!user.allowedDepartments.includes('ALL') && (
                              <div>
                                <div className="flex items-center gap-2 text-black font-bold text-sm mb-2">
                                    <Briefcase size={16} className="text-black" />
                                    ตำแหน่งเฉพาะ (Specific Positions)
                                </div>
                                <div className="p-2 bg-yellow-50/50 rounded-lg border border-yellow-200 min-h-[50px]">
                                    <PermissionSelector
                                      selected={user.allowedPositions || []}
                                      options={allPositions}
                                      onAdd={(val) => toggleUserPositionPermission(idx, val)}
                                      onRemove={(val) => toggleUserPositionPermission(idx, val)}
                                      tagColorClass="bg-amber-100 text-amber-800 border-amber-200"
                                      btnColorClass="text-amber-600 border-amber-300 hover:bg-amber-50"
                                      btnLabel="เพิ่มสิทธิ์ตำแหน่ง"
                                    />
                                </div>
                              </div>
                          )}

                        </div>
                      </div>

                      <div className="flex justify-end">
                          <LongPressDeleteButton 
                              onClick={() => handleDeleteUser(idx)} 
                              disabled={user.username === 'admin'}
                              label="ลบผู้ใช้งาน"
                          />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- TAB 3: WEIGHTS --- */}
            {activeTab === 'weights' && (
              <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-300 animate-fadeIn">
                <h3 className="font-bold text-lg mb-6 text-black border-b border-gray-200 pb-2">กำหนดน้ำหนักคะแนนรวม (Total Score Weights)</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">ส่วนที่ 1: KPI (Performance)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        value={localWeights.part1}
                        onChange={(e) => setLocalWeights({...localWeights, part1: Number(e.target.value)})}
                        className="w-24 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-black outline-none text-black bg-white"
                      />
                      <span className="text-black font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-1">ส่วนที่ 2: Competencies (Behavior)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        value={localWeights.part2}
                        onChange={(e) => setLocalWeights({...localWeights, part2: Number(e.target.value)})}
                        className="w-24 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-black outline-none text-black bg-white"
                      />
                      <span className="text-black font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black mb-1">ส่วนที่ 3: Attendance (Discipline)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        value={localWeights.part3}
                        onChange={(e) => setLocalWeights({...localWeights, part3: Number(e.target.value)})}
                        className="w-24 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-black outline-none text-black bg-white"
                      />
                      <span className="text-black font-bold">%</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-black">รวมทั้งหมด:</span>
                    <span className={`font-bold text-xl ${localWeights.part1 + localWeights.part2 + localWeights.part3 === 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {localWeights.part1 + localWeights.part2 + localWeights.part3}%
                    </span>
                  </div>
                  {localWeights.part1 + localWeights.part2 + localWeights.part3 !== 100 && (
                    <p className="text-xs text-red-600 font-medium">* ผลรวมควรเท่ากับ 100%</p>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB 4: BACKUP & RESTORE --- */}
            {activeTab === 'backup' && (
                <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                <Download size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-black">1. ส่งออกข้อมูล (Export)</h3>
                                <p className="text-sm text-gray-600">ดาวน์โหลดไฟล์การตั้งค่าเก็บไว้ หรือส่งให้เครื่องอื่น</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">
                            ใช้สำหรับบันทึกข้อมูลพนักงาน, ผู้ใช้งาน, และ <b>ผลการประเมินคะแนนทั้งหมด</b> เป็นไฟล์ .json เพื่อสำรองข้อมูล หรือนำไปใช้ในเครื่องอื่น
                        </p>
                        <button 
                            onClick={handleExportData}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
                        >
                            <Download size={18} /> ดาวน์โหลดไฟล์ (.json)
                        </button>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                                <Upload size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-black">2. นำเข้าข้อมูล (Import)</h3>
                                <p className="text-sm text-gray-600">นำไฟล์ .json จากเครื่องอื่นมาใช้ที่เครื่องนี้</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">
                            <span className="font-bold text-red-600">คำเตือน:</span> ข้อมูลเดิมในเครื่องนี้จะถูกแทนที่ด้วยข้อมูลใหม่จากไฟล์ทั้งหมด (รวมถึงคะแนนที่เคยประเมินไว้) กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
                        </p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                        <button 
                            onClick={handleImportClick}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-sm transition-colors flex justify-center items-center gap-2"
                        >
                            <Upload size={18} /> เลือกไฟล์เพื่อนำเข้า
                        </button>
                    </div>

                    <div className="text-center text-xs text-gray-400 mt-8">
                        ระบบ Export/Import นี้ใช้สำหรับการถ่ายโอนข้อมูลระหว่างเครื่อง เนื่องจากระบบทำงานแบบ Offline (Client-side)
                    </div>
                </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="bg-white p-4 border-t border-gray-300 flex justify-between items-center gap-3 shrink-0">
             <button 
              onClick={handleResetData}
              className="px-4 py-2 rounded-lg text-red-600 font-bold hover:bg-red-50 transition-colors text-xs flex items-center gap-2 border border-red-100"
              title="ล้างข้อมูลทั้งหมดที่บันทึกไว้ในเครื่องนี้และกลับไปใช้ค่าเริ่มต้น"
            >
              <RefreshCw size={14} /> คืนค่าเริ่มต้น (Reset Factory)
            </button>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-gray-300 text-black font-bold hover:bg-gray-100 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-md"
              >
                <Save size={18} /> บันทึกและใช้งาน
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* --- ADD USER MODAL --- */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-primary text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Plus size={20} /> เพิ่มผู้ใช้งานใหม่ (Add New User)
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4 mb-6">
                <h4 className="font-bold text-gray-800 border-b pb-2 mb-4">ข้อมูลบัญชี (Account Info)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
                      <input 
                         type="text" 
                         value={newUser.username}
                         onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                         className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                         placeholder="เช่น user1"
                         autoFocus
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">รหัสผ่าน (Password)</label>
                      <input 
                         type="text" 
                         value={newUser.password}
                         onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                         className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none font-mono"
                         placeholder="ระบุรหัสผ่าน"
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center border-b pb-2 mb-2">
                    <h4 className="font-bold text-gray-800">สิทธิ์การมองเห็น (Permissions)</h4>
                    <button 
                      onClick={() => toggleNewUserPermission('ALL')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        newUser.allowedDepartments.includes('ALL') 
                        ? 'bg-green-600 text-white border-green-600' 
                        : 'bg-white text-gray-500 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      เข้าถึงทุกแผนก (Admin)
                    </button>
                 </div>
                 
                 {newUser.allowedDepartments.includes('ALL') ? (
                    <div className="p-4 bg-green-50 text-green-800 rounded-lg flex items-center justify-center gap-2 font-bold text-sm">
                      <Check size={18} /> ผู้ใช้งานนี้จะเป็น Admin (เห็นข้อมูลทั้งหมด)
                    </div>
                 ) : (
                    <div className="space-y-4">
                        {/* Departments */}
                        <div>
                            <p className="text-xs font-bold text-gray-700 mb-2">แผนก (Departments)</p>
                            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[50px]">
                                <PermissionSelector
                                  selected={newUser.allowedDepartments}
                                  options={allDepartments}
                                  onAdd={(val) => toggleNewUserPermission(val)}
                                  onRemove={(val) => toggleNewUserPermission(val)}
                                  tagColorClass="bg-blue-100 text-blue-800 border-blue-200"
                                  btnColorClass="text-blue-600 border-blue-300 hover:bg-blue-50"
                                  btnLabel="เพิ่มสิทธิ์แผนก"
                                />
                            </div>
                        </div>

                        {/* Positions */}
                        <div>
                            <p className="text-xs font-bold text-gray-700 mb-2">ตำแหน่งเฉพาะ (Specific Positions)</p>
                            <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200 min-h-[50px]">
                                <PermissionSelector
                                  selected={newUser.allowedPositions || []}
                                  options={allPositions}
                                  onAdd={(val) => toggleNewUserPositionPermission(val)}
                                  onRemove={(val) => toggleNewUserPositionPermission(val)}
                                  tagColorClass="bg-amber-100 text-amber-800 border-amber-200"
                                  btnColorClass="text-amber-600 border-amber-300 hover:bg-amber-50"
                                  btnLabel="เพิ่มสิทธิ์ตำแหน่ง"
                                />
                            </div>
                        </div>
                    </div>
                 )}
                 <p className="text-[10px] text-gray-500 mt-2">* เลือกแผนก หรือ ตำแหน่งที่ต้องการให้ผู้ใช้งานนี้มองเห็น</p>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmAddUser}
                className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Check size={18} /> ยืนยันการเพิ่ม
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSettings;
