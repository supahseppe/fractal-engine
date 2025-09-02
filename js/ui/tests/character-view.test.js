import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { html } from 'lit';
import { litFixture, elementUpdated } from '@open-wc/testing';
import '../character-view.js';

// Mock the ai-modal component
class MockAiModal extends HTMLElement {
  launch() {}
}
customElements.define('ai-modal', MockAiModal);

describe('CharacterView', () => {
  let mockStore;

  beforeEach(() => {
    // Create a mock store for each test
    mockStore = {
      getState: vi.fn(),
      subscribe: vi.fn(),
      setState: vi.fn()
    };
  });

  afterEach(() => {
    // Restore original functions after each test
    vi.restoreAllMocks();
  });

  it('renders an empty state when there are no characters', async () => {
    mockStore.getState.mockReturnValue({
      characters: []
    });
    
    const el = await litFixture(html`<character-view .store=${mockStore}></character-view>`);
    const characterCards = el.shadowRoot.querySelectorAll('.character-card');
    expect(characterCards.length).to.equal(0);
    
    // Check for empty state elements
    const emptyState = el.shadowRoot.querySelector('.empty-state');
    expect(emptyState).to.exist;
    
    const heading = emptyState.querySelector('h3');
    expect(heading.textContent).to.include('Build your cast');
    
    const paragraph = emptyState.querySelector('p');
    expect(paragraph.textContent).to.include('Create characters manually or generate suggestions with AI');
    
    // Check for both CTAs
    const buttons = emptyState.querySelectorAll('.btn');
    expect(buttons.length).to.equal(2);
    
    const addCharacterButton = buttons[0];
    expect(addCharacterButton.textContent).to.include('Add character');
    
    const generateAiButton = buttons[1];
    expect(generateAiButton.textContent).to.include('Generate with AI');
  });

  it('renders a list of characters', async () => {
    // Set up characters in the mock store
    mockStore.getState.mockReturnValue({
      characters: [
        { id: 1, name: 'Character 1', summary: 'Summary 1' },
        { id: 2, name: 'Character 2', summary: 'Summary 2' }
      ]
    });
    
    const el = await litFixture(html`<character-view .store=${mockStore}></character-view>`);
    // Wait for the component to update
    await el.updateComplete;
    
    const characterCards = el.shadowRoot.querySelectorAll('.character-card');
    expect(characterCards.length).to.equal(2);
  });

  it('adds a new character when the form is submitted', async () => {
    const addCharacterSpy = vi.fn().mockResolvedValue({});
    mockStore.getState.mockReturnValue({
      characters: [],
      addCharacter: addCharacterSpy
    });
    
    const el = await litFixture(html`<character-view .store=${mockStore}></character-view>`);
    
    // Click the "Add character" button to open the form
    const addButton = el.shadowRoot.querySelector('.btn-primary');
    addButton.click();
    
    // Wait for the component to update
    await el.updateComplete;
    
    // Fill in the form
    const nameInput = el.shadowRoot.getElementById('char-name');
    const summaryTextarea = el.shadowRoot.getElementById('char-summary');
    const saveButton = el.shadowRoot.querySelector('.form-actions .btn-primary');
    
    nameInput.value = 'New Character';
    nameInput.dispatchEvent(new Event('input'));
    summaryTextarea.value = 'New Summary';
    summaryTextarea.dispatchEvent(new Event('input'));
    saveButton.click();

    expect(addCharacterSpy).toHaveBeenCalledWith({
      name: 'New Character',
      summary: 'New Summary',
    });
  });

  it('edits a character when the edit button is clicked', async () => {
    // Set up a character in the mock store
    const updateCharacterSpy = vi.fn().mockResolvedValue({});
    mockStore.getState.mockReturnValue({
      characters: [
        { id: 1, name: 'Original Name', summary: 'Original Summary' }
      ],
      updateCharacter: updateCharacterSpy
    });
    
    const el = await litFixture(html`<character-view .store=${mockStore}></character-view>`);
    // Wait for the component to update
    await el.updateComplete;

    // Click the edit button
    const editButton = el.shadowRoot.querySelector('.character-card .btn-secondary');
    editButton.click();
    
    // Wait for the component to update
    await el.updateComplete;

    // Fill in the form
    const nameInput = el.shadowRoot.getElementById('char-name');
    const summaryTextarea = el.shadowRoot.getElementById('char-summary');
    const saveButton = el.shadowRoot.querySelector('.form-actions .btn-primary');
    
    nameInput.value = 'New Name';
    nameInput.dispatchEvent(new Event('input'));
    summaryTextarea.value = 'New Summary';
    summaryTextarea.dispatchEvent(new Event('input'));
    saveButton.click();

    expect(updateCharacterSpy).toHaveBeenCalledWith({
      id: 1,
      name: 'New Name',
      summary: 'New Summary',
    });
  });

  it('deletes a character when the delete button is clicked and confirmed', async () => {
    // Set up a character in the mock store
    const deleteCharacterSpy = vi.fn().mockResolvedValue();
    mockStore.getState.mockReturnValue({
      characters: [
        { id: 1, name: 'Character 1', summary: 'Summary 1' }
      ],
      deleteCharacter: deleteCharacterSpy
    });
    
    const el = await litFixture(html`<character-view .store=${mockStore}></character-view>`);
    // Wait for the component to update
    await el.updateComplete;

    // Click the delete button to show confirmation
    const deleteButtons = el.shadowRoot.querySelectorAll('.character-card .btn-secondary');
    const deleteButton = deleteButtons[1]; // Second button is delete
    deleteButton.click();
    
    // Wait for the component to update
    await el.updateComplete;

    // Click the confirm delete button
    const confirmDeleteButton = el.shadowRoot.querySelector('.confirm-delete .btn-destructive');
    confirmDeleteButton.click();

    expect(deleteCharacterSpy).toHaveBeenCalledWith(1);
  });

  it('launches the AI modal for character suggestions', async () => {
    // Add the mock modal to the document body for the component to find
    const aiModal = new MockAiModal();
    document.body.appendChild(aiModal);
    const launchSpy = vi.spyOn(aiModal, 'launch');

    mockStore.getState.mockReturnValue({
      characters: []
    });
    
    const el = await litFixture(html`<character-view .store=${mockStore}></character-view>`);
    const suggestButton = el.shadowRoot.querySelector('.btn-secondary:nth-child(2)');
    suggestButton.click();

    expect(launchSpy).toHaveBeenCalledWith('suggest-characters');

    // Clean up the mock modal from the body
    document.body.removeChild(aiModal);
  });
});