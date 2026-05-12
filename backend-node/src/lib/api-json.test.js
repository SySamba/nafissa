import { Decimal } from '@prisma/client/runtime/library';
import { describe, expect, it } from 'vitest';
import { prismaPayloadToApiJson } from './api-json.js';

describe('prismaPayloadToApiJson', () => {
  it('snake_cases keys and strips secrets', () => {
    const d = new Date('2026-03-01T12:00:00.000Z');
    const out = prismaPayloadToApiJson({
      firstName: 'Ada',
      userProfile: { emailVerified: false },
      password: 'hide-me',
      price: Decimal('10.50'),
      createdAt: d,
    });

    expect(out.first_name).toBe('Ada');
    expect(out.password).toBeUndefined();
    expect(out.user_profile).toEqual({ email_verified: false });
    expect(out.price).toBe(10.5);
    expect(out.created_at).toBe(d.toISOString());
  });

  it('formats booking_date to YYYY-MM-DD when ISO includes T', () => {
    const out = prismaPayloadToApiJson({
      booking_date: '2026-06-01T00:00:00.000Z',
    });

    expect(out.booking_date).toBe('2026-06-01');
  });
});
