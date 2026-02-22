export function isVocabularyDeckId(deckId: string): boolean {
  return deckId.includes("PRIVATE_VOCABULARY");
}

export function isRevisionDeckId(deckId: string): boolean {
  return deckId.includes("REVISION");
}
