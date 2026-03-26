import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNotes } from './NoteContext';

const AIContext = createContext();

export const MODEL_OPTIONS = [
    "Gemini 3.1 Flash-Lite",
    "Gemini 3 Flash",
    "Gemini 2.5 Flash",
    "Gemini 2 Flash",
    "Gemma 3 27B",
    "Gemma 3 12B"
];

const MODEL_MAPPING = {
    "Gemini 3.1 Flash-Lite": "gemini-3.1-flash-lite-preview",
    "Gemini 3 Flash": "gemini-3-flash-preview",
    "Gemini 2.5 Flash": "gemini-2.5-flash",
    "Gemini 2 Flash": "gemini-2.0-flash",
    "Gemma 3 27B": "gemma-3-27b",
    "Gemma 3 12B": "gemma-3-12b"
};

export const AIProvider = ({ children }) => {
    const { state, addNote } = useNotes();
    const [apiKey, setApiKey] = useState(() => {
        return localStorage.getItem('magnotes_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    });
    
    const [selectedModel, setSelectedModel] = useState(() => {
        return localStorage.getItem('magnotes_selected_model') || "Gemini 2.5 Flash";
    });
    
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('magnotes_chat_history');
        return saved ? JSON.parse(saved) : [{
            role: 'assistant',
            content: 'How can I help you with your research today?'
        }];
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem('magnotes_chat_history', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('magnotes_gemini_api_key', apiKey);
        }
    }, [apiKey]);

    useEffect(() => {
        localStorage.setItem('magnotes_selected_model', selectedModel);
    }, [selectedModel]);

    const sendMessage = async (userInput, taggedNotes = [], targetNotebookId = null, retryCount = 0) => {
        if (!userInput.trim()) return;

        // Only add user message to state on initial call
        if (retryCount === 0) {
            setMessages(prev => [...prev, { role: 'user', content: userInput }]);
        }
        setIsLoading(true);

        try {
            if (!apiKey) {
                throw new Error("The Scriptorium requires a Key of Wisdom (API Key) to function. Please provide it in the settings.");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const modelId = MODEL_MAPPING[selectedModel] || "gemini-2.5-flash";
            const model = genAI.getGenerativeModel({ model: modelId });

            // Prepare Context
            const notesContext = taggedNotes.length > 0 
                ? `\nRESEARCH MATERIALS FOR THIS SPECIFIC INQUIRY:\n${taggedNotes.map(n => `--- MEMORIAL: ${n.title} ---\n${n.content}\n`).join('\n')}`
                : '';

            const globalContext = `
                RESEARCH ARCHIVE CONTEXT:
                Notebooks: ${Object.values(state.notebooks).map(n => `[ID: ${n.id}] ${n.title}`).join(', ')}
                Total Tasks: ${Object.values(state.tasks).length}
                Total Notes: ${Object.values(state.notes).length}
                ${targetNotebookId ? `ACTIVE TARGET NOTEBOOK ID: ${targetNotebookId}` : ''}
            `;

            const systemPrompt = `
                You are a highly capable research assistant for a scholarly notebook application. 
                Your goal is to provide accurate, concise, and helpful information based on the user's research archives.
                
                ${globalContext}
                ${notesContext}
                
                ACTION CAPABILITY:
                If the user asks you to "Save this", "Create a note", or "Add to archives", you MUST output this exact JSON block at the end of your response:
                { "action": "create_note", "notebookId": "${targetNotebookId || "TARGET_NB_ID"}", "title": "Note Title", "content": "Markdown Content" }
                ${targetNotebookId ? "PRIORITIZE using the ACTIVE TARGET NOTEBOOK ID provided in the context." : "Use the valid Notebook IDs provided in the context."}
                
                NUDGE: Always look for opportunities to include external scholarly sources, citations, or links to academic resources.
                Maintain a professional and academic tone.
            `;

            const chatHistory = messages
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }],
                }));

            while(chatHistory.length > 0 && chatHistory[0].role === 'model') chatHistory.shift();

            const chat = model.startChat({ history: chatHistory });
            const result = await chat.sendMessage(`${systemPrompt}\n\nUSER INQUIRY: ${userInput}`);
            const responseText = result.response.text();

            // Intercept Action with Improved Regex
            const actionMatch = responseText.match(/\{[\s\S]*"action":\s*"create_note"[\s\S]*\}/);
            
            if (actionMatch) {
                try {
                    const data = JSON.parse(actionMatch[0]);
                    if (data.notebookId && data.title && data.content) {
                        addNote(data.notebookId, data.title, data.content);
                        const cleanMsg = responseText.replace(actionMatch[0], "").trim();
                        setMessages(prev => [...prev, { role: 'assistant', content: cleanMsg + "\n\n*(Research memo saved to archives successfully)*" }]);
                    } else {
                        throw new Error("Missing required archival fields.");
                    }
                } catch (e) {
                    console.warn("AI Schema Error, attempting self-correction...", e.message);
                    if (retryCount < 1) {
                        return sendMessage("Your last archival instruction was malformed (missing fields or invalid JSON). Please output ONLY the corrected JSON block now.", taggedNotes, targetNotebookId, retryCount + 1);
                    }
                    setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
                }
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
            }
        } catch (error) {
            console.error("Archive Error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Forgive me, Scholar. An error occurred in the archives: ${error.message}` 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: 'The archives have been cleared. A fresh scroll awaits.'
        }]);
    };

    /**
     * Refine a specific note with AI strategies
     * @param {string} prompt - User instruction
     * @param {string} currentContent - Note content context
     * @param {string} option - 'generate' | 'summarize' | 'transcript'
     */
    const refineNoteAI = async (prompt, currentContent, option) => {
        if (!apiKey) throw new Error("API Key required.");
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const modelId = MODEL_MAPPING[selectedModel] || "gemini-2.5-flash";
            const model = genAI.getGenerativeModel({ model: modelId });

            let systemInstruction = "";
            let userPrompt = "";

            if (option === 'generate') {
                systemInstruction = "You are a scholarly scribe. Generate additional relevant research content to APPEND to the existing note based on the user's prompt. Maintain the existing tone and style.";
                userPrompt = `EXISTING NOTE:\n${currentContent}\n\nSCRIBER'S PROMPT: ${prompt}\n\nGenerate ONLY the additional text to append.`;
            } else if (option === 'summarize') {
                systemInstruction = "You are a scholarly archivist. Distill the existing note into a concise, high-density summary or abstract. Rewrite the entire note to be a summary of its core arguments.";
                userPrompt = `EXISTING NOTE:\n${currentContent}\n\nFOCUS PROMPT: ${prompt || "Summarize the entire work."}\n\nOutput only the summarized text.`;
            } else if (option === 'transcript') {
                systemInstruction = "You are an expert at transcribing scholarly discourse. Take the raw transcript or notes provided and organize them into high-quality, formatted research prose. Use the existing note's context if relevant.";
                userPrompt = `CONTEXT FROM CURRENT NOTES:\n${currentContent}\n\nRAW INPUT/TRANSCRIPT: ${prompt}\n\nFormat this into clean, scholarly markdown. Output only the formatted content.`;
            }

            const result = await model.generateContent(`${systemInstruction}\n\n${userPrompt}`);
            return result.response.text().trim();
        } catch (error) {
            console.error("Refinement Error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AIContext.Provider value={{ 
            messages, 
            sendMessage, 
            refineNoteAI, 
            isLoading, 
            clearChat, 
            apiKey, 
            setApiKey,
            selectedModel,
            setSelectedModel,
            MODEL_OPTIONS
        }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) throw new Error("useAI must be used within AIProvider");
    return context;
};
