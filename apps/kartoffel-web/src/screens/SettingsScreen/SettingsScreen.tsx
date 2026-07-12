import { useNavigate } from 'react-router-dom';
import { SettingsPage } from '@kartoffel/ui-library';
import { GERMAN_STATES } from '@kartoffel/utils';
import { useUser } from '../../hooks/useUser';

export function SettingsScreen() {
  const navigate = useNavigate();
  const { user, germanState, clearUser, setGermanState, clearProgress, showGoogleSearch, setShowGoogleSearch } = useUser();

  function handleLogout() {
    clearUser();
    window.location.replace('/');
  }

  return (
    <SettingsPage
      username={user?.username ?? ''}
      selectedState={germanState}
      states={GERMAN_STATES}
      onStateChange={setGermanState}
      onBack={() => navigate(-1)}
      onLogout={handleLogout}
      onSettings={() => navigate('/settings')}
      onClearProgress={clearProgress}
      showGoogleSearch={showGoogleSearch}
      onShowGoogleSearchChange={setShowGoogleSearch}
    />
  );
}
