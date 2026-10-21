import { r as createServerFn } from "./ssr.mjs";
import { f as createSsrRpc } from "./router-CM1X38DT.mjs";
import { t as authMiddleware } from "./middleware-D4T3645t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analytics-BDUFFN3h.js
var logListeningTime = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	trackId: String(input.trackId),
	seconds: Math.max(0, Math.min(3600, Math.floor(Number(input.seconds) || 0))),
	completed: Boolean(input.completed)
})).handler(createSsrRpc("b6d7734175b934ca7b7c4a71291039cc0a27bed3daa8b4fd3873b159c0378794"));
var getListeningStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("488b2e03921d9680a5b48f48e55a356b84c9603a347e19d91f04c8da5af5a233"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((trackId) => String(trackId)).handler(createSsrRpc("b37a492d007db198d5bbbdf54a2f9431dd82a0b972958259d577803a9e629b2f"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("d82c2b6d63d963d48e0f04ce11aa523699e1fdd1ef12b50e648cca09de515489"));
//#endregion
export { getListeningStats, logListeningTime };
