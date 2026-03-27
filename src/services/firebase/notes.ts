/**
 * notes.ts: Διαχείριση των σημειώσεων (Note Board) στο Firestore.
 * Επιτρέπει την προσθήκη, διαγραφή και παρακολούθηση σημειώσεων σε πραγματικό χρόνο.
 */

import { onSnapshot, query, orderBy, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db, notesCollection, deepSanitize, handleFirestoreError, OperationType } from "./core";
import { Note } from "../../core/types";

export const NoteService = {
  subscribeToNotes(callback: (notes: Note[]) => void) {
    const q = query(notesCollection, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(snap => ({ ...deepSanitize(snap.data()), id: snap.id } as Note));
      callback(notes);
    }, (error) => handleFirestoreError(error, OperationType.LIST, "notes"));
  },

  async addNote(note: Omit<Note, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(notesCollection, deepSanitize(note));
      return docRef.id;
    } catch (error) {
      return handleFirestoreError(error, OperationType.CREATE, "notes") as any;
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      const docRef = doc(db, "notes", id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
    }
  }
};
