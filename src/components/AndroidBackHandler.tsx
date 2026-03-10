'use client';
import { useAndroidBackButton } from '@/hooks/useAndroidBackButton';

export function AndroidBackHandler() {
  useAndroidBackButton();
  return null;
}