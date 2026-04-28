import {describe, it, expect} from 'vitest';
import {
  parseStatutParution,
  parseNumeroTome,
  parseBool,
  metaobjectField,
  richTextToPlain,
} from '../tomeMetafields';

describe('parseStatutParution', () => {
  it('returns "publié" by default for unknown/null/undefined', () => {
    expect(parseStatutParution(null)).toBe('publié');
    expect(parseStatutParution(undefined)).toBe('publié');
    expect(parseStatutParution('publié')).toBe('publié');
    expect(parseStatutParution('garbage')).toBe('publié');
  });

  it('returns the literal value for known statuses', () => {
    expect(parseStatutParution('précommande')).toBe('précommande');
    expect(parseStatutParution('annoncé')).toBe('annoncé');
  });
});

describe('parseNumeroTome', () => {
  it('parses numeric strings', () => {
    expect(parseNumeroTome('1')).toBe(1);
    expect(parseNumeroTome('42')).toBe(42);
  });

  it('returns null for null/undefined/empty/NaN', () => {
    expect(parseNumeroTome(null)).toBeNull();
    expect(parseNumeroTome(undefined)).toBeNull();
    expect(parseNumeroTome('')).toBeNull();
    expect(parseNumeroTome('abc')).toBeNull();
  });
});

describe('parseBool', () => {
  it('returns true only for the literal string "true"', () => {
    expect(parseBool('true')).toBe(true);
    expect(parseBool('false')).toBe(false);
    expect(parseBool('TRUE')).toBe(false);
    expect(parseBool(null)).toBe(false);
    expect(parseBool(undefined)).toBe(false);
  });
});

describe('metaobjectField', () => {
  const fields = [
    {key: 'nom', value: "L'Eau et du Sang"},
    {key: 'synopsis', value: 'La saga fondatrice.'},
    {key: 'untouched', value: null},
  ];

  it('returns the value when key found', () => {
    expect(metaobjectField(fields, 'nom')).toBe("L'Eau et du Sang");
  });

  it('returns null when key not found', () => {
    expect(metaobjectField(fields, 'missing')).toBeNull();
  });

  it('returns null when fields undefined', () => {
    expect(metaobjectField(undefined, 'anything')).toBeNull();
  });

  it('returns null when value is null', () => {
    expect(metaobjectField(fields, 'untouched')).toBeNull();
  });
});

describe('richTextToPlain', () => {
  it('returns empty string for null/undefined/empty', () => {
    expect(richTextToPlain(null)).toBe('');
    expect(richTextToPlain(undefined)).toBe('');
    expect(richTextToPlain('')).toBe('');
  });

  it('returns the raw string when not JSON', () => {
    expect(richTextToPlain('Plain text content')).toBe('Plain text content');
  });

  it('parses a single paragraph', () => {
    const json = JSON.stringify({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{type: 'text', value: 'Hello world'}],
        },
      ],
    });
    expect(richTextToPlain(json)).toBe('Hello world');
  });

  it('separates multiple paragraphs with double newline', () => {
    const json = JSON.stringify({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{type: 'text', value: 'First.'}],
        },
        {
          type: 'paragraph',
          children: [{type: 'text', value: 'Second.'}],
        },
      ],
    });
    expect(richTextToPlain(json)).toBe('First.\n\nSecond.');
  });

  it('renders list items with bullet + newline', () => {
    const json = JSON.stringify({
      type: 'root',
      children: [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [{type: 'text', value: 'Alpha'}],
            },
            {
              type: 'list-item',
              children: [{type: 'text', value: 'Beta'}],
            },
          ],
        },
      ],
    });
    const out = richTextToPlain(json);
    expect(out).toContain('• Alpha');
    expect(out).toContain('• Beta');
  });
});
