export type Locale = 'vi' | 'en';

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
    language: string;
    vietnamese: string;
    english: string;
  };
  navigation: {
    home: string;
    explore: string;
    series: string;
    categories: string;
    tags: string;
    workspace: string;
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
}
