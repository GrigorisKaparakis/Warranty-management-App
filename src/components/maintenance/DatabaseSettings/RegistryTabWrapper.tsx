/**
 * RegistryTabWrapper.tsx: Generic Wrapper για τα tabs των μητρώων.
 * Παρέχει κοινή λειτουργικότητα για Συγχρονισμό, Αναζήτηση και Πίνακα Δεδομένων,
 * επιτρέποντας την επαναχρησιμοποίηση κώδικα (DRY).
 */
import React from 'react';
import { useRegistryEditor } from './hooks/useRegistryEditor';
import { SyncSection } from './SyncSection';
import { RegistryTable } from './RegistryTable';
import { RegistryRow } from './RegistryRow';

interface RegistryTabWrapperProps<T extends { id: string }> {
  items: T[];
  config: {
    onMigrate: (onProgress: (count: number) => void) => Promise<number>;
    onUpsert: (id: string, data: any) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    searchFields: (item: T) => string;
  };
  syncProps: {
    title: string;
    description: string;
    icon: any;
  };
  tableProps: {
    title: string;
    searchPlaceholder: string;
    headers: { label: string; width?: string; align?: 'left' | 'center' | 'right' }[];
  };
  getInitialEditData: (item: T) => any;
  saveIdField?: keyof T;
  renderCells: (
    item: T, 
    isEditing: boolean, 
    editData: any, 
    setEditData: (data: any) => void
  ) => React.ReactNode;
}

export function RegistryTabWrapper<T extends { id: string }>({
  items,
  config,
  syncProps,
  tableProps,
  getInitialEditData,
  saveIdField = 'id',
  renderCells
}: RegistryTabWrapperProps<T>) {
  const {
    search, setSearch,
    isMigrating, migrationCount, handleMigrate,
    editingId, editData, setEditData,
    handleEdit, handleCancel, handleSave, handleDelete,
    filteredItems
  } = useRegistryEditor<T>(items, config);

  return (
    <div>
      <SyncSection 
        title={syncProps.title}
        description={syncProps.description}
        isMigrating={isMigrating}
        migrationCount={migrationCount}
        onMigrate={handleMigrate}
        icon={syncProps.icon}
      />

      <RegistryTable 
        title={tableProps.title}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={tableProps.searchPlaceholder}
        itemCount={filteredItems.length}
        headers={tableProps.headers}
      >
        {filteredItems.map(item => (
          <RegistryRow
            key={item.id}
            id={item.id}
            isEditing={editingId === item.id}
            onEdit={() => handleEdit(item.id, getInitialEditData(item))}
            onDelete={config.onDelete ? () => handleDelete(item.id) : undefined}
            onSave={() => handleSave(item[saveIdField] as unknown as string)}
            onCancel={handleCancel}
          >
            {renderCells(item, editingId === item.id, editData, setEditData)}
          </RegistryRow>
        ))}
      </RegistryTable>
    </div>
  );
}
