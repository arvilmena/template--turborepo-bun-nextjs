import logger from "@my/base/logger";
import { eq } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";
import { type DbType, db } from "../db";
import { stock } from "../schema";
export const stockDbInsertSchema = createInsertSchema(stock).pick({
  currentSymbol: true,
  currentSymbolSince: true,
  marketCountry: true,
  name: true,
  swsId: true,
  swsUniqueSymbol: true,
  swsSymbolSince: true,
  edgeCompanyId: true,
  website: true,
  swsLogoUrl: true,
  pseFramesLogoUrl: true,
  listedAt: true,
});
export type StockDbInsertType = z.infer<typeof stockDbInsertSchema>;
export const stockDbUpdateSchema = createUpdateSchema(stock).pick({
  currentSymbol: true,
  currentSymbolSince: true,
  marketCountry: true,
  name: true,
  swsId: true,
  swsUniqueSymbol: true,
  swsSymbolSince: true,
  edgeCompanyId: true,
  website: true,
  swsLogoUrl: true,
  pseFramesLogoUrl: true,
  listedAt: true,
});
export type StockDbUpdateType = z.infer<typeof stockDbUpdateSchema>;
export const stockDbSelectSchema = createSelectSchema(stock);
export type StockFoundOneType = z.infer<typeof stockDbSelectSchema>;

// Calculated fields to be used by the entity service layer
export const stockDbInsertWithoutCalculatedFieldsSchema = stockDbInsertSchema;
export type StockDbInsertWithoutCalculatedFieldsType = z.infer<
  typeof stockDbInsertWithoutCalculatedFieldsSchema
>;
export const stockDbUpdateWithoutCalculatedFieldsSchema = stockDbUpdateSchema;
export type StockDbUpdateWithoutCalculatedFieldsType = z.infer<
  typeof stockDbUpdateWithoutCalculatedFieldsSchema
>;

export class StockRepository {
  constructor(private readonly db: DbType) {}

  async insert(data: StockDbInsertType[]) {
    return await this.db.transaction(async (tx) => {
      try {
        return await tx.insert(stock).values(data).returning({
          id: stock.id,
        });
      } catch (error) {
        logger.error(error);
        tx.rollback();
        throw error;
      }
    });
  }

  async findById({ id }: { id: number }) {
    return this.db.query.stock.findFirst({
      where: eq(stock.id, id),
    });
  }

  async updateById({ id, data }: { id: number; data: StockDbUpdateType }) {
    return await this.db.transaction(async (tx) => {
      try {
        const [v] = await tx
          .update(stock)
          .set(data)
          .where(eq(stock.id, id))
          .returning({
            id: stock.id,
          });
        return v;
      } catch (error) {
        logger.error(error);
        tx.rollback();
        throw error;
      }
    });
  }

  async deleteById(id: number) {
    return await this.db.transaction(async (tx) => {
      try {
        return await tx.delete(stock).where(eq(stock.id, id)).returning({
          id: stock.id,
        });
      } catch (error) {
        logger.error(error);
        tx.rollback();
        throw error;
      }
    });
  }

  async getBy() {
    return await this.db.query.stock.findMany({ columns: { id: true } });
  }
}

export type StockDbFindOneType = Awaited<
  ReturnType<StockRepository["findById"]>
>;

export const stockRepository = new StockRepository(db);
