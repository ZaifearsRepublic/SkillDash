"use client";

import Script from "next/script";

/**
 * OpenRemark comment embed.
 *
 * The <div data-open-remark> is the mount point the embed script looks for;
 * the script is loaded lazily so it never competes with article content for
 * bandwidth on the mid-range Android connections most readers are on.
 */
export function OpenRemark() {
  return (
    <>
      <div data-open-remark data-site-key="cmt4f5d6u000304jlf9pe6vbg" />
      <Script src="https://open-remark.zeon.studio/embed.js" strategy="lazyOnload" />
    </>
  );
}

export default OpenRemark;
