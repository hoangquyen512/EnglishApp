import { create } from "zustand";
import { buildQuizQuestion, submitAnswer } from "../features/vocabulary";
import type { AnswerResult, QuizQuestion } from "../types";

interface QuizStore {
  question: QuizQuestion | null;
  selectedIndex: number | null;
  result: AnswerResult | null;
  isLoading: boolean;
  error: string | null;
  loadQuestion: () => Promise<void>;
  selectOption: (index: number) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  question: null,
  selectedIndex: null,
  result: null,
  isLoading: false,
  error: null,

  loadQuestion: async () => {
    set({ isLoading: true, error: null, result: null, selectedIndex: null });
    try {
      const question = await buildQuizQuestion();
      set({ question, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : String(err),
        isLoading: false,
      });
    }
  },

  selectOption: (index) => {
    if (!get().result) {
      set({ selectedIndex: index });
    }
  },

  submit: async () => {
    const { question, selectedIndex } = get();
    if (!question || selectedIndex === null) {
      return;
    }

    set({ isLoading: true });
    try {
      const result = await submitAnswer(
        question.vocabulary.id,
        selectedIndex,
        question.correctIndex,
      );
      set({ result, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : String(err),
        isLoading: false,
      });
    }
  },

  reset: () => {
    set({
      question: null,
      selectedIndex: null,
      result: null,
      error: null,
    });
  },
}));
