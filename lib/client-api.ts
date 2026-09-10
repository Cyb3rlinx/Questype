export interface PublicScene {
  id: string;
  act: number;
  order: number;
  title: string;
  narrative: string;
  choices: { id: string; text: string }[];
  visual: {
    default: PublicVisualAsset;
    choice_variants: Record<string, PublicVisualAsset>;
  };
}
export interface PublicVisualAsset {
  id: string;
  src: string;
  responsive_src: string | null;
  width: number;
  height: number;
  focal_point: { x: number; y: number };
  alt: string;
}
export interface SessionView {
  id: string;
  name: string | null;
  character_gender: 'man' | 'woman';
  status: 'in_progress' | 'processing' | 'completed';
  current_scene: number;
  completed_scenes: number;
  total_scenes: number;
  result_id: string | null;
  scene_image_variant: number | null;
  journey: {
    id: string;
    slug: string;
    version: string;
    title: string;
    act_names: string[];
    act_count: number;
    estimated_minutes: number;
  };
  scene: PublicScene | null;
}
export async function requestJson<T>(
  url: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers:
      body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new Error(
      data.error ?? 'Something interrupted the journey. Please try again.',
    );
  return data;
}
export const actNames = [
  'The Call',
  'The Threshold',
  'Allies & Strangers',
  'The Trials',
  'The Offering',
  'The Lighthouse',
  'The Return',
];
