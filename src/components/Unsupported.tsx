import { EllipsisVertical, Info, Settings2 } from "lucide-react";
import React from "react";

import { H1, H3, H4, Text } from "@ux/Typography";

import { LayoutIcon } from "./LayoutIcon";

export function Unsupported() {
  const browser = inferBrowser();
  return (
    <div className="text-default flex max-h-screen min-h-screen flex-row gap-2 overflow-hidden bg-neutral-100 dark:bg-neutral-800 dark:text-white">
      <div className="flex flex-1 flex-col gap-2 overflow-y-scroll p-4">
        <H1 className="inline-flex items-center gap-2 py-4">
          <LayoutIcon rows={3} columns={4} encoders={2} />
          ch57x keyboard tool
        </H1>
        <Text>
          Unfortunately, either your browser doesn't support WebHID, or you have
          a security setting preventing access to HID devices.
        </Text>
        <H3>Browser support</H3>
        <Text>
          Currently only <Text strong={browser === "Chrome"}>Chrome</Text>,{" "}
          <Text strong={browser === "Edge"}>Edge</Text>, and{" "}
          <Text strong={browser === "Opera"}>Opera</Text> support WebHID
        </Text>
        <Text>
          <Text strong={browser === "Firefox"}>Firefox</Text> currently has no
          plans to support it. See{" "}
          <a
            href="https://mozilla.github.io/standards-positions"
            className="text-blue-500"
            target="_blank"
          >
            Mozilla Standards Positions
          </a>
        </Text>
        <Text>
          Apple has made no statement regarding WebHID and{" "}
          <Text strong={browser === "Safari"}>Safari</Text>, but has been
          historically opposed to adding hardware-access APIs
        </Text>
        {browser === "Chrome" && (
          <div className="flex flex-col gap-2 py-2">
            <H3>Chrome permissions</H3>
            <Text>
              This app must be accessed in a secure context to be able to access
              WebHID. Ensure that you are accessing it over a secure connection.
            </Text>
            <Text>Permissions can be set in three places</Text>
            <H4>1. Global</H4>
            <Text>
              From the <EllipsisVertical className="inline size-4" /> menu, goto{" "}
              <Text strong>Settings</Text>
            </Text>
            <Text>
              Select <Text strong>Privacy and Security</Text> on the left menu
            </Text>
            <Text>
              Select <Text strong>Site settings</Text>
            </Text>
            <Text>
              Find the <Text strong>Permissions</Text> section, and goto{" "}
              <Text strong>Additional permissions</Text>
            </Text>
            <Text>
              Select <Text strong>HID devices</Text>
            </Text>
            <Text>
              To use this app,{" "}
              <Text strong>Sites can ask to connect to HID devices</Text> must
              be selected
            </Text>
            <Text>
              This settings page can also be accessed directly at{" "}
              <Text className="text-green-700">
                chrome://settings/content/hidDevices
              </Text>{" "}
            </Text>
            <Text className="italic">
              You will need to cut and paste this URL, chrome doesn't allow
              direct links to settings pages
            </Text>
            <H4>2. Per-site</H4>
            <Text>
              Select the <Settings2 className="inline size-4" /> or{" "}
              <Info className="inline size-4" /> at the start of the address
              bar.
            </Text>
            <Text>
              Select <Text strong>Site settings</Text>
            </Text>
            <Text>
              Find the <Text strong>HID devices</Text> item in the{" "}
              <Text strong>Permissions</Text> list
            </Text>
            <Text>
              To use this app, <Text strong>Ask</Text> must be selected
            </Text>
            <H4>3. Enterprise policy</H4>
            <Text>
              This is configured on Windows through the registry or on Mac/Linux
              through Managed Preferences
            </Text>
            <Text>
              The policy is called{" "}
              <Text className="bg-neutral-200 font-mono">
                Software\Policies\Google\Chrome\WebHidBlockedForUrls
              </Text>
            </Text>
            <Text>
              This contains a list of URLs for which HID access is denied.
            </Text>
            <Text>
              If the machine that you are running Chrome on is managed by an
              enterprise policy, you may need assistance from your IT team to
              use this app.
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

type Browser = "Opera" | "Edge" | "Chrome" | "Safari" | "Firefox";

const BROWSER_SIGNATURES: { tokens: string[]; name: Browser }[] = [
  { tokens: ["opr", "opera"], name: "Opera" },
  { tokens: ["edg"], name: "Edge" },
  { tokens: ["chrome"], name: "Chrome" },
  { tokens: ["safari"], name: "Safari" },
  { tokens: ["firefox"], name: "Firefox" },
];

function inferBrowser(): Browser | undefined {
  const agent = navigator.userAgent.toLowerCase();

  const browser = BROWSER_SIGNATURES.find(({ tokens }) =>
    tokens.some(token => agent.includes(token))
  );
  return browser?.name;
}
