import { HTMLAttributes } from 'react';
import { QuestionBody, QuestionData } from '../QuestionBody';
import { QuestionOptions } from '../QuestionOptions';
import styles from './QuestionContainer.module.css';

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;
const OPTION_LABELS: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

export interface QuestionContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  question: QuestionData;
  selectedAnswer: string | null;
  isRevealed: boolean;
  showTranslation: boolean;
  onSelect: (key: string) => void;
}

export function QuestionContainer({
  question,
  selectedAnswer,
  isRevealed,
  showTranslation,
  onSelect,
  className = '',
  ...props
}: QuestionContainerProps) {
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
      />

      <div className={styles.options}>
        {OPTION_KEYS.map(key => (
          <QuestionOptions
            key={key}
            label={OPTION_LABELS[key]}
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
