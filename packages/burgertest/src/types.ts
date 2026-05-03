export type QuestionType = 'general' | 'state';

export type OptionKey = 'a' | 'b' | 'c' | 'd';

export interface Question {
    id: number;
    type: QuestionType;
    /** Present when type === 'state', e.g. "Bayern" */
    state?: string;
    /** PDF page number — useful for debugging, can be ignored by consumers */
    page: number;
    /** Question text in German */
    text: string;
    /** Question text in English (added by translate step) */
    textEn?: string;
    /** Answer options in German */
    options: Record<OptionKey, string>;
    /** Answer options in English (added by translate step) */
    optionsEn?: Record<OptionKey, string>;
    /** Correct answer key — present for general questions and Berlin state questions */
    correctAnswer?: OptionKey;
    /**
     * Single image in the question body  → string  e.g. "images/q55.png"
     * Multiple images (one per option)   → string[] e.g. ["images/q21_1.png", …]
     */
    image?: string | string[];
    /** 1–3 sentence educational context note in English (added by enrich step) */
    context?: string;
}
