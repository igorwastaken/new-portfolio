import { Html, Head, Main, NextScript } from "next/document";
import { useEffect } from "react";

export default function Document() {
  return (
    <Html className="" lang="en">
      <Head />
      <body className="bg-[#DEE4FF] text-[#0F111B] dark:text-[#DEE4FF] dark:bg-[#0F111B]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
