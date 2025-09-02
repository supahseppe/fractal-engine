import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import './suggestion-card.js';

class AIModal extends LitElement {
  static properties = {
    store: { type: Object },
    apiCallback: { type: Object },
    isBusy: { type: Boolean },
    suggestions: { type: Array },
    markdownContent: { type: String },
    modalTitle: { type: String },
    isOpen: { type: Boolean },
    overlayVisible: { type: Boolean },
    overlayMessage: { type: String },
    taskMode: { type: String }, // New property for task mode
  };

  static styles = css`
    .modal {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 50;
    }
    .modal-content-wrapper {
        background-color: #1f2937;
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        width: 100%;
        max-width: 3xl;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        position: relative;
    }
    .modal-content-wrapper.overlay-active .modal-body {
        pointer-events: none;
    }
    .modal-content-wrapper.overlay-active .suggestion-card {
        opacity: 0.6;
        filter: grayscale(0.2);
    }
    .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #374151;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #f3f4f6;
    }
    .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
    }
    .modal-footer {
        padding: 1rem;
        background-color: #1f2937;
        border-top: 1px solid #374151;
        margin-top: auto;
    }
    .hidden {
        display: none;
    }
    .modal-overlay {
        position: absolute;
        inset: 0;
        background-color: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }
    .modal-overlay-card {
        background-color: #111827;
        color: #e5e7eb;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }
    .spinner {
        width: 32px;
        height: 32px;
        border: 4px solid rgba(255,255,255,0.2);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.9s linear infinite;
        margin: 1rem auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #d1d5db;
    }
  `;

  constructor() {
    super();
    this.isBusy = false;
    this.suggestions = [];
    this.markdownContent = '';
    this.modalTitle = 'AI Writing Assistant';
    this.isOpen = false;
    this._unsubscribe = null;
    this.overlayVisible = false;
    this.overlayMessage = 'Loading...';
    this.taskMode = null; // Initialize taskMode
  }

  connectedCallback() {
    super.connectedCallback();
    // Only subscribe if store is defined and has subscribe method
    if (this.store && typeof this.store.subscribe === 'function') {
      this._unsubscribe = this.store.subscribe(() => this.requestUpdate());
    }
  }

  updated(changed) {
    // Only subscribe if store is defined and has subscribe method
    if (changed.has('store') && this.store && typeof this.store.subscribe === 'function' && !this._unsubscribe) {
      this._unsubscribe = this.store.subscribe(() => this.requestUpdate());
    }
    if (changed.has('isBusy')) {
      const evtName = this.isBusy ? 'modal-busy' : 'modal-idle';
      this.dispatchEvent(new CustomEvent(evtName, { bubbles: true, composed: true }));
      // Auto-overlay during model calls; do not override if already visible
      if (this.isBusy && !this.overlayVisible) {
        this.showOverlay('Working...');
      }
      if (!this.isBusy && this.overlayVisible) {
        // Only hide overlays created for AI calls; explicit overlays (e.g., snapshot load)
        // should call hideOverlay themselves. We optimistically hide here; snapshot flow
        // does not toggle isBusy, so it's unaffected.
        this.hideOverlay();
      }
    }
  }

  disconnectedCallback() {
    try { this._unsubscribe?.(); } catch (_) {}
    this._unsubscribe = null;
    super.disconnectedCallback();
  }

  render() {
    if (!this.isOpen) return html``;

    return html`
      <div class="modal" @click=${this._closeModal}>
        <div class="modal-content-wrapper ${this.overlayVisible ? 'overlay-active' : ''}" @click=${(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h3 class="modal-title">${this.modalTitle}</h3>
                <button @click=${this._closeModal} class="text-gray-400 hover:text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="modal-body">
                ${this.isBusy ? html`<div class="loading-wrap"><div class="spinner"></div><p>Thinking...</p></div>` : ''}
                ${this.markdownContent ? unsafeHTML(this.markdownContent) : ''}
                ${this.suggestions.length > 0 ? this._renderSuggestions() : ''}
            </div>
            ${this.overlayVisible ? html`
              <div class="modal-overlay">
                <div class="modal-overlay-card">
                  <span class="spinner" style="width:20px;height:20px;border-width:3px;margin:0;"></span>
                  <span>${this.overlayMessage}</span>
                </div>
              </div>
            ` : ''}
            ${this.suggestions.length > 0 ? this._renderFooter() : ''}
        </div>
      </div>
    `;
  }

  launch(task) {
    // Check if store exists and has getState method before accessing
    if (!this.store || !this.store.getState) {
      this._openModal();
      this._renderMarkdownResponse('App is still initializing. Please try again.');
      return;
    }
    this.taskMode = task; // Set taskMode before invoking apiCallback
    this._openModal();
    this.apiCallback(
      task,
      this.store.getState(),
      this._openModal.bind(this),
      this._setSuggestions.bind(this),
      this._renderMarkdownResponse.bind(this),
      this
    );
  }

  _renderMarkdownResponse(text) {
    try {
      this.markdownContent = marked.parse(text ?? '');
    } catch (e) {
      this.markdownContent = String(text ?? '');
    }
    this.suggestions = [];
    this.isBusy = false;
    this.requestUpdate();
  }

  _renderSuggestions() {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-purple-500'];
    return html`
        ${this.suggestions.map((item, index) => html`
            <suggestion-card 
                .suggestion=${item} 
                .color=${colors[index % colors.length]}
                @apply=${(e) => this._handleApply(e.detail)}
                @iterate=${(e) => this._handleIterate(e.detail)}
                @copy=${(e) => this._handleCopy(e.detail)}
            ></suggestion-card>
        `)}
    `;
  }

  _setSuggestions(items) {
    try {
      this.suggestions = Array.isArray(items) ? items : [];
    } catch (_) {
      this.suggestions = [];
    }
    this.markdownContent = '';
    this.isBusy = false;
    this.requestUpdate();
  }

  _renderFooter() {
    // Check if shadowRoot exists before querying elements
    const selectedCount = this.shadowRoot ? 
      this.shadowRoot.querySelectorAll('.suggestion-checkbox:checked').length : 0;
    const footerDisabled = this.overlayVisible || selectedCount < 1; // Changed from < 2 to < 1 for character mode
    
    // Check if we're in suggest-characters mode
    if (this.taskMode === 'suggest-characters') {
      return html`
        <div class="modal-footer">
          <button 
            @click=${this._handleAddSelectedCharacters} 
            class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors ${footerDisabled ? 'opacity-60 cursor-not-allowed' : ''}"
            .disabled=${footerDisabled}
          >Add ${selectedCount} Selected</button>
        </div>
      `;
    }
    
    // Default behavior for other modes
    const synthesizeDisabled = this.overlayVisible || selectedCount < 2;
    return html`
      <div class="modal-footer">
        <button 
          @click=${this._handleSynthesize} 
          class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors ${synthesizeDisabled ? 'opacity-60 cursor-not-allowed' : ''}"
          .disabled=${synthesizeDisabled}
        >Synthesize ${selectedCount} Selected</button>
      </div>
    `;
  }

  _openModal() { this.isOpen = true; }
  _closeModal() { 
    this.isOpen = false; 
    this.taskMode = null; // Clear taskMode on modal close
  }

  showOverlay(message = 'Loading...') {
    this.overlayMessage = message;
    this.overlayVisible = true;
    this.requestUpdate();
  }

  hideOverlay() {
    this.overlayVisible = false;
    this.requestUpdate();
  }

  _handleApply(summary) {
    // Check if we're in suggest-characters mode
    if (this.taskMode === 'suggest-characters') {
      // Handle character suggestion apply
      this._handleApplyCharacter(summary);
      return;
    }
    
    // Default behavior for other modes - check if store exists
    if (this.store && this.store.getState) {
      const { currentStep, setStepContent } = this.store.getState();
      setStepContent(currentStep, summary);
      document.getElementById(`step-input-${currentStep}`).value = summary;
      document.getElementById('save-button').click();
    }
    this._closeModal();
  }
  
  async _handleApplyCharacter(suggestion) {
    // Check if store exists before accessing
    if (!this.store || !this.store.getState) {
      this._renderMarkdownResponse('App is still initializing. Please try again.');
      return;
    }
    
    try {
      let name = '';
      let summary = '';
      
      // Handle different suggestion formats
      if (typeof suggestion === 'string') {
        // String format - try to extract name
        summary = suggestion;
        const parts = summary.split(/[-:]/);
        if (parts.length > 1) {
          name = parts[0].trim() || 'Character';
        } else {
          name = 'Character';
        }
      } else if (typeof suggestion === 'object' && suggestion !== null) {
        // Object format
        name = suggestion.name || '';
        summary = suggestion.summary || '';
      }
      
      // Validate character data
      if (name.trim() && summary.trim()) {
        // Clamp summary to 1000 chars defensively
        const clampedSummary = summary.substring(0, 1000);
        const character = { name: name.trim(), summary: clampedSummary };
        
        // Add character to store
        await this.store.getState().addCharacter(character);
        
        // Close modal after successful add
        this._closeModal();
      } else {
        // Show error if validation fails
        this._renderMarkdownResponse('Failed to add character. Invalid data.');
      }
    } catch (error) {
      console.error('[ai-modal] _handleApplyCharacter failed', error);
      this._renderMarkdownResponse('Failed to add character. Please try again.');
    }
  }

  _handleCopy(summary) {
    navigator.clipboard.writeText(summary).catch(err => console.error('Failed to copy:', err));
  }

  _handleIterate(summary) {
    // Check if apiCallback exists before calling
    if (!this.apiCallback) {
      this._renderMarkdownResponse('AI functionality is not available.');
      return;
    }
    
    const userQuery = `Act as a development editor brainstorming alternate story paths. The user has chosen a core concept to explore:

**Core Concept:**
"${summary}"

---
Your task is to generate 3 new one-sentence summaries that are **structurally different variations** of the Core Concept. For each new summary, you **must** change at least TWO of the following: the protagonist's primary goal, the nature of the antagonist, the setting, or the story's stakes. Retain the original's spirit.

For each, provide a creative "angle". Return the response as a JSON object.`;
    this.apiCallback('generate', this.store ? this.store.getState() : {}, this._openModal.bind(this), this._setSuggestions.bind(this), this._renderMarkdownResponse.bind(this), this, userQuery);
  }

  _handleSynthesize() {
    // Check if shadowRoot exists before querying elements
    if (!this.shadowRoot) return;
    
    const selectedSummaries = Array.from(this.shadowRoot.querySelectorAll('.suggestion-checkbox:checked'))
       .map(cb => cb.dataset.summary);
   
   if (selectedSummaries.length < 2) return;

   const ideasText = selectedSummaries.map((s, i) => `**Idea ${String.fromCharCode(65 + i)}:** "${s}"`).join('\n');

   const userQuery = `Act as a story-blending alchemist. The user wants to fuse the core DNA of the following ideas:

${ideasText}

---
First, internally identify the single most powerful story element (a character, a conflict, a setting, a magic system) from each idea.

Then, combine these powerful elements to forge 3 new, unexpected, and cohesive one-sentence summaries. The goal is not to mash them together, but to create a novel concept that feels like a natural evolution of both.

For each, provide a creative "angle". Return the response as a JSON object.`;
   
   // Check if apiCallback exists before calling
   if (this.apiCallback) {
     this.apiCallback('generate', this.store ? this.store.getState() : {}, this._openModal.bind(this), this._setSuggestions.bind(this), this._renderMarkdownResponse.bind(this), this, userQuery);
   }
  }

  _handleAddSelectedCharacters() {
    // Check if shadowRoot exists before querying elements
    if (!this.shadowRoot) return;
    
    const selectedCheckboxes = this.shadowRoot.querySelectorAll('.suggestion-checkbox:checked');
    if (selectedCheckboxes.length === 0) return;

    const charactersToAdd = [];
    
    // Process each selected checkbox
    selectedCheckboxes.forEach(checkbox => {
      try {
        let name = '';
        let summary = '';
        
        // Try to get name and summary from data attributes
        if (checkbox.dataset.name) {
          name = checkbox.dataset.name;
        }
        
        if (checkbox.dataset.summary) {
          summary = checkbox.dataset.summary;
        }
        
        // If we have data-payload, try to parse it
        if (checkbox.dataset.payload) {
          try {
            const payload = JSON.parse(checkbox.dataset.payload);
            if (payload.name) name = payload.name;
            if (payload.summary) summary = payload.summary;
          } catch (parseError) {
            console.error('[ai-modal] Failed to parse payload', parseError);
          }
        }
        
        // Fallback: if we only have summary, try to extract name
        if (!name && summary) {
          // Try to extract name from summary (before first dash or colon)
          const parts = summary.split(/[-:]/);
          if (parts.length > 1) {
            name = parts[0].trim() || 'Character';
          } else {
            name = 'Character';
          }
        }
        
        // Validate character data
        if (name.trim() && summary.trim()) {
          // Clamp summary to 1000 chars defensively
          const clampedSummary = summary.substring(0, 1000);
          charactersToAdd.push({ name: name.trim(), summary: clampedSummary });
        }
      } catch (error) {
        console.error('[ai-modal] Error processing character suggestion', error);
      }
    });
    
    if (charactersToAdd.length === 0) {
      // Show error banner if no valid characters
      this._renderMarkdownResponse('Failed to add selected characters. Please try again.');
      return;
    }
    
    // Add characters to store
    this._addCharactersToStore(charactersToAdd);
  }
  
  async _addCharactersToStore(characters) {
    // Check if store exists before accessing
    if (!this.store || !this.store.getState) {
      this._renderMarkdownResponse('App is still initializing. Please try again.');
      return;
    }
    
    let successCount = 0;
    const errors = [];
    
    // Add characters sequentially or with limited concurrency
    for (const character of characters) {
      try {
        await this.store.getState().addCharacter(character);
        successCount++;
      } catch (error) {
        errors.push({ character, error });
        console.error('[ai-modal] addCharacter failed', error);
      }
    }
    
    // If at least one character was added successfully, close the modal
    if (successCount > 0) {
      this._closeModal();
    } else {
      // If all failed, show error banner
      this._renderMarkdownResponse('Failed to add selected characters. Please try again.');
    }
    
    // Log any errors
    if (errors.length > 0) {
      console.error('[ai-modal] Some characters failed to add', errors);
    }
  }
}

customElements.define('ai-modal', AIModal);
