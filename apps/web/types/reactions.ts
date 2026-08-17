export interface ReactionCountResponse {
  total: number;
  userReacted: boolean;
}

export interface ToggleReactionResponse {
  reacted: boolean;
  reactionType: string | null;
}

export interface ToggleReactionDto {
  reactionType?: string;
}
