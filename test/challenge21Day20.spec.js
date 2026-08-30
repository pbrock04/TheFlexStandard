import { describe, it, expect } from 'vitest';
import { challenge21Page } from '../src/challenge21.js';

describe('21-Day Habit Lock — Day 20', () => {
  it('has a concrete self-directed completion standard before graduation', () => {
    const html = challenge21Page();

    expect(html).toContain("title:'Habit Test'");
    expect(html).toContain('choose and complete a 20–30 minute movement session you know you can repeat');
    expect(html).toContain('Create your personal minimum standard for a busy day.');
    expect(html).toContain('What is the smallest version of your standard you can keep when life gets messy?');
    expect(html).toContain('Your minimum keeps the identity alive.');
  });
});
