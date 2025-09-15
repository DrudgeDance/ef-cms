import { getFeatureFlagValues } from '@web-api/persistence/postgres/featureFlag/getFeatureFlagValues';

export function getMaintenanceMode(): Promise<
  { current: boolean } | undefined
> {

  return new Promise((resolve) => {
    getFeatureFlagValues(['maintenance-mode'])
      .then(POSTGRES_RECORDS => {
        if (!POSTGRES_RECORDS) resolve({ current: false });
        if (!POSTGRES_RECORDS.length) resolve({ current: false });
        const MAINTENANCE_RECORD = POSTGRES_RECORDS[0];
        resolve(MAINTENANCE_RECORD.value);
      })
      .catch(() => {
        // if we can't connect to postgres, we assume maintence mode on due to critical issues
        resolve({ current: true });
      })
    // .finally(() => {
    //   process.off('uncaughtException', onPgConnectionError);
    // });

  })
}
