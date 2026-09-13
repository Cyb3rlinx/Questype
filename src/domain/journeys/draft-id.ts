export function draftSceneId(slug: string, order: number) {
  return `${slug.replaceAll('-', '_')}_${String(order).padStart(2, '0')}`;
}
