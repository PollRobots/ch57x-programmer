const VENDOR_ID = 0x1189;

export async function scanForKeyboard(force: boolean = false) {
  if (navigator.hid === undefined) {
    console.error(
      "Your browser doesn't support WebHID, or your security settings prevent its access."
    );
    return [];
  } else {
    const devices = await getOrRequestDevices(force);
    if (devices.length === 0) {
      console.warn("No usb devices found");
    }
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

  const filters = [0x8840, 0x8842, 0x8890].map(productId => ({
    vendorId: VENDOR_ID,
    productId,
  }));

  return navigator.hid.requestDevice({ filters });
}
