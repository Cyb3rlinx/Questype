import type { StructuredProfile } from '../domain/scoring/profile.js';
import type { CharacterBrief } from '../ai/prompts/characterPrompt.v1.js';
import type { ReportData } from '../reports/data.js';
import type { SocialCardData } from '../sharing/contracts.js';

export interface AITextProvider {
  readonly name: string;
  interpret(input: { profile: StructuredProfile; approvedTitles: readonly string[]; prompt: string; idempotencyKey: string; signal: AbortSignal }): Promise<unknown>;
}
export interface GeneratedCharacterImage {
  prompt: string; provider: string; provider_model: string; generation_id: string; image_url: string; created_at: string;
}
export interface CharacterImageProvider {
  readonly name: string;
  generateCharacterImage(input: CharacterBrief & { idempotencyKey: string; signal: AbortSignal }): Promise<GeneratedCharacterImage>;
}
export interface RenderedAsset { bytes: Uint8Array; contentType: string }
export interface AssetStorageProvider {
  put(input: { key: string; bytes: Uint8Array; contentType: string; visibility: 'private' | 'public' }): Promise<{ key: string }>;
  get(key: string, expiresInSeconds: number): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
}
export interface PDFProvider { render(report: ReportData): Promise<RenderedAsset> }
export interface SocialCardRenderer { render(card: SocialCardData): Promise<RenderedAsset> }
