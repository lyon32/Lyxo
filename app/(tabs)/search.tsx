import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Users } from 'lucide-react-native';

import { getDiscoverOptedIn, setDiscoverOptedIn } from '../../lib/search-storage';

type SubTab = 'feed' | 'discover';

// Tab "Search" (LLD.md §6.1, remplace l'ancien "Discover") : sous-tabs
// Feed/Discover en pills texte, partageant la même search bar en header.
export default function SearchScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SubTab>('feed');
  const [query, setQuery] = useState('');
  const [optedIn, setOptedIn] = useState(false);

  useEffect(() => {
    getDiscoverOptedIn().then(setOptedIn);
  }, []);

  const handleOptIn = () => {
    setOptedIn(true);
    setDiscoverOptedIn();
  };

  return (
    <View className="flex-1 bg-bg px-6 pt-16">
      <View className="mb-4 flex-row items-center gap-2 rounded-full bg-steel/80 px-4 py-3">
        <SearchIcon color="#8E8781" size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('search.placeholder')}
          placeholderTextColor="#8E8781"
          autoCapitalize="none"
          className="flex-1 text-fg"
        />
      </View>

      <View className="mb-6 flex-row gap-6">
        <Pressable onPress={() => setActiveTab('feed')}>
          <Text className={activeTab === 'feed' ? 'font-inter-semibold text-fg' : 'text-muted'}>
            {t('search.feed_tab')}
          </Text>
          {activeTab === 'feed' ? <View className="mt-1 h-0.5 w-full bg-ember" /> : null}
        </Pressable>
        <Pressable onPress={() => setActiveTab('discover')}>
          <Text className={activeTab === 'discover' ? 'font-inter-semibold text-fg' : 'text-muted'}>
            {t('search.discover_tab')}
          </Text>
          {activeTab === 'discover' ? <View className="mt-1 h-0.5 w-full bg-ember" /> : null}
        </Pressable>
      </View>

      {activeTab === 'feed' ? (
        <View className="flex-1 items-center justify-center pb-24">
          <Text className="text-xl text-fg">{t('search.feed_empty_title')}</Text>
          <Text className="mt-2 text-center text-muted">{t('search.feed_empty_subtitle')}</Text>
        </View>
      ) : optedIn ? (
        <View className="flex-1">
          <Text className="mb-4 text-lg text-fg">{t('search.matches_title')}</Text>
          <View className="flex-1 items-center justify-center pb-24">
            <Text className="text-xl text-fg">{t('search.matches_empty_title')}</Text>
            <Text className="mt-2 text-center text-muted">{t('search.matches_empty_subtitle')}</Text>
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center gap-4 pb-24">
          <View className="flex-row">
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                className="h-16 w-16 items-center justify-center rounded-full border-2 border-bg bg-steel"
                style={{ marginLeft: i === 0 ? 0 : -16 }}
              >
                <Users color="#8E8781" size={22} />
              </View>
            ))}
          </View>
          <Text className="text-center text-xl text-fg">{t('search.discover_title')}</Text>
          <Pressable onPress={handleOptIn} className="rounded-full bg-ember px-8 py-4">
            <Text className="font-inter-semibold text-fg">{t('search.discover_cta')}</Text>
          </Pressable>
          <Text className="text-center text-xs text-muted">{t('search.discover_reassurance')}</Text>
        </View>
      )}
    </View>
  );
}
