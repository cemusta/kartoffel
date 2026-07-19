import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSeed } from '@kartoffel/utils';

export function RealExamIntroScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const seed = generateSeed();
    navigate(`/einburger-test/real-exam/${seed}`, { replace: true });
  }, [navigate]);

  return null;
}
