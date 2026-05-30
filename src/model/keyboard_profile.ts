import { KeyBinding, KeyboardDeviceType } from "./keyboard";
import { VendorId } from "./usb";

export type KeyboardProfile = {
  name: string;
  vendorId: VendorId;
  productId: number;
  keyboardDeviceType: KeyboardDeviceType;
  layout: KeyLayout;
  bindingsByLayer: Omit<KeyBinding, "origin">[][];
};

export type KeyLayout = {
  rows: number;
  columns: number;
};
