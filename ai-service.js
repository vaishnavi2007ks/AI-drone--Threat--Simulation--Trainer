/**
 * AeroShield AI Service Gateway
 * Provides dual-mode AI capabilities:
 * 1. Live Google Gemini API acceleration (when API key is provided)
 * 2. High-fidelity built-in offline generative algorithms (zero-cost, zero-dependency, works offline & GitHub Pages)
 */

class AIService {
  constructor() {
    this.storageKey = 'aeroshield_gemini_api_key';
    this.modelStorageKey = 'aeroshield_gemini_model';
    this.apiKey = localStorage.getItem(this.storageKey) || '';
    this.selectedModel = localStorage.getItem(this.modelStorageKey) || 'gemini-1.5-flash';
    this.isOnline = navigator.onLine;
    this.hasActiveKey = !!this.apiKey.trim();

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
    }
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (this.apiKey) {
      localStorage.setItem(this.storageKey, this.apiKey);
      this.hasActiveKey = true;
    } else {
      localStorage.removeItem(this.storageKey);
      this.hasActiveKey = false;
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  setModel(model) {
    this.selectedModel = model || 'gemini-1.5-flash';
    localStorage.setItem(this.modelStorageKey, this.selectedModel);
  }

  getModel() {
    return this.selectedModel;
  }

  isLiveAIAvailable() {
    return this.hasActiveKey && this.isOnline;
  }

  /**
   * Universal completion method that calls Gemini if key is provided,
   * or falls back seamlessly to the offline provider function.
   */
  async generateCompletion(prompt, systemInstruction, offlineFallbackFn) {
    if (this.isLiveAIAvailable()) {
      try {
        const result = await this._callGemini(prompt, systemInstruction);
        if (result && result.trim()) {
          return { text: result, source: 'gemini', model: this.selectedModel };
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to built-in offline AI:', err);
      }
    }

    // Built-in intelligent offline response
    const fallbackText = typeof offlineFallbackFn === 'function' ? offlineFallbackFn() : offlineFallbackFn;
    return { text: fallbackText, source: 'offline-ai', model: 'AeroShield-Embedded-v4.5' };
  }

  async _callGemini(prompt, systemInstruction) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${this.apiKey}`;
    
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.95
      }
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts.map(p => p.text).join('\n');
    }

    throw new Error('Invalid response structure from Gemini API');
  }
}

if (typeof window !== 'undefined') {
  window.aiService = new AIService();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIService };
}
