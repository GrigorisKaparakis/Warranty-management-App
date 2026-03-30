/**
 * MaintenanceService.ts: Υπηρεσίες συντήρησης και μεταφοράς δεδομένων (Migrations).
 * Περιλαμβάνει λειτουργίες για τη δημιουργία μητρώων από υπάρχουσες εγγυήσεις
 * και τη μαζική ενημέρωση ημερομηνιών λήξης ή σημειώσεων.
 */

import { doc, updateDoc, query, limit, startAfter, writeBatch, orderBy, QueryDocumentSnapshot } from "firebase/firestore";
import { monitoredGetDocs } from "../monitor";
import { db, entriesCollection, sanitizeEntry, handleFirestoreError, OperationType } from "../core";
import { Entry } from "../../../core/types";
import { EntryStatus, PERFORMANCE_CONFIG } from "../../../core/config";
import { RegistryService } from "../registry";

const BATCH_SIZE = PERFORMANCE_CONFIG.FIRESTORE.BATCH_SIZE;

export const MaintenanceService = {
  async migrateParts(onProgress?: (count: number) => void): Promise<number> {
    const partsMap = new Map<string, { desc: string, brand: string, count: number }>();
    let lastDoc: QueryDocumentSnapshot | null = null;
    let hasMore = true;
    let totalProcessed = 0;

    while (hasMore) {
      const q = lastDoc 
        ? query(entriesCollection, orderBy("__name__"), startAfter(lastDoc), limit(BATCH_SIZE))
        : query(entriesCollection, orderBy("__name__"), limit(BATCH_SIZE));
      
      const snap = await monitoredGetDocs(q);
      if (snap.empty) {
        hasMore = false;
        break;
      }

      for (const docSnap of snap.docs) {
        const rawData = docSnap.data();
        const entryBrand = rawData.brand || '';
        let partsArray: any[] = Array.isArray(rawData.parts) ? rawData.parts : (rawData.parts ? Object.values(rawData.parts) : []);
        for (const part of partsArray) {
          if (!part) continue;
          const code = (part.code || part.partCode || part.itemCode || '').toString().trim().toUpperCase();
          let desc = (part.description || part.desc || part.label || '-').toString().trim();
          if (desc === 'ΠΕΡΙΓΡΑΦΗ ΑΠΟ ΙΣΤΟΡΙΚΟ') desc = '-';
          if (code) {
            const existing = partsMap.get(code);
            if (existing) {
              existing.count += 1;
              if ((existing.desc === '-' || !existing.desc) && desc !== '-') existing.desc = desc;
              if (!existing.brand && entryBrand) existing.brand = entryBrand;
            } else {
              partsMap.set(code, { desc, brand: entryBrand, count: 1 });
            }
          }
        }
      }

      totalProcessed += snap.docs.length;
      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.docs.length < BATCH_SIZE) hasMore = false;
    }

    let uniquePartsCount = 0;
    for (const [code, data] of partsMap.entries()) {
      await RegistryService.upsertPart(code, data.desc, data.brand);
      uniquePartsCount++;
      if (onProgress) onProgress(uniquePartsCount);
    }
    return uniquePartsCount;
  },

  async migrateVehicles(onProgress?: (count: number) => void): Promise<number> {
    const vehicleMap = new Map<string, { brand: string, ownerName: string, count: number }>();
    let lastDoc: QueryDocumentSnapshot | null = null;
    let hasMore = true;

    while (hasMore) {
      const q = lastDoc 
        ? query(entriesCollection, orderBy("__name__"), startAfter(lastDoc), limit(BATCH_SIZE))
        : query(entriesCollection, orderBy("__name__"), limit(BATCH_SIZE));
      
      const snap = await monitoredGetDocs(q);
      if (snap.empty) {
        hasMore = false;
        break;
      }

      for (const docSnap of snap.docs) {
        const entry = sanitizeEntry(docSnap.data(), docSnap.id);
        const vin = (entry.vin || '').trim().toUpperCase();
        if (vin && vin.length >= 5) {
          const existing = vehicleMap.get(vin);
          if (existing) {
            existing.count += 1;
            if (entry.fullName && entry.fullName.length > (existing.ownerName?.length || 0)) existing.ownerName = entry.fullName;
          } else {
            vehicleMap.set(vin, { brand: entry.brand || '', ownerName: entry.fullName || '', count: 1 });
          }
        }
      }

      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.docs.length < BATCH_SIZE) hasMore = false;
    }

    let count = 0;
    for (const [vin, data] of vehicleMap.entries()) {
      await RegistryService.upsertVehicle(vin, data.brand, data.ownerName);
      count++;
      if (onProgress) onProgress(count);
    }
    return count;
  },

  async migrateCustomers(onProgress?: (count: number) => void): Promise<number> {
    const customerMap = new Map<string, { vins: Set<string>, count: number }>();
    let lastDoc: QueryDocumentSnapshot | null = null;
    let hasMore = true;

    while (hasMore) {
      const q = lastDoc 
        ? query(entriesCollection, orderBy("__name__"), startAfter(lastDoc), limit(BATCH_SIZE))
        : query(entriesCollection, orderBy("__name__"), limit(BATCH_SIZE));
      
      const snap = await monitoredGetDocs(q);
      if (snap.empty) {
        hasMore = false;
        break;
      }

      for (const docSnap of snap.docs) {
        const entry = sanitizeEntry(docSnap.data(), docSnap.id);
        const name = (entry.fullName || '').trim().toUpperCase();
        const vin = (entry.vin || '').trim().toUpperCase();
        if (name) {
          const existing = customerMap.get(name);
          if (existing) {
            existing.count += 1;
            if (vin) existing.vins.add(vin);
          } else {
            const vins = new Set<string>();
            if (vin) vins.add(vin);
            customerMap.set(name, { vins, count: 1 });
          }
        }
      }

      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.docs.length < BATCH_SIZE) hasMore = false;
    }

    let count = 0;
    for (const [name, data] of customerMap.entries()) {
      const vinsArray = Array.from(data.vins);
      for (const vin of vinsArray) {
        await RegistryService.upsertCustomer(name, vin);
      }
      if (vinsArray.length === 0) {
        await RegistryService.upsertCustomer(name);
      }
      count++;
      if (onProgress) onProgress(count);
    }
    return count;
  },

  async migrateStatuses(mapping: Record<string, string>, onProgress?: (count: number) => void): Promise<number> {
    let count = 0;
    let lastDoc: QueryDocumentSnapshot | null = null;
    let hasMore = true;

    while (hasMore) {
      const q = lastDoc 
        ? query(entriesCollection, orderBy("__name__"), startAfter(lastDoc), limit(BATCH_SIZE))
        : query(entriesCollection, orderBy("__name__"), limit(BATCH_SIZE));
      
      const snap = await monitoredGetDocs(q);
      if (snap.empty) {
        hasMore = false;
        break;
      }

      const batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (mapping[data.status]) {
          batch.update(docSnap.ref, { status: mapping[data.status] });
          batchCount++;
          count++;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        if (onProgress) onProgress(count);
      }

      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.docs.length < BATCH_SIZE) hasMore = false;
    }

    return count;
  },

  async migrateExpiryDates(expiryRules: Record<string, string>, overwriteExisting: boolean, onProgress?: (count: number) => void): Promise<number> {
    let count = 0;
    const validStatuses = [EntryStatus.COMPLETED, EntryStatus.WORKSHOP, EntryStatus.RETURNED, EntryStatus.ALERT];
    let lastDoc: QueryDocumentSnapshot | null = null;
    let hasMore = true;

    while (hasMore) {
      const q = lastDoc 
        ? query(entriesCollection, orderBy("__name__"), startAfter(lastDoc), limit(BATCH_SIZE))
        : query(entriesCollection, orderBy("__name__"), limit(BATCH_SIZE));
      
      const snap = await monitoredGetDocs(q);
      if (snap.empty) {
        hasMore = false;
        break;
      }

      const batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnap of snap.docs) {
        const data = docSnap.data() as Entry;
        if (validStatuses.includes(data.status as EntryStatus) && !data.isPaid) {
          if (data.createdAt && (overwriteExisting || !data.expiryAt)) { 
            const company = data.company?.toUpperCase();
            let expiryDate: Date;
            const createdAtDate = new Date(data.createdAt);
            if (company && expiryRules[company] === 'END_OF_NEXT_MONTH') {
              expiryDate = new Date(createdAtDate.getFullYear(), createdAtDate.getMonth() + 2, 0);
            } else {
              let expiryMonths = 6; 
              if (company && expiryRules[company]) {
                const match = expiryRules[company].match(/(\d+)\s*months/i);
                if (match && match[1]) expiryMonths = parseInt(match[1]);
              }
              expiryDate = new Date(createdAtDate.setMonth(createdAtDate.getMonth() + expiryMonths));
            }
            batch.update(docSnap.ref, { expiryAt: expiryDate.getTime(), readyAt: data.readyAt || data.createdAt });
            batchCount++;
            count++;
          }
        } else if (data.expiryAt !== undefined || data.readyAt !== undefined) {
          batch.update(docSnap.ref, { expiryAt: null, readyAt: null });
          batchCount++;
          count++;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        if (onProgress) onProgress(count);
      }

      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.docs.length < BATCH_SIZE) hasMore = false;
    }

    return count;
  },

  async migrateNotesToLogFormat(onProgress?: (count: number) => void): Promise<number> {
    let count = 0;
    const actionPatterns = [
      { regex: /Τα ανταλλακτικά [ηή]ρθαν (\d{2}-\d{2}-\d{4})./, newText: "[admin] Ολοκληρωμένη στις {date} 00:00" },
      { regex: /Τα πήρατε (\d{2}-\d{2}-\d{4})./, newText: "[admin] Στο Συνεργείο στις {date} 00:00" },
      { regex: /Επιστράφηκαν (\d{2}-\d{2}-\d{4})./, newText: "[admin] Επιστράφηκε στις {date} 00:00" },
      { regex: /Alert στις (\d{2}-\d{2}-\d{4})./, newText: "[admin] Alert στις {date} 00:00" },
      { regex: /Απορρίφθηκε στις (\d{2}-\d{2}-\d{4})./, newText: "[admin] Απορρίφθηκε στις {date} 00:00" },
    ];

    let lastDoc: QueryDocumentSnapshot | null = null;
    let hasMore = true;

    while (hasMore) {
      const q = lastDoc 
        ? query(entriesCollection, orderBy("__name__"), startAfter(lastDoc), limit(BATCH_SIZE))
        : query(entriesCollection, orderBy("__name__"), limit(BATCH_SIZE));
      
      const snap = await monitoredGetDocs(q);
      if (snap.empty) {
        hasMore = false;
        break;
      }

      const batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnap of snap.docs) {
        const data = docSnap.data() as Entry;
        let originalNotes = data.notes || '';
        let newNotesLines: { timestamp: number; text: string }[] = [];
        let remainingNotes = originalNotes;
        actionPatterns.forEach(pattern => {
          let match;
          const globalRegex = new RegExp(pattern.regex.source, 'g');
          while ((match = globalRegex.exec(originalNotes)) !== null) {
            const [day, month, year] = match[1].split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
            newNotesLines.push({ timestamp: date.getTime(), text: pattern.newText.replace('{date}', formattedDate) });
            remainingNotes = remainingNotes.replace(match[0], '').trim();
          }
        });
        let finalNotes = remainingNotes;
        newNotesLines.sort((a, b) => a.timestamp - b.timestamp);
        if (newNotesLines.length > 0) {
          if (finalNotes) finalNotes += '\n';
          finalNotes += newNotesLines.map(line => line.text).join('\n');
        }
        finalNotes = finalNotes.replace(/\.{2,}/g, '.').replace(/\s*\.\s*$/g, '.').trim();
        if (finalNotes.trim() !== originalNotes.trim()) {
          batch.update(docSnap.ref, { notes: finalNotes.trim() });
          batchCount++;
          count++;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        if (onProgress) onProgress(count);
      }

      lastDoc = snap.docs[snap.docs.length - 1];
      if (snap.docs.length < BATCH_SIZE) hasMore = false;
    }

    return count;
  }
};
