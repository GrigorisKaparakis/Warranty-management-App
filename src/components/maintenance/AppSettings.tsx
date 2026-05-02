import React, { useState, useCallback } from 'react';
import { MenuItem, UserRole, StatusConfig, GarageSettings } from '../../core/types';
import { ONBOARDING_DEFAULTS } from '../../core/config';
import { useStore } from '../../store/useStore';
import { useSettingsActions } from '../../hooks/useSettingsActions';
import { StatusSettings } from './settings/StatusSettings';
import { MenuSettings } from './settings/MenuSettings';
import { CompanySettings } from './settings/CompanySettings';
import { BrandingSettings } from './settings/BrandingSettings';
import { PerformanceSettings } from './settings/PerformanceSettings';
import { ThresholdSettings } from './settings/ThresholdSettings';
import { FeatureSettings } from './settings/FeatureSettings';

interface AppSettingsProps {
  activeTab: string;
}

/**
 * AppSettings: Διαχειρίζεται τις βασικές ρυθμίσεις της εφαρμογής, όπως το μενού,
 * τις καταστάσεις (workflow), τις εταιρείες και τα όρια του συστήματος.
 */
export const AppSettings: React.FC<AppSettingsProps> = ({ activeTab }) => {
  const settings = useStore(s => s?.settings);
  const { updateGarageSettings } = useSettingsActions();

  // --- LOCAL STATE FOR BUFFERED UPDATES ---
  const [localBranding, setLocalBranding] = useState(settings.branding);
  const [localLimits, setLocalLimits] = useState(settings.limits);
  const [localThresholds, setLocalThresholds] = useState(settings.expiryThresholds);
  const [localStatuses, setLocalStatuses] = useState(settings.statusConfigs);
  const [localStatusOrder, setLocalStatusOrder] = useState(settings.statusOrder);
  const [localMenu, setLocalMenu] = useState(settings.menuConfig);
  const [localCompanyMap, setLocalCompanyMap] = useState(settings.companyBrandMap);
  const [localExpiryRules, setLocalExpiryRules] = useState(settings.companyExpiryRules);
  const [localChatEnabled, setLocalChatEnabled] = useState(settings.chatEnabled ?? true);

  const [isDirty, setIsDirty] = useState<Record<string, boolean>>({});

  // Sync local state when global settings change (if not dirty)
  React.useEffect(() => {
    if (!isDirty.app_label) setLocalBranding(settings.branding);
  }, [settings.branding, isDirty.app_label]);

  React.useEffect(() => {
    if (!isDirty.app_limits) setLocalLimits(settings.limits);
  }, [settings.limits, isDirty.app_limits]);

  React.useEffect(() => {
    if (!isDirty.expiry_thresholds) setLocalThresholds(settings.expiryThresholds);
  }, [settings.expiryThresholds, isDirty.expiry_thresholds]);

  React.useEffect(() => {
    if (!isDirty.status) {
      setLocalStatuses(settings.statusConfigs);
      setLocalStatusOrder(settings.statusOrder);
    }
  }, [settings.statusConfigs, settings.statusOrder, isDirty.status]);

  React.useEffect(() => {
    if (!isDirty.menu) setLocalMenu(settings.menuConfig);
  }, [settings.menuConfig, isDirty.menu]);

  React.useEffect(() => {
    if (!isDirty.companies) {
      setLocalCompanyMap(settings.companyBrandMap);
      setLocalExpiryRules(settings.companyExpiryRules);
    }
  }, [settings.companyBrandMap, settings.companyExpiryRules, isDirty.companies]);

  React.useEffect(() => {
    if (!isDirty.features) setLocalChatEnabled(settings.chatEnabled ?? true);
  }, [settings.chatEnabled, isDirty.features]);

  if (!['companies', 'status', 'menu', 'app_label', 'dashboard', 'app_limits', 'expiry_thresholds', 'feature_toggles'].includes(activeTab)) return null;

  const availableRoles = settings?.availableRoles || ONBOARDING_DEFAULTS.DEFAULT_ROLES;

  // --- SAVE HANDLERS ---
  const saveSection = async (section: string) => {
    let updates: Partial<GarageSettings> = {};

    if (section === 'app_label') updates = { branding: localBranding };
    if (section === 'app_limits') updates = { limits: localLimits };
    if (section === 'expiry_thresholds') updates = { expiryThresholds: localThresholds };
    if (section === 'status') updates = { statusConfigs: localStatuses, statusOrder: localStatusOrder };
    if (section === 'menu') updates = { menuConfig: localMenu };
    if (section === 'companies') updates = { companyBrandMap: localCompanyMap, companyExpiryRules: localExpiryRules };
    if (section === 'features') updates = { chatEnabled: localChatEnabled };

    const success = await updateGarageSettings(updates);
    if (success) {
      setIsDirty(prev => ({ ...prev, [section]: false }));
    }
  };

  const cancelSection = useCallback((section: string) => {
    if (section === 'app_label') setLocalBranding(settings.branding);
    if (section === 'app_limits') setLocalLimits(settings.limits);
    if (section === 'expiry_thresholds') setLocalThresholds(settings.expiryThresholds);
    if (section === 'status') {
      setLocalStatuses(settings.statusConfigs);
      setLocalStatusOrder(settings.statusOrder);
    }
    if (section === 'menu') setLocalMenu(settings.menuConfig);
    if (section === 'companies') {
      setLocalCompanyMap(settings.companyBrandMap);
      setLocalExpiryRules(settings.companyExpiryRules);
    }
    if (section === 'features') setLocalChatEnabled(settings.chatEnabled ?? true);
    setIsDirty(prev => ({ ...prev, [section]: false }));
  }, [settings]);

  // --- HANDLERS (Memoized for sub-components) ---

  const handleUpdateMenuItem = useCallback((itemId: string, field: string, value: any) => {
    setLocalMenu(prev => (prev || []).map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
    setIsDirty(prev => ({ ...prev, menu: true }));
  }, []);

  const handleAddMenuItem = useCallback((item: MenuItem) => {
    setLocalMenu(prev => [...(prev || []), item]);
    setIsDirty(prev => ({ ...prev, menu: true }));
  }, []);

  const handleDeleteMenuItem = useCallback((itemId: string) => {
    setLocalMenu(prev => (prev || []).filter(m => m.id !== itemId));
    setIsDirty(prev => ({ ...prev, menu: true }));
  }, []);

  const handleMoveMenu = useCallback((itemId: string, direction: 'up' | 'down') => {
    setLocalMenu(prev => {
      const updated = [...(prev || [])];
      const idx = updated.findIndex(m => m.id === itemId);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= updated.length) return prev;
      [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
      return updated;
    });
    setIsDirty(prev => ({ ...prev, menu: true }));
  }, []);

  const handleResetMenu = useCallback(() => {
    const { DEFAULT_MENU } = require('../../core/config');
    setLocalMenu(DEFAULT_MENU as MenuItem[]);
    setIsDirty(prev => ({ ...prev, menu: true }));
  }, []);

  const handleUpdateStatus = useCallback((statusKey: string, field: keyof StatusConfig, value: any) => {
    setLocalStatuses(prev => ({
      ...prev,
      [statusKey]: {
        ...prev[statusKey],
        [field]: value
      }
    }));
    setIsDirty(prev => ({ ...prev, status: true }));
  }, []);

  const handleToggleStatusRole = useCallback((statusKey: string, role: UserRole) => {
    setLocalStatuses(prev => {
      const roles = [...(prev[statusKey]?.allowedRoles || [])];
      const idx = roles.indexOf(role);
      if (idx > -1) roles.splice(idx, 1); else roles.push(role);
      return {
        ...prev,
        [statusKey]: { ...prev[statusKey], allowedRoles: roles }
      };
    });
    setIsDirty(prev => ({ ...prev, status: true }));
  }, []);

  const handleAddStatus = useCallback((key: string) => {
    const formattedKey = key.trim().toUpperCase().replace(/\s/g, '_');
    setLocalStatuses(prev => ({
      ...prev,
      [formattedKey]: { label: formattedKey, color: '#64748b', allowedRoles: [] }
    }));
    setLocalStatusOrder(prev => [...prev, formattedKey]);
    setIsDirty(prev => ({ ...prev, status: true }));
  }, []);

  const handleDeleteStatus = useCallback((key: string) => {
    setLocalStatuses(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setLocalStatusOrder(prev => prev.filter(k => k !== key));
    setIsDirty(prev => ({ ...prev, status: true }));
  }, []);

  const handleMoveStatus = useCallback((statusKey: string, direction: 'up' | 'down') => {
    setLocalStatusOrder(prev => {
      const currentOrder = [...prev];
      const idx = currentOrder.indexOf(statusKey);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= currentOrder.length) return prev;
      [currentOrder[idx], currentOrder[newIdx]] = [currentOrder[newIdx], currentOrder[idx]];
      return currentOrder;
    });
    setIsDirty(prev => ({ ...prev, status: true }));
  }, []);

  const handleUpdateCompanies = useCallback((company: string, brands: string[]) => {
    setLocalCompanyMap(prev => ({ ...prev, [company]: brands }));
    setIsDirty(prev => ({ ...prev, companies: true }));
  }, []);

  const handleUpdateExpiryRules = useCallback((company: string, rule: string) => {
    setLocalExpiryRules(prev => ({ ...prev, [company]: rule }));
    setIsDirty(prev => ({ ...prev, companies: true }));
  }, []);

  const handleAddCompany = useCallback((company: string) => {
    setLocalCompanyMap(prev => ({ ...prev, [company]: [] }));
    setIsDirty(prev => ({ ...prev, companies: true }));
  }, []);

  const handleRemoveCompany = useCallback((company: string) => {
    setLocalCompanyMap(prev => {
      const newMap = { ...prev };
      delete newMap[company];
      return newMap;
    });
    setLocalExpiryRules(prev => {
      const newRules = { ...prev };
      delete newRules[company];
      return newRules;
    });
    setIsDirty(prev => ({ ...prev, companies: true }));
  }, []);

  const handleUpdateBranding = useCallback((field: string, value: string) => {
    setLocalBranding(prev => ({ ...prev, [field]: value }));
    setIsDirty(prev => ({ ...prev, app_label: true }));
  }, []);

  const handleUpdateLimits = useCallback((key: string, value: number) => {
    setLocalLimits(prev => ({ ...prev, [key]: value }));
    setIsDirty(prev => ({ ...prev, app_limits: true }));
  }, []);

  const handleUpdateThresholds = useCallback((key: string, value: number) => {
    setLocalThresholds(prev => ({
      ...(prev || { warningDays: 10, criticalDays: 7, soonDays: 30 }),
      [key]: value
    }));
    setIsDirty(prev => ({ ...prev, expiry_thresholds: true }));
  }, []);

  const handleUpdateChatStatus = useCallback((enabled: boolean) => {
    setLocalChatEnabled(enabled);
    setIsDirty(prev => ({ ...prev, features: true }));
  }, []);

  return (
    <div className="animate-slide-up space-y-6">
      {activeTab === 'status' && (
        <StatusSettings
          localStatuses={localStatuses}
          localStatusOrder={localStatusOrder}
          availableRoles={availableRoles}
          isDirty={!!isDirty.status}
          onUpdateStatus={handleUpdateStatus}
          onToggleStatusRole={handleToggleStatusRole}
          onAddStatus={handleAddStatus}
          onDeleteStatus={handleDeleteStatus}
          onMoveStatus={handleMoveStatus}
          onSave={() => saveSection('status')}
          onCancel={() => cancelSection('status')}
          settings={settings}
        />
      )}

      {activeTab === 'menu' && (
        <MenuSettings
          localMenu={localMenu}
          localStatuses={localStatuses}
          isDirty={!!isDirty.menu}
          onUpdateMenuItem={handleUpdateMenuItem}
          onAddMenuItem={handleAddMenuItem}
          onDeleteMenuItem={handleDeleteMenuItem}
          onMoveMenu={handleMoveMenu}
          onResetMenu={handleResetMenu}
          onSave={() => saveSection('menu')}
          onCancel={() => cancelSection('menu')}
        />
      )}

      {activeTab === 'companies' && (
        <CompanySettings
          localCompanyMap={localCompanyMap}
          localExpiryRules={localExpiryRules}
          isDirty={!!isDirty.companies}
          onUpdateCompanies={handleUpdateCompanies}
          onUpdateExpiryRules={handleUpdateExpiryRules}
          onAddCompany={handleAddCompany}
          onRemoveCompany={handleRemoveCompany}
          onSave={() => saveSection('companies')}
          onCancel={() => cancelSection('companies')}
        />
      )}

      {activeTab === 'app_label' && (
        <BrandingSettings
          localBranding={localBranding}
          isDirty={!!isDirty.app_label}
          onUpdateBranding={handleUpdateBranding}
          onSave={() => saveSection('app_label')}
          onCancel={() => cancelSection('app_label')}
        />
      )}

      {activeTab === 'app_limits' && (
        <PerformanceSettings
          localLimits={localLimits}
          isDirty={!!isDirty.app_limits}
          onUpdateLimits={handleUpdateLimits}
          onSave={() => saveSection('app_limits')}
          onCancel={() => cancelSection('app_limits')}
        />
      )}

      {activeTab === 'expiry_thresholds' && (
        <ThresholdSettings
          localThresholds={localThresholds}
          isDirty={!!isDirty.expiry_thresholds}
          onUpdateThresholds={handleUpdateThresholds}
          onSave={() => saveSection('expiry_thresholds')}
          onCancel={() => cancelSection('expiry_thresholds')}
        />
      )}

      {activeTab === 'feature_toggles' && (
        <FeatureSettings
          localChatEnabled={localChatEnabled}
          isDirty={!!isDirty.features}
          onUpdateChatStatus={handleUpdateChatStatus}
          onSave={() => saveSection('features')}
          onCancel={() => cancelSection('features')}
        />
      )}
    </div>
  );
};
