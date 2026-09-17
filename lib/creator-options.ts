export const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'Multiple'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const NICHES = [
  'Beauty',
  'Fashion',
  'Finance/Tech',
  'Food',
  'Fitness',
  'Lifestyle',
  'Other'
] as const;
export type Niche = (typeof NICHES)[number];
