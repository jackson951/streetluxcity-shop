import { OrderStatus } from "@/lib/types";

export const ORDER_TRACKING_FLOW: OrderStatus[] = [
  "ORDER_RECEIVED",
  "PROCESSING_PACKING",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

export function getOrderStatusLabel(status: OrderStatus | string, options?: { paymentApproved?: boolean }) {
  const paymentApproved = options?.paymentApproved ?? false;
  switch (status) {
    case "ORDER_RECEIVED":
      return paymentApproved ? "Order Received" : "Awaiting Payment";
    case "PROCESSING_PACKING":
      return "Processing / Packing";
    case "SHIPPED":
      return "Shipped";
    case "IN_TRANSIT":
      return "In Transit";
    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return String(status).replaceAll("_", " ");
  }
}

export function getNextTrackingStatus(status: OrderStatus | string): OrderStatus | null {
  const index = ORDER_TRACKING_FLOW.indexOf(status as OrderStatus);
  if (index < 0 || index >= ORDER_TRACKING_FLOW.length - 1) return null;
  return ORDER_TRACKING_FLOW[index + 1];
}
