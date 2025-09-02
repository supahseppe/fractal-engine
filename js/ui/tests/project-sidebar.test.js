import { describe, it, expect } from 'vitest';
import { html } from 'lit';
import { litFixture } from '@open-wc/testing';
import '../project-sidebar.js';

describe('ProjectSidebar', () => {
  it('renders the sidebar with a title', async () => {
    const el = await litFixture(html`<project-sidebar></project-sidebar>`);
    const title = el.shadowRoot.querySelector('h1');
    expect(title).to.exist;
    expect(title.textContent).to.equal('Snowflake Method');
  });
});
