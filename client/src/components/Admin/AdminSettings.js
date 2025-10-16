import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Shield,
  Bell,
  Database,
  Globe,
  Mail,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Referus.co',
    siteDescription: 'Professional referral management platform',
    contactEmail: 'admin@referralhub.com',
    supportEmail: 'support@referralhub.com',
    
    // Commission Settings
    defaultCommissionRate: 5.0,
    maxCommissionRate: 10.0,
    minCommissionRate: 0.5,
    
    // Notification Settings
    emailNotifications: true,
    newLeadNotifications: true,
    withdrawalNotifications: true,
    weeklyReports: true,
    
    // Security Settings
    requireEmailVerification: true,
    allowSelfRegistration: true,
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info'
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Mock API call - in production, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        siteName: 'Referus.co',
        siteDescription: 'Professional referral management platform',
        contactEmail: 'admin@referralhub.com',
        supportEmail: 'support@referralhub.com',
        defaultCommissionRate: 5.0,
        maxCommissionRate: 10.0,
        minCommissionRate: 0.5,
        emailNotifications: true,
        newLeadNotifications: true,
        withdrawalNotifications: true,
        weeklyReports: true,
        requireEmailVerification: true,
        allowSelfRegistration: true,
        maxLoginAttempts: 5,
        sessionTimeout: 24,
        maintenanceMode: false,
        debugMode: false,
        logLevel: 'info'
      });
      toast.success('Settings reset to defaults');
    }
  };

  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Icon className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );

  const SettingField = ({ label, type = 'text', value, onChange, options, helpText }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">{label}</label>
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}
      {helpText && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={resetToDefaults}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="spinner-small mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </button>
        </div>
      </div>

      {/* General Settings */}
      <SettingSection title="General Settings" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingField
            label="Site Name"
            value={settings.siteName}
            onChange={(value) => handleInputChange('general', 'siteName', value)}
            helpText="The name displayed on the website"
          />
          <SettingField
            label="Site Description"
            value={settings.siteDescription}
            onChange={(value) => handleInputChange('general', 'siteDescription', value)}
            helpText="Brief description of the platform"
          />
          <SettingField
            label="Contact Email"
            type="email"
            value={settings.contactEmail}
            onChange={(value) => handleInputChange('general', 'contactEmail', value)}
            helpText="Primary contact email for the platform"
          />
          <SettingField
            label="Support Email"
            type="email"
            value={settings.supportEmail}
            onChange={(value) => handleInputChange('general', 'supportEmail', value)}
            helpText="Support email for user inquiries"
          />
        </div>
      </SettingSection>

      {/* Commission Settings */}
      <SettingSection title="Commission Settings" icon={DollarSign}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SettingField
            label="Default Commission Rate (%)"
            type="number"
            value={settings.defaultCommissionRate}
            onChange={(value) => handleInputChange('commission', 'defaultCommissionRate', parseFloat(value))}
            helpText="Default commission rate for new leads"
          />
          <SettingField
            label="Minimum Commission Rate (%)"
            type="number"
            value={settings.minCommissionRate}
            onChange={(value) => handleInputChange('commission', 'minCommissionRate', parseFloat(value))}
            helpText="Minimum allowed commission rate"
          />
          <SettingField
            label="Maximum Commission Rate (%)"
            type="number"
            value={settings.maxCommissionRate}
            onChange={(value) => handleInputChange('commission', 'maxCommissionRate', parseFloat(value))}
            helpText="Maximum allowed commission rate"
          />
        </div>
      </SettingSection>

      {/* Notification Settings */}
      <SettingSection title="Notification Settings" icon={Bell}>
        <div className="space-y-4">
          <SettingField
            label="Enable Email Notifications"
            type="checkbox"
            value={settings.emailNotifications}
            onChange={(value) => handleInputChange('notifications', 'emailNotifications', value)}
            helpText="Send email notifications for important events"
          />
          <SettingField
            label="New Lead Notifications"
            type="checkbox"
            value={settings.newLeadNotifications}
            onChange={(value) => handleInputChange('notifications', 'newLeadNotifications', value)}
            helpText="Notify admin when new leads are submitted"
          />
          <SettingField
            label="Withdrawal Notifications"
            type="checkbox"
            value={settings.withdrawalNotifications}
            onChange={(value) => handleInputChange('notifications', 'withdrawalNotifications', value)}
            helpText="Notify admin when withdrawal requests are made"
          />
          <SettingField
            label="Weekly Reports"
            type="checkbox"
            value={settings.weeklyReports}
            onChange={(value) => handleInputChange('notifications', 'weeklyReports', value)}
            helpText="Send weekly summary reports to admin"
          />
        </div>
      </SettingSection>

      {/* Security Settings */}
      <SettingSection title="Security Settings" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingField
            label="Require Email Verification"
            type="checkbox"
            value={settings.requireEmailVerification}
            onChange={(value) => handleInputChange('security', 'requireEmailVerification', value)}
            helpText="Require users to verify their email addresses"
          />
          <SettingField
            label="Allow Self Registration"
            type="checkbox"
            value={settings.allowSelfRegistration}
            onChange={(value) => handleInputChange('security', 'allowSelfRegistration', value)}
            helpText="Allow users to register accounts themselves"
          />
          <SettingField
            label="Maximum Login Attempts"
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(value) => handleInputChange('security', 'maxLoginAttempts', parseInt(value))}
            helpText="Number of failed login attempts before account lockout"
          />
          <SettingField
            label="Session Timeout (hours)"
            type="number"
            value={settings.sessionTimeout}
            onChange={(value) => handleInputChange('security', 'sessionTimeout', parseInt(value))}
            helpText="How long user sessions remain active"
          />
        </div>
      </SettingSection>

      {/* System Settings */}
      <SettingSection title="System Settings" icon={Database}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingField
            label="Maintenance Mode"
            type="checkbox"
            value={settings.maintenanceMode}
            onChange={(value) => handleInputChange('system', 'maintenanceMode', value)}
            helpText="Put the site in maintenance mode"
          />
          <SettingField
            label="Debug Mode"
            type="checkbox"
            value={settings.debugMode}
            onChange={(value) => handleInputChange('system', 'debugMode', value)}
            helpText="Enable debug logging and error details"
          />
          <SettingField
            label="Log Level"
            type="select"
            value={settings.logLevel}
            onChange={(value) => handleInputChange('system', 'logLevel', value)}
            options={[
              { value: 'error', label: 'Error' },
              { value: 'warn', label: 'Warning' },
              { value: 'info', label: 'Info' },
              { value: 'debug', label: 'Debug' }
            ]}
            helpText="Level of detail in system logs"
          />
        </div>
      </SettingSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? (
            <div className="spinner-small mr-2"></div>
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
