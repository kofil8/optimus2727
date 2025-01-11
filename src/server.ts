

import { PrismaClient } from "@prisma/client";
import { Server } from "http";
import app from "./app";
import config from "./config";
// import { privateMessageService } from "./app/modules/privateMessage/privateMessage.service";

const prisma = new PrismaClient();

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log("Server running on port", config.port);
  });
}

main();

