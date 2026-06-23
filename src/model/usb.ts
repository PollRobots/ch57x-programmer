import { z } from "zod";

export const KNOWN_VENDOR_IDS = [0x1189] as const;
export type VendorId = (typeof KNOWN_VENDOR_IDS)[number];

export const VendorIdSchema = z.union(
  KNOWN_VENDOR_IDS.map(id => z.literal(id))
) satisfies z.ZodType<VendorId>;

export const KNOWN_PRODUCT_IDS: Record<VendorId, number[]> = {
  0x1189: [0x8840, 0x8842, 0x8890],
};

export async function scanForKeyboard(force: boolean = false) {
  if (navigator.hid === undefined) {
    console.error(
      "Your browser doesn't support WebHID, or your security settings prevent its access."
    );
    return [];
  } else {
    const devices = await getOrRequestDevices(force);
    return devices.filter(device => {
      return device.collections.some(
        collection =>
          collection.outputReports &&
          collection.outputReports.some(report => report.reportId === 3)
      );
    });
  }
}

export async function getOrRequestDevices(forceRequest: boolean) {
  if (!forceRequest) {
    const devices = await navigator.hid.getDevices();
    if (devices.length !== 0) {
      return devices;
    }
  }

  const filters = KNOWN_VENDOR_IDS.flatMap(vendorId =>
    KNOWN_PRODUCT_IDS[vendorId].map(productId => ({ vendorId, productId }))
  );

  return navigator.hid.requestDevice({ filters });
}
