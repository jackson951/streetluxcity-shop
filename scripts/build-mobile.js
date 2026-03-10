#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Building StreetLuxCity Mobile App...');

try {
  // Step 1: Build the Next.js app (static export happens automatically via output: 'export')
  console.log('📦 Building Next.js app...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 2: Add Capacitor platforms if not already added
  console.log('🔌 Adding Capacitor platforms...');
  try {
    execSync('npx cap add android', { stdio: 'inherit' });
  } catch {
    console.log('Android platform already added or skipped');
  }

  try {
    execSync('npx cap add ios', { stdio: 'inherit' });
  } catch {
    console.log('iOS platform already added or skipped');
  }

  // Step 3: Sync built files to Capacitor
  console.log('📁 Syncing files to Capacitor...');
  execSync('npx cap sync', { stdio: 'inherit' });

  console.log('✅ Mobile build completed successfully!');
  console.log('');
  console.log('📱 Next steps:');
  console.log('   Android: npx cap open android');
  console.log('   iOS:     npx cap open ios');
  console.log('');
  console.log('🔧 To run on device:');
  console.log('   Android: npx cap run android');
  console.log('   iOS:     npx cap run ios');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}