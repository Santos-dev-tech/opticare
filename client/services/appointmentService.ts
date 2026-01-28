import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Type definition for appointment data
export interface AppointmentData {
  id?: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  appointmentDate: string; // YYYY-MM-DD format
  appointmentTime: string; // HH:MM format
  duration: number; // in minutes
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  notes: string;
  reasonForVisit: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const APPOINTMENTS_COLLECTION = "appointments";

/**
 * Book a new appointment
 */
export async function bookAppointment(
  appointmentData: AppointmentData,
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), {
      ...appointmentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
}

/**
 * Get all appointments, optionally filtered by patient
 */
export async function getAppointments(
  patientId?: string,
): Promise<AppointmentData[]> {
  try {
    let q;
    if (patientId) {
      q = query(
        collection(db, APPOINTMENTS_COLLECTION),
        where("patientId", "==", patientId),
      );
    } else {
      q = query(collection(db, APPOINTMENTS_COLLECTION));
    }

    const querySnapshot = await getDocs(q);
    const appointments = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as AppointmentData,
    );

    // Sort by date descending
    return appointments.sort(
      (a, b) =>
        new Date(b.appointmentDate).getTime() -
        new Date(a.appointmentDate).getTime(),
    );
  } catch (error) {
    console.error("Error getting appointments:", error);
    throw error;
  }
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(
  appointmentId: string,
): Promise<AppointmentData | null> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as AppointmentData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting appointment:", error);
    throw error;
  }
}

/**
 * Get appointments for a specific date
 */
export async function getAppointmentsByDate(date: string): Promise<AppointmentData[]> {
  try {
    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("appointmentDate", "==", date),
    );

    const querySnapshot = await getDocs(q);
    const appointments = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as AppointmentData,
    );

    // Sort by time ascending
    return appointments.sort(
      (a, b) => a.appointmentTime.localeCompare(b.appointmentTime),
    );
  } catch (error) {
    console.error("Error getting appointments by date:", error);
    throw error;
  }
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  appointmentId: string,
  appointmentData: Partial<AppointmentData>,
): Promise<void> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(docRef, {
      ...appointmentData,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId: string): Promise<void> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
    await updateDoc(docRef, {
      status: "cancelled",
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(appointmentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, APPOINTMENTS_COLLECTION, appointmentId));
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
}

/**
 * Get upcoming appointments (next 7 days)
 */
export async function getUpcomingAppointments(): Promise<AppointmentData[]> {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const todayStr = today.toISOString().split("T")[0];
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    const q = query(
      collection(db, APPOINTMENTS_COLLECTION),
      where("appointmentDate", ">=", todayStr),
      where("appointmentDate", "<=", nextWeekStr),
      where("status", "==", "scheduled"),
      orderBy("appointmentDate", "asc"),
      orderBy("appointmentTime", "asc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as AppointmentData,
    );
  } catch (error) {
    console.error("Error getting upcoming appointments:", error);
    throw error;
  }
}
