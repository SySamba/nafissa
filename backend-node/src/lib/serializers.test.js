import { describe, expect, it } from 'vitest';
import { stripUser } from './serializers.js';

describe('stripUser', () => {
  it('removes password and remember token', () => {
    const u = {
      id: 1,
      email: 'a@x.com',
      password: 'secret',
      rememberToken: 'tok',
      name: 'N',
    };

    const out = stripUser(u);

    expect(out.password).toBeUndefined();
    expect(out.rememberToken).toBeUndefined();
    expect(out.email).toBe('a@x.com');
    expect(out.id).toBe(1);
  });

  it('returns falsy unchanged', () => {
    expect(stripUser(null)).toBe(null);
    expect(stripUser(undefined)).toBe(undefined);
  });
});
