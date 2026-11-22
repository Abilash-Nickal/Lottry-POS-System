import React, { useState } from 'react';
import { getAvatarUrl, getAvatarById } from '../constants/avatars';

interface AvatarDisplayProps {
  avatarId?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
  alt?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarId,
  name = 'User',
  size = 'md',
  className = '',
  showBadge = false,
  alt
}) => {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = getAvatarUrl(avatarId);
  const character = getAvatarById(avatarId);
  const initial = name.trim().charAt(0).toUpperCase() || 'U';

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${sizeClass} rounded-full overflow-hidden bg-white border-2 border-orange-200/80 shadow-xs flex items-center justify-center`}
      >
        {!imageError && avatarUrl ? (
          <img
            src={avatarUrl}
            alt={alt || character.name || name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-600 text-white font-black flex items-center justify-center">
            {initial}
          </div>
        )}
      </div>

      {showBadge && avatarId && (
        <span className="absolute -bottom-1 -right-1 bg-stone-900 text-white font-mono text-[9px] px-1 py-0.2 rounded-full border border-white leading-tight shadow-xs">
          {avatarId.replace('char-', '#')}
        </span>
      )}
    </div>
  );
};
