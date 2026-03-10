'use client';
import { useIsNative } from '@/hooks/useNative';
import { WhatsAppChat } from './whatsapp-chat';

export function NativeAwareWhatsApp() {
  const isNative = useIsNative();
  if (isNative) return null;
  return <WhatsAppChat />;
}