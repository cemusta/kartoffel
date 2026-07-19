import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { RealExamIntroPage, RealExamQuizPage } from '@kartoffel/ui-library';
import { questions } from '@cemusta/burgertest';
import { seededShuffle, generateSeed } from '@kartoffel/utils';
import { useUser } from '../../hooks/useUser';

const GENERAL_COUNT = 30;
const STATE_COUNT = 3;
const PASSING_SCORE = 17;

type Phase = 'intro' | 'quiz';

export function RealExamQuizScreen() {
  const { seed = '' } = useParams<{ seed: string }>();
  const navigate = useNavigate();
  const { germanState, recordQuizAnswers } = useUser();
  const [phase, setPhase] = useState<Phase>('intro');
  const [examInProgress, setExamInProgress] = useState(false);


  // Block browser back/forward during active exam
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      examInProgress && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmed = window.confirm(
        'Are you sure you want to quit? Your exam progress will be lost.',
      );
      if (confirmed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  const quizQuestions = useMemo(() => {
    const general = questions.filter(q => q.type === 'general');
    const state = questions.filter(q => q.type === 'state' && q.state === germanState);
    const shuffledGeneral = seededShuffle(general, seed + 'G');
    const shuffledState = seededShuffle(state, seed + 'S');
    return [...shuffledGeneral.slice(0, GENERAL_COUNT), ...shuffledState.slice(0, STATE_COUNT)];
  }, [seed, germanState]);

  function handleComplete(_score: number, correctIds: number[], incorrectIds: number[]) {
    setExamInProgress(false);
    recordQuizAnswers(correctIds, incorrectIds);
  }

  function handleReviewWrong(wrongIds: number[], userAnswers: Record<number, string>) {
    navigate(`/einburger-test/real-exam/${seed}/review`, { state: { wrongIds, userAnswers } });
  }

  function handleChangeSeed() {
    navigate(`/einburger-test/real-exam/${generateSeed()}`, { replace: true });
  }

  function handleBack() {
    navigate(-1);
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (phase === 'intro') {
    return (
      <RealExamIntroPage
        seed={seed}
        shareUrl={shareUrl}
        onBack={handleBack}
        onStart={() => setPhase('quiz')}
        onChangeSeed={handleChangeSeed}
      />
    );
  }

  return (
    <RealExamQuizPage
      onBack={handleBack}
      questions={quizQuestions}
      passingScore={PASSING_SCORE}
      onComplete={handleComplete}
      onReviewWrong={handleReviewWrong}
      onQuizStarted={setExamInProgress}
    />
  );
}
