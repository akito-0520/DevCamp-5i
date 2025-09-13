import { onRequest } from "firebase-functions/v2/https";
import * as server from "../build/server/index.js";

export const ssrServer = onRequest(server.default);
