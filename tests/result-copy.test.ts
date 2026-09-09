import assert from 'node:assert/strict';
import test from 'node:test';
import { ARCHETYPE_KEYS } from '../src/domain/types.js';
import { archetypeResultCopy } from '../src/i18n/result-copy.js';

for (const locale of ['es', 'en'] as const) {
  test(`every archetype has distinct ${locale} result copy`, () => {
    const copies = ARCHETYPE_KEYS.map((slug) => archetypeResultCopy(slug, locale));

    for (const field of ['headline', 'emphasis', 'threadLead', 'threadBody', 'quote'] as const) {
      assert.equal(
        new Set(copies.map((copy) => copy[field])).size,
        ARCHETYPE_KEYS.length,
        `${field} must be unique for all archetypes`,
      );
    }

    copies.forEach((copy, index) => {
      assert.equal(copy.strengthTitles.length, 4);
      assert.equal(
        new Set(copy.strengthTitles).size,
        4,
        `${ARCHETYPE_KEYS[index]} must have four distinct strength titles`,
      );
      Object.values(copy)
        .flat()
        .forEach((value) => assert.ok(value.trim().length >= 8));
    });

    const strengthTitles = copies.flatMap((copy) => copy.strengthTitles);
    assert.equal(
      new Set(strengthTitles).size,
      ARCHETYPE_KEYS.length * 4,
      'all strength titles must be distinct across the registry',
    );
  });
}
