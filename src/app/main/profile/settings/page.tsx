'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../app/components/layout/Navbar';
import Footer from '../../../../app/components/layout/Footer';
import { ArrowLeft, Save } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [notification, setNotification] = useState({
    email: true,
    app: true,
    newContent: true,
    updates: false
  });
  
  const [language, setLanguage] = useState('english');
  const [subtitle, setSubtitle] = useState('english');
  
  
  const handleSave = () => {
    // Simulate saving settings
    setTimeout(() => {
      alert('Settings saved successfully!');
    }, 500);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-24 pb-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => router.push('/main/profile')} 
            className="cursor-pointer flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2" size={16} />
            <span>Back to Profile</span>
          </button>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-gray-400">Receive updates via email</p>
              </div>
              <button 
                className={`w-12 h-6 rounded-full ${notification.email ? 'bg-red-600' : 'bg-gray-700'} relative`}
                onClick={() => setNotification({...notification, email: !notification.email})}
              >
                <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${notification.email ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div>
                <h3 className="font-medium">App Notifications</h3>
                <p className="text-sm text-gray-400">Receive in-app notifications</p>
              </div>
              <button 
                className={`w-12 h-6 rounded-full ${notification.app ? 'bg-red-600' : 'bg-gray-700'} relative`}
                onClick={() => setNotification({...notification, app: !notification.app})}
              >
                <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${notification.app ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div>
                <h3 className="font-medium">New Content Alerts</h3>
                <p className="text-sm text-gray-400">Get notified about new movies and shows</p>
              </div>
              <button 
                className={`w-12 h-6 rounded-full ${notification.newContent ? 'bg-red-600' : 'bg-gray-700'} relative`}
                onClick={() => setNotification({...notification, newContent: !notification.newContent})}
              >
                <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${notification.newContent ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <div>
                <h3 className="font-medium">Product Updates</h3>
                <p className="text-sm text-gray-400">Get notified about app updates and features</p>
              </div>
              <button 
                className={`w-12 h-6 rounded-full ${notification.updates ? 'bg-red-600' : 'bg-gray-700'} relative`}
                onClick={() => setNotification({...notification, updates: !notification.updates})}
              >
                <div className={`absolute w-4 h-4 rounded-full bg-white top-1 transition-all ${notification.updates ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Display & Language</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Interface Language</h3>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full md:w-1/3 bg-gray-800 border border-gray-700 rounded-md px-3 py-2"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="japanese">Japanese</option>
              </select>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Subtitle Language</h3>
              <select 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full md:w-1/3 bg-gray-800 border border-gray-700 rounded-md px-3 py-2"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="japanese">Japanese</option>
                <option value="off">Off</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium"
          >
            <Save className="mr-2" size={18} />
            Save Settings
          </button>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}