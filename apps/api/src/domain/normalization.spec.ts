import { normalizeEmail } from './normalization';

describe('email normalization', () => {
  it('rejects malformed domain labels even when an at-sign and dot exist', () => {
    expect(() => normalizeEmail('orion@,ail.com')).toThrow('email must be valid');
  });

  it('normalizes a valid email address', () => {
    expect(normalizeEmail(' Orion@Mail.COM ')).toBe('orion@mail.com');
  });
});
