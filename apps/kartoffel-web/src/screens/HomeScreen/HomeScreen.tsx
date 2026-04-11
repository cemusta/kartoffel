import { useNavigate } from 'react-router-dom';
import { HomePage } from '@kartoffel/ui-library';
import { useUser } from '../../hooks/useUser';

export function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <HomePage username={user?.username ?? null} onBurgerTest={() => navigate('/burger-test')} />
  );
}
