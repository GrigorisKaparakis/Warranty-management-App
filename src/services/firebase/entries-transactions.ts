import { doc } from "firebase/firestore";
import { db } from "./core";

export const EntryTransactions = {
  getStatsDocRef() {
    return doc(db, "metadata/stats");
  }
};
