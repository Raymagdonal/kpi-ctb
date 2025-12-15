import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Save, Plus, Trash2, User as UserIcon, Shield, Check, AlertCircle } from 'lucide-react';
import { EmployeeData, User } from '../types';
import { POSITION_KPI_MAP } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employees: any[];
  setEmployees: (data: any[]) => void;
  sectionWeights: { part1: number; part2: number; part3: number };
  setSectionWeights: (weights: { part1: number; part2: number; part3: number }) => void;
  users: User[];
  setUsers: (users: User[]) => void;
}

// Custom Button Component for Long Press Action (5 Seconds)
const LongPressDeleteButton = ({ onClick, disabled = false, label }: { onClick: () => void, disabled?: boolean, label?: React.ReactNode }) => {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const DURATION = 5000; // 5 Seconds

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
      title="กดค้างไว้ 5 วินาทีเพื่อลบข้อมูล"
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
        {pressing && <span className="text-[10px] ml-1 font-normal">({((DURATION - (progress/100 * DURATION))/1000).toFixed(1)}s)</span>}
      </div>
    </button>
  );
};

const AdminSettings: React.FC<Props> = ({ 
  isOpen, onClose, employees, setEmployees, sectionWeights, setSectionWeights, users, setUsers
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'weights' | 'users'>('employees');
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

  // Derive unique departments from employee list for permissions
  const allDepartments = useMemo(() => {
    return Array.from(new Set(localEmployees.map(e => e.jobType).filter(Boolean)));
  }, [localEmployees]);

  // Derive unique positions from POSITION_KPI_MAP
  const allPositions = useMemo(() => {
    return Object.keys(POSITION_KPI_MAP);
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    setEmployees(localEmployees);
    setSectionWeights(localWeights);
    setUsers(localUsers);
    onClose();
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

  const toggleUserPositionPermission = (index: number, position: string) => {
    const updated = [...localUsers];
    const user = updated[index];
    
    if (!user.allowedPositions) user.allowedPositions = [];
    
    if (position === 'ALL') {
       if (user.allowedPositions.includes('ALL')) {
           user.allowedPositions = []; 
       } else {
           user.allowedPositions = ['ALL']; 
       }
    } else {
        if (user.allowedPositions.includes(position)) {
            user.allowedPositions = user.allowedPositions.filter(p => p !== position);
        } else {
            user.allowedPositions = [...user.allowedPositions.filter(p => p !== 'ALL'), position];
        }
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

  const toggleNewUserPositionPermission = (position: string) => {
    let updatedPositions = [...newUser.allowedPositions!];
    if (position === 'ALL') {
       if (updatedPositions.includes('ALL')) {
           updatedPositions = []; 
       } else {
           updatedPositions = ['ALL']; 
       }
    } else {
        if (updatedPositions.includes(position)) {
            updatedPositions = updatedPositions.filter(p => p !== position);
        } else {
            updatedPositions = [...updatedPositions.filter(p => p !== 'ALL'), position];
        }
    }
    setNewUser({ ...newUser, allowedPositions: updatedPositions });
  };

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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

          {/* Tabs */}
          <div className="flex border-b border-gray-300 bg-gray-50">
            <button 
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'employees' ? 'text-black border-primary bg-white' : 'text-black/60 border-transparent hover:text-black hover:bg-gray-100'}`}
            >
              จัดการข้อมูลพนักงาน
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'users' ? 'text-black border-primary bg-white' : 'text-black/60 border-transparent hover:text-black hover:bg-gray-100'}`}
            >
              จัดการผู้ใช้งาน (User Management)
            </button>
            <button 
              onClick={() => setActiveTab('weights')}
              className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${activeTab === 'weights' ? 'text-black border-primary bg-white' : 'text-black/60 border-transparent hover:text-black hover:bg-gray-100'}`}
            >
              กำหนดน้ำหนักคะแนน
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            
            {/* --- TAB 1: EMPLOYEES --- */}
            {activeTab === 'employees' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-black">สามารถแก้ไข รหัส, ชื่อ, แผนก, ตำแหน่ง ได้โดยตรงจากตาราง (กดรูปถังขยะค้าง 5 วินาทีเพื่อลบ)</p>
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
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-black">
                      <Shield className="text-primary" />
                      <span className="font-bold">จัดการผู้ใช้งานและสิทธิ์การเข้าถึง (User Permissions)</span>
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
                        <div className="flex-[2]">
                          <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-black font-bold">
                                  <Shield size={18} className="text-black" />
                                  สิทธิ์การเข้าถึงแผนก (Visible Departments)
                              </div>
                              <div className="flex gap-2">
                                <button 
                                    onClick={() => toggleUserPermission(idx, 'ALL')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                      user.allowedDepartments.includes('ALL') 
                                      ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                                      : 'bg-white text-black border-gray-300 hover:border-green-500 hover:text-green-600'
                                    }`}
                                >
                                    เข้าถึงทุกแผนก (Admin)
                                </button>
                              </div>
                          </div>
                          
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              {user.allowedDepartments.includes('ALL') ? (
                                <div className="text-green-700 font-medium text-sm flex items-center gap-2">
                                    <Check size={16} /> ผู้ใช้งานนี้เป็น Admin สามารถเข้าถึงข้อมูลได้ทุกแผนก
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                    {allDepartments.map((dept) => {
                                      const isSelected = user.allowedDepartments.includes(dept);
                                      return (
                                          <button
                                            key={dept}
                                            onClick={() => toggleUserPermission(idx, dept)}
                                            className={`px-3 py-1.5 rounded text-xs font-medium transition-all border select-none ${
                                                isSelected
                                                ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm'
                                                : 'bg-white text-black border-gray-300 hover:border-gray-400'
                                            }`}
                                          >
                                            {dept}
                                          </button>
                                      );
                                    })}
                                    {allDepartments.length === 0 && <span className="text-gray-500 text-sm italic">ไม่มีข้อมูลแผนกในระบบ</span>}
                                </div>
                              )}
                          </div>

                          {/* Position Permissions */}
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">สิทธิ์การประเมินตำแหน่ง</label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                {user.allowedPositions && user.allowedPositions.includes('ALL') ? (
                                  <div className="text-green-700 font-medium text-sm flex items-center gap-2">
                                      <Check size={16} /> ผู้ใช้งานนี้เป็น Admin สามารถประเมินได้ทุกตำแหน่ง
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                      {allPositions.map((position) => {
                                        const isSelected = user.allowedPositions && user.allowedPositions.includes(position);
                                        return (
                                            <button
                                              key={position}
                                              onClick={() => toggleUserPositionPermission(idx, position)}
                                              className={`px-3 py-1.5 rounded text-xs font-medium transition-all border select-none ${
                                                  isSelected
                                                  ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm'
                                                  : 'bg-white text-black border-gray-300 hover:border-gray-400'
                                              }`}
                                            >
                                              {position}
                                            </button>
                                        );
                                      })}
                                      {allPositions.length === 0 && <span className="text-gray-500 text-sm italic">ไม่มีข้อมูลตำแหน่งในระบบ</span>}
                                  </div>
                                )}
                            </div>
                          </div>
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
              <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-300">
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

          </div>

          {/* Footer Actions */}
          <div className="bg-white p-4 border-t border-gray-300 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-black font-bold hover:bg-gray-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-md"
            >
              <Save size={18} /> บันทึกการเปลี่ยนแปลง
            </button>
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
                    <h4 className="font-bold text-gray-800">สิทธิ์การมองเห็นแผนก (Permissions)</h4>
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
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {allDepartments.length > 0 ? allDepartments.map((dept) => {
                          const isSelected = newUser.allowedDepartments.includes(dept);
                          return (
                              <button
                                key={dept}
                                onClick={() => toggleNewUserPermission(dept)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all border ${
                                    isSelected
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {dept}
                              </button>
                          );
                      }) : (
                        <div className="text-gray-400 text-sm italic w-full text-center py-2 flex items-center justify-center gap-2">
                           <AlertCircle size={16} /> ไม่มีข้อมูลแผนกในระบบ (กรุณาเพิ่มพนักงานก่อน)
                        </div>
                      )}
                    </div>
                 )}
                 <p className="text-xs text-gray-500 mt-2">* เลือกแผนกที่ต้องการให้ผู้ใช้งานนี้มองเห็นและจัดการได้</p>
              </div>

              {/* Position Permissions */}
              <div className="space-y-3">
                 <label className="block text-sm font-bold text-gray-700">สิทธิ์การประเมินตำแหน่ง</label>
                 <div className="flex gap-2">
                    <button
                      onClick={() => toggleNewUserPositionPermission('ALL')}
                      className={`px-4 py-2 rounded-lg font-medium border transition-all ${
                        newUser.allowedPositions!.includes('ALL') 
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-white text-gray-500 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      เข้าถึงทุกตำแหน่ง (Admin)
                    </button>
                 </div>
                 
                 {newUser.allowedPositions!.includes('ALL') ? (
                    <div className="p-4 bg-green-50 text-green-800 rounded-lg flex items-center justify-center gap-2 font-bold text-sm">
                      <Check size={18} /> ผู้ใช้งานนี้จะเป็น Admin (เห็นข้อมูลทั้งหมด)
                    </div>
                 ) : (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {allPositions.length > 0 ? allPositions.map((position) => {
                          const isSelected = newUser.allowedPositions!.includes(position);
                          return (
                              <button
                                key={position}
                                onClick={() => toggleNewUserPositionPermission(position)}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition-all border ${
                                    isSelected
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {position}
                              </button>
                          );
                      }) : (
                        <div className="text-gray-400 text-sm italic w-full text-center py-2 flex items-center justify-center gap-2">
                           <AlertCircle size={16} /> ไม่มีข้อมูลตำแหน่งในระบบ
                        </div>
                      )}
                    </div>
                 )}
                 <p className="text-xs text-gray-500 mt-2">* เลือกตำแหน่งที่ต้องการให้ผู้ใช้งานนี้ประเมินได้</p>
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
