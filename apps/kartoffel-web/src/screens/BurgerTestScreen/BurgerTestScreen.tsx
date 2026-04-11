import { useNavigate } from 'react-router-dom';
import { BurgerTestPage } from '@kartoffel/ui-library';

export function BurgerTestScreen() {
  const navigate = useNavigate();

  return <BurgerTestPage onBack={() => navigate(-1)} />;
}
