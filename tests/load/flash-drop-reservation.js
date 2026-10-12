import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

const env = JSON.parse(open("./k6-env.json"));

const successfulLocks = new Counter("successful_inventory_locks");
const rejectedLocks = new Counter("rejected_out_of_stock_locks");

export const options = {
  scenarios: {
    flash_drop_burst: {
      executor: "shared-iterations",
      vus: 300,              // 300 simultaneous buyers competing for 1 unit
      iterations: 300,
      maxDuration: "30s",
    },
  },
  thresholds: {
    successful_inventory_locks: ["count==1"], // Exactly 1 buyer must acquire lock
  },
};

export default function () {
  const payload = JSON.stringify({
    items: [
      {
        productId: env.TEST_TARGET_PRODUCT_ID,
        quantity: 1,
      },
    ],
    shippingAddress: {
      fullName: `Stress Tester ${__VU}`,
      phone: "9876543210",
      flatBuilding: "Apt 101",
      street: "MG Road",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
    },
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Cookie: `aero_session=${env.AUTH_BEARER_TOKEN}`,
      "x-action-name": "initiateCheckoutAction",
    },
  };

  const res = http.post(`${env.BASE_URL}/api/checkout/initiate`, payload, params);

  if (res.status === 200) {
    const body = res.json();
    if (body.success === true) {
      successfulLocks.add(1);
    } else {
      rejectedLocks.add(1);
    }
  } else {
    rejectedLocks.add(1);
  }

  check(res, {
    "handled gracefully (200 or 409)": (r) => r.status === 200 || r.status === 409,
  });
}
