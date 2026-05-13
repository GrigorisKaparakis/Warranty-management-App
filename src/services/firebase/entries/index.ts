import { EntrySubscriptions } from './subscriptions';
import { EntryCRUD } from './crud';
import { EntryBatch } from './batch';
import { EntryRestore } from './restore';

export const EntryService = {
  ...EntrySubscriptions,
  ...EntryCRUD,
  ...EntryBatch,
  ...EntryRestore
};
