import { Prompt } from '../types';

// Base URL for the server API - same pattern as products
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080').replace(/\/$/, '');

/**
 * Get all prompt names from external API
 */
export async function getAllPromptNames(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/prompts`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data || [],
    };
  } catch (error) {
    console.error('Error getting prompt names:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch prompt names',
    };
  }
}

/**
 * Get a specific prompt by name from external API
 */
export async function getPrompt(name: string): Promise<Prompt | null> {
  try {
    const response = await fetch(`${API_BASE}/api/prompts/${encodeURIComponent(name)}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.prompt) {
      return null;
    }

    const prompt: Prompt = {
      ...data.prompt,
      createdAt: data.prompt.createdAt ? new Date(data.prompt.createdAt) : undefined,
      updatedAt: data.prompt.updatedAt ? new Date(data.prompt.updatedAt) : undefined,
    };

    return prompt;
  } catch (error) {
    console.error('Error getting prompt:', error);
    throw new Error(error instanceof Error ? error.message : `Failed to fetch prompt: ${name}`);
  }
}

/**
 * Save a prompt to external API
 */
export async function savePrompt(name: string, content: string): Promise<{ name: string; message: string; version: number; }> {
  try {
    // Validate content
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }

    if (content.length > 50000) {
      throw new Error('Content must be less than 50,000 characters');
    }

    const response = await fetch(`${API_BASE}/api/prompts/${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error saving prompt:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to save prompt');
  }
}

/**
 * Validate prompt name
 */
export function validatePromptName(name: string): boolean {
  // Basic validation: alphanumeric, hyphens, underscores
  const validNamePattern = /^[a-zA-Z0-9_-]+$/;
  return validNamePattern.test(name) && name.length > 0 && name.length <= 100;
}