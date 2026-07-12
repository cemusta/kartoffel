import { useNavigate } from 'react-router-dom';
import { HomePage } from '@kartoffel/ui-library';
import { useUser } from '../../hooks/useUser';
import packageJson from '../../../package.json';

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, clearUser } = useUser();

  function handleLogout() {
    clearUser();
    window.location.replace('/');
  }

  return (
    <HomePage
      username={user?.username ?? null}
      version={packageJson.version}
      onBurgerTest={() => navigate('/burger-test')}
      onLogout={handleLogout}
      onSettings={() => navigate('/settings')}
    />
  );
}
