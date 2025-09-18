'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Prompt, CacheStats } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useToast } from '../ui/Toaster';
import {
  getAllPromptNames,
  getPrompt,
  savePrompt,
  deletePrompt,
  getPromptCacheStats,
  clearExternalPromptCache
} from '../../lib/prompts';

export default function PromptsListClient() {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<{ name: string; content: string; isNew: boolean; } | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [showCacheStats, setShowCacheStats] = useState(false);
  const { addToast } = useToast();

  // Load prompts list
  const loadPrompts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllPromptNames();

      if (result.success) {
        setPrompts(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load prompts');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load prompts';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load specific prompt
  const loadPrompt = async (name: string) => {
    try {
      const prompt = await getPrompt(name);
      setSelectedPrompt(prompt);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load prompt';
      setError(message);
      addToast(message, 'error');
    }
  };

  // Save prompt
  const savePromptHandler = async (name: string, content: string) => {
    try {
      setError(null);

      await savePrompt(name, content);

      // Refresh prompts list
      await loadPrompts();
      setEditingPrompt(null);
      setShowEditor(false);

      // Show success message
      addToast('Prompt saved successfully!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save prompt';
      setError(message);
      addToast(message, 'error');
    }
  };

  // Delete prompt
  const deletePromptHandler = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the prompt "${name}"?`)) {
      return;
    }

    try {
      setError(null);

      await deletePrompt(name);

      // Refresh prompts list
      await loadPrompts();
      setSelectedPrompt(null);

      // Show success message
      addToast('Prompt deleted successfully!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete prompt';
      setError(message);
      addToast(message, 'error');
    }
  };

  // Load cache stats
  const loadCacheStats = async () => {
    try {
      const stats = await getPromptCacheStats();
      setCacheStats(stats);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cache stats';
      setError(message);
      addToast(message, 'error');
    }
  };

  // Clear cache
  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear the prompt cache?')) {
      return;
    }

    try {
      await clearExternalPromptCache();
      await loadCacheStats();
      addToast('Cache cleared successfully!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cache';
      setError(message);
      addToast(message, 'error');
    }
  };

  // Load prompts on component mount
  useEffect(() => {
    loadPrompts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Prompt Management</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingPrompt({ name: '', content: '', isNew: true });
                setShowEditor(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Prompt
            </button>
            <button
              onClick={loadPrompts}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Refresh
            </button>
            <button
              onClick={() => {
                setShowCacheStats(!showCacheStats);
                if (!showCacheStats) loadCacheStats();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Cache Stats
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Cache Stats */}
      {showCacheStats && cacheStats && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-green-800">Cache Statistics</h2>
            <button
              onClick={clearCache}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Clear Cache
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-green-600">Cache Size</p>
              <p className="text-2xl font-bold text-green-800">{cacheStats.size}</p>
            </div>
            <div>
              <p className="text-sm text-green-600">Hit Rate</p>
              <p className="text-2xl font-bold text-green-800">
                {cacheStats.hitRate ? `${(cacheStats.hitRate * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-600">Cached Keys</p>
              <p className="text-sm text-green-700">{cacheStats.keys.join(', ') || 'None'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prompts List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Prompts ({prompts.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {prompts.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No prompts found. Create your first prompt to get started.
              </div>
            ) : (
              prompts.map((promptName) => (
                <div key={promptName} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{promptName}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadPrompt(promptName)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={async () => {
                        await loadPrompt(promptName);
                        if (selectedPrompt) {
                          setEditingPrompt({
                            name: promptName,
                            content: selectedPrompt.content,
                            isNew: false
                          });
                          setShowEditor(true);
                        }
                      }}
                      className="text-green-600 hover:text-green-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deletePromptHandler(promptName)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Prompt Viewer/Editor */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {showEditor ? (editingPrompt?.isNew ? 'New Prompt' : 'Edit Prompt') : 'Prompt Details'}
            </h2>
          </div>
          <div className="p-6">
            {showEditor && editingPrompt ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="prompt-name" className="block text-sm font-medium text-gray-700">
                    Prompt Name
                  </label>
                  <input
                    type="text"
                    id="prompt-name"
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                    disabled={!editingPrompt.isNew}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="e.g., frontend-agent"
                  />
                </div>
                <div>
                  <label htmlFor="prompt-content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    id="prompt-content"
                    rows={20}
                    value={editingPrompt.content}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                    placeholder="Enter your prompt content here..."
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {editingPrompt.content.length}/50,000 characters
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => savePromptHandler(editingPrompt.name, editingPrompt.content)}
                    disabled={!editingPrompt.name || !editingPrompt.content}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
                  >
                    Save Prompt
                  </button>
                  <button
                    onClick={() => {
                      setEditingPrompt(null);
                      setShowEditor(false);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedPrompt ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedPrompt.name}</h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Version: {selectedPrompt.version}</p>
                    <p>Loaded from: {selectedPrompt.loadedFrom}</p>
                    {selectedPrompt.updatedAt && (
                      <p>Updated: {selectedPrompt.updatedAt.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                    {selectedPrompt.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select a prompt to view its details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
