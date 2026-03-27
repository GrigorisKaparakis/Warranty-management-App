
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Entry, GarageSettings } from "../core/types";
import { PDF_CONFIG } from "../core/config";

/**
 * PDF Service με Native υποστήριξη Ελληνικών.
 * Χρησιμοποιούμε τη γραμματοσειρά NotoSans της Google για να αποφύγουμε 
 * τα προβλήματα με τα "κουτάκια" αντί για Ελληνικούς χαρακτήρες.
 */

const NOTO_SANS_URL = PDF_CONFIG.FONTS.NOTO_SANS_URL;

/**
 * Φορτώνει τη γραμματοσειρά NotoSans και την κάνει register στο jsPDF.
 */
const loadGreekFont = async (doc: jsPDF): Promise<void> => {
  try {
    const response = await fetch(NOTO_SANS_URL);
    const buffer = await response.arrayBuffer();
    const binary = new Uint8Array(buffer);
    let base64 = "";
    for (let i = 0; i < binary.length; i++) {
      base64 += String.fromCharCode(binary[i]);
    }
    const fontBase64 = btoa(base64);
    
    doc.addFileToVFS("NotoSans-Regular.ttf", fontBase64);
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    doc.setFont("NotoSans");
  } catch (error) {
    console.error("Failed to load Greek font:", error);
  }
};

const formatSafeDate = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export const PDFService = {
  /**
   * Εξαγωγή ολόκληρης της λίστας εγγυήσεων σε μορφή πίνακα.
   */
  exportEntryList: async (entries: Entry[], settings?: GarageSettings) => {
    const doc = new jsPDF();
    await loadGreekFont(doc);
    
    const companyName = settings?.branding?.appName || PDF_CONFIG.DEFAULTS.COMPANY_NAME;

    // Header Αναφοράς
    doc.setFontSize(PDF_CONFIG.FONT_SIZES.TITLE);
    doc.setTextColor(PDF_CONFIG.COLORS.PRIMARY[0], PDF_CONFIG.COLORS.PRIMARY[1], PDF_CONFIG.COLORS.PRIMARY[2]); 
    doc.text(`${companyName} - ΑΝΑΦΟΡΑ ΕΓΓΥΗΣΕΩΝ`, 14, 22);
    
    doc.setFontSize(PDF_CONFIG.FONT_SIZES.SMALL);
    doc.setTextColor(PDF_CONFIG.COLORS.SECONDARY[0]);
    doc.text(`Ημερομηνία Εξαγωγής: ${new Date().toLocaleDateString('el-GR')}`, 14, 30);

    const tableData = entries.map(e => [
      e.status,
      e.warrantyId,
      e.vin,
      `${e.company} / ${e.brand}`,
      formatSafeDate(e.createdAt),
      e.fullName,
      e.isPaid ? 'ΝΑΙ' : 'ΟΧΙ'
    ]);

    // Δημιουργία Πίνακα με autoTable
    (doc as any).autoTable({
      startY: 40,
      head: [['Κατάσταση', 'Αρ. Εγγύησης', 'VIN', 'Εταιρεία/Μάρκα', 'Ημ/νία', 'Πελάτης', 'Πληρ.']],
      body: tableData,
      styles: { font: "NotoSans", fontSize: PDF_CONFIG.FONT_SIZES.TINY }, 
      headStyles: { fillColor: PDF_CONFIG.COLORS.PRIMARY, textColor: PDF_CONFIG.COLORS.WHITE, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: PDF_CONFIG.COLORS.BACKGROUND_ALT },
      margin: { top: 40 },
    });

    doc.save(`Αναφορα_Εγγυησεων_${new Date().toISOString().split('T')[0]}.pdf`);
  },

  /**
   * Εξαγωγή μιας μεμονωμένης εγγύησης ως Πιστοποιητικό.
   */
  exportSingleEntry: async (entry: Entry, settings?: GarageSettings) => {
    const doc = new jsPDF();
    await loadGreekFont(doc);
    
    const companyName = settings?.branding?.appName || PDF_CONFIG.DEFAULTS.COMPANY_NAME;

    // Αισθητικό Header με σκούρο φόντο
    doc.setFillColor(PDF_CONFIG.COLORS.PRIMARY[0], PDF_CONFIG.COLORS.PRIMARY[1], PDF_CONFIG.COLORS.PRIMARY[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(PDF_CONFIG.COLORS.WHITE[0], PDF_CONFIG.COLORS.WHITE[1], PDF_CONFIG.COLORS.WHITE[2]);
    doc.setFontSize(PDF_CONFIG.FONT_SIZES.BODY);
    doc.text(`ΑΡΙΘΜΟΣ ΕΓΓΥΗΣΗΣ: ${entry.warrantyId}`, 14, 32);

    // Ενότητες Πληροφοριών
    doc.setTextColor(PDF_CONFIG.COLORS.PRIMARY[0], PDF_CONFIG.COLORS.PRIMARY[1], PDF_CONFIG.COLORS.PRIMARY[2]);
    doc.setFontSize(PDF_CONFIG.FONT_SIZES.SUBTITLE);
    doc.text("ΠΛΗΡΟΦΟΡΙΕΣ ΟΧΗΜΑΤΟΣ", 14, 55);
    doc.line(14, 57, 100, 57);

    doc.setFontSize(PDF_CONFIG.FONT_SIZES.BODY);
    doc.text(`Πλαίσιο (VIN): ${entry.vin}`, 14, 65);
    doc.text(`Μάρκα/Μοντέλο: ${entry.brand}`, 14, 72);
    doc.text(`Εταιρεία: ${entry.company}`, 14, 79);

    doc.setFontSize(PDF_CONFIG.FONT_SIZES.SUBTITLE);
    doc.text("ΣΤΟΙΧΕΙΑ ΠΕΛΑΤΗ", 110, 55);
    doc.line(110, 57, 196, 57);
    
    doc.setFontSize(PDF_CONFIG.FONT_SIZES.BODY);
    doc.text(`Ονοματεπώνυμο: ${entry.fullName}`, 110, 65);
    doc.text(`Ημ/νία Καταχώρησης: ${formatSafeDate(entry.createdAt)}`, 110, 72);
    doc.text(`Κατάσταση: ${entry.status}`, 110, 79);

    // Πίνακας Ανταλλακτικών
    doc.setFontSize(PDF_CONFIG.FONT_SIZES.SUBTITLE);
    doc.text("ΑΝΤΑΛΛΑΚΤΙΚΑ & ΕΡΓΑΣΙΕΣ", 14, 100);
    doc.line(14, 102, 196, 102);

    const partsData = entry.parts.map(p => [
      p.code,
      p.description,
      p.quantity.toString(),
      p.isReady ? 'Έτοιμο' : 'Εκκρεμεί'
    ]);

    (doc as any).autoTable({
      startY: 110,
      head: [['Κωδικός', 'Περιγραφή', 'Ποσ.', 'Κατάσταση']],
      body: partsData,
      styles: { font: "NotoSans" },
      headStyles: { fillColor: PDF_CONFIG.COLORS.ACCENT }, 
    });

    // Παρατηρήσεις
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(PDF_CONFIG.FONT_SIZES.SUBTITLE);
    doc.text("ΠΑΡΑΤΗΡΗΣΕΙΣ / ΙΣΤΟΡΙΚΟ", 14, finalY + 20);
    doc.setFontSize(PDF_CONFIG.FONT_SIZES.SMALL);
    doc.setTextColor(PDF_CONFIG.COLORS.SECONDARY[0]);
    const splitNotes = doc.splitTextToSize(entry.notes || 'Δεν υπάρχουν πρόσθετες παρατηρήσεις.', 180);
    doc.text(splitNotes, 14, finalY + 30);



    // Καθαρισμός ονόματος αρχείου από παράνομους χαρακτήρες
    const safeName = entry.fullName
      .replace(/[<>:"/\\|?*]/g, '_') 
      .replace(/\s+/g, '_')          
      .substring(0, 50);             
    
    doc.save(`Εγγυηση_${entry.warrantyId}_${safeName}.pdf`);
  }
};
