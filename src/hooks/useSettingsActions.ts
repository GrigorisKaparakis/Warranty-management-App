import { useStore } from '../store/useStore';
import { GarageSettings, MenuItem, StatusConfig, UserRole, DistributorRule, AppBranding } from '../core/types';
import { FirestoreService } from '../services/firebase/db';
import { toast } from '../utils/toast';
import { UI_MESSAGES } from '../core/config';

/**
 * useSettingsActions: Custom hook που παρέχει μεθόδους για την ενημέρωση των ρυθμίσεων
 * του συνεργείου στο Firestore.
 */
export const useSettingsActions = () => {
  const settings = useStore(s => s.settings);

  const updateGarageSettings = async (updates: Partial<GarageSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      await FirestoreService.updateSettings(newSettings);
      toast.success(UI_MESSAGES.SUCCESS.SETTINGS_UPDATED);
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error(UI_MESSAGES.ERRORS.SETTINGS_UPDATE_FAILED);
      return false;
    }
  };

  const updateBranding = (branding: AppBranding) => 
    updateGarageSettings({ branding });

  const updateMenu = (menuConfig: MenuItem[]) => 
    updateGarageSettings({ menuConfig });

  const updateStatuses = (statusConfigs: Record<string, StatusConfig>) => 
    updateGarageSettings({ statusConfigs });

  const updateRoles = (availableRoles: string[]) => 
    updateGarageSettings({ availableRoles });

  const updatePermissions = (rolePermissions: Record<string, UserRole[]>) => 
    updateGarageSettings({ rolePermissions });

  const updateAiPrompts = (aiPrompts: { pdfExtraction?: string; botInstructions?: string }) => 
    updateGarageSettings({ aiPrompts });

  const updateDistributorRules = (distributorRules: DistributorRule[]) => 
    updateGarageSettings({ distributorRules });

  const updateExpiryRules = (companyExpiryRules: Record<string, string>) => 
    updateGarageSettings({ companyExpiryRules });

  const updateCompanyBrandMap = (companyBrandMap: Record<string, string[]>) => 
    updateGarageSettings({ companyBrandMap });

  return {
    updateGarageSettings,
    updateBranding,
    updateMenu,
    updateStatuses,
    updateRoles,
    updatePermissions,
    updateAiPrompts,
    updateDistributorRules,
    updateExpiryRules,
    updateCompanyBrandMap
  };
};
