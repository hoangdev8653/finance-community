export interface PublicProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
  bio: string | null;
  createdAt: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarMediaId?: string;
}

export interface FollowItemProfile {
  userId: string;
  username: string;
  displayName: string | null;
  avatarMediaId: string | null;
}

export interface FollowerItem {
  followerId: string;
  followedAt: string;
  profile: FollowItemProfile | null;
}

export interface FollowingItem {
  followingId: string;
  followedAt: string;
  profile: FollowItemProfile | null;
}

export interface FollowStatusResponse {
  following: boolean;
  followingId: string;
}

export interface QueryFollowsParams {
  page?: number;
  limit?: number;
}
