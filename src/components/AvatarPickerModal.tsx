import React, { useState } from 'react';
import { X, Check, Sparkles, Filter } from 'lucide-react';
import { CHARACTER_AVATARS, CharacterAvatar } from '../constants/avatars';
import { AvatarDisplay } from './AvatarDisplay';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarId?: string;
  onSelectAvatar: (avatarId: string) => void;
  title?: string;
  subtitle?: string;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  selectedAvatarId,
  onSelectAvatar,
  title = 'Choose Character Profile Avatar',
  subtitle = 'Select an authentic Sri Lankan character ID for this profile'
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'female' | 'male' | 'youth' | 'elder'>('all');
  const [tempSelected, setTempSelected] = useState<string>(selectedAvatarId || 'char-01');

  if (!isOpen) return null;

  const filteredAvatars = CHARACTER_AVATARS.filter(
    char => activeCategory === 'all' || char.category === activeCategory
  );

  const selectedChar = CHARACTER_AVATARS.find(c => c.id === tempSelected) || CHARACTER_AVATARS[0];

  const handleConfirm = () => {
    onSelectAvatar(tempSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-orange-50 via-white to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center border border-orange-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-1" />
          {[
            { id: 'all', label: `All Characters (${CHARACTER_AVATARS.length})` },
            { id: 'female', label: 'Women' },
            { id: 'male', label: 'Men' },
            { id: 'youth', label: 'Youth' },
            { id: 'elder', label: 'Elders' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredAvatars.map(char => {
            const isSelected = tempSelected === char.id;
            return (
              <div
                key={char.id}
                onClick={() => setTempSelected(char.id)}
                className={`group relative p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center select-none ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/50 shadow-md ring-2 ring-orange-400/20'
                    : 'border-stone-200 hover:border-orange-300 hover:bg-stone-50/80'
                }`}
              >
                {/* Checkmark badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Avatar circle */}
                <AvatarDisplay avatarId={char.id} name={char.name} size="lg" className="mb-2" />

                {/* Name */}
                <h4 className="text-xs font-black text-stone-900 group-hover:text-orange-700 transition-colors">
                  {char.name}
                </h4>

                {/* Description */}
                <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5 font-medium">
                  {char.description}
                </p>

                {/* Character ID badge */}
                <span className="mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                  {char.id}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <AvatarDisplay avatarId={selectedChar.id} name={selectedChar.name} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-stone-900">
                  {selectedChar.name}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 border border-orange-200">
                  {selectedChar.id}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">{selectedChar.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Assign Character</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

