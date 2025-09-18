import { Prompt, CacheStats, PromptListResponse, PromptResponse, PromptSaveResponse, ApiResponse } from '../types';

// In-memory cache for prompts
class PromptCache {
  private cache = new Map<string, { prompt: Prompt; lastAccessed: Date; }>();
  private hitCount = 0;
  private missCount = 0;

  get(name: string): Prompt | null {
    const cached = this.cache.get(name);
    if (cached) {
      cached.lastAccessed = new Date();
      this.hitCount++;
      return { ...cached.prompt, loadedFrom: 'cache' };
    }
    this.missCount++;
    return null;
  }

  set(name: string, prompt: Prompt): void {
    this.cache.set(name, {
      prompt: { ...prompt, loadedFrom: 'cache' },
      lastAccessed: new Date()
    });
  }

  delete(name: string): boolean {
    return this.cache.delete(name);
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  getStats(): CacheStats {
    const stats: CacheStats = {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      lastAccessed: {},
    };

    // Add last accessed times
    this.cache.forEach((value, key) => {
      stats.lastAccessed[key] = value.lastAccessed;
    });

    // Calculate hit rate
    const total = this.hitCount + this.missCount;
    if (total > 0) {
      stats.hitRate = this.hitCount / total;
    }

    return stats;
  }
}

// Global cache instance
const promptCache = new PromptCache();

// Base URL for the server API - matches company and products pattern
const getServerUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
  // Remove trailing slash to prevent double slashes in URLs
  return baseUrl.replace(/\/$/, '');
};

/**
 * Get all prompt names from external API
 */
export async function getAllPromptNames(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/prompts`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: PromptListResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch prompt names');
    }

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
 * Get a specific prompt by name
 */
export async function getPrompt(name: string): Promise<Prompt | null> {
  try {
    // Check cache first
    const cached = promptCache.get(name);
    if (cached) {
      return cached;
    }

    // Fetch from external API
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/prompts/${encodeURIComponent(name)}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PromptResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch prompt');
    }

    if (!data.data) {
      return null;
    }

    const prompt: Prompt = {
      ...data.data,
      createdAt: data.data.createdAt ? new Date(data.data.createdAt) : undefined,
      updatedAt: data.data.updatedAt ? new Date(data.data.updatedAt) : undefined,
    };

    // Cache the result
    promptCache.set(name, prompt);

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

    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/prompts/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: PromptSaveResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to save prompt');
    }

    if (!data.data) {
      throw new Error('Invalid response from server');
    }

    // Update cache
    const prompt: Prompt = {
      name,
      content,
      version: data.data.version,
      updatedAt: new Date(),
      loadedFrom: 'cache'
    };
    promptCache.set(name, prompt);

    return data.data;
  } catch (error) {
    console.error('Error saving prompt:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to save prompt');
  }
}

/**
 * Delete a prompt from external API
 */
export async function deletePrompt(name: string): Promise<void> {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/prompts/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });

    if (response.status === 404) {
      throw new Error(`Prompt '${name}' not found`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to delete prompt');
    }

    // Remove from cache
    promptCache.delete(name);
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw new Error(error instanceof Error ? error.message : `Failed to delete prompt: ${name}`);
  }
}

/**
 * Clear prompt cache
 */
export function clearPromptCache(): void {
  promptCache.clear();
}

/**
 * Get cache statistics from external API
 */
export async function getPromptCacheStats(): Promise<CacheStats> {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/prompts/cache/stats`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<CacheStats> = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to get cache stats');
    }

    return data.data || { size: 0, keys: [], lastAccessed: {} };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    // Return local cache stats as fallback
    return promptCache.getStats();
  }
}

/**
 * Clear cache on external API
 */
export async function clearExternalPromptCache(): Promise<void> {
  try {
    const serverUrl = getServerUrl();
    const response = await fetch(`${serverUrl}/api/prompts/cache/clear`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to clear cache');
    }

    // Also clear local cache
    promptCache.clear();
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to clear cache');
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
