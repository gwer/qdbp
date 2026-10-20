import { describe, expect, it } from 'vitest';
import { uniqueNames } from './download';

describe('uniqueNames', () => {
  it('дубли получают номер', () => {
    expect(uniqueNames(['a.jpg', 'b.jpg', 'a.jpg', 'a.jpg', 'c', 'c'])).toEqual(['a.jpg', 'b.jpg', 'a (2).jpg', 'a (3).jpg', 'c', 'c (2)']);
  });
});
