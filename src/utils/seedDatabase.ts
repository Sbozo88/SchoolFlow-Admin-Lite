import { writeBatch, doc } from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/firebase/firebaseConfig";
import { demoLearners, demoAttendance, demoPayments, demoParentSubmissions, demoRecentActivity } from "./seedData";

export async function seedDatabase() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured.");
  }

  const db = getFirebaseDb();
  const batch = writeBatch(db);

  try {
    // Note: This does not delete existing data, it only merges the demo data
    // in a real scenario, you might want to wipe the collections first.
    // For MVP, we will just upsert demo data with specific IDs.

    // Seed Learners
    for (const learner of demoLearners) {
      const ref = doc(db, "learners", learner.id);
      batch.set(ref, learner);
    }

    // Seed Attendance
    for (const record of demoAttendance) {
      const ref = doc(db, "attendance", record.id);
      batch.set(ref, record);
    }

    // Seed Payments
    for (const payment of demoPayments) {
      const ref = doc(db, "payments", payment.id);
      batch.set(ref, payment);
    }

    // Seed Parent Submissions
    for (const submission of demoParentSubmissions) {
      const ref = doc(db, "parentSubmissions", submission.id);
      batch.set(ref, submission);
    }

    // Seed Recent Activity
    for (const activity of demoRecentActivity) {
      const ref = doc(db, "recentActivity", activity.id);
      batch.set(ref, activity);
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
