import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  type ViewToken,
  type ListRenderItemInfo,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { colors, radii, typography, shadows } from '../../shared/theme/placeholder-theme';
import { PrimaryButton } from '../../components/shared/PrimaryButton';
import { useRouteContent } from '../../shared/content/RouteContentContext';
import { APP_STRINGS } from '../../shared/content/strings';
import { COUNTRIES, type Country } from '../../shared/data/countries';
import { appStorage } from '../../shared/storage/app-storage';
import type { QuizQuestion } from '../../shared/content/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Slide type definitions
// ---------------------------------------------------------------------------

type SlideType = 'intro' | 'quiz' | 'ad' | 'country';

interface IntroSlideData {
  type: 'intro';
  title: string;
  subtitle: string;
}

interface QuizSlideData {
  type: 'quiz';
  question: QuizQuestion;
  questionIndex: number;
}

interface AdSlideData {
  type: 'ad';
}

interface CountrySlideData {
  type: 'country';
}

type SlideData = IntroSlideData | QuizSlideData | AdSlideData | CountrySlideData;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OnboardingScreenProps {
  onComplete: (countryCode: string) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function IntroSlide({ data }: { data: IntroSlideData }) {
  return (
    <View style={[slideStyles.container, slideStyles.introContainer]}>
      <View style={slideStyles.introContent}>
        <Text style={slideStyles.introTitle}>{data.title}</Text>
        <Text style={slideStyles.introSubtitle}>{data.subtitle}</Text>
      </View>
    </View>
  );
}

function QuizSlide({
  data,
  selectedIndex,
  onSelect,
}: {
  data: QuizSlideData;
  selectedIndex: number | null;
  onSelect: (questionIndex: number, optionIndex: number) => void;
}) {
  const { question } = data;
  const answered = selectedIndex !== null;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (answered) return;
      onSelect(data.questionIndex, optionIndex);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    },
    [answered, onSelect, data.questionIndex, fadeAnim],
  );

  return (
    <View style={[slideStyles.container, slideStyles.quizContainer]}>
      <Text style={slideStyles.quizQuestion}>{question.pembaQuestion}</Text>

      <View style={slideStyles.optionsContainer}>
        {question.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          return (
            <TouchableOpacity
              key={i}
              style={[
                slideStyles.optionCard,
                isSelected && slideStyles.optionCardSelected,
              ]}
              onPress={() => handleSelect(i)}
              activeOpacity={0.7}
              disabled={answered}
            >
              <Text
                style={[
                  slideStyles.optionText,
                  isSelected && slideStyles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={slideStyles.quizResponse}>{question.pembaResponse}</Text>
          <Text style={slideStyles.quizFact}>{question.fact}</Text>
        </Animated.View>
      )}
    </View>
  );
}

function AdSlide() {
  return (
    <View style={[slideStyles.container, slideStyles.introContainer]}>
      <View style={slideStyles.introContent}>
        <Text style={slideStyles.introTitle}>{APP_STRINGS.ads.title}</Text>
        <Text style={slideStyles.introSubtitle}>{APP_STRINGS.ads.subtitle}</Text>
      </View>
    </View>
  );
}

function CountrySlide({
  selectedCountry,
  searchText,
  onSearchChange,
  onSelectCountry,
}: {
  selectedCountry: Country | null;
  searchText: string;
  onSearchChange: (text: string) => void;
  onSelectCountry: (country: Country) => void;
}) {
  const routeContent = useRouteContent();

  const filteredCountries = useMemo(() => {
    if (!searchText.trim()) return COUNTRIES;
    const query = searchText.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query),
    );
  }, [searchText]);

  const showList =
    searchText.length > 0 && (!selectedCountry || searchText !== selectedCountry.name);

  const renderCountryItem = useCallback(
    ({ item }: { item: Country }) => (
      <TouchableOpacity
        style={[
          slideStyles.countryItem,
          selectedCountry?.code === item.code && slideStyles.countryItemSelected,
        ]}
        onPress={() => onSelectCountry(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            slideStyles.countryName,
            selectedCountry?.code === item.code && slideStyles.countryNameSelected,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    ),
    [selectedCountry, onSelectCountry],
  );

  return (
    <KeyboardAvoidingView
      style={[slideStyles.container, slideStyles.countryContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={slideStyles.introTitle}>
        {routeContent.onboarding.countryPicker.title}
      </Text>
      <Text style={slideStyles.introSubtitle}>
        {routeContent.onboarding.countryPicker.subtitle}
      </Text>
      <TextInput
        style={slideStyles.searchInput}
        value={searchText}
        onChangeText={onSearchChange}
        placeholder={routeContent.onboarding.countryPicker.placeholder}
        placeholderTextColor={colors.sage}
        autoCorrect={false}
        autoCapitalize="words"
      />
      {showList && (
        <View style={slideStyles.dropdownContainer}>
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={renderCountryItem}
            style={slideStyles.dropdown}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          />
        </View>
      )}
      {selectedCountry && (
        <Text style={slideStyles.selectedLabel}>{selectedCountry.name}</Text>
      )}
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Page Dots
// ---------------------------------------------------------------------------

function PageDots({ total, currentIndex }: { total: number; currentIndex: number }) {
  return (
    <View style={dotStyles.container}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[dotStyles.dot, i === currentIndex && dotStyles.dotActive]}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main OnboardingScreen
// ---------------------------------------------------------------------------

export function OnboardingScreen({ onComplete }: OnboardingScreenProps): React.JSX.Element {
  const routeContent = useRouteContent();

  // Build slide data
  const slides: SlideData[] = useMemo(() => {
    const result: SlideData[] = [];

    // 3 intro slides
    for (const slide of routeContent.onboarding.slides) {
      result.push({ type: 'intro', title: slide.title, subtitle: slide.subtitle });
    }

    // 4 quiz slides
    routeContent.quiz.forEach((question, index) => {
      result.push({ type: 'quiz', question, questionIndex: index });
    });

    // 1 ad slide
    result.push({ type: 'ad' });

    // 1 country picker slide
    result.push({ type: 'country' });

    return result;
  }, [routeContent]);

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchText, setSearchText] = useState('');

  const flatListRef = useRef<FlatList<SlideData>>(null);

  const currentSlide = slides[currentIndex];
  const isCountrySlide = currentSlide?.type === 'country';
  const isQuizSlide = currentSlide?.type === 'quiz';
  const quizAnswered = isQuizSlide
    ? quizAnswers[(currentSlide as QuizSlideData).questionIndex] !== undefined
    : false;

  // Can we show the next button?
  const showNextButton = !isCountrySlide && (!isQuizSlide || quizAnswered);
  const showBeginButton = isCountrySlide;

  // Scroll handling
  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / SCREEN_WIDTH);
      setCurrentIndex(newIndex);
    },
    [],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  // Quiz answer handler
  const handleQuizSelect = useCallback(
    (questionIndex: number, optionIndex: number) => {
      setQuizAnswers((prev) => {
        if (prev[questionIndex] !== undefined) return prev;
        return { ...prev, [questionIndex]: optionIndex };
      });

      // Store answer in MMKV
      const question = routeContent.quiz[questionIndex];
      if (question) {
        appStorage.set(question.storageKey, question.storageValues[optionIndex]!);
      }
    },
    [routeContent.quiz],
  );

  // Navigation
  const goToNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, slides.length]);

  const handleBeginJourney = useCallback(() => {
    onComplete(selectedCountry?.code ?? 'US');
  }, [onComplete, selectedCountry]);

  // Country picker handlers
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (selectedCountry && text !== selectedCountry.name) {
        setSelectedCountry(null);
      }
    },
    [selectedCountry],
  );

  const handleSelectCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
    setSearchText(country.name);
  }, []);

  // Should scrolling be enabled?
  // Block swiping forward on quiz slides until answered, but always allow swiping back
  const scrollEnabled = useMemo(() => {
    if (!isQuizSlide) return true;
    return quizAnswered;
  }, [isQuizSlide, quizAnswered]);

  // Render slide
  const renderSlide = useCallback(
    ({ item }: ListRenderItemInfo<SlideData>) => {
      switch (item.type) {
        case 'intro':
          return <IntroSlide data={item} />;
        case 'quiz':
          return (
            <QuizSlide
              data={item}
              selectedIndex={quizAnswers[item.questionIndex] ?? null}
              onSelect={handleQuizSelect}
            />
          );
        case 'ad':
          return <AdSlide />;
        case 'country':
          return (
            <CountrySlide
              selectedCountry={selectedCountry}
              searchText={searchText}
              onSearchChange={handleSearchChange}
              onSelectCountry={handleSelectCountry}
            />
          );
      }
    },
    [
      quizAnswers,
      handleQuizSelect,
      selectedCountry,
      searchText,
      handleSearchChange,
      handleSelectCountry,
    ],
  );

  const keyExtractor = useCallback((_: SlideData, index: number) => `slide-${index}`, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<SlideData> | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        onMomentumScrollEnd={handleScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.bottomContainer}>
        <PageDots total={slides.length} currentIndex={currentIndex} />

        {showNextButton && (
          <PrimaryButton
            label={APP_STRINGS.onboarding.next}
            onPress={goToNext}
            variant="inverse"
            style={styles.nextButton}
          />
        )}

        {showBeginButton && (
          <PrimaryButton
            label={APP_STRINGS.onboarding.beginJourney}
            onPress={handleBeginJourney}
            variant="accent"
            disabled={!selectedCountry}
            style={styles.nextButton}
          />
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  nextButton: {
    marginTop: 16,
  },
});

const dotStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sage,
    opacity: 0.4,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: colors.background,
  },
});

const slideStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 32,
  },
  introContainer: {
    justifyContent: 'center',
  },
  introContent: {
    flex: 1,
    justifyContent: 'center',
  },
  introTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.background,
    marginBottom: 16,
  },
  introSubtitle: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.sage,
  },
  // Quiz styles
  quizContainer: {
    justifyContent: 'center',
    paddingBottom: 120,
  },
  quizQuestion: {
    fontSize: 19,
    lineHeight: 28,
    fontStyle: 'italic',
    color: colors.sage,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: 16,
    width: '100%',
  },
  optionCardSelected: {
    backgroundColor: colors.accentDeep,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: colors.background,
  },
  quizResponse: {
    marginTop: 20,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    color: colors.sage,
  },
  quizFact: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    color: colors.accent,
  },
  // Country styles
  countryContainer: {
    justifyContent: 'center',
    paddingBottom: 120,
  },
  searchInput: {
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.sage,
    borderRadius: radii.md,
    padding: 14,
    fontSize: 17,
    fontWeight: '600',
    color: colors.background,
  },
  dropdownContainer: {
    maxHeight: 200,
    marginTop: 8,
    borderRadius: radii.md,
    backgroundColor: colors.card,
    ...shadows.md,
  },
  dropdown: {
    borderRadius: radii.md,
  },
  countryItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  countryItemSelected: {
    backgroundColor: colors.accentDeep,
  },
  countryName: {
    ...typography.body,
    color: colors.text,
  },
  countryNameSelected: {
    color: colors.background,
    fontWeight: '700',
  },
  selectedLabel: {
    marginTop: 12,
    ...typography.label,
    color: colors.sage,
    textAlign: 'center',
  },
});
