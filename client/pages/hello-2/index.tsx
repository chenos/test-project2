import { useTranslation } from '@nocobase/i18n/client';
import type { ReactElement } from 'react';

import { PageContainer } from '#components/page-container';
import { PageHeader } from '#components/page-header';

export default function Hello2Page(): ReactElement {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <PageHeader
        title={t('hello2.title')}
        description={t('hello2.description')}
      />
    </PageContainer>
  );
}
