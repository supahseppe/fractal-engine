import { LitElement, html, css } from 'lit';
import { useStore } from '../store.js';

class CharacterView extends LitElement {
  static properties = {
    characters: { type: Array },
    store: { type: Object },
    uiMode: { type: String }, // 'list' | 'create' | 'edit'
    draft: { type: Object }, // { id?: number; name: string; summary: string }
    formError: { type: String },
    isSubmitting: { type: Boolean },
    _confirmingId: { type: Number, state: true } // Private state for delete confirmation
  };

  static styles = css`
    :host {
      display: block;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    
    .header h2 {
      margin: 0;
    }
    
    .header-buttons {
      display: flex;
      gap: 0.5rem;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
    }
    
    .btn-primary {
      background-color: #4f46e5;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #4338ca;
    }
    
    .btn-secondary {
      background-color: #374151;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #1f2937;
    }
    
    .btn-destructive {
      background-color: #dc2626;
      color: white;
    }
    
    .btn-destructive:hover {
      background-color: #b91c1c;
    }
    
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
    
    .empty-state {
      text-align: center;
      padding: 2rem;
      border: 1px dashed #374151;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
    }
    
    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #f3f4f6;
    }
    
    .empty-state p {
      margin: 0 0 1rem 0;
      color: #9ca3af;
    }
    
    .character-list {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .character-card {
      background-color: #1f2937;
      border: 1px solid #374151;
      border-radius: 0.5rem;
      padding: 1rem;
    }
    
    .character-card h3 {
      margin: 0 0 0.5rem 0;
      color: #f3f4f6;
    }
    
    .character-card p {
      margin: 0 0 1rem 0;
      color: #d1d5db;
    }
    
    .character-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .form-region {
      background-color: #1f2937;
      border: 1px solid #374151;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 500;
      color: #f3f4f6;
    }
    
    .form-control {
      width: 100%;
      padding: 0.5rem;
      background-color: #111827;
      border: 1px solid #374151;
      border-radius: 0.375rem;
      color: #f3f4f6;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #4f46e5;
      ring: 2px solid #4f46e5;
    }
    
    .form-control[aria-invalid="true"] {
      border-color: #dc2626;
    }
    
    .helper-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #9ca3af;
    }
    
    .error-text {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc2626;
    }
    
    .character-counter {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #9ca3af;
      text-align: right;
    }
    
    .character-counter.over-limit {
      color: #dc2626;
    }
    
    .form-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .confirm-delete {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
    }
  `;

  constructor() {
    super();
    this.characters = [];
    this.store = null; // Initialize as null instead of useStore
    this.uiMode = 'list';
    this.draft = { name: '', summary: '' };
    this.formError = '';
    this.isSubmitting = false;
    this._confirmingId = null;
    this._unsubscribe = null;
    this._lastFocusEl = null;
  }

  connectedCallback() {
    super.connectedCallback();
    // Subscribe to store changes when connected, but only if store is defined
    if (this.store && typeof this.store.subscribe === 'function') {
      this._unsubscribe = this.store.subscribe(() => {
        // Only update characters if store has getState method
        if (this.store.getState && this.store.getState().characters) {
          this.characters = this.store.getState().characters;
        }
      });
      
      // Initialize with current state if available
      if (this.store.getState && this.store.getState().characters) {
        this.characters = this.store.getState().characters;
      }
    }
  }

  disconnectedCallback() {
    // Unsubscribe when disconnected
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    super.disconnectedCallback();
  }

  // Form open/close methods
  openCreateForm() {
    this._lastFocusEl = document.activeElement;
    this.draft = { name: '', summary: '' };
    this.uiMode = 'create';
    this.formError = '';
    this.requestUpdate();
    // Focus name field after render
    setTimeout(() => {
      const nameInput = this.shadowRoot?.getElementById('char-name');
      if (nameInput) nameInput.focus();
    }, 0);
  }

  openEditForm(character) {
    this._lastFocusEl = document.activeElement;
    this.draft = { ...character };
    this.uiMode = 'edit';
    this.formError = '';
    this.requestUpdate();
    // Focus name field after render
    setTimeout(() => {
      const nameInput = this.shadowRoot?.getElementById('char-name');
      if (nameInput) nameInput.focus();
    }, 0);
  }

  closeForm() {
    this.uiMode = 'list';
    this.draft = { name: '', summary: '' };
    this.formError = '';
    // Return focus to appropriate element
    setTimeout(() => {
      if (this._lastFocusEl) {
        this._lastFocusEl.focus();
      } else {
        const addButton = this.shadowRoot?.querySelector('.btn-primary');
        if (addButton) addButton.focus();
      }
    }, 0);
  }

  // Form submission
  async submitForm(event) {
    event.preventDefault();
    
    // Check if store exists before proceeding
    if (!this.store || !this.store.getState) {
      this.formError = 'Application is still initializing. Please try again.';
      return;
    }
    
    // Trim inputs
    const name = this.draft.name.trim();
    const summary = this.draft.summary.trim();
    
    // Validation
    if (!name || !summary) {
      this.formError = 'Both name and summary are required.';
      return;
    }
    
    if (summary.length > 280) {
      this.formError = 'Summary must be 280 characters or less.';
      return;
    }
    
    this.formError = '';
    this.isSubmitting = true;
    
    try {
      if (this.uiMode === 'create') {
        await this.store.getState().addCharacter({ name, summary });
      } else if (this.uiMode === 'edit') {
        await this.store.getState().updateCharacter({ 
          id: this.draft.id, 
          name, 
          summary 
        });
      }
      
      // Success - reset and return to list
      this.draft = { name: '', summary: '' };
      this.uiMode = 'list';
      
      // Return focus to appropriate element
      setTimeout(() => {
        if (this.uiMode === 'list' && this._lastFocusEl) {
          this._lastFocusEl.focus();
        } else {
          const addButton = this.shadowRoot?.querySelector('.btn-primary');
          if (addButton) addButton.focus();
        }
      }, 0);
    } catch (error) {
      this.formError = 'Save failed. Try again.';
      console.error('[character-view] save failed', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  // Delete confirmation
  confirmDelete(id) {
    this._confirmingId = id;
  }

  cancelDelete() {
    this._confirmingId = null;
  }

  async executeDelete(id) {
    // Check if store exists before proceeding
    if (!this.store || !this.store.getState) {
      console.error('[character-view] Store not available for delete operation');
      return;
    }
    
    try {
      await this.store.getState().deleteCharacter(id);
    } catch (error) {
      console.error('[character-view] delete failed', error);
      // Optionally surface inline error
    } finally {
      this._confirmingId = null;
    }
  }

  // Handle keyboard events
  handleKeydown(event) {
    // Escape key handling
    if (event.key === 'Escape') {
      if (this.uiMode === 'create' || this.uiMode === 'edit') {
        this.closeForm();
      } else if (this._confirmingId !== null) {
        this.cancelDelete();
      }
    }
    
    // Enter key handling for form submission
    if (event.key === 'Enter' && (this.uiMode === 'create' || this.uiMode === 'edit')) {
      // Only submit if focus is not on a textarea (to allow line breaks)
      if (event.target.tagName !== 'TEXTAREA') {
        this.submitForm(event);
      }
    }
  }

  // Handle input changes
  handleNameInput(event) {
    this.draft = { ...this.draft, name: event.target.value };
  }

  handleSummaryInput(event) {
    this.draft = { ...this.draft, summary: event.target.value };
  }

  render() {
    return html`
      <div class="character-view" @keydown=${this.handleKeydown}>
        ${this.renderHeader()}
        ${this.uiMode === 'list' ? this.renderList() : this.renderForm()}
      </div>
    `;
  }

  renderHeader() {
    return html`
      <div class="header">
        <h2 id="character-view-heading" tabindex="-1">Characters</h2>
        <div class="header-buttons">
          <button 
            class="btn btn-primary"
            @click=${this.openCreateForm}
            aria-label="Add character"
          >
            Add character
          </button>
          <button 
            class="btn btn-secondary"
            @click=${this.suggestCharacters}
            aria-label="Generate characters with AI"
          >
            Generate with AI
          </button>
        </div>
      </div>
    `;
  }

  renderList() {
    if (this.characters.length === 0) {
      return this.renderEmptyState();
    }
    
    return html`
      <div class="character-list">
        ${this.characters.map(character => this.renderCharacterCard(character))}
      </div>
    `;
  }

  renderEmptyState() {
    return html`
      <div class="empty-state">
        <h3>Build your cast</h3>
        <p>Create characters manually or generate suggestions with AI to get started.</p>
        <div class="header-buttons">
          <button 
            class="btn btn-primary"
            @click=${this.openCreateForm}
            aria-label="Add character"
          >
            Add character
          </button>
          <button 
            class="btn btn-secondary"
            @click=${this.suggestCharacters}
            aria-label="Generate characters with AI"
          >
            Generate with AI
          </button>
        </div>
      </div>
    `;
  }

  renderCharacterCard(character) {
    if (this._confirmingId === character.id) {
      return html`
        <div class="character-card">
          <h3>${character.name}</h3>
          <p>${character.summary}</p>
          <div class="confirm-delete">
            <span>Confirm delete?</span>
            <button 
              class="btn btn-destructive btn-sm"
              @click=${() => this.executeDelete(character.id)}
              aria-label="Confirm delete character ${character.name}"
            >
              Delete
            </button>
            <button 
              class="btn btn-secondary btn-sm"
              @click=${this.cancelDelete}
              aria-label="Cancel delete character ${character.name}"
            >
              Cancel
            </button>
          </div>
        </div>
      `;
    }
    
    return html`
      <div class="character-card">
        <h3>${character.name}</h3>
        <p>${character.summary}</p>
        <div class="character-actions">
          <button 
            class="btn btn-secondary btn-sm"
            @click=${() => this.openEditForm(character)}
            aria-label="Edit character ${character.name}"
          >
            Edit
          </button>
          <button 
            class="btn btn-secondary btn-sm"
            @click=${() => this.confirmDelete(character.id)}
            aria-label="Delete character ${character.name}"
          >
            Delete
          </button>
        </div>
      </div>
    `;
  }

  renderForm() {
    const summaryLength = this.draft.summary.length;
    const isOverLimit = summaryLength > 280;
    
    return html`
      <div class="form-region" role="form" aria-labelledby="character-form-title">
        <h3 id="character-form-title">
          ${this.uiMode === 'create' ? 'Add Character' : 'Edit Character'}
        </h3>
        
        ${this.formError ? html`
          <div class="error-text" role="alert">${this.formError}</div>
        ` : ''}
        
        <form @submit=${this.submitForm}>
          <div class="form-group">
            <label for="char-name">Character name</label>
            <input
              type="text"
              id="char-name"
              class="form-control"
              .value=${this.draft.name}
              @input=${this.handleNameInput}
              required
              aria-invalid=${this.formError && !this.draft.name.trim() ? 'true' : 'false'}
              aria-describedby=${this.formError && !this.draft.name.trim() ? 'name-error' : ''}
            />
            ${this.formError && !this.draft.name.trim() ? html`
              <div id="name-error" class="error-text">Name is required</div>
            ` : ''}
          </div>
          
          <div class="form-group">
            <label for="char-summary">1–2 sentence summary</label>
            <textarea
              id="char-summary"
              class="form-control"
              .value=${this.draft.summary}
              @input=${this.handleSummaryInput}
              required
              rows="3"
              aria-invalid=${(this.formError && (!this.draft.summary.trim() || summaryLength > 280)) ? 'true' : 'false'}
              aria-describedby=${this.formError && !this.draft.summary.trim() ? 'summary-error' : ''}
            ></textarea>
            <span class="helper-text">Keep it short and concrete. Focus on role and key traits.</span>
            ${this.formError && !this.draft.summary.trim() ? html`
              <div id="summary-error" class="error-text">Summary is required</div>
            ` : ''}
            <div class="character-counter ${isOverLimit ? 'over-limit' : ''}">
              ${summaryLength}/280
            </div>
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary"
              ?disabled=${this.isSubmitting}
              aria-label="Save character"
            >
              ${this.isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              class="btn btn-secondary"
              @click=${this.closeForm}
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;
  }

  suggestCharacters() {
    const aiModal = document.querySelector('ai-modal');
    if (aiModal) {
      aiModal.launch('suggest-characters');
    }
  }
}

customElements.define('character-view', CharacterView);