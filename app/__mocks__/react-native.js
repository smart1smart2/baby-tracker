// Minimal `react-native` shim for unit tests. Pure-logic modules pull in
// constants/* which in turn import RN's Platform / StyleSheet — values we
// never actually exercise from a Node-environment test, so a no-op stub is
// enough.
module.exports = {
  Platform: { OS: 'ios', select: (x) => x.ios ?? x.default },
  StyleSheet: { create: (styles) => styles, hairlineWidth: 1, flatten: (x) => x },
  Pressable: 'Pressable',
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
};
