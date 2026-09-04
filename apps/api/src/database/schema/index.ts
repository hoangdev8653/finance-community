import { usersTable } from './users.schema';
import { rolesTable } from './roles.schema';
import { userRolesTable } from './user-roles.schema';
import { profilesTable } from './profiles.schema';
import { auditLogsTable } from './audit-logs.schema';
import { mediaTable } from './media.schema';
import { categoriesTable } from './categories.schema';
import { tagsTable } from './tags.schema';
import { postsTable } from './posts.schema';
import { postTagsTable } from './post-tags.schema';
import { postMediaTable } from './post-media.schema';
import { commentsTable } from './comments.schema';
import { postReactionsTable } from './post-reactions.schema';
import { commentReactionsTable } from './comment-reactions.schema';
import { followsTable } from './follows.schema';
import { notificationsTable } from './notifications.schema';
import { reportsTable } from './reports.schema';
import { moderationActionsTable } from './moderation-actions.schema';
import { systemSettingsTable } from './system-settings.schema';
import { featureFlagsTable } from './feature-flags.schema';
import { authCredentialsTable } from './auth-credentials.schema';
import { postBookmarksTable } from './post-bookmarks.schema';
import { domainsTable } from './domains.schema';
import { topicsTable } from './topics.schema';
import { postTopicsTable } from './post-topics.schema';
import { quizzesTable, quizQuestionsTable, learningProgressTable } from './learning.schema';
import { learningSourcesTable } from './learning-sources.schema';
import { learningSeriesTable, learningSeriesPostsTable } from './learning-series.schema';
import { refreshTokensTable } from './refresh-tokens.schema';

export * from './users.schema';
export * from './roles.schema';
export * from './user-roles.schema';
export * from './profiles.schema';
export * from './audit-logs.schema';
export * from './media.schema';
export * from './categories.schema';
export * from './tags.schema';
export * from './posts.schema';
export * from './post-tags.schema';
export * from './post-media.schema';
export * from './comments.schema';
export * from './post-reactions.schema';
export * from './comment-reactions.schema';
export * from './follows.schema';
export * from './notifications.schema';
export * from './reports.schema';
export * from './moderation-actions.schema';
export * from './system-settings.schema';
export * from './feature-flags.schema';
export * from './auth-credentials.schema';
export * from './post-bookmarks.schema';
export * from './domains.schema';
export * from './topics.schema';
export * from './post-topics.schema';
export * from './learning.schema';
export * from './learning-sources.schema';
export * from './learning-series.schema';
export * from './refresh-tokens.schema';

export const schema = {
  users: usersTable,
  roles: rolesTable,
  userRoles: userRolesTable,
  profiles: profilesTable,
  auditLogs: auditLogsTable,
  media: mediaTable,
  categories: categoriesTable,
  tags: tagsTable,
  posts: postsTable,
  postTags: postTagsTable,
  postMedia: postMediaTable,
  comments: commentsTable,
  postReactions: postReactionsTable,
  commentReactions: commentReactionsTable,
  follows: followsTable,
  notifications: notificationsTable,
  reports: reportsTable,
  moderationActions: moderationActionsTable,
  systemSettings: systemSettingsTable,
  featureFlags: featureFlagsTable,
  authCredentials: authCredentialsTable,
  postBookmarks: postBookmarksTable,
  domains: domainsTable,
  topics: topicsTable,
  postTopics: postTopicsTable,
  quizzes: quizzesTable,
  quizQuestions: quizQuestionsTable,
  learningProgress: learningProgressTable,
  learningSources: learningSourcesTable,
  learningSeries: learningSeriesTable,
  learningSeriesPosts: learningSeriesPostsTable,
  refreshTokens: refreshTokensTable,
};
