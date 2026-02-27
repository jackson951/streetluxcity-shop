"use client";

import { Product } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "./product-card";

const OVERSCAN_ROWS = 3;

function getColumnCount(width: number) {
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

function getEstimatedRowHeight(columns: number) {
  if (columns === 1) return 430;
  if (columns === 2) return 410;
  if (columns === 4) return 370;
  return 390;
}

export function VirtualizedProductGrid({
  products,
  viewportClassName = "h-[72vh]"
}: {
  products: Product[];
  viewportClassName?: string;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(900);
  const [viewportWidth, setViewportWidth] = useState(1024);

  const columns = getColumnCount(viewportWidth);
  const rowHeight = getEstimatedRowHeight(columns);
  const totalRows = Math.ceil(products.length / columns);

  const { startRow, endRow } = useMemo(() => {
    if (!viewportHeight) return { startRow: 0, endRow: Math.min(totalRows - 1, 0) };
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN_ROWS);
    const end = Math.min(totalRows - 1, Math.ceil((scrollTop + viewportHeight) / rowHeight) + OVERSCAN_ROWS);
    return { startRow: start, endRow: end };
  }, [scrollTop, viewportHeight, rowHeight, totalRows]);

  const startIndex = startRow * columns;
  const endIndex = Math.min(products.length, (endRow + 1) * columns);
  const visibleProducts = products.slice(startIndex, endIndex);
  const topSpacer = startRow * rowHeight;
  const bottomSpacer = Math.max(0, (totalRows - endRow - 1) * rowHeight);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const syncSize = () => {
      setViewportHeight(node.clientHeight);
      setViewportWidth(node.clientWidth);
    };

    syncSize();

    const observer = new ResizeObserver(syncSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrollTop(node.scrollTop));
    };

    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (products.length <= 18) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div ref={viewportRef} className={`${viewportClassName} overflow-auto pr-1`}>
      <div style={{ height: topSpacer }} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div style={{ height: bottomSpacer }} />
    </div>
  );
}
