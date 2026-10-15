import { NextResponse } from "next/server";
import { getProducts } from "@/server/queries/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await getProducts({ pageSize: 50, sortBy: "newest" });
    const allProducts = res.data || [];

    const drones = allProducts.filter(
      (p) =>
        !p.isSecondHand &&
        !p.sku?.startsWith("ACC-") &&
        !p.category?.slug?.includes("accessor")
    );

    const mini = drones.filter((p) => p.category?.slug === "mini-series");
    const air = drones.filter((p) => p.category?.slug === "air-series");
    const mavic = drones.filter((p) => p.category?.slug === "mavic-series");
    const avata = drones.filter((p) => p.category?.slug === "avata-series");

    const preowned = allProducts.filter((p) => p.isSecondHand);

    const accessories = allProducts.filter(
      (p) =>
        p.category?.slug?.toLowerCase().includes("accessor") ||
        p.sku?.toUpperCase().startsWith("ACC-")
    );

    return NextResponse.json({
      success: true,
      drones,
      mini,
      air,
      mavic,
      avata,
      preowned,
      accessories,
    });
  } catch (error) {
    console.error("[Nav Catalog API Error]:", error);
    return NextResponse.json(
      { success: false, drones: [], preowned: [], accessories: [], diy: [] },
      { status: 500 }
    );
  }
}
