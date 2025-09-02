import { db } from './db.js';
import { callOpenRouterAPI } from './api.js';
import { useStore } from './store.js';

document.addEventListener('DOMContentLoaded', () => {

    const saveButton = document.getElementById('save-button');
    const generateButton = document.getElementById('generate-button');
    const brainstormButton = document.getElementById('brainstorm-button');
    const refineButton = document.getElementById('refine-button');
    const saveNotification = document.getElementById('save-notification');
    const aiModal = document.querySelector('ai-modal');
    const projectSidebar = document.querySelector('project-sidebar');
    
    // Step 3 elements
    const step3 = document.getElementById('step-3');
    const step3Heading = document.getElementById('step-3-heading');
    const characterView = document.getElementById('character-view');

    // Ensure components exist before setting properties
    if (projectSidebar) {
        projectSidebar.store = useStore;
    }
    if (aiModal) {
        aiModal.store = useStore;
        aiModal.apiCallback = callOpenRouterAPI;
    }
    
    // Provide the store to the character view
    if (characterView) {
        characterView.store = useStore;
    }

    // View toggle function to show exactly one step
    function showStep(stepNum) {
        // Get all step containers
        const step1 = document.getElementById('step-content-1');
        const step2 = document.getElementById('step-content-2');
        
        // Hide all steps
        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'none';
        if (step3) step3.style.display = 'none';
        
        // Show the requested step
        switch (stepNum) {
            case 1:
                if (step1) step1.style.display = '';
                break;
            case 2:
                if (step2) step2.style.display = '';
                break;
            case 3:
                if (step3) step3.style.display = '';
                break;
        }
    }

    // Subscribe to store changes for step navigation
    useStore.subscribe(async (state) => {
        const step = state.currentStep;
        
        if (step === 3) {
            // Lazy load characters on first entry to Step 3
            if (!useStore.getState().isCharactersLoaded) {
                try {
                    await useStore.getState().loadCharacters();
                } catch (err) {
                    console.error('[app] loadCharacters failed', err);
                }
            }
            
            // Show Step 3 and hide others
            showStep(3);
            
            // Focus management - move focus to Step 3 heading
            if (step3Heading) {
                // Use setTimeout for better browser compatibility
                setTimeout(() => {
                    step3Heading.focus();
                }, 0);
            }
        } else if (step === 1 || step === 2) {
            // Show the appropriate step
            showStep(step);
        }
    });

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
        const { currentStep, setStepContent } = useStore.getState();
        const currentInput = document.getElementById(`step-input-${currentStep}`);
        if (currentInput) {
            const content = currentInput.value;
            setStepContent(currentStep, content);
            await db.steps.put({ id: currentStep.toString(), content });
        }
        saveNotification.classList.remove('opacity-0');
        setTimeout(() => saveNotification.classList.add('opacity-0'), 2000);
    }

    saveButton.addEventListener('click', saveData);
    generateButton.addEventListener('click', () => {
        if (aiModal) aiModal.launch('generate');
    });
    brainstormButton.addEventListener('click', () => {
        if (aiModal) aiModal.launch('brainstorm');
    });
    refineButton.addEventListener('click', () => {
        if (aiModal) aiModal.launch('refine');
    });

    // Initialize the display based on current step
    showStep(useStore.getState().currentStep);
    
    loadData();
});
