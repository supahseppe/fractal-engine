const OPENROUTER_URL = '/api/openrouter'; // dev proxy or server endpoint
const DEFAULT_MODEL = 'deepseek/deepseek-chat-v3.1:free';

function getSystemPrompt() {
    return "You are an expert novelist and creative writing assistant. You are guiding a user through the Snowflake Method. Your tone is encouraging and insightful. When asked to generate ideas, be creative and provide distinct options.";
}

export async function callOpenRouterAPI(task, appState, openModal, renderSuggestions, renderMarkdownResponse, modalLoading, overrideQuery = null) {
    openModal();
    if (modalLoading && 'isBusy' in modalLoading) modalLoading.isBusy = true;
    // Show a task-specific overlay message when possible
    try {
        const msgMap = {
            'generate': 'Generating suggestions...',
            'brainstorm': 'Fetching advice...',
            'refine': 'Refining your text...',
            'suggest-characters': 'Suggesting characters...'
        };
        const overlayMsg = msgMap[task] || 'Contacting model...';
        if (modalLoading && typeof modalLoading.showOverlay === 'function') {
            modalLoading.showOverlay(overlayMsg);
        }
    } catch (_) {}

    // Add safety check for document.getElementById
    const currentStepElement = document.getElementById(`step-input-${appState.currentStep}`);
    const currentStepContent = currentStepElement ? currentStepElement.value : '';
    
    if ((task === 'generate' || task === 'refine') && currentStepContent.trim() === '' && !overrideQuery) {
        renderMarkdownResponse('Please enter some text in the text area first.');
        if (modalLoading && 'isBusy' in modalLoading) modalLoading.isBusy = false;
        return;
    }

    let userQuery = overrideQuery;
    // Default JSON expectation for 'generate' tasks; others may override below
    let wantsJson = (task === 'generate' || !!overrideQuery);

    if (!userQuery) {
        const context = `Here is the current story context from previous steps:\n\n**Step 1:** ${appState.steps['1'] || 'Not started.'}`;
        const stepTitles = { '1': 'One-Sentence Summary', '2': 'One-Paragraph Summary' };
        const currentStepTitle = stepTitles[String(appState.currentStep)] || `Step ${appState.currentStep}`;

        const step = String(appState.currentStep);
        switch(task) {
            case 'generate':
                if (step === '1') {
                    userQuery = `Act as a master storyteller and genre expert. The user has provided the following raw story premise: "${currentStepContent}". Your task is to transform this premise into 4 distinct, compelling one-sentence summaries that could launch a novel.

For each summary, you must:
1) Explore a radically different creative direction (e.g., change genre, protagonist motivation, central conflict).
2) Provide a specific and evocative "angle" that captures sub-genre and tone (e.g., 'Hopepunk Adventure', 'Gothic Steampunk', 'Cosmic Horror Mystery'). Avoid generic labels.

Return the response as a pure JSON array of {"summary": string, "angle": string}.`;
                } else if (step === '2') {
                    userQuery = `You are assisting with Step 2 of the Snowflake Method.

Given the finalized one-sentence summary from Step 1:
"${appState.steps['1'] || ''}"

And the user's current notes for Step 2 (may be empty):
"${currentStepContent}"

Generate 3 complete one-paragraph story summaries. Each version should propose a different three-act shape:
- One that is character-driven (internal change, relationship stakes)
- One that is plot-driven (external disasters escalate)
- One that leans into mystery/twist (revelations and reversals)

Each paragraph should stand alone as a clear, cohesive plot outline. For each, provide a concise, evocative angle label like 'Character-Driven', 'Plot-Driven', or 'Mystery Twist'.

Return the response as a pure JSON array of {"summary": string, "angle": string}.`;
                }
                break;
            case 'suggest-characters':
                wantsJson = true; // We want JSON for character suggestions
                // Get Step 1 and Step 2 content from appState
                // Based on the store structure, steps are stored directly as strings
                const step1Content = appState.steps?.['1'] || '';
                const step2Content = appState.steps?.['2'] || '';
                
                // Handle missing content gracefully
                const step1Text = step1Content.trim() || 'N/A';
                const step2Text = step2Content.trim() || 'N/A';
                
                userQuery = `Return ONLY valid JSON (no markdown) as an array of objects: [{"name": "string", "summary": "string"}]. Generate 5 distinct, archetype-varied characters grounded in the following story context:

Step 1 (One-sentence summary):
${step1Text}

Step 2 (One-paragraph summary):
${step2Text}

Rules:
- Each summary is 1–2 sentences (max 280 chars), concrete and specific.
- Names should be human-readable and setting-appropriate.
- Avoid duplicates; no worldbuilding dumps; no spoilers.`;
                break;
            case 'brainstorm':
                if (step === '1') {
                    userQuery = `${context}

The user is on ${currentStepTitle}. Provide creative prompts and guidelines to help explore different directions for a strong one-sentence hook.`;
                } else if (step === '2') {
                    userQuery = `${context}

The user is on ${currentStepTitle}. Offer advice on shaping a strong paragraph summary (setup, escalating disasters, ending). Include tips to anticipate Step 3 (Character Summaries): what protagonist/antagonist roles emerge from this paragraph?`;
                }
                break;
            case 'refine':
                if (step === '1') {
                    userQuery = `${context}

The user wrote: "${currentStepContent}". Help refine the one-sentence summary: tighten clarity, stakes, and specificity. Provide 2-3 improved options.`;
                } else if (step === '2') {
                    userQuery = `${context}

The user wrote this Step 2 paragraph:

"${currentStepContent}"

Help refine it: strengthen the disasters and turning points, ensure causal flow to the ending, and tighten prose. Provide 1 polished version plus 2 alternative outlines that push different focuses (character, plot, or mystery).`;
                }
                break;
        }
    }
    
    // Build OpenRouter-compatible payload
    const payload = {
        model: DEFAULT_MODEL,
        messages: [
            { role: 'system', content: getSystemPrompt() },
            { role: 'user', content: userQuery }
        ]
    };

    // Hint the model to produce JSON when we expect suggestions
    if (wantsJson) {
        if (task === 'suggest-characters') {
            // For suggest-characters, we want a specific JSON format
            payload.messages[1].content += "\n\nReturn ONLY valid JSON (no markdown) as an array of objects: [{\"name\": \"string\", \"summary\": \"string\"}].";
        } else {
            // For other tasks, use the existing format
            payload.messages[1].content += "\n\nReturn the response as a pure JSON array with objects of the shape {\"summary\": string, \"angle\": string} and no surrounding commentary.";
        }
        // If/when strict JSON schema is desired and supported across models, consider:
        // payload.response_format = { type: 'json_schema', json_schema: { name: 'suggestions', schema: { ... }, strict: true } };
    }

    try {
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
        
        const result = await response.json();
        const text = result?.choices?.[0]?.message?.content;
        
        if (!text) throw new Error("Received an empty response from the AI.");

        if (wantsJson) {
            try {
                // For suggest-characters, we expect a different JSON format
                if (task === 'suggest-characters') {
                    // Try to parse the JSON response
                    let jsonData;
                    try {
                        jsonData = JSON.parse(text);
                    } catch (parseError) {
                        // Try to strip common markdown fences and retry
                        const cleanedText = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
                        try {
                            jsonData = JSON.parse(cleanedText);
                        } catch (retryError) {
                            console.warn("Failed to parse JSON for suggest-characters, showing error to user");
                            renderMarkdownResponse(`Sorry, I received an unexpected format. Here is the raw response:\n\n\`\`\`\n${text.substring(0, 500)}${text.length > 500 ? '...' : ''}\n\`\`\``);
                            return;
                        }
                    }
                    
                    // Validate shape to an array of objects with {name: string, summary: string}
                    if (Array.isArray(jsonData)) {
                        const validCharacters = jsonData
                            .filter(item => 
                                item && 
                                typeof item === 'object' && 
                                typeof item.name === 'string' && 
                                typeof item.summary === 'string' &&
                                item.name.trim() !== '' &&
                                item.summary.trim() !== ''
                            )
                            .map(item => ({
                                name: item.name.trim(),
                                summary: item.summary.trim().substring(0, 280) // Enforce max length
                            }));
                        
                        // Keep at least 1 valid item if possible
                        if (validCharacters.length > 0) {
                            if (typeof renderSuggestions === 'function') {
                                renderSuggestions(validCharacters);
                            } else {
                                renderMarkdownResponse(JSON.stringify(validCharacters, null, 2));
                            }
                        } else {
                            console.warn("No valid characters found in response");
                            renderMarkdownResponse(`Sorry, I couldn't generate valid character suggestions. Here is the raw response:\n\n\`\`\`\n${text.substring(0, 500)}${text.length > 500 ? '...' : ''}\n\`\`\``);
                        }
                    } else {
                        console.warn("Response is not an array");
                        renderMarkdownResponse(`Sorry, I received an unexpected format. Here is the raw response:\n\n\`\`\`\n${text.substring(0, 500)}${text.length > 500 ? '...' : ''}\n\`\`\``);
                    }
                } else {
                    // Existing logic for other tasks
                    const jsonData = JSON.parse(text);
                    if (typeof renderSuggestions === 'function') {
                        renderSuggestions(jsonData);
                    } else {
                        renderMarkdownResponse(Array.isArray(jsonData) ? JSON.stringify(jsonData, null, 2) : String(text));
                    }
                }
            } catch (e) {
                console.error("Failed to parse JSON:", text.substring(0, 100) + (text.length > 100 ? '...' : ''));
                renderMarkdownResponse("Sorry, I received an unexpected format. Here is the raw response:\n\n```\n" + text + "\n```");
            }
        } else {
            renderMarkdownResponse(text);
        }
    } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        renderMarkdownResponse(`<p class="text-red-400">An error occurred: ${error.message}</p>`);
    } finally {
        if (modalLoading && 'isBusy' in modalLoading) modalLoading.isBusy = false;
        try { if (modalLoading && typeof modalLoading.hideOverlay === 'function') modalLoading.hideOverlay(); } catch (_) {}
    }
}
