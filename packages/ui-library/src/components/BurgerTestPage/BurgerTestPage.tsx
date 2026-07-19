import { ModeCard } from '../ModeCard';
import { TopBar } from '../TopBar';
import { HamburgerMenu } from '../HamburgerMenu';
import { ProgressGrid } from '../ProgressGrid';
import { FactCallout } from '../FactCallout';
import styles from './BurgerTestPage.module.css';

const FACTS = [
  'Historically, the success rate is over 98%, as the questions are public and can be practiced in advance.',
  'To pass, you need to answer at least 17 of 33 questions correctly.',
  'The test has 33 questions total — 30 from a pool of general questions and 3 tailored to your specific German state.',
  'The complete question catalog is publicly available, so you can study every possible question in advance.',
  'The Einbürgerungstest has been mandatory for German citizenship applicants since September 2008.',
  'Each test session lasts up to 60 minutes. It is little bit shorter than 2 minutes per question, so no rush... 😊',
  'The test fee is €25 per attempt, regardless of how many times you take it. It`s almost impossible to find these cheap tests though...',
  'Tests are administered at local Volkshochschulen (VHS) — Germany\'s adult education centers.',
];

export interface BurgerTestPageProps {
  onBack: () => void;
  username: string | null;
  onLogout: () => void;
  onSettings?: () => void;
  onShowAllQuestions: () => void;
  onStartPractice?: () => void;
  onAnswerAllQuestions?: () => void;
  onStartRealExam?: () => void;
  userState: string | null;
  allQuestionIds?: number[];
  correctQuestionIds?: number[];
  incorrectQuestionIds?: number[];
}

export function BurgerTestPage({
  onBack,
  username,
  onLogout,
  onSettings,
  onShowAllQuestions,
  onStartPractice,
  onAnswerAllQuestions: _onAnswerAllQuestions,
  onStartRealExam,
  userState,
  allQuestionIds,
  correctQuestionIds = [],
  incorrectQuestionIds = [],
}: BurgerTestPageProps) {
  const questionCount = userState ? 310 : 300;
  const questionDescription = userState
    ? `${questionCount} questions including ${userState}`
    : `${questionCount} general questions`;

  const practiceEnabled = Boolean(onStartPractice && userState);
  const realExamEnabled = Boolean(onStartRealExam && userState);

  return (
    <div className={styles.screen}>
      <TopBar
        left={
          <>
            <button
              className={styles.backButton}
              onClick={onBack}
              aria-label="Go back"
              type="button"
            >
              ‹
            </button>
            <p className={styles.topBarTitle}>Burger Test</p>
          </>
        }
        right={<HamburgerMenu username={username} onLogout={onLogout} onSettings={onSettings} />}
      />
      <div className={styles.content}>
        <h2 className={styles.sectionLabel}>Practice Modes</h2>
        <div className={styles.modeCardGrid}>
          <ModeCard
            title="Show All Questions"
            description={questionDescription}
            icon="📋"
            onClick={onShowAllQuestions}
          />
          <ModeCard
            title="Practice Mode"
            description={
              practiceEnabled
                ? '33 questions · passing score 17/33'
                : 'Select a state to start practice'
            }
            icon="🎯"
            disabled={!practiceEnabled}
            onClick={practiceEnabled ? onStartPractice : undefined}
          />
          <ModeCard
            title="Answer All Questions"
            description="Coming soon"
            icon="📝"
            disabled={true}
          />
          <ModeCard
            title="Real Exam"
            description={
              realExamEnabled
                ? '33 questions · official exam format'
                : 'Select a state to start'
            }
            icon="🎓"
            disabled={!realExamEnabled}
            onClick={realExamEnabled ? onStartRealExam : undefined}
          />
        </div>
        {allQuestionIds && allQuestionIds.length > 0 && (
          <div className={styles.progressSection}>
            <h2 className={styles.sectionLabel}>Your Progress</h2>
            <ProgressGrid
              allQuestionIds={allQuestionIds}
              correctIds={correctQuestionIds}
              incorrectIds={incorrectQuestionIds}
            />
          </div>
        )}
        <FactCallout facts={FACTS} />
      </div>
    </div>
  );
}
