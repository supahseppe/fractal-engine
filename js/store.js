import { create } from 'zustand';
import { db } from './db';

/**
 * @typedef {Object} Character
 * @property {number} id - Unique identifier for the character
 * @property {string} name - Name of the character
 * @property {string} summary - Summary description of the character
 * @property {number} createdAt - Timestamp when the character was created (epoch millis)
 * @property {number} updatedAt - Timestamp when the character was last updated (epoch millis)
 */

export const useStore = create((set, get) => ({
  // Active Project
  activeProject: null,
  setActiveProject: (project) => {
    set({ activeProject: project });
  },
  updateProject: async (projectData) => {
    const activeProject = get().activeProject;
    if (activeProject) {
      await db.projects.update(activeProject.id, projectData);
      set({ activeProject: { ...activeProject, ...projectData } });
      get().showNotification('Progress saved!');
    }
  },

  // Projects List
  projects: [],
  fetchProjects: async () => {
    const projects = await db.projects.toArray();
    set({ projects });
  },
  addProject: async (project) => {
    const newId = await db.projects.add(project);
    set((state) => ({ projects: [...state.projects, { ...project, id: newId }] }));
    get().fetchProjects();
    return newId;
  },

  // Character Slice Implementation
  /** @type {Character[]} */
  characters: [],
  /** @type {boolean} */
  isCharactersLoaded: false,

  /**
   * Get all characters from the store
   * @returns {Character[]} Array of characters
   */
  getCharacters: () => get().characters,

  /**
   * Load characters from the database
   * @returns {Promise<void>}
   */
  loadCharacters: async () => {
    // If already loaded, no-op
    if (get().isCharactersLoaded) return;
    
    try {
      const characters = await db.characters.toArray();
      set({ characters, isCharactersLoaded: true });
    } catch (err) {
      console.error('[store.characters] loadCharacters failed', err);
      // Keep state unchanged while isCharactersLoaded remains false
    }
  },

  /**
   * Add a new character
   * @param {{ name: string; summary: string }} input - Character input data
   * @returns {Promise<Character>} The persisted character
   */
  addCharacter: async (input) => {
    const timestamp = Date.now();
    const tempId = Symbol('temp-id');
    
    // Create the character record
    const tempCharacter = {
      id: tempId,
      name: input.name,
      summary: input.summary,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Optimistic update: add temp character to state
    set(state => ({
      characters: [...state.characters, tempCharacter]
    }));
    
    try {
      // Create the normalized record for persistence
      const normalized = {
        name: input.name,
        summary: input.summary,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Persist to database
      const id = await db.characters.add(normalized);
      
      // Replace temp item with persisted one
      set(state => ({
        characters: state.characters.map(char => 
          char.id === tempId ? { ...normalized, id } : char
        )
      }));
      
      // Return the persisted character
      return { ...normalized, id };
    } catch (err) {
      // Rollback temp insert
      set(state => ({
        characters: state.characters.filter(char => char.id !== tempId)
      }));
      
      console.error('[store.characters] addCharacter failed', err);
      throw err;
    }
  },

  /**
   * Update an existing character
   * @param {{ id: number; name: string; summary: string }} update - Character update data
   * @returns {Promise<Character>} The updated character
   */
  updateCharacter: async (update) => {
    // Find existing in state
    const existing = get().characters.find(char => char.id === update.id);
    if (!existing) {
      throw new Error('Character not found');
    }
    
    const timestamp = Date.now();
    const updatedCharacter = {
      ...existing,
      ...update,
      updatedAt: timestamp
    };
    
    // Optimistically update the item in memory
    set(state => ({
      characters: state.characters.map(char => 
        char.id === update.id ? updatedCharacter : char
      )
    }));
    
    try {
      // Persist to database
      await db.characters.put(updatedCharacter);
      
      // Return the updated character
      return updatedCharacter;
    } catch (err) {
      // Rollback to previous value
      set(state => ({
        characters: state.characters.map(char => 
          char.id === update.id ? existing : char
        )
      }));
      
      console.error('[store.characters] updateCharacter failed', err);
      throw err;
    }
  },

  /**
   * Delete a character
   * @param {number} id - Character ID to delete
   * @returns {Promise<void>}
   */
  deleteCharacter: async (id) => {
    // Find existing in state
    const existing = get().characters.find(char => char.id === id);
    if (!existing) {
      throw new Error('Character not found');
    }
    
    // Optimistically remove from state
    set(state => ({
      characters: state.characters.filter(char => char.id !== id)
    }));
    
    try {
      // Persist to database
      await db.characters.delete(id);
    } catch (err) {
      // Restore previous state
      set(state => ({
        characters: [...state.characters, existing]
      }));
      
      console.error('[store.characters] deleteCharacter failed', err);
      throw err;
    }
  },

  // AI Modal
  aiModal: {
    isOpen: false,
    content: '',
    isLoading: false,
  },
  openAiModal: (content = '', isLoading = false) =>
    set({ aiModal: { isOpen: true, content, isLoading } }),
  closeAiModal: () => set((state) => ({ aiModal: { ...state.aiModal, isOpen: false } })),
  setAiModalContent: (content) => set((state) => ({ aiModal: { ...state.aiModal, content } })),
  setAiModalLoading: (isLoading) =>
    set((state) => ({ aiModal: { ...state.aiModal, isLoading } })),

  // Notifications
  notification: {
    isOpen: false,
    message: '',
  },
  showNotification: (message) => {
    set({ notification: { isOpen: true, message } });
    setTimeout(() => {
      set({ notification: { isOpen: false, message: '' } });
    }, 3000);
  },
  
  // Steps
  currentStep: 1,
  steps: { '1': '', '2': '' },
  setCurrentStep: (step) => set({ currentStep: step }),
  setStepContent: (step, content) => set(state => ({
    steps: { ...state.steps, [step]: content }
  })),
}));