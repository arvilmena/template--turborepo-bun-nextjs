import assert from "node:assert";
import logger from "@my/base/logger";
import { stockService } from "@my/service/stock.service";
import { randomUUIDv7 } from "bun";

async function testStockService() {
  const symbol = randomUUIDv7();
  logger.info({ symbol });

  logger.info("Creating stock...");
  const newStock = await stockService.createOne({
    data: {
      name: "Test Stock",
      currentSymbol: symbol,
      currentSymbolSince: "2021-01-01",
      marketCountry: "US",
      swsId: Math.floor(Math.random() * 1000000),
      swsUniqueSymbol: symbol,
      swsSymbolSince: "2021-01-01",
    },
  });

  logger.info(JSON.stringify(newStock, null, 2));

  if (!newStock?.id) {
    throw new Error("Stock not created");
  }

  logger.info("Retrieving stock...");
  const retrieve = await stockService.findById({ id: newStock?.id });

  if (!retrieve) {
    throw new Error("Newly created stock not found");
  }

  logger.info(JSON.stringify(retrieve, null, 2));

  logger.info({ id: retrieve.id });

  logger.info("Updating stock...");
  const update = await stockService.updateById({
    id: retrieve.id,
    data: {
      name: "Updated Stock",
    },
  });

  logger.info(JSON.stringify(update, null, 2));

  logger.info("Retrieving updated stock...");
  const retrieveUpdated = await stockService.findById({ id: retrieve.id });

  logger.info(JSON.stringify(retrieveUpdated, null, 2));

  logger.info("Deleting stock...");
  const deletedStock = await stockService.deleteById({ id: retrieve.id });

  logger.info(JSON.stringify({ deletedStock }, null, 2));

  logger.info("Retrieving deleted stock...");
  const retrieveDeleted = await stockService.findById({ id: retrieve.id });

  logger.info(JSON.stringify(retrieveDeleted, null, 2));

  assert(retrieveDeleted === undefined);

  logger.info("Done!");
}

await testStockService();

if (require.main === module) {
  process.exit(0);
}
