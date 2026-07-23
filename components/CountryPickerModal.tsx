import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';

import { CountryOption, getCountryOptions } from '../lib/countries';

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: CountryOption) => void;
}

// Liste fermée ISO 3166-1 alpha-2 (SECURITY_NOTES §2.2), noms localisés
// via lib/countries.ts. Recherche locale simple — 249 entrées, pas besoin
// de debounce/réseau.
export function CountryPickerModal({ visible, onClose, onSelect }: CountryPickerModalProps) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const locale = i18n.language === 'en' ? 'en' : 'fr';

  const options = useMemo(() => getCountryOptions(locale), [locale]);
  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const lower = query.trim().toLowerCase();
    return options.filter(
      (option) => option.name.toLowerCase().includes(lower) || option.code.toLowerCase() === lower,
    );
  }, [options, query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-bg px-6 py-16">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl text-fg">{t('onboarding.details.country_picker_title')}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X color="#F5F1EC" size={24} />
          </Pressable>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('onboarding.details.country_picker_search')}
          placeholderTextColor="#8E8781"
          autoCapitalize="none"
          className="mb-4 h-14 rounded-2xl bg-input px-4 text-fg"
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelect(item);
                setQuery('');
                onClose();
              }}
              className="border-b border-border py-4"
            >
              <Text className="text-fg">{item.name}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
