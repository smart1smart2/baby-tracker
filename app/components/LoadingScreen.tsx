import { ActivityIndicator, StyleSheet, View } from 'react-native';

/** Full-screen centered spinner used while route data is loading. */
export function LoadingScreen() {
  return (
    <View style={styles.root}>
      <ActivityIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
