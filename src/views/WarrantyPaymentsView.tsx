import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Entry } from '../core/types';
import { EntryStatus } from '../core/config';
import { PageHeader } from '../components/ui/PageHeader';
import { PaymentRow } from '../components/warranty/PaymentRow';
import { 
  Search, 
  Calendar, 
  Building2, 
  TrendingUp, 
  PieChart, 
  Euro,
  Filter,
  X,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import * as XLSX from 'xlsx';

export const WarrantyPaymentsView: React.FC<{ label: string }> = ({ label }) => {
  const entries = useStore(s => s.entries);
  const settings = useStore(s => s.settings);

  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(50);

  const isFiltered = companyFilter !== 'ALL' || startDate !== '' || endDate !== '';

  const filteredEntries = useMemo(() => {
    // Default: Empty if no filters
    if (!isFiltered) return [];

    return entries.filter(e => {
      // Only Paid entries
      if (!e.isPaid) return false;

      // Filter by Company
      if (companyFilter !== 'ALL' && e.company !== companyFilter) return false;

      // Filter by Date
      if (startDate && e.createdAt < new Date(startDate).getTime()) return false;
      if (endDate && e.createdAt > new Date(endDate).getTime() + 86400000) return false;

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          e.warrantyId.toLowerCase().includes(q) ||
          e.vin.toLowerCase().includes(q) ||
          e.fullName.toLowerCase().includes(q) ||
          e.brand.toLowerCase().includes(q)
        );
      }

      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [entries, companyFilter, startDate, endDate, searchQuery, isFiltered]);

  // Statistics
  const stats = useMemo(() => {
    const byCompany: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    let total = 0;

    // We calculate stats based on ALL COMPLETED entries, or just filtered?
    // The user said: "στατιστικα ανα εταιρια και μηνα π.χ για το τι εβγαλε σαν € απο τις εγγυησεις"
    // Usually stats are for the filtered set or for the whole year.
    // Let's use the filtered entries for stats if filtered, otherwise all paid.
    const entriesForStats = isFiltered ? filteredEntries : entries.filter(e => e.isPaid);

    entriesForStats.forEach(e => {
      const amount = e.paymentAmount || 0;
      total += amount;

      // By Company
      const company = e.company || 'ΑΛΛΟ';
      byCompany[company] = (byCompany[company] || 0) + amount;

      // By Month (Using paidAt if available, otherwise createdAt)
      const date = new Date(e.paidAt || e.createdAt);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + amount;
    });

    return {
      total,
      byCompany: Object.entries(byCompany).sort((a, b) => b[1] - a[1]),
      byMonth: Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]))
    };
  }, [entries, filteredEntries, isFiltered]);

  const clearFilters = () => {
    setCompanyFilter('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const exportToExcel = () => {
    if (filteredEntries.length === 0) return;

    const data = filteredEntries.map(e => ({
      'ΗΜ. ΚΑΤΑΧΩΡΗΣΗΣ': new Date(e.createdAt).toLocaleDateString('el-GR'),
      'ΗΜ. ΠΛΗΡΩΜΗΣ': e.paidAt ? new Date(e.paidAt).toLocaleDateString('el-GR') : '-',
      'ΚΩΔΙΚΟΣ ΕΓΓΥΗΣΗΣ': e.warrantyId,
      'VIN': e.vin,
      'ΠΕΛΑΤΗΣ': e.fullName,
      'ΕΤΑΙΡΕΙΑ': e.company,
      'ΜΑΡΚΑ': e.brand,
      'ΠΟΣΟ ΠΛΗΡΩΜΗΣ (€)': e.paymentAmount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Πληρωμές");

    // Generate filename with current date
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Warranty_Payments_${dateStr}.xlsx`);
  };

  return (
    <div className="p-4 md:p-8 max-w-[98%] mx-auto space-y-10 pb-32">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="flex-1 space-y-8 w-full">
          <PageHeader 
            title={label} 
            subtitle={isFiltered ? `${filteredEntries.length} ΕΓΓΡΑΦΕΣ ΒΡΕΘΗΚΑΝ` : 'ΕΠΙΛΕΞΤΕ ΦΙΛΤΡΑ ΓΙΑ ΝΑ ΔΕΙΤΕ ΤΙΣ ΠΛΗΡΩΜΕΣ'} 
          />
          
          <div className="flex flex-wrap gap-4">
            {/* Company Filter */}
            <div className="flex items-center gap-3 bg-white border border-zinc-100 rounded-[1.5rem] px-6 py-4 shadow-sm min-w-[240px]">
              <Building2 size={16} className="text-zinc-400" />
              <select 
                value={companyFilter} 
                onChange={e => setCompanyFilter(e.target.value)} 
                className="flex-1 text-[11px] font-black uppercase outline-none bg-transparent cursor-pointer"
              >
                <option value="ALL">ΟΛΕΣ ΟΙ ΕΤΑΙΡΕΙΕΣ</option>
                {Object.keys(settings?.companyBrandMap || {}).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-3 bg-white border border-zinc-100 rounded-[1.5rem] px-6 py-4 shadow-sm">
               <Calendar size={16} className="text-zinc-400" />
               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-[11px] font-bold outline-none bg-transparent uppercase" />
               <span className="text-zinc-300">—</span>
               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-[11px] font-bold outline-none bg-transparent uppercase" />
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[300px] group">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
              <input 
                type="text" 
                placeholder="ΑΝΑΖΗΤΗΣΗ..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full pl-14 pr-6 py-4 bg-white border border-zinc-100 rounded-[1.5rem] text-[11px] font-bold outline-none shadow-sm focus:ring-4 focus:ring-zinc-50 focus:border-zinc-200 transition-all placeholder:text-zinc-300" 
              />
            </div>

            {isFiltered && (
              <Button variant="neutral" onClick={clearFilters} icon={X} className="rounded-[1.5rem] px-6">
                ΚΑΘΑΡΙΣΜΟΣ
              </Button>
            )}
          </div>
        </div>

        {/* Total Stats Card */}
        <div className="bg-zinc-900 text-white rounded-[2rem] p-8 min-w-[300px] shadow-2xl shadow-zinc-900/20 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
          <div className="relative z-10 space-y-2">
            <div className="text-[10px] font-black tracking-[0.2em] opacity-50 uppercase">ΣΥΝΟΛΙΚΑ ΕΣΟΔΑ</div>
            <div className="text-4xl font-black tracking-tighter flex items-center gap-2">
              <Euro size={32} className="text-blue-400" />
              {stats.total.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] font-bold opacity-40 uppercase">
              {isFiltered ? 'ΓΙΑ ΤΗΝ ΕΠΙΛΕΓΜΕΝΗ ΠΕΡΙΟΔΟ' : 'ΣΥΝΟΛΟ ΟΛΩΝ ΤΩΝ ΕΓΓΥΗΣΕΩΝ'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-zinc-100 overflow-hidden min-h-[500px]">
            <div className="px-8 py-6 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-zinc-400" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΛΙΣΤΑ ΠΛΗΡΩΜΩΝ</span>
              </div>
              {isFiltered && filteredEntries.length > 0 && (
                <Button 
                  variant="neutral" 
                  size="sm" 
                  onClick={exportToExcel}
                  icon={FileSpreadsheet}
                  className="rounded-xl text-[9px] h-8 px-4 border-zinc-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
                >
                  ΕΞΑΓΩΓΗ EXCEL
                </Button>
              )}
            </div>

            <div className="divide-y divide-zinc-50">
              <AnimatePresence mode="popLayout">
                {!isFiltered ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-40 flex flex-col items-center justify-center text-zinc-300"
                  >
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                      <Filter size={32} strokeWidth={1} className="opacity-20" />
                    </div>
                    <div className="font-black uppercase tracking-[0.2em] text-xs italic text-center max-w-xs">
                      ΕΠΙΛΕΞΤΕ ΕΤΑΙΡΕΙΑ Η ΗΜΕΡΟΜΗΝΙΑ ΓΙΑ ΝΑ ΕΜΦΑΝΙΣΤΟΥΝ ΟΙ ΕΓΓΥΗΣΕΙΣ
                    </div>
                  </motion.div>
                ) : filteredEntries.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-40 flex flex-col items-center justify-center text-zinc-300"
                  >
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
                      <Search size={32} strokeWidth={1} className="opacity-20" />
                    </div>
                    <div className="font-black uppercase tracking-[0.2em] text-xs italic">ΔΕΝ ΒΡΕΘΗΚΑΝ ΠΛΗΡΩΜΕΝΕΣ ΕΓΓΥΗΣΕΙΣ</div>
                  </motion.div>
                ) : (
                  filteredEntries.slice(0, visibleLimit).map((entry) => (
                    <PaymentRow key={entry.id} entry={entry} />
                  ))
                )}
              </AnimatePresence>
            </div>

            {filteredEntries.length > visibleLimit && (
              <button 
                onClick={() => setVisibleLimit(prev => prev + 50)} 
                className="w-full py-8 text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] hover:bg-blue-50 transition-all border-t border-zinc-50 bg-white flex items-center justify-center gap-3"
              >
                <ChevronDown size={14} />
                ΦΟΡΤΩΣΗ ΠΕΡΙΣΣΟΤΕΡΩΝ
              </button>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-8">
          {/* Stats by Company */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-zinc-100 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <PieChart size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΑΝΑΛΥΣΗ</div>
                <div className="text-sm font-black text-zinc-900 uppercase">ΑΝΑ ΕΤΑΙΡΕΙΑ</div>
              </div>
            </div>

            <div className="space-y-6">
              {stats.byCompany.length > 0 ? stats.byCompany.map(([company, amount]) => (
                <div key={company} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-tight">{company}</span>
                    <span className="text-[13px] font-black text-zinc-900">{amount.toLocaleString('el-GR')}€</span>
                  </div>
                  <div className="h-2 bg-zinc-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(amount / (stats.total || 1)) * 100}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              )) : (
                <div className="text-[10px] text-zinc-300 font-bold uppercase italic">ΔΕΝ ΥΠΑΡΧΟΥΝ ΔΕΔΟΜΕΝΑ</div>
              )}
            </div>
          </div>

          {/* Stats by Month */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-zinc-100 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ΠΟΡΕΙΑ</div>
                <div className="text-sm font-black text-zinc-900 uppercase">ΑΝΑ ΜΗΝΑ</div>
              </div>
            </div>

            <div className="space-y-4">
              {stats.byMonth.length > 0 ? stats.byMonth.map(([month, amount]) => {
                const [year, m] = month.split('-');
                const monthName = new Date(parseInt(year), parseInt(m) - 1).toLocaleString('el-GR', { month: 'long' });
                return (
                  <div key={month} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                    <div>
                      <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{year}</div>
                      <div className="text-[11px] font-black text-zinc-900 uppercase">{monthName}</div>
                    </div>
                    <div className="text-[14px] font-black text-emerald-600">
                      +{amount.toLocaleString('el-GR')}€
                    </div>
                  </div>
                );
              }) : (
                <div className="text-[10px] text-zinc-300 font-bold uppercase italic">ΔΕΝ ΥΠΑΡΧΟΥΝ ΔΕΔΟΜΕΝΑ</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
