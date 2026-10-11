import {
  relations,
  sql,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ============================================================================
// 1. POSTGRES ENUMS
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const productStatusEnum = pgEnum("product_status", [
  "active",
  "draft",
  "archived",
]);

export const cosmeticGradeEnum = pgEnum("cosmetic_grade", ["A", "B", "C"]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const storageProviderEnum = pgEnum("storage_provider", ["r2", "bunny"]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "upi_qr",
  "bank_transfer",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "awaiting_verification",
  "paid",
  "rejected",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

// ============================================================================
// 2. CORE IDENTITY & ACCESS
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).unique(),
    email: varchar("email", { length: 255 }).unique(),
    role: userRoleEnum("role").default("customer").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_users_phone").on(table.phone),
    index("idx_users_email").on(table.email),
    index("idx_users_role").on(table.role),
  ]
);

// ============================================================================
// 3. CATALOG TAXONOMY & HARDWARE PRODUCTS
// ============================================================================

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    description: text("description"),
    parentId: uuid("parent_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_categories_slug").on(table.slug),
    index("idx_categories_parent").on(table.parentId),
  ]
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    sku: varchar("sku", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    // Monetary amounts strictly stored in paise (INR * 100) to prevent precision loss
    basePricePaise: integer("base_price_paise").notNull(),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    isSecondHand: boolean("is_second_hand").default(false).notNull(),
    status: productStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_products_slug").on(table.slug),
    index("idx_products_sku").on(table.sku),
    index("idx_products_category_status").on(table.categoryId, table.status),
    index("idx_products_price").on(table.basePricePaise),
    index("idx_products_second_hand").on(table.isSecondHand, table.status),
  ]
);

// ============================================================================
// 4. HARDWARE SPECIFICATIONS & USED DRONE INSPECTIONS
// ============================================================================

export const droneSpecifications = pgTable("drone_specifications", {
  productId: uuid("product_id")
    .primaryKey()
    .references(() => products.id, { onDelete: "cascade" }),
  frameSizeMm: integer("frame_size_mm"),
  weightGrams: integer("weight_grams"),
  inputVoltageLipo: varchar("input_voltage_lipo", { length: 32 }), // e.g., "4S-6S LiPo"
  motorKv: varchar("motor_kv", { length: 32 }), // e.g., "1750KV"
  fcFirmware: varchar("fc_firmware", { length: 64 }), // e.g., "Betaflight 4.5"
  escProtocol: varchar("esc_protocol", { length: 64 }), // e.g., "DShot600"
  flightTimeMinutes: integer("flight_time_minutes"),
  payloadCapacityGrams: integer("payload_capacity_grams"),
});

export const secondHandDetails = pgTable("second_hand_details", {
  productId: uuid("product_id")
    .primaryKey()
    .references(() => products.id, { onDelete: "cascade" }),
  cosmeticGrade: cosmeticGradeEnum("cosmetic_grade").notNull(),
  flightHours: integer("flight_hours").default(0),
  crashHistory: boolean("crash_history").default(false).notNull(),
  batteryCycleCount: integer("battery_cycle_count").default(0),
  includedAccessories: jsonb("included_accessories")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`),
  inspectionNotes: text("inspection_notes"),
});

// ============================================================================
// 5. MEDIA ASSETS (CLOUDFLARE R2 & BUNNY STREAM)
// ============================================================================

export const productMedia = pgTable(
  "product_media",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    storageProvider: storageProviderEnum("storage_provider").notNull(),
    url: text("url").notNull(), // WebP public route or Bunny HLS manifest
    playbackId: varchar("playback_id", { length: 128 }), // Bunny.net Video UUID
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_product_media_lookup").on(table.productId, table.displayOrder),
    index("idx_product_media_playback").on(table.playbackId),
  ]
);

// ============================================================================
// 6. ORDERS & DIRECT UPI QR VERIFICATION
// ============================================================================

export interface ShippingAddressPayload {
  fullName: string;
  phone: string;
  flatBuilding: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderReference: varchar("order_reference", { length: 24 })
      .notNull()
      .unique(), // e.g., "ORD-82914"
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "restrict" })
      .notNull(),
    totalAmountPaise: integer("total_amount_paise").notNull(),
    shippingAddress: jsonb("shipping_address")
      .$type<ShippingAddressPayload>()
      .notNull(),

    // UPI Settlement Pipeline
    paymentMethod: paymentMethodEnum("payment_method")
      .default("upi_qr")
      .notNull(),
    paymentStatus: paymentStatusEnum("payment_status")
      .default("awaiting_verification")
      .notNull(),
    upiTransactionId: varchar("upi_transaction_id", { length: 64 }), // Bank 12-digit UTR
    paymentScreenshotUrl: text("payment_screenshot_url"),

    // Fulfillment State Machine
    orderStatus: orderStatusEnum("order_status").default("placed").notNull(),
    courierPartner: varchar("courier_partner", { length: 64 }), // e.g., "Delhivery", "Blue Dart"
    trackingAwb: varchar("tracking_awb", { length: 64 }),

    // Reconciliation & Approval
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedBy: uuid("verified_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("unique_upi_utr")
      .on(table.upiTransactionId)
      .where(sql`${table.upiTransactionId} IS NOT NULL`),
    index("idx_orders_user").on(table.userId),
    index("idx_orders_payment_status").on(table.paymentStatus),
    index("idx_orders_order_status").on(table.orderStatus),
    index("idx_orders_created").on(table.createdAt),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "restrict" })
      .notNull(),
    quantity: integer("quantity").notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    isSecondHand: boolean("is_second_hand").default(false).notNull(),
  },
  (table) => [
    index("idx_order_items_order").on(table.orderId),
    index("idx_order_items_product").on(table.productId),
  ]
);

// ============================================================================
// 7. INVENTORY RESERVATIONS & AUDITING
// ============================================================================

export const stockReservations = pgTable(
  "stock_reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    quantity: integer("quantity").notNull(),
    reservedUntil: timestamp("reserved_until", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_stock_reservations_expiry").on(table.reservedUntil),
    index("idx_stock_reservations_product").on(table.productId),
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 100 }).notNull(),
    entityName: varchar("entity_name", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 64 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_audit_logs_admin").on(table.adminId),
    index("idx_audit_logs_created").on(table.createdAt),
    index("idx_audit_logs_entity").on(table.entityName, table.entityId),
  ]
);

// ============================================================================
// 8. DRIZZLE RELATIONAL DEFINITIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  stockReservations: many(stockReservations),
  auditLogs: many(auditLogs),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "category_hierarchy",
  }),
  children: many(categories, { relationName: "category_hierarchy" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  specifications: one(droneSpecifications, {
    fields: [products.id],
    references: [droneSpecifications.productId],
  }),
  secondHandDetails: one(secondHandDetails, {
    fields: [products.id],
    references: [secondHandDetails.productId],
  }),
  media: many(productMedia),
  orderItems: many(orderItems),
  stockReservations: many(stockReservations),
}));

export const droneSpecificationsRelations = relations(
  droneSpecifications,
  ({ one }) => ({
    product: one(products, {
      fields: [droneSpecifications.productId],
      references: [products.id],
    }),
  })
);

export const secondHandDetailsRelations = relations(
  secondHandDetails,
  ({ one }) => ({
    product: one(products, {
      fields: [secondHandDetails.productId],
      references: [products.id],
    }),
  })
);

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  verifier: one(users, {
    fields: [orders.verifiedBy],
    references: [users.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const stockReservationsRelations = relations(
  stockReservations,
  ({ one }) => ({
    product: one(products, {
      fields: [stockReservations.productId],
      references: [products.id],
    }),
    user: one(users, {
      fields: [stockReservations.userId],
      references: [users.id],
    }),
  })
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [auditLogs.adminId],
    references: [users.id],
  }),
}));

// ============================================================================
// 9. INFERRED TYPESCRIPT TYPES
// ============================================================================

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

export type Product = InferSelectModel<typeof products>;
export type NewProduct = InferInsertModel<typeof products>;

export type DroneSpecification = InferSelectModel<typeof droneSpecifications>;
export type NewDroneSpecification = InferInsertModel<
  typeof droneSpecifications
>;

export type SecondHandDetail = InferSelectModel<typeof secondHandDetails>;
export type NewSecondHandDetail = InferInsertModel<typeof secondHandDetails>;

export type ProductMedia = InferSelectModel<typeof productMedia>;
export type NewProductMedia = InferInsertModel<typeof productMedia>;

export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;

export type OrderItem = InferSelectModel<typeof orderItems>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;

export type StockReservation = InferSelectModel<typeof stockReservations>;
export type NewStockReservation = InferInsertModel<typeof stockReservations>;

export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;
