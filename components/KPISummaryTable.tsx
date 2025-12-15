import React from 'react';
import { KPISectionData, ScoreState } from '../types';

interface Props {
  section: KPISectionData;
  scores: ScoreState;
}

const KPISummaryTable: React.FC<Props> = ({ section, scores }) => {
  const calculateItemScore = (score: number, weight: number) => {
    if (!score) return 0;
    return ((score / 5) * weight);
  };

  const totalRawWeightedScore = section.items.reduce((acc, item) => {
    return acc + calculateItemScore(scores[item.id] || 0, item.weight);
  }, 0);

  // Final weighted score for the section (e.g. out of 50 or 20)
  const weightedTotal = (totalRawWeightedScore / 100) * section.sectionWeight;

  return (
    <div className="mb-3 break-inside-avoid">
      <div className="flex justify-between items-end mb-1 border-b border-black pb-1">
        <h3 className="font-bold text-black text-xs">{section.title}</h3>
        <span className="text-[10px] font-bold text-black">
           คะแนน: {weightedTotal.toFixed(2)} / {section.sectionWeight}
        </span>
      </div>
      <table className="w-full text-[9px] border-collapse border border-black">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-black px-1 py-0.5 text-left w-[65%] text-black font-bold">หัวข้อการประเมิน (Items)</th>
            <th className="border border-black px-1 py-0.5 text-center w-[10%] text-black font-bold">นน.(%)</th>
            <th className="border border-black px-1 py-0.5 text-center w-[10%] text-black font-bold">คะแนน</th>
            <th className="border border-black px-1 py-0.5 text-center w-[15%] text-black font-bold">รวม</th>
          </tr>
        </thead>
        <tbody>
          {section.items.map((item, idx) => {
             const score = scores[item.id] || 0;
             const itemTotal = calculateItemScore(score, item.weight);
             return (
              <tr key={item.id}>
                <td className="border border-black px-1 py-0.5 align-middle">
                  <div className="font-medium text-black">{idx + 1}. {item.title}</div>
                </td>
                <td className="border border-black px-1 py-0.5 text-center align-middle text-black">{item.weight}</td>
                <td className="border border-black px-1 py-0.5 text-center align-middle font-medium text-black">{score || '-'}</td>
                <td className="border border-black px-1 py-0.5 text-center font-bold align-middle bg-gray-50 text-black">{itemTotal.toFixed(2)}</td>
              </tr>
             );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default KPISummaryTable;
