export type ShiftType = 'A Shift' | 'B Shift' | 'C Shift' | 'Night Shift' | 'General Shift' | '20 TO 04' | string;

export interface Employee {
  id: string;
  name: string;
  designation: string;
  ward: string;
  shift: ShiftType;
  unit: string; // Only 'A Shift' has a unit. For others, it will be blank/empty.
  weekOff: string;
  password?: string;
  collarType?: 'white' | 'blue';
}

export type RecordType = 'week_off';

export interface BaseRecord {
  id: string;
  type: RecordType;
  empId: string;
  empName: string;
  submittedBy: string; // Name of person who logged it
  submittedByRole: 'admin' | 'white_collar';
  timestamp: string;
}

export interface WeekOffRecord extends BaseRecord {
  type: 'week_off';
  previousWeekOff: string;
  newWeekOff: string;
}

export type ChangeRecord = WeekOffRecord;

export interface WeekOffRequest {
  id: string;
  empId: string;
  empName: string;
  designation: string;
  collarType: 'white' | 'blue';
  currentWeekOff: string;
  proposedWeekOff: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UserSession {
  username: string;
  role: 'admin' | 'white_collar';
  empId?: string;
}
