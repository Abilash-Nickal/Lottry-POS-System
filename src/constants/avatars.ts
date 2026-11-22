export interface CharacterAvatar {
  id: string; // e.g. 'char-01'
  name: string;
  description: string;
  image: string;
  category: 'female' | 'male' | 'elder' | 'youth';
}

export const CHARACTER_AVATARS: CharacterAvatar[] = [
  {
    id: 'char-01',
    name: 'Priyanka',
    description: 'Traditional Saree & Bindi',
    image: '/avatars/char-01.png',
    category: 'female'
  },
  {
    id: 'char-02',
    name: 'Kamal',
    description: 'Mustache & Striped Shirt',
    image: '/avatars/char-02.png',
    category: 'male'
  },
  {
    id: 'char-03',
    name: 'Nirosha',
    description: 'Traditional Jasmine Hair Flowers',
    image: '/avatars/char-03.png',
    category: 'female'
  },
  {
    id: 'char-04',
    name: 'Sanjaya',
    description: 'Sri Lanka Cricket Jersey',
    image: '/avatars/char-04.png',
    category: 'youth'
  },
  {
    id: 'char-05',
    name: 'Ananya',
    description: 'Wavy Bob Hair & Floral Kurti',
    image: '/avatars/char-05.png',
    category: 'female'
  },
  {
    id: 'char-06',
    name: 'Ramesh',
    description: 'Traditional Kurtha & Shawl',
    image: '/avatars/char-06.png',
    category: 'male'
  },
  {
    id: 'char-07',
    name: 'Dilan',
    description: 'Spectacles & Patterned Shirt',
    image: '/avatars/char-07.png',
    category: 'male'
  },
  {
    id: 'char-08',
    name: 'Mahesh',
    description: 'Athletic Tracksuit',
    image: '/avatars/char-08.png',
    category: 'youth'
  },
  {
    id: 'char-09',
    name: 'Sunethra',
    description: 'Elegance & Floral Saree',
    image: '/avatars/char-09.png',
    category: 'female'
  },
  {
    id: 'char-10',
    name: 'Ruwan',
    description: 'Trimmed Beard & Collared Shirt',
    image: '/avatars/char-10.png',
    category: 'male'
  },
  {
    id: 'char-11',
    name: 'Ammachchi',
    description: 'Elderly Mother in Maroon Saree',
    image: '/avatars/char-11.png',
    category: 'elder'
  },
  {
    id: 'char-12',
    name: 'Kavinda',
    description: 'Cap & Modern Jacket',
    image: '/avatars/char-12.png',
    category: 'youth'
  },
  {
    id: 'char-13',
    name: 'Malsha',
    description: 'Long Earrings & Saree',
    image: '/avatars/char-13.png',
    category: 'female'
  },
  {
    id: 'char-14',
    name: 'Bandara',
    description: 'Mature Gentleman Profile',
    image: '/avatars/char-14.png',
    category: 'elder'
  }
];

export function getAvatarUrl(avatarId?: string): string {
  if (!avatarId) return '/avatars/char-01.png';
  const found = CHARACTER_AVATARS.find(a => a.id === avatarId);
  return found ? found.image : `/avatars/${avatarId}.png`;
}

export function getAvatarById(avatarId?: string): CharacterAvatar {
  const found = CHARACTER_AVATARS.find(a => a.id === avatarId);
  return found || CHARACTER_AVATARS[0];
}
