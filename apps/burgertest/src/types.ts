export type QuestionType = 'general' | 'state';

export type OptionKey = 'a' | 'b' | 'c' | 'd';

export interface Question {
    id: number;
    type: QuestionType;
    state?: string; // Only present when type === 'state'
    page: number;
    text: string;
    textEn?: string; // English translation (added by translate step)
    options: Record<OptionKey, string>;
    optionsEn?: Record<OptionKey, string>; // English translation (added by translate step)
    /** Required after merge step — sourced from external dataset. */
    correctAnswer?: OptionKey;
    /**
     * Single image in the question body  → string  e.g. "images/q55.png"
     * Multiple images (option images)    → string[] e.g. ["images/q21_1.png", …, "images/q21_4.png"]
     */
    image?: string | string[];
    /** Fun fact / civic education context (added by enrich step). */
    context?: string;
}
