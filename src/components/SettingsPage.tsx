'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  Key,
  Database,
  Cloud,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [loadingHealth, setLoadingHealth] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      analysisComplete: true,
      reportNotifications: true,
      securityAlerts: true
    },
    privacy: {
      dataRetention: '1-year',
      shareWithPartners: false,
      anonymousAnalytics: true
    },
    storage: {
      autoBackup: true,
      encryptionLevel: 'AES-256',
      storageLocation: 'pinata-ipfs'
    }
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'storage', label: 'Data Storage', icon: Database },
    { id: 'api', label: 'API Access', icon: Key }
  ]

  useEffect(() => {
    if (activeTab === 'storage') {
      checkHealthStatus()
    }
  }, [activeTab])

  const checkHealthStatus = async () => {
    setLoadingHealth(true)
    try {
      const response = await fetch('/api/health')
      const health = await response.json()
      setHealthStatus(health)
    } catch (error) {
      console.error('Failed to check health status:', error)
      setHealthStatus({ status: 'error', message: 'Failed to check system health' })
    } finally {
      setLoadingHealth(false)
    }
  }

  const syncData = async () => {
    try {
      toast.loading('Synchronizing data...', { id: 'sync-data' })
      
      const response = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Data synchronized successfully!', { id: 'sync-data' })
        checkHealthStatus() // Refresh health status
      } else {
        toast.error('Data synchronization failed', { id: 'sync-data' })
      }
    } catch (error) {
      toast.error('Failed to synchronize data', { id: 'sync-data' })
    }
  }

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }))
  }

  const saveSettings = async () => {
    try {
      toast.loading('Saving settings...', { id: 'save-settings' })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Settings saved successfully!', { id: 'save-settings' })
    } catch (error) {
      toast.error('Failed to save settings. Please try again.', { id: 'save-settings' })
    }
  }

  const exportData = async () => {
    try {
      toast.loading('Preparing data export...', { id: 'export-data' })
      
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const exportData = {
        user: {
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          exportDate: new Date().toISOString()
        },
        settings: settings,
        analysisHistory: 'Available in full export'
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `luxehealth-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Data exported successfully!', { id: 'export-data' })
    } catch (error) {
      toast.error('Failed to export data. Please try again.', { id: 'export-data' })
    }
  }

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not available in demo mode.')
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="luxury-card">
        <h3 className="text-xl font-semibold text-luxury-navy mb-6">Profile Information</h3>
        
        <div className="flex items-center space-x-6 mb-6">
          <img
            src={user?.imageUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h4 className="text-lg font-semibold text-luxury-navy">{user?.fullName}</h4>
            <p className="text-gray-600">{user?.primaryEmailAddress?.emailAddress}</p>
            <button className="text-luxury-gold hover:text-luxury-navy transition-colors text-sm mt-1">
              Change Photo
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-luxury-navy mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={user?.fullName || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-luxury-navy mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={user?.primaryEmailAddress?.emailAddress || ''}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
              readOnly
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Profile managed by Clerk</p>
              <p className="text-sm text-blue-600">
                To update your profile information, please use the Clerk user management system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="luxury-card">
        <h3 className="text-xl font-semibold text-luxury-navy mb-6">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-luxury-navy">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-luxury-navy">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-luxury-navy">Analysis Complete</h4>
              <p className="text-sm text-gray-600">Notify when AI analysis is completed</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.analysisComplete}
                onChange={(e) => handleSettingChange('notifications', 'analysisComplete', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-luxury-navy">Appointment Reminders</h4>
              <p className="text-sm text-gray-600">Notify about new reports and analysis updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.reportNotifications}
                onChange={(e) => handleSettingChange('notifications', 'reportNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-luxury-navy">Security Alerts</h4>
              <p className="text-sm text-gray-600">Important security notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.securityAlerts}
                onChange={(e) => handleSettingChange('notifications', 'securityAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div className="luxury-card">
        <h3 className="text-xl font-semibold text-luxury-navy mb-6">Privacy & Security Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-luxury-navy mb-2">
              Data Retention Period
            </label>
            <select
              value={settings.privacy.dataRetention}
              onChange={(e) => handleSettingChange('privacy', 'dataRetention', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
            >
              <option value="6-months">6 Months</option>
              <option value="1-year">1 Year</option>
              <option value="2-years">2 Years</option>
              <option value="5-years">5 Years</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-luxury-navy">Share with Healthcare Partners</h4>
              <p className="text-sm text-gray-600">Allow sharing anonymized data with trusted healthcare partners</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.shareWithPartners}
                onChange={(e) => handleSettingChange('privacy', 'shareWithPartners', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-luxury-navy">Anonymous Analytics</h4>
              <p className="text-sm text-gray-600">Help improve our AI by sharing anonymous usage data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.anonymousAnalytics}
                onChange={(e) => handleSettingChange('privacy', 'anonymousAnalytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="luxury-card">
        <h3 className="text-xl font-semibold text-luxury-navy mb-6">Data Management</h3>
        
        <div className="space-y-4">
          <button
            onClick={exportData}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-luxury-gold text-luxury-navy font-semibold rounded-lg hover:bg-luxury-gold hover:text-white transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span>Export My Data</span>
          </button>

          <button
            onClick={deleteAccount}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderStorageTab = () => (
    <div className="space-y-6">
      <div className="luxury-card">
        <h3 className="text-xl font-semibold text-luxury-navy mb-6">Data Storage Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-luxury-navy">Automatic Backup</h4>
              <p className="text-sm text-gray-600">Automatically backup analysis data to IPFS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.storage.autoBackup}
                onChange={(e) => handleSettingChange('storage', 'autoBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-luxury-navy mb-2">
              Encryption Level
            </label>
            <select
              value={settings.storage.encryptionLevel}
              onChange={(e) => handleSettingChange('storage', 'encryptionLevel', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
            >
              <option value="AES-128">AES-128 (Standard)</option>
              <option value="AES-256">AES-256 (High Security)</option>
              <option value="AES-512">AES-512 (Maximum Security)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-luxury-navy mb-2">
              Primary Storage Location
            </label>
            <select
              value={settings.storage.storageLocation}
              onChange={(e) => handleSettingChange('storage', 'storageLocation', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
            >
              <option value="pinata-ipfs">Pinata IPFS (Recommended)</option>
              <option value="mongodb-only">MongoDB Only</option>
              <option value="hybrid">Hybrid (IPFS + MongoDB)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 font-medium">Secure Storage Active</p>
              <p className="text-sm text-green-600">
                Your data is encrypted and stored securely using {settings.storage.encryptionLevel} encryption.
              </p>
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <div className="mt-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-luxury-navy">System Health Status</h4>
            <button
              onClick={checkHealthStatus}
              disabled={loadingHealth}
              className="px-3 py-1 text-sm bg-luxury-gold text-white rounded hover:bg-luxury-gold/90 transition-colors disabled:opacity-50"
            >
              {loadingHealth ? 'Checking...' : 'Refresh'}
            </button>
          </div>
          
          {healthStatus && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pinata IPFS</span>
                <div className={`flex items-center space-x-2 ${healthStatus.services?.pinata ? 'text-green-600' : 'text-red-600'}`}>
                  {healthStatus.services?.pinata ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm">{healthStatus.services?.pinata ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">MongoDB</span>
                <div className={`flex items-center space-x-2 ${healthStatus.services?.mongodb ? 'text-green-600' : 'text-red-600'}`}>
                  {healthStatus.services?.mongodb ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm">{healthStatus.services?.mongodb ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={syncData}
                  className="w-full px-4 py-2 bg-luxury-navy text-white rounded-lg hover:bg-luxury-navy/90 transition-colors text-sm"
                >
                  Sync Data Between Systems
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderApiTab = () => (
    <div className="space-y-6">
      <div className="luxury-card">
        <h3 className="text-xl font-semibold text-luxury-navy mb-6">API Access</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-luxury-navy mb-2">
              API Key
            </label>
            <div className="flex space-x-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value="lha_demo_key_1234567890abcdef"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                readOnly
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Use this API key to integrate LuxeHealth AI with your applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <button className="px-6 py-3 border-2 border-luxury-gold text-luxury-navy font-semibold rounded-lg hover:bg-luxury-gold hover:text-white transition-all duration-300">
              Regenerate Key
            </button>
            <button className="px-6 py-3 bg-luxury-navy text-white font-semibold rounded-lg hover:bg-luxury-navy/90 transition-colors">
              View Documentation
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">API Access Limits</p>
              <p className="text-sm text-yellow-600">
                Current plan allows 100 API calls per month. Upgrade for higher limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-luxury font-bold luxury-text-gradient mb-4">
            Settings
          </h1>
          <p className="text-xl text-gray-600">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="luxury-card p-0 overflow-hidden">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-6 py-4 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-luxury-gold/10 text-luxury-navy border-r-4 border-luxury-gold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'privacy' && renderPrivacyTab()}
              {activeTab === 'storage' && renderStorageTab()}
              {activeTab === 'api' && renderApiTab()}
            </motion.div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={saveSettings}
                className="luxury-button flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}