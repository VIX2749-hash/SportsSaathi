import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { Onboarding } from './components/Onboarding';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { PartnerDiscovery } from './pages/PartnerDiscovery';
import { ActivityCatalog } from './pages/ActivityCatalog';
import { ActivityDetail } from './pages/ActivityDetail';
import { CreateActivity } from './pages/CreateActivity';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { ProfileSettings } from './pages/ProfileSettings';
import { SafetyHub } from './pages/SafetyHub';
import { SportsSpaces } from './pages/SportsSpaces';
import { EquipmentLibrary } from './pages/EquipmentLibrary';
import { MyBookings } from './pages/MyBookings';
import { Activity, Partner } from './types';
import { apiRequest } from './services/api';

export function App() {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Forced Onboarding for freshly registered user
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Initial landing page preview data
  const [previewActivities, setPreviewActivities] = useState<Activity[]>([]);
  const [previewPartners, setPreviewPartners] = useState<Partner[]>([]);

  useEffect(() => {
    // Fetch preview data for landing page
    apiRequest<{ activities: Activity[] }>('/activities')
      .then((res) => setPreviewActivities(res.activities))
      .catch(() => {});

    apiRequest<{ partners: Partner[] }>('/partners')
      .then((res) => setPreviewPartners(res.partners))
      .catch(() => {});
  }, []);

  // Check if logged-in user needs onboarding
  useEffect(() => {
    if (user && !user.completedOnboarding) {
      setIsOnboarding(true);
    } else {
      setIsOnboarding(false);
    }
  }, [user]);

  const handleNavigate = (tab: string, meta?: any) => {
    if (tab === 'activity-detail' && meta) {
      setSelectedActivityId(meta);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-wine flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <span className="font-display text-xl uppercase tracking-wider text-brand-ivory">
            Move Together
          </span>
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <Onboarding
        onComplete={() => {
          setIsOnboarding(false);
          setCurrentTab('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-wine text-brand-ivory">
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            activities={previewActivities}
            partners={previewPartners}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'partners' && (
          <PartnerDiscovery
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'activities' && (
          <ActivityCatalog
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'activity-detail' && selectedActivityId && (
          <ActivityDetail
            activityId={selectedActivityId}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'create-activity' && (
          <CreateActivity
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'messages' && (
          <Messages />
        )}

        {currentTab === 'notifications' && (
          <Notifications
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileSettings
            onOpenOnboarding={() => setIsOnboarding(true)}
          />
        )}

        {currentTab === 'spaces' && (
          <SportsSpaces
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'equipment' && (
          <EquipmentLibrary
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentTab === 'my-bookings' && (
          <MyBookings
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'safety' && (
          <SafetyHub
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (!user?.completedOnboarding) {
            setCurrentTab('dashboard');
          }
        }}
      />
    </div>
  );
}

export default App;
