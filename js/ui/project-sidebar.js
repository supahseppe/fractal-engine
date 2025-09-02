import { LitElement, html, css } from 'lit';

class ProjectSidebar extends LitElement {
  static properties = {
    store: { type: Object },
  };

  static styles = css`
    :host {
        display: block;
        height: 100%;
    }
    .sidebar {
        background-color: #1f2937; /* bg-gray-800 */
        padding: 1rem; /* p-4 */
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
    }
    .sidebar-title {
        font-size: 1.25rem; /* text-xl */
        font-weight: 700; /* font-bold */
        color: #f3f4f6; /* text-white */
        margin-bottom: 1.5rem; /* mb-6 */
    }
    .sidebar-list {
        list-style: none;
        padding: 0;
        margin: 0;
        space-y: 0.5rem;
    }
    .sidebar-link {
        display: block;
        padding: 0.5rem 0.75rem; /* py-2 px-3 */
        border-radius: 0.5rem; /* rounded-lg */
        transition: all 0.2s ease-in-out;
        color: #d1d5db; /* text-gray-300 */
        text-decoration: none;
    }
    .sidebar-link.active {
        background-color: #4f46e5; /* bg-indigo-600 */
        color: white;
        font-weight: 600;
    }
    .sidebar-link:not(.active):hover {
        background-color: #374151; /* bg-gray-700 */
    }
    .count-badge {
        display: inline-block;
        min-width: 1.25ch;
        padding: 0 0.375rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        line-height: 1.25;
        background-color: #374151; /* gray-700 */
        color: #e5e7eb;
        margin-left: 0.5rem;
    }
    .sidebar-link.active .count-badge {
        background-color: #4338ca; /* indigo-700 */
    }
  `;

  constructor() {
    super();
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
  }

  disconnectedCallback() {
    try { this._unsubscribe?.(); } catch (_) {}
    this._unsubscribe = null;
    super.disconnectedCallback();
  }

  _handleLinkClick(e) {
    e.preventDefault();
    // Use currentTarget instead of target to avoid issues with nested elements
    const step = e.currentTarget.dataset.step;
    if (this.store && this.store.getState) {
      this.store.getState().setCurrentStep(step);
    }
  }

  render() {
    // Check if store exists and has getState method before accessing
    if (!this.store || !this.store.getState) {
      return html`<nav class="sidebar"><h1 class="sidebar-title">Snowflake Method</h1></nav>`;
    }
    
    const { currentStep } = this.store.getState();
    
    // Derive character count for Step 3, with safety checks
    const count = this.store.getState().characters ? this.store.getState().characters.length : 0;
    
    return html`
      <nav class="sidebar">
        <h1 class="sidebar-title">Snowflake Method</h1>
        <ul class="sidebar-list">
            <li><a href="#" class="sidebar-link ${currentStep == 1 ? 'active' : ''}" data-step="1" @click=${this._handleLinkClick}>1. One-Sentence Summary</a></li>
            <li><a href="#" class="sidebar-link ${currentStep == 2 ? 'active' : ''}" data-step="2" @click=${this._handleLinkClick}>2. One-Paragraph Summary</a></li>
            <li><a href="#" 
                   class="sidebar-link ${currentStep == 3 ? 'active' : ''}" 
                   data-step="3" 
                   @click=${this._handleLinkClick}
                   aria-label=${`3. Character Summaries, ${count} ${count === 1 ? 'character' : 'characters'}`}
                   >3. Character Summaries <span class="count-badge">${count}</span></a></li>
        </ul>
      </nav>
    `;
  }
}

customElements.define('project-sidebar', ProjectSidebar);
