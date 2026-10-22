import {
  TestI18nProvider,
  createTestI18nRuntime,
} from '@nocobase/i18n/testing';
import { render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import enUS from '../../client/locales/en-US.js';
import Hello2Page from '../../client/pages/hello-2/index.js';

const runtime = await createTestI18nRuntime({
  application: { namespace: '@nocobase/app-template-default', resources: enUS },
});

function I18n({ children }: { readonly children: ReactNode }): ReactElement {
  return <TestI18nProvider runtime={runtime}>{children}</TestI18nProvider>;
}

describe('Hello 2 page', () => {
  it('shows Hello 2 as the page heading', () => {
    render(<Hello2Page />, { wrapper: I18n });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Hello 2' }),
    ).toBeVisible();
    expect(screen.getByText(enUS.hello2.description)).toBeVisible();
  });
});
