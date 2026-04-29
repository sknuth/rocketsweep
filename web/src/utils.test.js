import { safeAppUrl } from "./utils";

describe("safeAppUrl", () => {
  it("builds the Safe app launch URL with the configured Rocketsweep host", () => {
    const url = new URL(
      safeAppUrl({
        safeAddress: "0x000000000000000000000000000000000000dEaD",
        appUrl: "https://rocketsweep.vercel.app",
      })
    );

    expect(url.origin).toBe("https://app.safe.global");
    expect(url.pathname).toBe("/apps/open");
    expect(url.searchParams.get("safe")).toBe(
      "eth:0x000000000000000000000000000000000000dEaD"
    );
    expect(url.searchParams.get("appUrl")).toBe(
      "https://rocketsweep.vercel.app"
    );
  });
});
