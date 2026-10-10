/**
 * DAL Factory — Single access point for the data adapter.
 *
 * Usage:
 *   import { getDataAdapter } from '@core/dal';
 *   const db = getDataAdapter();
 *   const user = await db.users.getUserById(id);
 *
 * To swap backends: change the import below to a different adapter.
 */

import { SupabaseAdapter } from './SupabaseAdapter';
import type { IDataAdapter } from './IDataAdapter';

let _adapter: IDataAdapter | null = null;

export function getDataAdapter(): IDataAdapter {
  if (!_adapter) {
    _adapter = SupabaseAdapter;
  }
  return _adapter;
}

/** For testing: inject a mock adapter */
export function _setDataAdapterForTesting(mock: IDataAdapter): void {
  _adapter = mock;
}

export type { IDataAdapter } from './IDataAdapter';
