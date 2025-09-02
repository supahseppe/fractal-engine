// Bootstraps the application by wiring the store and UI components
import { useStore } from './store.js';
import { db } from './db.js';
import { callOpenRouterAPI } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  const saveButton = document.getElementById('save-button');
  const generateButton = document.getElementById('generate-button');
  const brainstormButton = document.getElementById('brainstorm-button');
  const refineButton = document.getElementById('refine-button');
  const suggestCharactersButton = document.getElementById('suggest-characters-button');
  const saveNotification = document.getElementById('save-notification');
  const quickSaveButton = document.getElementById('quick-save-button');
  const quickLoadButton = document.getElementById('quick-load-button');
  const aiModal = document.querySelector('ai-modal');
  const projectSidebar = document.querySelector('project-sidebar');

  // Only proceed if required components exist
  if (!aiModal || !projectSidebar) return;

  // Set store and apiCallback for components
  projectSidebar.store = useStore;
  aiModal.store = useStore;
  aiModal.apiCallback = callOpenRouterAPI;

  // Button loading helpers
  const actionButtons = [
    document.getElementById('generate-button'),
    document.getElementById('brainstorm-button'),
    document.getElementById('refine-button'),
    document.getElementById('suggest-characters-button')
  ].filter(Boolean);

  function setButtonLoading(btn, isLoading) {
    if (!btn) return;
    if (!btn.dataset.label) btn.dataset.label = btn.textContent || '';
    btn.disabled = !!isLoading;
    btn.classList.toggle('opacity-60', !!isLoading);
    btn.classList.toggle('cursor-not-allowed', !!isLoading);
    if (isLoading) {
      btn.innerHTML = `<span class="inline-flex items-center gap-2"><span class=\"loader border-2 border-white/30 border-t-white rounded-full w-4 h-4 inline-block animate-spin\"></span>${btn.dataset.label}</span>`;
    } else {
      btn.textContent = btn.dataset.label || '';
    }
  }

  function setActionsLoading(isLoading) {
    actionButtons.forEach(btn => setButtonLoading(btn, isLoading));
  }

  function renderStep() {
    const { currentStep } = useStore.getState();
    const step1 = document.getElementById('step-content-1');
    const step2 = document.getElementById('step-content-2');
    const step3 = document.getElementById('step-3'); // Changed from step-content-3 to step-3
    if (step1 && step2 && step3) {
      step1.classList.toggle('hidden', String(currentStep) !== '1');
      step2.classList.toggle('hidden', String(currentStep) !== '2');
      step3.classList.toggle('hidden', String(currentStep) !== '3');
    }

    // If entering Step 2 and it's empty, default to Step 1 sentence
    if (String(currentStep) === '2') {
      const state = useStore.getState();
      const step1Text = state.steps['1'] || '';
      const input2 = document.getElementById('step-input-2');
      const input2Empty = !input2?.value || input2.value.trim() === '';

      if (step1Text && input2 && input2Empty) {
        input2.value = step1Text;
      }
      // Reflect default into store so features like quick-save capture it,
      // but do not persist to IndexedDB until the user clicks Save.
      const step2EmptyInStore = !state.steps['2'] || state.steps['2'].trim() === '';
      if (step1Text && step2EmptyInStore) {
        state.setStepContent('2', input2?.value || step1Text);
      }
    }
    
    // If entering Step 3, ensure character view is properly initialized
    if (String(currentStep) === '3') {
      const characterView = document.getElementById('character-view');
      if (characterView && !characterView.store) {
        characterView.store = useStore;
      }
    }
  }
  // Keep main view in sync with selected step
  useStore.subscribe(renderStep);
  renderStep();

  async function loadData() {
    const steps = await db.steps.bulkGet(['1', '2']);
    steps.forEach(step => {
      if (step) {
        useStore.getState().setStepContent(step.id, step.content);
        const input = document.getElementById(`step-input-${step.id}`);
        if (input) input.value = step.content;
      }
    });
    useStore.getState().setCurrentStep(useStore.getState().currentStep);
  }

  async function saveData() {
    setButtonLoading(saveButton, true);
    const { currentStep, setStepContent } = useStore.getState();
    const currentInput = document.getElementById(`step-input-${currentStep}`);
    if (currentInput) {
      const content = currentInput.value;
      setStepContent(currentStep, content);
      await db.steps.put({ id: currentStep.toString(), content });
    }
    saveNotification.classList.remove('opacity-0');
    setTimeout(() => saveNotification.classList.add('opacity-0'), 2000);
    setButtonLoading(saveButton, false);
  }

  function quickSave() {
    setButtonLoading(quickSaveButton, true);
    const state = useStore.getState();
    const payload = {
      version: 1,
      currentStep: state.currentStep,
      steps: state.steps,
      createdAt: Date.now(),
    };
    try {
      localStorage.setItem('snowflake_quicksave_v1', JSON.stringify(payload));
      saveNotification.textContent = 'Quick state saved!';
      saveNotification.classList.remove('opacity-0');
      setTimeout(() => {
        saveNotification.classList.add('opacity-0');
        saveNotification.textContent = 'Progress saved!';
      }, 1500);
    } catch (e) {
      console.error('Quick save failed:', e);
      alert('Quick save failed: ' + (e?.message || e));
    }
    setButtonLoading(quickSaveButton, false);
  }

  async function quickLoad() {
    setButtonLoading(quickLoadButton, true);
    // If modal is open, overlay the modal; otherwise use full-screen overlay
    const appOverlay = document.getElementById('app-overlay');
    const appOverlayText = document.getElementById('app-overlay-text');
    const useModalOverlay = !!(aiModal && aiModal.isOpen);
    const showOverlay = (msg) => {
      if (useModalOverlay) {
        if (aiModal.showOverlay) aiModal.showOverlay(msg);
      } else if (appOverlay) {
        if (appOverlayText) appOverlayText.textContent = msg || 'Loading...';
        appOverlay.classList.remove('hidden');
      }
    };
    const hideOverlay = () => {
      if (useModalOverlay) {
        if (aiModal.hideOverlay) aiModal.hideOverlay();
      } else if (appOverlay) {
        appOverlay.classList.add('hidden');
      }
    };
    showOverlay('Loading snapshot...');
    try {
      const raw = localStorage.getItem('snowflake_quicksave_v1');
      if (!raw) { hideOverlay(); alert('No quick save found.'); return; }
      const snapshot = JSON.parse(raw);
      if (!snapshot || typeof snapshot !== 'object') { hideOverlay(); alert('Invalid quick save data.'); return; }

      const { steps = {}, currentStep = 1 } = snapshot;
      // Update store and inputs
      Object.entries(steps).forEach(([id, content]) => {
        useStore.getState().setStepContent(id, content || '');
        const input = document.getElementById(`step-input-${id}`);
        if (input) input.value = content || '';
      });
      useStore.getState().setCurrentStep(String(currentStep));

      // Persist to IndexedDB so normal flows still work
      await Promise.all(Object.entries(steps).map(([id, content]) => db.steps.put({ id: String(id), content: content || '' })));

      saveNotification.textContent = 'Quick state loaded!';
      saveNotification.classList.remove('opacity-0');
      setTimeout(() => {
        saveNotification.classList.add('opacity-0');
        saveNotification.textContent = 'Progress saved!';
      }, 1500);
    } catch (e) {
      console.error('Quick load failed:', e);
      alert('Quick load failed: ' + (e?.message || e));
    } finally {
      hideOverlay();
    }
    setButtonLoading(quickLoadButton, false);
  }

  // Add safety checks for button event listeners
  if (saveButton) saveButton?.addEventListener('click', saveData);
  if (generateButton) generateButton?.addEventListener('click', () => aiModal.launch('generate'));
  if (brainstormButton) brainstormButton?.addEventListener('click', () => aiModal.launch('brainstorm'));
  if (refineButton) refineButton?.addEventListener('click', () => aiModal.launch('refine'));
  if (suggestCharactersButton) suggestCharactersButton?.addEventListener('click', () => aiModal.launch('suggest-characters'));
  
  // Reflect AI modal busy/idle into action buttons
  if (aiModal) {
    aiModal.addEventListener('modal-busy', () => setActionsLoading(true));
    aiModal.addEventListener('modal-idle', () => setActionsLoading(false));
  }
  
  if (quickSaveButton) quickSaveButton?.addEventListener('click', quickSave);
  if (quickLoadButton) quickLoadButton?.addEventListener('click', quickLoad);

  loadData();
});
