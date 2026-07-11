// Full-screen barcode scanner (expo-camera). Continuously decodes; on the first
// hit it hands the code to the app's barcode pipeline (→ /api/barcode) and pops.
// Mirrors the web CameraModal, including its camera-permission copy.
import { useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, fonts } from '../src/theme';
import { useApp } from '../src/context/AppProvider';
import { CloseIcon } from '../src/components/Icons';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'] as const;

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const { handleScan } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  const onBarcode = ({ data }: { data: string }) => {
    if (scannedRef.current || !data) return;
    scannedRef.current = true;
    router.back();
    handleScan(data);
  };

  const Header = (
    <Pressable
      style={[styles.close, { top: insets.top + 8 }]}
      onPress={() => router.back()}
      accessibilityLabel="Close scanner"
      hitSlop={8}
    >
      <CloseIcon color={colors.textPrimary} />
    </Pressable>
  );

  // Permission not determined yet → request it once.
  if (!permission) {
    return <View style={styles.black}>{Header}</View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.black}>
        {Header}
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>
            Camera access needed to scan barcodes.
          </Text>
          {permission.canAskAgain ? (
            <Pressable style={styles.grantBtn} onPress={requestPermission}>
              <Text style={styles.grantText}>Allow camera</Text>
            </Pressable>
          ) : (
            <Text style={styles.errorHint}>Enable camera access for Kristy in Settings.</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.black}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES as unknown as any }}
        onBarcodeScanned={onBarcode}
      />
      <View style={styles.scanLine} />
      {Header}
      <Text style={[styles.label, { bottom: insets.bottom + 28 }]}>Point at a barcode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: colors.black },
  close: {
    position: 'absolute',
    right: 14,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.scrimSoft,
  },
  scanLine: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    top: '45%',
    height: 2,
    backgroundColor: colors.accentGold,
  },
  label: {
    position: 'absolute',
    alignSelf: 'center',
    color: colors.textMuted,
    fontSize: 14,
    fontFamily: fonts.ui,
  },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  errorText: { color: colors.textPrimary, fontSize: 15, lineHeight: 22, textAlign: 'center', fontFamily: fonts.ui },
  errorHint: { color: colors.textMuted, fontSize: 13, textAlign: 'center', fontFamily: fonts.ui },
  grantBtn: { backgroundColor: colors.accentGold, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 22 },
  grantText: { color: colors.bg, fontFamily: fonts.uiSemibold, fontSize: 15 },
});
