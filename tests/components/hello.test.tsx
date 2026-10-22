import {
  TestI18nProvider,
  createTestI18nRuntime,
} from '@nocobase/i18n/testing';
import { render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import enUS from '../../client/locales/en-US.js';
import HelloPage from '../../client/pages/hello/index.js';

const runtime = await createTestI18nRuntime({
  application: { namespace: '@nocobase/app-template-default', resources: enUS },
});

function I18n({ children }: { readonly children: ReactNode }): ReactElement {
  return <TestI18nProvider runtime={runtime}>{children}</TestI18nProvider>;
}

describe('Hello page', () => {
  it('shows Hello as the page heading', () => {
    render(<HelloPage />, { wrapper: I18n });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Hello' }),
    ).toBeVisible();
    expect(screen.getByText(enUS.hello.description)).toBeVisible();
  });
});
