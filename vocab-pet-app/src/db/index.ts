export { getDb, selectRows, executeQuery, initDatabase } from "./connection";
export {
  getAllVocabulary,
  getVocabularyById,
  getDueVocabulary,
  getRandomVocabulary,
  getRandomMeanings,
  getLearningProgress,
  updateLearningProgress,
  insertStudySession,
} from "./vocabulary";
export {
  getPetState,
  updatePetAfterAnswer,
  refreshPetMood,
  updateStreak,
} from "./pet-state";
