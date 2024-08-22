import { Html, Head, Main, NextScript } from "next/document";
import { useEffect, useState } from "react";

export default function Document() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkDark = localStorage.getItem('theme');
    if (!checkDark) {
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add(checkDark);
    }
  }, []);

  return (
    <Html lang="pt-br">
      <Head />
      <body className="bg-[#DEE4FF] text-[#0F111B] dark:text-[#DEE4FF] dark:bg-[#0F111B]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
