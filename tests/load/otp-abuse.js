import http from "k6/http";
import { check } from "k6";
import { Counter, Rate } from "k6/metrics";

const env = JSON.parse(open("./k6-env.json"));

const rateLimitedCount = new Counter("rate_limited_429_responses");
const blockedLeakRate = new Rate("unauthorized_sms_dispatches");

export const options = {
  scenarios: {
    otp_flood: {
      executor: "constant-arrival-rate",
      rate: 50,              // 50 requests/sec
      timeUnit: "1s",
      duration: "1m",
      preAllocatedVUs: 20,
      maxVUs: 50,
    },
  },
  thresholds: {
    rate_limited_429_responses: ["count>200"], // Rate limiter actively triggers
  },
};

export default function () {
  const payload = JSON.stringify({
    identifier: "9999900001", // Static target to trigger identifier rate limiting
  });

  const res = http.post(`${env.BASE_URL}/api/auth/request-otp`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  if (res.status === 429) {
    rateLimitedCount.add(1);
    blockedLeakRate.add(0);
  } else if (res.status === 200) {
    blockedLeakRate.add(1);
  }

  check(res, {
    "rate limiter responds with 429 or 200": (r) => r.status === 429 || r.status === 200,
  });
}
