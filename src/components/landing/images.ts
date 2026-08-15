/**
 * Placeholder property/lifestyle photography sourced from Unsplash, standing in for
 * real listing photos until hosts upload their own. Swap any of these for real URLs —
 * every consumer just passes `src` through to PlaceholderImage.
 */
export const IMAGES = {
  heroMain: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  heroSecondary1: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  heroSecondary2: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
  featured1: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  featured2: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
  featured3: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
  featured4: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
  // destAbuja's original source photo 404s. Replacement URL below is verified to load
  // (curl'd, 200) but its actual subject is NOT visually confirmed — no way to view
  // images in this environment. Swap if it turns out not to be a skyline/city shot.
  destAbuja: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&q=80',
  destLagos: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80',
  destPh: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80',
  destIbadan: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800&q=80',
  destEnugu: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80',
  guest1: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  guest2: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80',
  guest3: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
  hostMain: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1000&q=80',
  finalCTA: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1400&q=80',
} as const
