import React, { useState, useMemo, useEffect } from 'react';
import KPIHeader from './components/KPIHeader';
import EmployeeInfo from './components/EmployeeInfo';
import ScoreLegend from './components/ScoreLegend';
import KPIItemCard from './components/KPIItemCard';
import KPISummaryTable from './components/KPISummaryTable'; 
import AttendanceSection from './components/AttendanceSection';
import FeedbackSection from './components/FeedbackSection';
import Login from './components/Login';
import AdminSettings from './components/AdminSettings';
import { POSITION_KPI_MAP, DEFAULT_KPI_DATA, EMPLOYEE_DATABASE } from './constants';
import { EmployeeData, ScoreState, CommentState, KPISectionData, AttendanceState, User } from './types';
import { Save, Lock, Unlock, ChevronDown, FileText } from 'lucide-react';

declare global {
  interface Window {
    html2pdf: any;
  }
}

const forbiddenIds = ['226002', '226005', '226006', '226007'];

const App: React.FC = () => {
  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // --- Dynamic Data State ---
  const [employeeList, setEmployeeList] = useState(EMPLOYEE_DATABASE);
  const [sectionWeights, setSectionWeights] = useState({ part1: 50, part2: 20, part3: 30 });
  const [users, setUsers] = useState<User[]>([
    { username: 'admin', password: 'admin', role: 'admin', allowedDepartments: ['ALL'] }
  ]);

  // --- App State ---
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [employee, setEmployee] = useState<EmployeeData>({
    id: '',
    name: '',
    jobType: '',
    position: '',
    department: '',
    date: '15 ธันวาคม 2568'
  });

  const [scores, setScores] = useState<ScoreState>({});
  const [comments, setComments] = useState<CommentState>({});
  const [attendance, setAttendance] = useState<AttendanceState>({
    sickLeave: 0, personalLeave: 0, absent: 0, late: 0,
    maternityLeave: 0, ordinationLeave: 0,
    verbalWarning: 0, writtenWarning: 0, suspension: 0
  });
  const [feedback, setFeedback] = useState<string>("");

  // --- Derived Data ---
  const currentKPIData: KPISectionData[] = useMemo(() => {
    // Clone the template based on position, defaulting to standard if not found
    const template = POSITION_KPI_MAP[employee.position] || DEFAULT_KPI_DATA;
    
    // Apply dynamic weights from state
    return template.map(section => {
      let newWeight = section.sectionWeight;
      if (section.id === 'part-1') newWeight = sectionWeights.part1;
      if (section.id === 'part-2') newWeight = sectionWeights.part2;
      if (section.id === 'part-3') newWeight = sectionWeights.part3;
      // Keep Part 4 (Feedback) as 0 or whatever it was
      return { ...section, sectionWeight: newWeight };
    });
  }, [employee.position, sectionWeights]);

  useEffect(() => {
    if (currentSectionIndex >= currentKPIData.length) {
      setCurrentSectionIndex(0);
    }
  }, [currentKPIData, currentSectionIndex]);

  // --- Handlers ---
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(undefined);
    // Reset form state to avoid seeing previous data on re-login
    setEmployee({
      id: '',
      name: '',
      jobType: '',
      position: '',
      department: '',
      date: '15 ธันวาคม 2568'
    });
    setScores({});
    setComments({});
    setAttendance({
      sickLeave: 0, personalLeave: 0, absent: 0, late: 0,
      maternityLeave: 0, ordinationLeave: 0,
      verbalWarning: 0, writtenWarning: 0, suspension: 0
    });
    setFeedback("");
    setCurrentSectionIndex(0);
    setIsLocked(false);
  };

  const handleEmployeeChange = (field: keyof EmployeeData, value: string) => {
    setEmployee(prev => ({ ...prev, [field]: value }));
    if (field === 'position') {
      setScores({});
      setComments({});
      setAttendance({
        sickLeave: 0, personalLeave: 0, absent: 0, late: 0, 
        maternityLeave: 0, ordinationLeave: 0, 
        verbalWarning: 0, writtenWarning: 0, suspension: 0
      });
      setFeedback("");
      setCurrentSectionIndex(0);
    }
  };

  const handleScoreChange = (itemId: string, val: number) => {
    if (isLocked) return;
    if (forbiddenIds.includes(employee.id) && currentUser && currentUser.allowedDepartments.length === 1 && currentUser.allowedDepartments[0] === 'ฝ่ายปฏิบัติการ') return;
    setScores(prev => ({ ...prev, [itemId]: val }));
  };

  const handleCommentChange = (itemId: string, val: string) => {
    if (isLocked) return;
    if (forbiddenIds.includes(employee.id) && currentUser && currentUser.allowedDepartments.length === 1 && currentUser.allowedDepartments[0] === 'ฝ่ายปฏิบัติการ') return;
    setComments(prev => ({ ...prev, [itemId]: val }));
  };

  const handleAttendanceChange = (field: keyof AttendanceState, value: number) => {
    if (isLocked) return;
    if (forbiddenIds.includes(employee.id) && currentUser && currentUser.allowedDepartments.length === 1 && currentUser.allowedDepartments[0] === 'ฝ่ายปฏิบัติการ') return;
    setAttendance(prev => ({ ...prev, [field]: value }));
  };

  const handleFeedbackChange = (value: string) => {
    if (forbiddenIds.includes(employee.id) && currentUser && currentUser.allowedDepartments.length === 1 && currentUser.allowedDepartments[0] === 'ฝ่ายปฏิบัติการ') return;
    setFeedback(value);
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const handleSavePDF = () => {
    setIsPdfGenerating(true);
    setTimeout(() => {
      const element = document.getElementById('kpi-container');
      const opt = {
        margin: [5, 5, 5, 5],
        filename: `KPI_${employee.id || 'Unknown'}_${employee.name || 'Emp'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      if (window.html2pdf) {
        window.html2pdf().set(opt).from(element).save().then(() => {
           setIsPdfGenerating(false);
        }).catch((err: any) => {
           console.error("PDF generation failed:", err);
           setIsPdfGenerating(false);
        });
      } else {
        window.print();
        setIsPdfGenerating(false);
      }
    }, 500);
  };

  const calculateAttendanceDeduction = () => {
    const d = attendance;
    return (d.sickLeave * 1) + (d.personalLeave * 1) + (d.absent * 3) + 
           (d.late * 1) + (d.maternityLeave * 1) + (d.ordinationLeave * 1) +
           (d.verbalWarning * 3) + (d.writtenWarning * 5) + (d.suspension * 15);
  };

  const calculateSectionScore = (sectionIndex: number) => {
    const section = currentKPIData[sectionIndex];
    if (!section) return 0;

    if (section.id === 'part-3') {
      const deduction = calculateAttendanceDeduction();
      return Math.max(0, section.sectionWeight - deduction);
    }

    if (section.id === 'part-4') return 0;
    
    const rawWeightedSum = section.items.reduce((acc, item) => {
      const score = scores[item.id] || 0;
      return acc + ((score / 5) * item.weight);
    }, 0);

    return (rawWeightedSum / 100) * section.sectionWeight;
  };

  const finalTotalScore = useMemo(() => {
    return currentKPIData.reduce((acc, _, idx) => acc + calculateSectionScore(idx), 0);
  }, [scores, attendance, currentKPIData]);

  const calculateGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
  };

  const grade = calculateGrade(finalTotalScore);

  if (!isLoggedIn) {
    return <Login onLogin={handleLoginSuccess} users={users} />;
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50/50 print:bg-white print:p-0 ${isPdfGenerating ? 'bg-white p-0 text-black' : ''}`}>
      <div className={`mx-auto ${isPdfGenerating ? 'max-w-[800px]' : 'max-w-5xl'}`}>
        
        <div id="kpi-container" className={isPdfGenerating ? 'bg-white p-4 text-black' : ''}>
          
          <KPIHeader 
            isPdf={isPdfGenerating} 
            onOpenAdmin={() => setShowAdminPanel(true)} 
            onLogout={handleLogout}
            isAdmin={currentUser?.role === 'admin'}
            currentUser={currentUser}
          />
          
          <div className={isLocked ? "opacity-90 pointer-events-none grayscale-[0.3]" : ""}>
            <EmployeeInfo 
              data={employee} 
              onChange={handleEmployeeChange} 
              hideSearch={isPdfGenerating} 
              employeeList={employeeList} 
              currentUser={currentUser} // Pass currentUser to filter visible departments
              forbiddenIds={forbiddenIds}
            />
          </div>

          {/* Navigation Controls */}
          <div className={`mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 print:hidden ${isPdfGenerating ? 'hidden' : 'flex'}`}>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-gray-700 font-bold whitespace-nowrap">เลือกส่วนการประเมิน:</label>
              <div className="relative flex-1 sm:w-80">
                <select
                  value={currentSectionIndex}
                  onChange={(e) => setCurrentSectionIndex(Number(e.target.value))}
                  className="w-full appearance-none bg-blue-50 border border-blue-200 text-primary font-semibold py-2 pl-4 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {currentKPIData.map((section, idx) => (
                    <option key={section.id} value={idx}>
                      {section.title.split(':')[0]} ({section.sectionWeight > 0 ? `${section.sectionWeight} คะแนน` : 'ความคิดเห็น'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 text-primary pointer-events-none" size={18} />
              </div>
            </div>

            <div className="flex items-center gap-2">
               {isLocked && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    <Lock size={14} />
                    <span>แบบประเมินถูกล็อค</span>
                  </div>
               )}
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                ส่วนที่ {currentSectionIndex + 1} จาก {currentKPIData.length}
              </div>
            </div>
          </div>

          {/* Content Sections */}
          {isPdfGenerating ? (
              <div className="space-y-2">
                 {currentKPIData.map((section, idx) => {
                    if (section.id === 'part-3' || section.id === 'part-4') return null;
                    return <KPISummaryTable key={section.id} section={section} scores={scores} />;
                 })}
                 <AttendanceSection 
                    data={attendance} 
                    totalDeduction={calculateAttendanceDeduction()} 
                    finalScore={calculateSectionScore(currentKPIData.findIndex(s => s.id === 'part-3'))} 
                    isLocked={true} 
                    forcePrintMode={true} 
                    compactView={true}
                    onChange={() => {}}
                 />
                 <FeedbackSection 
                    value={feedback} 
                    isLocked={true} 
                    forcePrintMode={true} 
                    onChange={() => {}}
                 />
              </div>
          ) : (
             <div className="space-y-6 print:hidden">
                {currentKPIData.map((section, idx) => {
                   const showSection = idx === currentSectionIndex;
                   return (
                     <div 
                        key={section.id} 
                        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 animate-fadeIn ${showSection ? 'block' : 'hidden'}`}
                     >
                        {/* Section Header */}
                        {section.id !== 'part-3' && section.id !== 'part-4' && (
                          <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                                {section.title}
                              </h2>
                              <p className="text-gray-500 mt-1">
                                คะแนนเต็มส่วนนี้: <span className="text-primary font-bold">{section.sectionWeight} คะแนน</span>
                              </p>
                            </div>
                            <div className="hidden md:block text-right">
                              <span className="text-xs text-gray-400">คะแนนส่วนนี้ที่ได้</span>
                              <div className="text-3xl font-bold text-primary">
                                {calculateSectionScore(idx).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Standard Items */}
                        {section.id !== 'part-3' && section.id !== 'part-4' && (
                          <>
                            <ScoreLegend />
                            <div className="hidden md:flex items-center text-primary font-bold text-sm bg-secondary px-4 py-3 rounded-md mb-6 border border-blue-100">
                              <div className="flex-1">หัวข้อการประเมิน</div>
                              <div className="w-24 text-center">น้ำหนัก (%)</div>
                              <div className="min-w-[280px] pl-16">ให้คะแนน (1-5)</div>
                            </div>
                            <div className="space-y-6">
                              {section.items.map((item) => (
                                <KPIItemCard
                                  key={item.id}
                                  item={item}
                                  score={scores[item.id] || 0}
                                  comment={comments[item.id] || ''}
                                  onScoreChange={(val) => handleScoreChange(item.id, val)}
                                  onCommentChange={(val) => handleCommentChange(item.id, val)}
                                  isLocked={isLocked}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        {/* Attendance Section */}
                        {section.id === 'part-3' && (
                          <AttendanceSection 
                            data={attendance}
                            onChange={handleAttendanceChange}
                            totalDeduction={calculateAttendanceDeduction()}
                            finalScore={calculateSectionScore(idx)}
                            isLocked={isLocked}
                          />
                        )}

                        {/* Feedback Section */}
                        {section.id === 'part-4' && (
                          <FeedbackSection 
                            value={feedback}
                            onChange={handleFeedbackChange}
                            isLocked={isLocked}
                          />
                        )}
                     </div>
                   );
                })}
             </div>
          )}

          {/* Footer Summary */}
          <div className={`mt-8 bg-white rounded-lg shadow-lg border-t-4 border-primary overflow-hidden print:shadow-none print:break-inside-avoid print:border-2 print:border-gray-300 ${isPdfGenerating ? 'shadow-none border border-black rounded-none mt-2' : ''}`}>
             <div className={`bg-gray-50 px-6 py-4 border-b border-gray-200 print:bg-gray-100 ${isPdfGenerating ? 'py-1 px-2 border-b border-black bg-white' : ''}`}>
               <h3 className={`font-bold flex items-center gap-2 ${isPdfGenerating ? 'text-black text-xs' : 'text-gray-700'}`}>
                 <span className={`w-2 h-6 rounded-sm ${isPdfGenerating ? 'bg-black h-3' : 'bg-primary'}`}></span>
                 สรุปผลคะแนนรวม (Total Summary)
               </h3>
             </div>
             
             <div className={`p-6 grid grid-cols-1 md:grid-cols-2 gap-8 ${isPdfGenerating ? '!grid-cols-2 p-2 gap-4' : ''}`}>
               {/* Breakdown Table */}
               <div className="space-y-3">
                 {currentKPIData.map((section, idx) => {
                   if (section.sectionWeight === 0) return null; 
                   const score = calculateSectionScore(idx);
                   return (
                     <div key={section.id} className={`flex justify-between items-center text-sm border-b pb-2 last:border-0 ${isPdfGenerating ? 'border-gray-300 text-[10px] pb-1' : 'border-gray-100 text-gray-600'}`}>
                        <span className="truncate pr-4">{section.title.split(':')[0]}</span>
                        <div className="flex gap-4">
                          <span className={`w-16 text-right ${isPdfGenerating ? 'text-black' : 'text-gray-400'}`}>เต็ม {section.sectionWeight}</span>
                          <span className={`font-bold w-12 text-right ${isPdfGenerating ? 'text-black' : 'text-gray-800'}`}>{score.toFixed(2)}</span>
                        </div>
                     </div>
                   );
                 })}
               </div>

               {/* Grand Total */}
               <div className={`flex flex-col items-center justify-center bg-blue-50/50 rounded-xl p-4 border border-blue-100 print:bg-white print:border-2 print:border-primary ${isPdfGenerating ? 'border border-black bg-white flex-row gap-4 p-2' : ''}`}>
                  <span className={`font-medium mb-2 ${isPdfGenerating ? 'text-black text-xs mb-0' : 'text-gray-500'}`}>คะแนนรวม (100)</span>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold tracking-tight ${isPdfGenerating ? 'text-black text-2xl' : 'text-6xl text-primary'}`}>
                      {finalTotalScore.toFixed(2)}
                    </span>
                    <div className={`flex flex-col items-center justify-center rounded-full border-4 ${isPdfGenerating ? 'w-10 h-10 border-black bg-white text-black border-2' : 'w-20 h-20'} ${
                      !isPdfGenerating && (grade === 'A' ? 'border-green-500 bg-green-50 text-green-700' :
                      grade === 'B' ? 'border-blue-500 bg-blue-50 text-blue-700' :
                      grade === 'C' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' :
                      'border-red-500 bg-red-50 text-red-700')
                    }`}>
                      <span className={`font-bold uppercase ${isPdfGenerating ? 'text-[8px]' : 'text-xs'}`}>Grade</span>
                      <span className={`font-extrabold leading-none ${isPdfGenerating ? 'text-lg' : 'text-3xl'}`}>{grade}</span>
                    </div>
                  </div>
               </div>
             </div>
             
             {/* Signatures */}
             <div className={`justify-between px-10 py-16 mt-4 print:flex ${isPdfGenerating ? 'flex py-4 mt-1 px-4 text-black' : 'hidden'}`}>
                <div className="text-center">
                   <div className="border-b border-black w-40 mb-1"></div>
                   <p className="text-[10px] font-bold">พนักงานผู้ถูกประเมิน</p>
                   <p className="text-[10px]">วันที่ ........../........../..........</p>
                </div>
                <div className="text-center">
                   <div className="border-b border-black w-40 mb-1"></div>
                   <p className="text-[10px] font-bold">ผู้บังคับบัญชา/ผู้ประเมิน</p>
                   <p className="text-[10px]">วันที่ ........../........../..........</p>
                </div>
             </div>

             {/* Footer Buttons */}
             <div className={`p-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-200 print:hidden ${isPdfGenerating ? 'hidden' : 'flex'}`}>
               <button 
                onClick={toggleLock}
                className={`flex items-center justify-center gap-2 border px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                  isLocked 
                    ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200' 
                    : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
               >
                 {isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                 {isLocked ? 'ปลดล็อคการแก้ไข' : 'ล็อคคะแนน'}
               </button>

               <button 
                onClick={handleSavePDF}
                disabled={isPdfGenerating}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-800 text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-wait"
               >
                 <FileText size={18} />
                 {isPdfGenerating ? 'กำลังสร้างไฟล์ PDF...' : 'บันทึกไฟล์ PDF'}
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Admin Panel Modal */}
      <AdminSettings 
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        employees={employeeList}
        setEmployees={setEmployeeList}
        sectionWeights={sectionWeights}
        setSectionWeights={setSectionWeights}
        users={users}
        setUsers={setUsers}
      />
    </div>
  );
};

export default App;
