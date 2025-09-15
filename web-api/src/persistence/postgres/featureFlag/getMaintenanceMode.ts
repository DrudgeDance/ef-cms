import { getFeatureFlagValues } from '@web-api/persistence/postgres/featureFlag/getFeatureFlagValues';

export function getMaintenanceMode(): Promise<
  { current: boolean } | undefined
> {
  return new Promise((resolve) => {
    const onPgConnectionError = () => {
      // the database threw some type of connection error, assume maintence mode on due to critical issues
      resolve({ current: true });
    };

    // this is only possible in a serverless environment of one request per lambda,
    // on a hosted node stateful service, this might cause side effects.
    process.on('uncaughtException', onPgConnectionError);

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
      }).finally(() => {
        process.off('uncaughtException', onPgConnectionError);
      });

  })
}
