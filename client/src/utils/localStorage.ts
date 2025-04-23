const STORAGE_KEY = 'saved_books';

export const getSavedBookIds = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveBookIds = (bookIds: string[]): void => {
  if (bookIds.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookIds));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const removeBookId = (bookId: string): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;

    const bookIds: string[] = JSON.parse(saved);
    const filtered = bookIds.filter((id) => id !== bookId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
};
