import http from "k6/http";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const env = JSON.parse(open("./k6-env.json"));

const cacheHitRate = new Rate("edge_cache_hit_rate");
const catalogDuration = new Trend("catalog_response_time");

export const options = {
  stages: [
    { duration: "1m", target: 200 },   // Warm-up ramp
    { duration: "2m", target: 1200 },  // Surge ramp
    { duration: "2m", target: 2500 },  // Peak load
    { duration: "1m", target: 0 },     // Scale down
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],          // Under 1% failures
    http_req_duration: ["p(95)<400"],        // 95% of requests under 400ms
    edge_cache_hit_rate: ["rate>0.85"],      // Cache hit ratio >85%
  },
};

const CATEGORY_SLUGS = ["fpv-drones", "motors", "flight-controllers", "escs"];

export default function () {
  const randomCategory = CATEGORY_SLUGS[Math.floor(Math.random() * CATEGORY_SLUGS.length)];
  const isSecondHand = Math.random() > 0.6 ? "true" : "false";

  // 1. Faceted Catalog Query
  const catalogUrl = `${env.BASE_URL}/catalog?category=${randomCategory}&condition=${isSecondHand}&sort=newest`;
  const catalogRes = http.get(catalogUrl, {
    tags: { name: "CatalogFacetedQuery" },
  });

  catalogDuration.add(catalogRes.timings.duration);

  // Check CF cache status header
  const cfCacheStatus = catalogRes.headers["Cf-Cache-Status"] || "MISS";
  cacheHitRate.add(cfCacheStatus === "HIT" || cfCacheStatus === "STALE");

  check(catalogRes, {
    "catalog status is 200": (r) => r.status === 200,
    "catalog contains products": (r) => r.body && r.body.includes("Hardware Inventory"),
  });

  sleep(Math.random() * 1.5 + 0.5);

  // 2. High-traffic Product Detail Page (PDP) Read
  const pdpUrl = `${env.BASE_URL}/product/${env.TEST_TARGET_SLUG}`;
  const pdpRes = http.get(pdpUrl, {
    tags: { name: "ProductDetailPage" },
  });

  check(pdpRes, {
    "pdp status is 200": (r) => r.status === 200,
    "pdp includes technical specs": (r) => r.body && r.body.includes("Technical Specifications"),
  });

  sleep(Math.random() * 2 + 1);
}
