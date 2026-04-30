import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Save, Bell, Globe, Shield } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Local state for forms
  const [siteName, setSiteName] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
        const { data } = await axios.get('/api/settings', config);
        setSettings(data);
        
        // Map settings to local state
        const nameSetting = data.find(s => s.key === 'siteName');
        const maintSetting = data.find(s => s.key === 'maintenanceMode');
        const emailSetting = data.find(s => s.key === 'emailNotifications');
        
        if (nameSetting) setSiteName(nameSetting.value);
        if (maintSetting) setMaintenanceMode(maintSetting.value === 'true' || maintSetting.value === true);
        if (emailSetting) setEmailNotifications(emailSetting.value === 'true' || emailSetting.value === true);
        
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [currentUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      
      const savePromises = [
        axios.post('/api/settings', { key: 'siteName', value: siteName, description: 'Main title of the website' }, config),
        axios.post('/api/settings', { key: 'maintenanceMode', value: maintenanceMode.toString(), description: 'Toggle maintenance mode block' }, config),
        axios.post('/api/settings', { key: 'emailNotifications', value: emailNotifications.toString(), description: 'Global toggle for email notifications' }, config)
      ];

      await Promise.all(savePromises);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in">
      <Helmet>
        <title>Settings | Admin Panel</title>
        <meta name="description" content="Configure global site settings." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 mt-1">Manage core platform configurations and notifications.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-6 md:p-8 space-y-8">
            
            {/* General Settings */}
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
                <Globe size={20} className="text-blue-600" />
                General Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all" 
                    value={siteName} 
                    onChange={e => setSiteName(e.target.value)} 
                    placeholder="e.g. My Admin Dashboard"
                  />
                  <p className="text-xs text-gray-500 mt-1">This appears in the browser tab and emails.</p>
                </div>
              </div>
            </div>



            {/* Notification Settings */}
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
                <Bell size={20} className="text-amber-500" />
                Notification Preferences
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Send automatic emails when users are blocked or results are updated.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Security & Access */}
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 pb-2 border-b">
                <Shield size={20} className="text-red-500" />
                Security & Access
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                    <p className="text-sm text-gray-500">Prevent non-admins from logging in while you make updates.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>

          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
