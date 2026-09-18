export const dataManifest = {
  BBCA: {
    market: {
      sourceQuality: 'PUBLIC_SECONDARY',
      source: 'Yahoo Finance chart API for BBCA.JK',
      latestSession: '2026-09-18',
      lastSuccessfulRefresh: '2026-09-18T02:46:57.000Z',
      refreshPolicy: 'Reviewed local input only; no automatic provider fetch or rate-limit bypass.',
    },
    fundamentals: {
      sourceQuality: 'OFFICIAL_ISSUER',
      latestPeriod: 'H1 2026',
      publicationDate: '2026-07-28',
      source: 'PT Bank Central Asia Tbk Financial Report June 2026',
    },
  },
} as const
