import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PracticeQuizPage } from '@kartoffel/ui-library';
import { questions } from '@cemusta/burgertest';
import { useUser } from '../../hooks/useUser';

const GENERAL_COUNT = 30;
const STATE_COUNT = 3;
const PASSING_SCORE = 17;

function sampleN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

export function PracticeQuizScreen() {
  const navigate = useNavigate();
  const { germanState, recordQuizAnswers } = useUser();

  const quizQuestions = useMemo(() => {
    const general = questions.filter(q => q.type === 'general');
    const state = questions.filter(q => q.type === 'state' && q.state === germanState);
    return [...sampleN(general, GENERAL_COUNT), ...sampleN(state, STATE_COUNT)];
  }, [germanState]);

  function handleComplete(_score: number, correctIds: number[], incorrectIds: number[]) {
    recordQuizAnswers(correctIds, incorrectIds);
  }

  function handleBack() {
    navigate(-1);
  }

  return (
    <PracticeQuizPage
      onBack={handleBack}
      questions={quizQuestions}
      passingScore={PASSING_SCORE}
      onComplete={handleComplete}
    />
  );
}
