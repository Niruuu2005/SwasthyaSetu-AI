import React, { useState } from 'react';
import { AppScreen, Language, UserProfile } from '../types';
import { ASSETS } from '../data/mockData';

interface HeaderProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  language: Language;
  onToggleLanguage: () => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  currentUser: UserProfile;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  language,
  onToggleLanguage,
  isOnline,
  onToggleOnline,
  currentUser,
  onSignOut
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive screen title based on active screen & language
  const getSubTitle = () => {
    switch (currentScreen) {
      case 'patient-intake':
        return language === 'hi' ? 'स्वास्थ्य सेतु • रोगी प्रवेश' : 'स्वास्थ्य सेतु • Patient Intake';
      case 'active-cases-triage':
        return language === 'hi' ? 'स्वास्थ्य सेतु • सक्रिय मामले / ट्राइएज' : 'स्वास्थ्य सेतु • Active Cases / Triage';
      case 'urgent-referrals':
        return language === 'hi' ? 'स्वास्थ्य सेतु • तत्काल रेफरल' : 'स्वास्थ्य सेतु • Urgent Referrals';
      case 'referral-dispatch-tracker':
        return language === 'hi' ? 'स्वास्थ्य सेतु • प्रेषण ट्रैकर' : 'Referral Dispatch Tracker';
      case 'cdmo-dashboard':
        return language === 'hi' ? 'स्वास्थ्य सेतु • सीडीएमओ डैशबोर्ड' : 'स्वास्थ्य सेतु • Cdmo Dashboard';
      default:
        return 'स्वास्थ्य सेतु • National Health Mission';
    }
  };

  const isTracker = currentScreen === 'referral-dispatch-tracker';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#f6faf7]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe border-b border-[#ebefec]">
      <div className="h-16 px-gutter flex items-center justify-between gap-space-xs max-w-2xl mx-auto">
        <div className="flex items-center gap-space-sm min-w-0">
          {isTracker && (
            <button
              onClick={() => onNavigate('urgent-referrals')}
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-on-surface hover:text-primary-container active:bg-surface-container shrink-0 transition-colors"
              aria-label="Back to Referrals"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          )}

          <button 
            onClick={() => onNavigate('patient-intake')}
            className="flex items-center gap-2 text-left focus:outline-none"
          >
            <img
              src={ASSETS.BRAND_LOGO}
              alt="SwasthyaSetu AI Brand Emblem"
              className="h-8 w-auto object-contain shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-primary leading-none truncate tracking-tight font-bold">
                SwasthyaSetu AI
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight truncate mt-0.5">
                {getSubTitle()}
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-space-xs shrink-0">
          {/* Online / Offline Status Button (click to toggle simulation) */}
          <button
            onClick={onToggleOnline}
            title="Click to toggle Online / Offline mode"
            className={`h-7 px-2.5 rounded-full flex items-center gap-1.5 transition-all active:scale-95 ${
              isOnline
                ? 'bg-primary-fixed text-on-primary-fixed'
                : 'bg-tertiary-fixed text-on-tertiary-fixed'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-primary-container animate-pulse' : 'bg-tertiary-container'
              }`}
            />
            <span className="font-label-sm text-label-sm hidden min-[390px]:inline">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={onToggleLanguage}
            title="Switch Language / भाषा बदलें"
            className="h-7 px-2.5 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm min-w-[44px] min-h-[44px] hover:bg-surface-container-highest active:scale-95 transition-all"
          >
            <span className="font-bold">{language === 'en' ? 'EN|हि' : 'हि|EN'}</span>
          </button>

          {/* Profile Switcher Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User profile and role menu"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all text-on-primary shadow-sm"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                {currentUser.avatarIcon || 'person'}
              </span>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high p-space-sm z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 border-b border-surface-container-high mb-1.5">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                    Active Session
                  </p>
                  <p className="font-title-sm text-title-sm text-primary font-bold">
                    {currentUser.name}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {currentUser.badge}
                  </p>
                </div>

                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider px-2 py-1">
                  Session
                </p>
                <div className="px-2.5 py-1.5 text-xs text-on-surface-variant">
                  <p className="font-semibold text-on-surface">{currentUser.name || 'Signed in'}</p>
                  <p>{currentUser.phone ? `+91 ${currentUser.phone}` : currentUser.roleLabel}</p>
                  <p className="mt-1 text-[10px]">Sign out and log in again to change role.</p>
                </div>

                <div className="border-t border-surface-container-high mt-2 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onSignOut();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-error hover:bg-error-container/30 font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sign Out / Switch Profile Screen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
