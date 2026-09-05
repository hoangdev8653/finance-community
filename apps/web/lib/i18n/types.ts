export type Locale = 'vi';

export interface TranslationDictionary {
  common: {
    signIn: string;
    join: string;
    signOut: string;
    settings: string;
    toggleTheme: string;
    search: string;
    searchPlaceholder: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    back: string;
    viewAll: string;
    readMore: string;
    all: string;
    notifications: string;
  };
  navigation: {
    home: string;
    explore: string;
    series: string;
    categories: string;
    tags: string;
    workspace: string;
    tools: string;
    account: string;
    feedsAndDiscover: string;
    personalLibrary: string;
    admin: string;
    moderation: string;
  };
  header: {
    brandSubtitle: string;
    searchPrompt: string;
  };
  feedback: {
    noRecords: string;
    noRecordsDesc: string;
    notFound: string;
    errorOccurred: string;
    tryAgain: string;
  };
  posts: {
    publishedOn: string;
    readingTime: string;
    minRead: string;
    author: string;
    comments: string;
    reactions: string;
    share: string;
    bookmark: string;
    latestPosts: string;
    featuredPosts: string;
    trending: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    exploreResearch: string;
    joinCommunity: string;
    statsArticles: string;
    statsMembers: string;
    statsSeries: string;
    statsAccuracy: string;
    featuredTopics: string;
    curatedArticles: string;
    filteredArticles: string;
    editorialStandards: string;
    editorialStandardsDesc: string;
    topContributors: string;
  };
  macro: {
    flashBadge: string;
    leadBadge: string;
    editorialDesk: string;
    justUpdated: string;
    macroHeadline: string;
    macroSummary: string;
    keyPoints: string;
    point1: string;
    point2: string;
    point3: string;
    readFullAnalysis: string;
    viewMacroCharts: string;
    macroSnapshot: string;
    fedRate: string;
    dxyIndex: string;
    us10y: string;
    oilBrent: string;
    usdVnd: string;
  };
  editorial: {
    dailyBriefing: string;
    todayDispatches: string;
    domesticNews: string;
    internationalNews: string;
    marketAnalysis: string;
    featuredSeries: string;
    startReading: string;
    episodesCount: string;
    communityDiscussions: string;
    hotTopics: string;
    activeVoices: string;
    viewAllDispatches: string;
    readLeadStory: string;
    publishedTime: string;
    minsRead: string;
  };
  newsletter: {
    title: string;
    desc: string;
    placeholder: string;
    subscribe: string;
    subscribed: string;
    privacyNote: string;
  };
  scope: {
    all: string;
    domestic: string;
    international: string;
    series: string;
    community: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    markAllRead: string;
    allNotifications: string;
    unread: string;
    noUnread: string;
    noUnreadDesc: string;
    noNotifications: string;
    noNotificationsDesc: string;
  };
  search: {
    title: string;
    subtitle: string;
    resultsFor: string;
  };
}
