/**
 * PENILAIAN STORAGE MODULE
 * ✅ Browser-compatible import via firebase-config.js re-exports
 * ✅ FIX: Correct object syntax for return values
 */

// ✅ FIX: Semua import dari firebase-config.js (relative path)
import { db, doc, setDoc, getDoc } from '../firebase-config.js';

export const penilaianStorage = {
  // Load semua nilai untuk kelas tertentu
  async loadGrades(classId) {
    try {
      const ref = doc(db, "grades", classId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        console.log("📊 [PenilaianStorage] Grades loaded:", classId);
        return snap.data();
      } else {
        console.warn("⚠️ [PenilaianStorage] No grades found for:", classId);
        // ✅ FIX: Tambah key "data:" sebelum {}
        return { meta: { jumlahPH: 1 }, data: {} };
      }
    } catch (e) {
      console.error("❌ [PenilaianStorage] loadGrades error:", e.message);
      // ✅ FIX: Tambah key "data:" sebelum {}
      return { meta: { jumlahPH: 1 }, data: {} };
    }
  },

  // Simpan nilai untuk kelas tertentu
  async saveGrades(classId, payload) {
    try {
      const ref = doc(db, "grades", classId);
      await setDoc(ref, payload, { merge: true });
      console.log("✅ [PenilaianStorage] Grades saved:", classId);
      return true;
    } catch (e) {
      console.error("❌ [PenilaianStorage] saveGrades error:", e.message);
      throw e;
    }
  }
};

console.log('✅ [PenilaianStorage] Loaded - Browser Compatible');
