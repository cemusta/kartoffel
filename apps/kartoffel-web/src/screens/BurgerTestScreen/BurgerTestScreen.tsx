import { useNavigate } from 'react-router-dom';
import { BurgerTestPage } from '@kartoffel/ui-library';
import { useUser } from '../../hooks/useUser';

export function BurgerTestScreen() {
  const navigate = useNavigate();
  const { user, germanState, clearUser } = useUser();

  function handleLogout() {
    clearUser();
    window.location.replace('/');
  }

  return (
    <BurgerTestPage
      onBack={() => navigate(-1)}
      username={user?.username ?? null}
      onLogout={handleLogout}
      onSettings={() => navigate('/settings')}
      onShowAllQuestions={() => navigate('/burger-test/all-questions')}
      userState={germanState}
    />
  );
}
