Feature Vision: A Step-by-Step Creative Partnership

This document outlines the intended user experience and AI-powered features for each step of the Snowflake Method application. The core philosophy is to transform the app from a simple text editor into an active creative partner that helps writers generate, iterate, and synthesize ideas.

Step 1: One-Sentence Summary
UI: A single, welcoming text area.

Creative AI Features (Already Implemented):

Generate: Takes a user's raw premise (e.g., "a story about a space wizard") and generates 3-5 distinct, compelling one-sentence summaries. Each comes with a creative "angle" tag (e.g., 'Cosmic Horror', 'Political Sci-Fi') to inspire different genre directions.

Iterate: Allows the user to select a single generated summary and ask the AI to create new variations, forcing it to change core components like the protagonist's goal or the nature of the conflict.

Synthesize: Allows the user to select two or more summaries and have the AI fuse their most compelling elements into a new, hybrid concept.

Data Storage: The final summary is stored as a simple string.

Step 2: One-Paragraph Summary
UI: A larger text area for the paragraph.

Creative AI Features:

Generate: The AI will read the final one-sentence summary from Step 1. It will then generate 2-3 complete paragraph summaries. Each version will propose a different three-act structure: one might focus on a character-driven conflict, another on a plot-driven disaster, and a third on a mystery.

Iterate/Refine: A user can write a paragraph and ask the AI for targeted improvements, such as:

"Make the second disaster feel more personal to the hero."

"Suggest a twist for the ending."

"Strengthen the connection between the setup and the conclusion."

Data Storage: The final paragraph is stored as a string.

Step 3: Character Summaries
UI: A dynamic list of characters. An "Add Character" button creates a new entry with a field for the character's name and a text area for their one-paragraph summary.

Creative AI Features:

Suggest Characters: Based on the summaries from Steps 1 and 2, the AI will propose a cast of essential characters (e.g., Protagonist, Antagonist, Mentor, Foil). It will generate a name and a brief, one-line role description for each, which the user can then add to their list to flesh out.

Generate Summary: For a newly added character, the AI can read their name/role and the plot summary to generate a one-paragraph character summary focusing on their storyline, goals, and core conflict.

Data Storage: Stored as an array of character objects, each with an ID, name, and summary. [{"id": "char1", "name": "...", "summary": "..."}]

Step 4: Character Profiles
UI: Expands on the character list from Step 3. Clicking a character opens a larger text area for their full, one-page profile.

Creative AI Features:

Expand to Profile: The AI will take a character's one-paragraph summary (from Step 3) and expand it into a full one-page profile, generating details about their backstory, motivations, internal conflicts, and physical appearance.

Character Interview: The AI can generate a list of insightful interview questions tailored to that specific character, prompting the writer to think more deeply about their creation. The user's answers can then be incorporated into the profile.

Data Storage: Stored in a parallel array, linking to characters by ID. [{"id": "char1", "profile": "..."}]

Step 5: Multi-Page Synopsis
UI: A large, single text area for a 4-5 page synopsis.

Creative AI Features:

Generate Synopsis: This is a major synthesis step. The AI will read the one-paragraph plot summary (Step 2) and all the character summaries (Step 3). It will then weave them together into a detailed, multi-paragraph synopsis, showing how the plot events affect each character and how the characters' decisions drive the plot.

Inject Subplot: The user can highlight a section of the synopsis and ask the AI to "Weave in a romantic subplot for these two characters here" or "Suggest a betrayal that complicates this section."

Data Storage: The final synopsis is stored as a long string.

Step 6: Character Charts
UI: The character list view, but clicking a character opens a structured form with fields for "Goal," "Conflict," "Motivation," "Epiphany," etc.

Creative AI Features:

Auto-Fill Chart: For a given character, the AI will read their detailed profile (Step 4) and the full synopsis (Step 5) to intelligently fill in the chart fields. It will infer the character's major turning point from the plot to suggest a powerful Epiphany.

Deepen Motivation: The user can click an "Iterate" button next to any field. For "Motivation," the AI could suggest deeper, more primal reasons for a character's stated goal, adding psychological complexity.

Data Storage: Stored in another parallel array. [{"id": "char1", "chart": "{...}"}]

Step 7 & 8: Scene List & Scene Descriptions
UI: A re-orderable list of scenes. Each scene is an item that can be expanded to reveal a large text area for its full description.

Creative AI Features:

Generate Scene List: This is a cornerstone feature. The AI will read the multi-page synopsis (Step 5) and break it down into a logical, ordered list of scenes. It will provide a working title and identify the Point-of-View character for each scene.

Pacing Analysis: The user can ask the AI to "Add a quiet, reflective scene after this big action sequence" or "Suggest a scene to introduce the antagonist's perspective earlier."

Generate Scene Description: For any scene in the list, the AI will take its title, the POV character's chart (Step 6), and the relevant part of the synopsis (Step 5) to write a multi-paragraph description of the scene, including the character's goal for the scene, the central conflict, and the outcome.

Data Storage: Two parallel arrays for the list and the descriptions. [{"id": "scene1", "title": "..."}, ...] and [{"id": "scene1", "fullDescription": "..."}]