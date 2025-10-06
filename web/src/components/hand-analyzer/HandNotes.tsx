'use client';

import React, { useState, useEffect } from 'react';
import { HandNotesProps, PREDEFINED_TAGS, TagCategory } from '@/types/notes';
import { HandNotesStorage } from '@/lib/storage/hand-notes';

const HandNotes: React.FC<HandNotesProps> = ({
  handId,
  onNotesChanged,
  initialNotes = '',
  initialTags = []
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [customTag, setCustomTag] = useState('');

  // Load saved notes on mount
  useEffect(() => {
    const saved = HandNotesStorage.load(handId);
    if (saved) {
      setNotes(saved.notes);
      setTags(saved.tags);
    }
  }, [handId]);

  // Save notes when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notes || tags.length > 0) {
        const existing = HandNotesStorage.load(handId);
        const updated = existing
          ? HandNotesStorage.update(existing, notes, tags)
          : HandNotesStorage.create(handId, notes, tags);

        HandNotesStorage.save(updated);

        if (onNotesChanged) {
          onNotesChanged(updated);
        }
      }
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [notes, tags, handId, onNotesChanged]);

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <span className="text-2xl">📝</span>
        Notas e Tags
      </h3>

      {/* Notes Text Area */}
      <div className="mb-4">
        <label className="block text-sm text-gray-300 mb-2">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Escreva suas observações sobre esta mão..."
          className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm resize-none focus:outline-none focus:border-green-500"
        />
      </div>

      {/* Tags Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm text-gray-300">Tags</label>
          <button
            onClick={() => setShowTagPicker(!showTagPicker)}
            className="text-xs text-green-400 hover:text-green-300"
          >
            {showTagPicker ? 'Esconder' : 'Adicionar Tag'}
          </button>
        </div>

        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1 bg-green-900/40 border border-green-500/50 text-green-300 rounded-full text-xs hover:bg-green-900/60 transition-all flex items-center gap-1"
            >
              {tag}
              <span className="text-green-500">×</span>
            </button>
          ))}
          {tags.length === 0 && (
            <span className="text-gray-500 text-xs italic">Nenhuma tag selecionada</span>
          )}
        </div>

        {/* Tag Picker */}
        {showTagPicker && (
          <div className="bg-gray-800/70 rounded-lg p-3 border border-gray-600 space-y-3">
            {Object.entries(PREDEFINED_TAGS).map(([category, categoryTags]) => (
              <div key={category}>
                <div className="text-xs text-gray-400 mb-1 capitalize">{category}</div>
                <div className="flex flex-wrap gap-1">
                  {categoryTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 rounded text-xs transition-all ${
                        tags.includes(tag)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Custom Tag Input */}
            <div>
              <div className="text-xs text-gray-400 mb-1">Tag Personalizada</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                  placeholder="Digite uma tag..."
                  className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={addCustomTag}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-all"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HandNotes;
