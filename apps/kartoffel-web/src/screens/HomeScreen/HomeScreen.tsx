import { useNavigate } from 'react-router-dom';
import { HomePage } from '@kartoffel/ui-library';
import { useUser } from '../../hooks/useUser';

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
      onBurgerTest={() => navigate('/burger-test')}
      onLogout={handleLogout}
    />
  );
}
