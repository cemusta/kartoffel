export type QuestionType = 'general' | 'state';

export type OptionKey = 'a' | 'b' | 'c' | 'd';

export interface Question {
    id: number;
    type: QuestionType;
    state?: string; // Only present when type === 'state'
    page: number;
    text: string;
    options: Record<OptionKey, string>;
    /** Not present in the PDF — must be merged from an external source after parsing. */
    correctAnswer?: OptionKey;
    /**
     * Single image in the question body  → string  e.g. "images/q55.png"
     * Multiple images (option images)    → string[] e.g. ["images/q21_1.png", …, "images/q21_4.png"]
     */
    image?: string | string[];
}
