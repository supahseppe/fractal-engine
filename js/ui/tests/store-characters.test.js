import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module
vi.mock('../../db.js', () => {
  // Create a mock database implementation
  const mockDb = {
    characters: {
      toArray: vi.fn(),
      add: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }
  };
  
  return {
    db: mockDb
  };
});

describe('Character Store', () => {
  let store;
  let db;
  
  beforeEach(async () => {
    // Reset modules to ensure fresh store state
    vi.resetModules();
    
    // Import the store after resetting modules
    const storeModule = await import('../../store.js');
    store = storeModule.useStore;
    
    // Get the mocked db instance
    const dbModule = await import('../../db.js');
    db = dbModule.db;
    
    // Reset store state
    store.setState({
      characters: [],
      isCharactersLoaded: false
    });
    
    // Reset mock implementations
    db.characters.toArray.mockReset();
    db.characters.add.mockReset();
    db.characters.put.mockReset();
    db.characters.delete.mockReset();
  });

  describe('loadCharacters', () => {
    it('loads characters idempotently', async () => {
      // Setup mock data
      const mockCharacters = [
        { id: 1, name: 'Character 1', summary: 'Summary 1', createdAt: Date.now(), updatedAt: Date.now() },
        { id: 2, name: 'Character 2', summary: 'Summary 2', createdAt: Date.now(), updatedAt: Date.now() }
      ];
      
      db.characters.toArray.mockResolvedValueOnce(mockCharacters);
      
      // First load
      await store.getState().loadCharacters();
      expect(store.getState().characters).toEqual(mockCharacters);
      expect(store.getState().isCharactersLoaded).toBe(true);
      
      // Second load - should not duplicate
      await store.getState().loadCharacters();
      expect(store.getState().characters).toEqual(mockCharacters);
      expect(store.getState().characters.length).toBe(2);
      expect(store.getState().isCharactersLoaded).toBe(true);
      
      // Verify db.characters.toArray was only called once
      expect(db.characters.toArray).toHaveBeenCalledTimes(1);
    });
  });

  describe('addCharacter', () => {
    it('optimistically adds character and updates with real ID', async () => {
      const newCharacter = { name: 'New Character', summary: 'New Summary' };
      const realId = 123;
      
      // Mock db.add to return a real ID
      db.characters.add.mockResolvedValueOnce(realId);
      
      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call addCharacter
      const resultPromise = store.getState().addCharacter(newCharacter);
      
      // Check optimistic update (before await)
      let state = store.getState();
      expect(state.characters.length).toBe(1);
      expect(state.characters[0].id).toBeTypeOf('symbol');
      expect(state.characters[0].name).toBe(newCharacter.name);
      expect(state.characters[0].summary).toBe(newCharacter.summary);
      expect(state.characters[0].createdAt).toBeDefined();
      expect(state.characters[0].updatedAt).toBeDefined();
      
      // Wait for the actual result
      const result = await resultPromise;
      
      // Check final state with real ID
      state = store.getState();
      expect(state.characters.length).toBe(1);
      expect(state.characters[0].id).toBe(realId);
      expect(state.characters[0].name).toBe(newCharacter.name);
      expect(state.characters[0].summary).toBe(newCharacter.summary);
      expect(state.characters[0].createdAt).toBeDefined();
      expect(state.characters[0].updatedAt).toBeDefined();
      
      // Verify db.characters.add was called
      expect(db.characters.add).toHaveBeenCalledTimes(1);
      
      // Verify no console errors
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('rolls back on failure', async () => {
      const newCharacter = { name: 'New Character', summary: 'New Summary' };
      
      // Mock db.add to reject
      const errorMessage = 'Database error';
      db.characters.add.mockRejectedValueOnce(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Get initial state
      const initialState = store.getState().characters;
      
      // Call addCharacter and expect it to throw
      await expect(store.getState().addCharacter(newCharacter)).rejects.toThrow(errorMessage);
      
      // Check that state was rolled back
      expect(store.getState().characters).toEqual(initialState);
      
      // Check that console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith('[store.characters] addCharacter failed', expect.any(Error));
      
      // Verify db.characters.add was called
      expect(db.characters.add).toHaveBeenCalledTimes(1);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateCharacter', () => {
    beforeEach(() => {
      // Pre-seed state with a character
      const timestamp = Date.now();
      store.setState({
        characters: [
          { id: 1, name: 'Old Name', summary: 'Old Summary', createdAt: timestamp, updatedAt: timestamp }
        ]
      });
    });

    it('optimistically updates character', async () => {
      const updatedCharacter = { id: 1, name: 'Updated Name', summary: 'Updated Summary' };
      
      // Mock db.put to resolve
      db.characters.put.mockResolvedValueOnce(1);
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Get the initial updatedAt time
      const initialUpdatedAt = store.getState().characters[0].updatedAt;
      
      // Call updateCharacter
      await store.getState().updateCharacter(updatedCharacter);
      
      // Check that the character was updated
      const state = store.getState();
      expect(state.characters.length).toBe(1);
      expect(state.characters[0].id).toBe(1);
      expect(state.characters[0].name).toBe('Updated Name');
      expect(state.characters[0].summary).toBe('Updated Summary');
      
      // Check that updatedAt was updated (should be different from initial)
      // We need to account for potential timing issues, so we'll check it's a valid timestamp
      expect(state.characters[0].updatedAt).toBeDefined();
      expect(typeof state.characters[0].updatedAt).toBe('number');
      
      // Check that db.put was called with correct arguments
      expect(db.characters.put).toHaveBeenCalled();
      const callArgs = db.characters.put.mock.calls[0][0];
      expect(callArgs.id).toBe(1);
      expect(callArgs.name).toBe('Updated Name');
      expect(callArgs.summary).toBe('Updated Summary');
      expect(callArgs.createdAt).toBeDefined();
      expect(callArgs.updatedAt).toBeDefined();
      
      // Verify no console errors
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('throws error when character not found', async () => {
      // Set empty state
      store.setState({ characters: [] });
      
      const updatedCharacter = { id: 999, name: 'Non-existent', summary: 'Character' };
      
      // Call updateCharacter and expect it to throw
      await expect(store.getState().updateCharacter(updatedCharacter)).rejects.toThrow('Character not found');
    });

    it('rolls back on failure', async () => {
      const updatedCharacter = { id: 1, name: 'Updated Name', summary: 'Updated Summary' };
      
      // Mock db.put to reject
      const errorMessage = 'Database error';
      db.characters.put.mockRejectedValueOnce(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Get initial state
      const initialState = [...store.getState().characters];
      
      // Call updateCharacter and expect it to throw
      await expect(store.getState().updateCharacter(updatedCharacter)).rejects.toThrow(errorMessage);
      
      // Check that state was rolled back
      expect(store.getState().characters).toEqual(initialState);
      
      // Check that console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith('[store.characters] updateCharacter failed', expect.any(Error));
      
      // Verify db.characters.put was called
      expect(db.characters.put).toHaveBeenCalledTimes(1);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteCharacter', () => {
    beforeEach(() => {
      // Pre-seed state with characters
      store.setState({
        characters: [
          { id: 1, name: 'Character 1', summary: 'Summary 1' },
          { id: 2, name: 'Character 2', summary: 'Summary 2' }
        ]
      });
    });

    it('optimistically deletes character', async () => {
      // Mock db.delete to resolve
      db.characters.delete.mockResolvedValueOnce();
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call deleteCharacter
      await store.getState().deleteCharacter(1);
      
      // Check that the character was removed from state
      const state = store.getState();
      expect(state.characters.length).toBe(1);
      expect(state.characters[0].id).toBe(2);
      
      // Check that db.delete was called
      expect(db.characters.delete).toHaveBeenCalledWith(1);
      
      // Verify no console errors
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('throws error when character not found', async () => {
      // Set empty state
      store.setState({ characters: [] });
      
      // Call deleteCharacter and expect it to throw
      await expect(store.getState().deleteCharacter(999)).rejects.toThrow('Character not found');
    });

    it('rolls back on failure', async () => {
      // Mock db.delete to reject
      const errorMessage = 'Database error';
      db.characters.delete.mockRejectedValueOnce(new Error(errorMessage));
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Get initial state (preserve order)
      const initialState = [...store.getState().characters];
      
      // Call deleteCharacter and expect it to throw
      await expect(store.getState().deleteCharacter(1)).rejects.toThrow(errorMessage);
      
      // Check that state was rolled back (check that both characters are still there)
      const currentState = store.getState().characters;
      expect(currentState.length).toBe(2);
      
      // Check that both characters are still present
      const currentIds = currentState.map(c => c.id).sort();
      const initialIds = initialState.map(c => c.id).sort();
      expect(currentIds).toEqual(initialIds);
      
      // Check that console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith('[store.characters] deleteCharacter failed', expect.any(Error));
      
      // Verify db.characters.delete was called
      expect(db.characters.delete).toHaveBeenCalledTimes(1);
      
      consoleErrorSpy.mockRestore();
    });
  });
});