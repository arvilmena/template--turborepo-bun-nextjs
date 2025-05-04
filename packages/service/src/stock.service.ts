import {
  type StockDbFindOneType,
  type StockDbInsertWithoutCalculatedFieldsType,
  type StockDbUpdateWithoutCalculatedFieldsType,
  type StockRepository,
  stockDbInsertWithoutCalculatedFieldsSchema,
  stockDbUpdateWithoutCalculatedFieldsSchema,
  stockRepository,
} from "@my/db/repository/stock.repository";
import {
  DatabaseInsertionError,
  FailedExpectationError,
  NotFoundError,
} from "@my/error/error";
import {
  type RedisService,
  redisService,
} from "@my/redis-service/redis.service";
import pLimit from "p-limit";
import type { ServiceArgType } from "./constants/serviceArg.types";

export class StockService {
  constructor(
    private readonly redisService: RedisService,
    private readonly stockRepository: StockRepository,
  ) {}

  private async getRedisCache(id: number): Promise<StockDbFindOneType> {
    const cacheKey = `StockService:findById:${id}`;
    const cache = await this.redisService.getJson(cacheKey);
    return cache as StockDbFindOneType;
  }

  private async setRedisCache(id: number, data: StockDbFindOneType) {
    if (data === undefined) {
      await this.redisService.del(`StockService:findById:${id}`);
      return;
    }
    const cacheKey = `StockService:findById:${data.id}`;
    await this.redisService.setJson(cacheKey, data);
  }

  async deleteById({
    id,
  }: {
    id: number;
  }): Promise<StockDbFindOneType> {
    // Step 1. First retrieve the record to delete
    const existingRecord = await this.findById({
      id,
    });

    // throw Error if the data to delete is not found
    if (!existingRecord) {
      throw new NotFoundError(`Failed to find Stock with id: ${id} to delete.`);
    }

    // Step 2. Issue the delete
    await this.stockRepository.deleteById(id);

    // Step 3. Delete the record from the cache
    await this.setRedisCache(id, undefined);

    // Finally, return the deleted record
    return existingRecord;
  }

  private async onChangeEvent({
    record,
  }: {
    record: StockDbFindOneType;
  }) {
    if (!record) return;
    await this.setRedisCache(record.id, record);
  }

  async createMany({
    data,
  }: {
    data: StockDbInsertWithoutCalculatedFieldsType[];
  }) {
    // Step 1. Make sure each data adheres to the <Entity>DbInsertWithoutCalculatedFieldsType schema
    // If there are calculated fields, calculate them
    // and store them in the _data array
    const _limit1 = pLimit(5);
    const _data = await Promise.all(
      data.map(async (d) =>
        _limit1(async () => {
          const _withoutCalculatedFields =
            stockDbInsertWithoutCalculatedFieldsSchema.parse(d);

          return {
            ..._withoutCalculatedFields,
            // TODO: Calculate the calculated fields
          };
        }),
      ),
    );

    // Step 2. Insert the data into the database, which returns the inserted record Ids
    const recordIds = await this.stockRepository.insert(_data);

    // Step 3. For each inserted record, retrieve the findById record from the database
    const _limit2 = pLimit(5);
    const records = await Promise.all(
      recordIds.map(async (recordId) =>
        _limit2(async () => {
          const found = await this.stockRepository.findById({
            id: recordId.id,
          });

          if (!found) {
            throw new FailedExpectationError(
              "Stock should already be inserted, but failed when tried to retrieve the normalised record.",
            );
          }

          await this.onChangeEvent({
            record: found,
          });

          return found;
        }),
      ),
    );
    return records;
  }

  async createOne({
    data,
  }: {
    data: StockDbInsertWithoutCalculatedFieldsType;
  }) {
    const [record] = await this.createMany({
      data: [data],
    });
    return record;
  }

  async findById({
    id,
    skipCache = false,
  }: ServiceArgType & {
    id: number;
  }): Promise<StockDbFindOneType> {
    if (!skipCache) {
      const cached = await this.getRedisCache(id);
      if (cached) {
        return cached;
      }
    }
    const record = await this.stockRepository.findById({
      id,
    });
    await this.setRedisCache(id, record);
    return record;
  }

  async updateById({
    id,
    data,
  }: {
    id: number;
    data: StockDbUpdateWithoutCalculatedFieldsType;
  }) {
    // Step 1. Confirm that the requested record exists
    const existingRecord = await this.findById({
      id,
      skipCache: true,
    });
    // throw Error if the data to update is not found
    if (!existingRecord) {
      throw new NotFoundError(`Failed to find Stock with id: ${id} to update.`);
    }

    // Step 2. Make sure the payload conforms to the <Entity>DbUpdateWithoutCalculatedFieldsType schema
    const _data = stockDbUpdateWithoutCalculatedFieldsSchema.parse(data);

    // Step 3. If there's a need to calculate any field, do it now
    const updateParams = {
      ..._data,
    };

    // Step 4. Issue the update
    const updatedRecordId = await this.stockRepository.updateById({
      id,
      data: updateParams,
    });
    // throw Error if the update failed
    if (!updatedRecordId) {
      throw new DatabaseInsertionError(`Failed to update Stock with id: ${id}`);
    }

    // Step 5. Retrieve the normalised updated record
    const updatedRecord = await this.stockRepository.findById({
      id: updatedRecordId.id,
    });

    // throw Error if for some reason the updated record is not found
    if (!updatedRecord) {
      throw new FailedExpectationError(
        "Stock should already be updated, but failed when tried to retrieve the updated record.",
      );
    }

    // Step 6. Trigger the onChangeEvent
    await this.onChangeEvent({
      record: updatedRecord,
    });

    // Finally, return the updated record
    return updatedRecord;
  }

  async getBy() {
    // Step 1. Retrieve the collection, getting only the ids
    const recordIds = await this.stockRepository.getBy();

    // Step 2. For each id, retrieve the normalised record
    const _limit = pLimit(5);
    const records = await Promise.all(
      recordIds.map(async (recordId) =>
        _limit(async () => {
          return await this.findById({ id: recordId.id });
        }),
      ),
    );

    // Step 3. Filter out the undefined records
    const withoutUndefined = records.filter(Boolean);

    // Step 4. Throw an error if the number of records is not the same as the number of ids
    if (withoutUndefined.length !== recordIds.length) {
      throw new FailedExpectationError(
        "Stock should already be inserted, but failed when tried to retrieve the normalised record.",
      );
    }

    // Step 5. Return the records
    return withoutUndefined;
  }
}

export const stockService = new StockService(redisService, stockRepository);
