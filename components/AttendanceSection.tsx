import React from 'react';
import { AttendanceState } from '../types';

interface Props {
  data: AttendanceState;
  onChange: (field: keyof AttendanceState, value: number) => void;
  totalDeduction: number;
  finalScore: number;
  isLocked?: boolean;
  forcePrintMode?: boolean;
  compactView?: boolean;
}

const AttendanceSection: React.FC<Props> = ({ data, onChange, totalDeduction, finalScore, isLocked = false, forcePrintMode = false, compactView = false }) => {
  
  const calculateRowDeduction = (count: number, rate: number) => {
    return count * rate;
  };

  const InputCell = ({ 
    value, 
    field, 
    rate 
  }: { 
    value: number, 
    field: keyof AttendanceState, 
    rate: number 
  }) => {
    if (forcePrintMode || compactView) {
      return <span className="text-black font-bold">{value || 0}</span>;
    }
    return (
      <input
        type="number"
        min="0"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(field, Math.max(0, parseInt(e.target.value) || 0))}
        disabled={isLocked}
        className={`w-16 text-gray-900 font-medium placeholder-gray-400 text-center border border-gray-300 rounded px-1 py-1.5 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none ${isLocked ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}`}
        placeholder="0"
      />
    );
  };

  const LabelText = ({ text }: { text: string }) => (
    <span className="text-primary font-bold text-sm">
      {text}
    </span>
  );

  const RateText = ({ rate }: { rate: number }) => (
    <span className="text-gray-600 font-bold text-sm">
      {rate}
    </span>
  );

  // --- Compact View for PDF Summary ---
  if (compactView) {
    return (
      <div className="mb-3 break-inside-avoid">
        <div className="flex justify-between items-end mb-1 border-b border-black pb-1">
          <h3 className="font-bold text-black text-xs">ส่วนที่ 3: การมาทำงาน (Attendance)</h3>
          <span className="text-[10px] font-bold text-black">
            คะแนน: {finalScore} / 30
          </span>
        </div>
        <table className="w-full text-[9px] border-collapse border border-black">
           <thead className="bg-gray-100">
              <tr>
                 <th className="border border-black px-1 py-0.5 text-left w-1/3 text-black">รายการ (Items)</th>
                 <th className="border border-black px-1 py-0.5 text-center text-black">ครั้ง</th>
                 <th className="border border-black px-1 py-0.5 text-center text-black">หัก</th>
                 <th className="border border-black px-1 py-0.5 text-left w-1/3 text-black">รายการ (Items)</th>
                 <th className="border border-black px-1 py-0.5 text-center text-black">ครั้ง</th>
                 <th className="border border-black px-1 py-0.5 text-center text-black">หัก</th>
              </tr>
           </thead>
           <tbody>
              <tr>
                 <td className="border border-black px-1 py-0.5 text-black">ลาป่วย/กิจ เกิน</td>
                 <td className="border border-black px-1 py-0.5 text-center text-black">{data.sickLeave + data.personalLeave}</td>
                 <td className="border border-black px-1 py-0.5 text-center text-black">{calculateRowDeduction(data.sickLeave, 1) + calculateRowDeduction(data.personalLeave, 1)}</td>
                 
                 <td className="border border-black px-1 py-0.5 text-black">ใบชี้แจง/เตือน</td>
                 <td className="border border-black px-1 py-0.5 text-center text-black">{data.verbalWarning + data.writtenWarning}</td>
                 <td className="border border-black px-1 py-0.5 text-center text-black">{calculateRowDeduction(data.verbalWarning, 3) + calculateRowDeduction(data.writtenWarning, 5)}</td>
              </tr>
              <tr>
                 <td className="border border-black px-1 py-0.5 text-black">มาสาย/ขาดงาน</td>
                 <td className="border border-black px-1 py-0.5 text-center text-black">{data.late + data.absent}</td>
                 <td className="border border-black px-1 py-0.5 text-center text-black">{calculateRowDeduction(data.late, 1) + calculateRowDeduction(data.absent, 3)}</td>
                 
                 <td className="border border-black px-1 py-0.5 text-black">พักงาน</td>
                 <td className="border border-black px-1 py-0.5 text-center text-black">{data.suspension}</td>
                 <td className="border border-black px-1 py-0.5 text-center text-black">{calculateRowDeduction(data.suspension, 15)}</td>
              </tr>
              <tr className="bg-gray-50 font-bold">
                 <td className="border border-black px-1 py-0.5 text-right text-black" colSpan={5}>รวมคะแนนที่หักทั้งหมด</td>
                 <td className="border border-black px-1 py-0.5 text-center text-black">{totalDeduction}</td>
              </tr>
           </tbody>
        </table>
      </div>
    );
  }

  // --- Normal / Expanded View ---
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${forcePrintMode ? 'border-none shadow-none' : ''}`}>
      <div className={`bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center ${forcePrintMode ? 'bg-white p-2 border-b-2' : ''}`}>
        <h3 className="font-bold text-gray-800">ส่วนที่ 3 : รายละเอียดการประเมินความสม่ำเสมอ การตรงต่อเวลา และวินัยในการมาทำงาน</h3>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">30 คะแนน</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="py-4 px-4 text-left font-semibold text-gray-600 w-1/3">ความสม่ำเสมอและการตรงต่อเวลา</th>
              <th className="py-4 px-2 text-center font-semibold text-gray-600 w-20">หลัก<br/>เกณฑ์<br/><span className="text-[10px] font-normal text-gray-400">(คะแนน<br/>หักต่อ<br/>หน่วย)</span></th>
              <th className="py-4 px-2 text-center font-semibold text-gray-600 w-20">จำนวน<br/>วัน/ครั้ง</th>
              <th className="py-4 px-2 text-center font-semibold text-gray-600 w-20">คะแนน<br/>ประเมิน<br/>ที่หัก</th>
              
              <th className="py-4 px-4 text-left font-semibold text-gray-600 w-1/3 border-l border-gray-100">สถิติทางวินัย</th>
              <th className="py-4 px-2 text-center font-semibold text-gray-600 w-20">หลัก<br/>เกณฑ์<br/><span className="text-[10px] font-normal text-gray-400">(คะแนน<br/>หักต่อ<br/>ครั้ง)</span></th>
              <th className="py-4 px-2 text-center font-semibold text-gray-600 w-20">ครั้ง</th>
              <th className="py-4 px-2 text-center font-semibold text-gray-600 w-24">คะแนน<br/>ประเมิน<br/>ที่หัก</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Row 1 */}
            <tr className="hover:bg-gray-50/30">
              <td className="py-4 px-4"><LabelText text="1. ลาป่วยเกิน 7 วันขึ้นไป" /></td>
              <td className="py-4 px-2 text-center"><RateText rate={1} /></td>
              <td className="py-4 px-2 text-center">
                <InputCell value={data.sickLeave} field="sickLeave" rate={1} />
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                {calculateRowDeduction(data.sickLeave, 1)}
              </td>

              <td className="py-4 px-4 border-l border-gray-100"><LabelText text="1. ใบชี้แจง" /></td>
              <td className="py-4 px-2 text-center"><RateText rate={3} /></td>
              <td className="py-4 px-2 text-center">
                <InputCell value={data.verbalWarning} field="verbalWarning" rate={3} />
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                {calculateRowDeduction(data.verbalWarning, 3)}
              </td>
            </tr>

            {/* Row 2 */}
            <tr className="hover:bg-gray-50/30">
              <td className="py-4 px-4"><LabelText text="2. ลากิจเกิน 7 วันขึ้นไป" /></td>
              <td className="py-4 px-2 text-center"><RateText rate={1} /></td>
              <td className="py-4 px-2 text-center">
                <InputCell value={data.personalLeave} field="personalLeave" rate={1} />
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                {calculateRowDeduction(data.personalLeave, 1)}
              </td>

              <td className="py-4 px-4 border-l border-gray-100"><LabelText text="2. หนังสือเตือน" /></td>
              <td className="py-4 px-2 text-center"><RateText rate={5} /></td>
              <td className="py-4 px-2 text-center">
                <InputCell value={data.writtenWarning} field="writtenWarning" rate={5} />
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                {calculateRowDeduction(data.writtenWarning, 5)}
              </td>
            </tr>

            {/* Row 3 */}
            <tr className="hover:bg-gray-50/30">
              <td className="py-4 px-4"><LabelText text="3. ขาดงาน" /></td>
              <td className="py-4 px-2 text-center"><RateText rate={3} /></td>
              <td className="py-4 px-2 text-center">
                <InputCell value={data.absent} field="absent" rate={3} />
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                {calculateRowDeduction(data.absent, 3)}
              </td>

              <td className="py-4 px-4 border-l border-gray-100"><LabelText text="3. ถูกพักงาน/ภาคทัณฑ์" /></td>
              <td className="py-4 px-2 text-center"><RateText rate={15} /></td>
              <td className="py-4 px-2 text-center">
                <InputCell value={data.suspension} field="suspension" rate={15} />
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                {calculateRowDeduction(data.suspension, 15)}
              </td>
            </tr>

            {/* Row 4 */}
            <tr className="hover:bg-gray-50/30">
              <td className="py-4 px-4"><LabelText text="4. มาสายเกิน 6 ครั้งขึ้นไป" /></td>
              <td className="py-4 px-2 text-center"><RateText rate={1} /></td>
              <td className="py-4 px-2 text-center">
                <InputCell value={data.late} field="late" rate={1} />
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                {calculateRowDeduction(data.late, 1)}
              </td>

              <td className="py-4 px-4 border-l border-gray-100 bg-gray-50/50" colSpan={4}></td>
            </tr>

            {/* Row 5 */}
            <tr className="hover:bg-gray-50/30">
              <td className="py-4 px-4"><LabelText text="5. ลาคลอดเกิน 45 วันขึ้นไป" /></td>
              <td className="py-4 px-2 text-center"><RateText rate={1} /></td>
              <td className="py-4 px-2 text-center">
                <InputCell value={data.maternityLeave} field="maternityLeave" rate={1} />
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                {calculateRowDeduction(data.maternityLeave, 1)}
              </td>

              <td className="py-4 px-4 border-l border-gray-100 text-right font-bold text-gray-700 text-sm" colSpan={3}>
                รวมคะแนนทางวินัยที่หัก (B)
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg bg-red-50">
                {calculateRowDeduction(data.verbalWarning, 3) + calculateRowDeduction(data.writtenWarning, 5) + calculateRowDeduction(data.suspension, 15)}
              </td>
            </tr>

            {/* Row 6 */}
            <tr className="hover:bg-gray-50/30">
              <td className="py-4 px-4"><LabelText text="6. ลาบวชเกิน 15 วันขึ้นไป" /></td>
              <td className="py-4 px-2 text-center"><RateText rate={1} /></td>
              <td className="py-4 px-2 text-center">
                <InputCell value={data.ordinationLeave} field="ordinationLeave" rate={1} />
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                {calculateRowDeduction(data.ordinationLeave, 1)}
              </td>

              <td className="py-4 px-4 border-l border-gray-100 text-right font-bold text-red-500" colSpan={3}>
                 {/* Empty space */}
              </td>
              <td className="py-4 px-2 text-center font-bold text-red-600 text-lg">
                 {totalDeduction > 0 ? totalDeduction : 0}
              </td>
            </tr>

            {/* Summary Row */}
            <tr className="bg-gray-50 border-t border-gray-200">
              <td className="py-4 px-4 text-right font-bold text-gray-600" colSpan={4}>
                รวมคะแนนลาเกินเกณฑ์ที่หัก (A): <span className="text-gray-800 ml-2">{
                  calculateRowDeduction(data.sickLeave, 1) + 
                  calculateRowDeduction(data.personalLeave, 1) + 
                  calculateRowDeduction(data.absent, 3) + 
                  calculateRowDeduction(data.late, 1) + 
                  calculateRowDeduction(data.maternityLeave, 1) + 
                  calculateRowDeduction(data.ordinationLeave, 1)
                }</span>
              </td>
              <td className="py-4 px-4 text-right font-bold text-gray-600 border-l border-gray-200" colSpan={3}>
                รวมคะแนนส่วนที่ 3 : เท่ากับคะแนนเต็มส่วนที่ 3 - (C) (คะแนนเต็ม 30 คะแนน)
              </td>
              <td className="py-4 px-2 text-center font-bold text-black bg-blue-300 text-2xl border border-blue-400">
                {finalScore}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSection;
