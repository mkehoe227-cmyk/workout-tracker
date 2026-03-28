import React from 'react';
import {
  View,
  Image,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme';

interface Props {
  imageUri: string | null;
  uploading?: boolean;
  onPicked: (localUri: string) => void;
  label?: string;
}

export function ImagePickerButton({ imageUri, uploading, onPicked, label = 'Add photo' }: Props) {
  async function pick() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      onPicked(result.assets[0].uri);
    }
  }

  if (imageUri) {
    return (
      <Pressable onPress={pick} style={styles.preview}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color="#FFF" />
          </View>
        )}
        <View style={styles.changeLabel}>
          <Text style={styles.changeLabelText}>Change photo</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={pick} style={styles.placeholder}>
      <Text style={styles.placeholderIcon}>📷</Text>
      <Text style={styles.placeholderText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    alignItems: 'center',
  },
  changeLabelText: {
    color: '#FFF',
    fontSize: 11,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  placeholderIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
