import { HTMLAttributes, useMemo } from 'react';
import { QuestionBody, QuestionData } from '../QuestionBody';
import { QuestionOptions } from '../QuestionOptions';
import styles from './QuestionContainer.module.css';

export const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;
const OPTION_LABELS: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

export function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let random = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Simple seeded random number generator
    random = (random * 9301 + 49297) % 233280;
    const j = Math.floor((random / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface QuestionContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  question: QuestionData;
  selectedAnswer: string | null;
  isRevealed: boolean;
  showTranslation: boolean;
  onSelect: (key: string) => void;
  randomizeOptions?: boolean;
  showGoogleSearch?: boolean;
}

export function QuestionContainer({
  question,
  selectedAnswer,
  isRevealed,
  showTranslation,
  onSelect,
  randomizeOptions = false,
  showGoogleSearch = true,
  className = '',
  ...props
}: QuestionContainerProps) {
  // Shuffle options deterministically based on question ID when randomization is enabled.
  // Disabled for questions with images: images are shown in fixed order, so shuffling
  // options would break the correspondence between an image and its answer option.
  const shuffledKeys = useMemo(() => {
    if (!randomizeOptions || question.image) return [...OPTION_KEYS];
    return shuffleArray([...OPTION_KEYS], question.id);
  }, [randomizeOptions, question.id, question.image]);

  return (
    <div className={`${styles.container} ${className}`} {...props}>
      <QuestionBody
        text={question.text}
        textEn={question.translations?.en?.text}
        imageUrl={question.image}
        imageText={question.imageText}
        showTranslation={showTranslation}
        questionId={question.id}
        questionType={question.type}
        stateName={question.state}
        showGoogleSearch={showGoogleSearch}
      />

      <div className={styles.options}>
        {shuffledKeys.map((key, index) => (
          <QuestionOptions
            key={key}
            label={OPTION_LABELS[OPTION_KEYS[index]]}
            text={question.options[key]}
            textEn={question.translations?.en?.options?.[key]}
            isSelected={selectedAnswer === key}
            isCorrect={key === question.correctAnswer}
            isRevealed={isRevealed}
            showTranslation={showTranslation}
            onSelect={() => onSelect(key)}
          />
        ))}
      </div>
    </div>
  );
}
