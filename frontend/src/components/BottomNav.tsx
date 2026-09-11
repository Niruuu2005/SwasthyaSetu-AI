import React from 'react';
import { AppScreen, Language } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  language: Language;
  hasRedFlagCase?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  language,
  hasRedFlagCase = true
}) => {
  const tabs = [
    {
      id: 'patient-intake' as AppScreen,
      icon: 'add_circle',
      labelEn: 'Intake',
      labelHi: 'प्रवेश'
    },
    {
      id: 'active-cases-triage' as AppScreen,
      icon: 'assignment_late',
      labelEn: 'Triage',
      labelHi: 'ट्राइएज',
      badge: hasRedFlagCase
    },
    {
      id: 'urgent-referrals' as AppScreen,
      icon: 'local_hospital',
      labelEn: 'Referrals',
      labelHi: 'रेफरल'
    },
    {
      id: 'cdmo-dashboard' as AppScreen,
      icon: 'bar_chart',
      labelEn: 'Dashboard',
      labelHi: 'डैशबोर्ड'
    }
  ];

  // If we are in referral-dispatch-tracker, highlight 'urgent-referrals'
  const activeId = currentScreen === 'referral-dispatch-tracker' ? 'urgent-referrals' : currentScreen;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#f6faf7]/95 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)] border-t border-[#ebefec]">
      <div className="flex justify-around items-center h-20 px-space-xs max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[48px] transition-all touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-primary-container font-semibold scale-105'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">
                  {tab.icon}
                </span>
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface animate-pulse" />
                )}
              </div>
              <span className="font-label-sm text-label-sm mt-0.5">
                {language === 'hi' ? tab.labelHi : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
