import { Logger } from '../core/interfaces';

const enabled = true;

export const logger: Logger = {
  info(message, meta) {
    if (!enabled) return;
    // eslint-disable-next-line no-console
    console.log(`[INFO] ${message}`, meta ?? '');
  },
  error(message, meta) {
    // eslint-disable-next-line no-console
    console.error(`[ERROR] ${message}`, meta ?? '');
  },
  debug(message, meta) {
    if (!enabled) return;
    // eslint-disable-next-line no-console
    console.debug(`[DEBUG] ${message}`, meta ?? '');
  }
};
