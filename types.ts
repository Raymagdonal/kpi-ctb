export interface CriteriaLevel {
  score: 1 | 2 | 3 | 4 | 5;
  description: string;
}

export interface KPIItemData {
  id: string;
  title: string;
  description: string;
  weight: number; // Percent within the section (sum to 100)
  criteria: CriteriaLevel[];
}

export interface KPISectionData {
  id: string;
  title: string;
  sectionWeight: number; // Weight of this section in the total score (e.g. 50, 20, 30)
  items: KPIItemData[];
}

export interface EmployeeData {
  id: string; // Employee ID
  name: string;
  jobType: string; // 'สำนักงาน' | 'ปฏิบัติการ'
  position: string;
  department: string;
  date: string;
}

export interface ScoreState {
  [itemId: string]: number; // 1-5
}

export interface CommentState {
  [itemId: string]: string;
}

export interface AttendanceState {
  sickLeave: number;
  personalLeave: number;
  absent: number;
  late: number;
  maternityLeave: number;
  ordinationLeave: number;
  verbalWarning: number;
  writtenWarning: number;
  suspension: number;
}

export interface User {
  username: string;
  password?: string;
  role: 'admin' | 'user';
  allowedDepartments: string[]; // 'ALL' or specific departments
  allowedPositions?: string[]; // 'ALL' or specific positions
}
