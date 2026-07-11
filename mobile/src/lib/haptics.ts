// Light-touch haptics for key moments. Every call is best-effort — wrapped so a
// device without a Taptic Engine (or a simulator) never throws.

import * as Haptics from 'expo-haptics';

/** A quiet tick when the user sends a message. */
export function tapSend(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** A soft success cue when a macro card lands (food logged). */
export function macroLanded(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** A small selection tick for chip taps / plan selection. */
export function selectTick(): void {
  Haptics.selectionAsync().catch(() => {});
}
