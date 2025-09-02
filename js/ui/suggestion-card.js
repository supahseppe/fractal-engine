import { LitElement, html, css } from 'lit';

class SuggestionCard extends LitElement {
  static properties = {
    suggestion: { type: Object },
    color: { type: String },
  };

  static styles = css`
    .suggestion-card {
      background-color: #374151;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      position: relative;
    }
    .suggestion-card .suggestion-checkbox {
      margin-top: 0.25rem;
    }
    .suggestion-tag {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .action-toolbar {
      display: flex;
      gap: 0.5rem;
      margin-left: auto;
    }
    .action-icon {
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      color: #9ca3af;
    }
    .action-icon:hover {
      background-color: #4b5563;
      color: #f3f4f6;
    }
    .action-icon.apply-btn:hover { color: #10b981; }
    .action-icon.iterate-btn:hover { color: #8b5cf6; }
    .action-icon.copy-btn:hover { color: #3b82f6; }
  `;

  _handleApply() {
    this.dispatchEvent(new CustomEvent('apply', { detail: this.suggestion }));
  }

  _handleIterate() {
    this.dispatchEvent(new CustomEvent('iterate', { detail: this.suggestion }));
  }

  _handleCopy() {
    this.dispatchEvent(new CustomEvent('copy', { detail: this.suggestion }));
  }

  render() {
    // Handle different suggestion formats
    let name = '';
    let summary = '';
    let angle = '';
    
    if (typeof this.suggestion === 'string') {
      // Legacy string format
      summary = this.suggestion;
    } else if (typeof this.suggestion === 'object' && this.suggestion !== null) {
      // New object format (could be character or suggestion)
      if (this.suggestion.name && this.suggestion.summary) {
        // Character format
        name = this.suggestion.name;
        summary = this.suggestion.summary;
      } else {
        // Suggestion format
        name = this.suggestion.name || '';
        summary = this.suggestion.summary || '';
        angle = this.suggestion.angle || '';
      }
    }
    
    // Create payload for data attribute
    const payload = JSON.stringify({ name, summary });
    
    return html`
      <div class="suggestion-card">
          <input 
            type="checkbox" 
            class="suggestion-checkbox" 
            data-summary="${summary.replace(/"/g, '&quot;')}"
            data-payload="${payload.replace(/"/g, '&quot;')}"
            ${name ? `data-name="${name.replace(/"/g, '&quot;')}"` : ''}
          >
          <div>
              ${angle ? html`<span class="suggestion-tag ${this.color}">${angle}</span>` : ''}
              ${name ? html`<h4 class="text-gray-100 font-semibold">${name}</h4>` : ''}
              <p class="text-gray-300">${summary}</p>
          </div>
          <div class="action-toolbar">
              <div class="action-icon apply-btn" title="Apply Summary" @click=${this._handleApply}><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
              ${!name ? html`<div class="action-icon iterate-btn" title="Iterate on this Idea" @click=${this._handleIterate}><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>` : ''}
              <div class="action-icon copy-btn" title="Copy Text" @click=${this._handleCopy}><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></div>
          </div>
      </div>
    `;
  }
}

customElements.define('suggestion-card', SuggestionCard);
