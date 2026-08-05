import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch, 
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Employee, WeekOffRequest, ChangeRecord } from '../types';

const EMPLOYEES_COL = 'employees';
const REQUESTS_COL = 'week_off_requests';
const RECORDS_COL = 'change_records';

/**
 * Subscribe to real-time updates for Employees collection.
 * Triggers callback whenever data changes in Firestore on any device.
 */
export function subscribeEmployees(onData: (employees: Employee[]) => void) {
  const colRef = collection(db, EMPLOYEES_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: Employee[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Employee);
    });
    onData(list);
  }, (err) => {
    console.error("Firestore employees subscription error:", err);
  });
}

/**
 * Subscribe to real-time updates for Week Off Requests.
 */
export function subscribeRequests(onData: (requests: WeekOffRequest[]) => void) {
  const colRef = collection(db, REQUESTS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: WeekOffRequest[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as WeekOffRequest);
    });
    // Sort by timestamp descending
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    onData(list);
  }, (err) => {
    console.error("Firestore requests subscription error:", err);
  });
}

/**
 * Subscribe to real-time updates for Change Records.
 */
export function subscribeChangeRecords(onData: (records: ChangeRecord[]) => void) {
  const colRef = collection(db, RECORDS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: ChangeRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ChangeRecord);
    });
    // Sort by timestamp descending
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    onData(list);
  }, (err) => {
    console.error("Firestore change records subscription error:", err);
  });
}

/**
 * Update single employee in cloud
 */
export async function updateEmployeeInCloud(employee: Employee) {
  try {
    const docRef = doc(db, EMPLOYEES_COL, String(employee.id));
    await setDoc(docRef, employee, { merge: true });
  } catch (err) {
    console.error("Error updating employee in cloud:", err);
  }
}

/**
 * Replace or Bulk Import Employees to Cloud
 */
export async function saveEmployeesToCloud(employees: Employee[], mode: 'append' | 'replace' = 'append') {
  try {
    if (mode === 'replace') {
      // Clear existing docs
      const snap = await getDocs(collection(db, EMPLOYEES_COL));
      const deleteBatch = writeBatch(db);
      snap.forEach((docSnap) => {
        deleteBatch.delete(docSnap.ref);
      });
      await deleteBatch.commit();
    }

    // Save new employees in chunks of 450 (batch limit in Firestore is 500)
    const chunkSize = 400;
    for (let i = 0; i < employees.length; i += chunkSize) {
      const chunk = employees.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((emp) => {
        const docRef = doc(db, EMPLOYEES_COL, String(emp.id));
        batch.set(docRef, emp, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    console.error("Error saving employees to cloud:", err);
  }
}

/**
 * Save single Week Off Request to Cloud
 */
export async function saveRequestToCloud(request: WeekOffRequest) {
  try {
    const docRef = doc(db, REQUESTS_COL, request.id);
    await setDoc(docRef, request);
  } catch (err) {
    console.error("Error saving request to cloud:", err);
  }
}

/**
 * Update Request status in Cloud
 */
export async function updateRequestStatusInCloud(requestId: string, status: 'approved' | 'rejected') {
  try {
    const docRef = doc(db, REQUESTS_COL, requestId);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.error("Error updating request status in cloud:", err);
  }
}

/**
 * Save Change Record to Cloud
 */
export async function saveChangeRecordToCloud(record: ChangeRecord) {
  try {
    const docRef = doc(db, RECORDS_COL, record.id);
    await setDoc(docRef, record);
  } catch (err) {
    console.error("Error saving change record to cloud:", err);
  }
}
