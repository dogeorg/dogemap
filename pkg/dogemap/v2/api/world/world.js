import ApiClient from "/api/client.js";
import { store } from "/state/store.js";

import { generateMockedWorld } from "./world.mocks.js";

const client = new ApiClient("http://localhost:3000", store.networkContext);

export async function getWorld() {
  return client.get("/world", { mock: generateMockedWorld });
}
