import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizQuestionContainer, TopBar } from '@kartoffel/ui-library';
import { questions } from '@cemusta/burgertest';
import { useUser } from '../../hooks/useUser';
import styles from './PracticeQuizScreen.module.css';

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

  return (
    <div className={styles.screen}>
      <TopBar
        left={
          <>
            <button
              className={styles.backButton}
              onClick={() => navigate(-1)}
              aria-label="Go back"
              type="button"
            >
              ‹
            </button>
            <p className={styles.topBarTitle}>Practice Quiz</p>
          </>
        }
      />
      <div className={styles.content}>
        <QuizQuestionContainer
          questions={quizQuestions}
          passingScore={PASSING_SCORE}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
