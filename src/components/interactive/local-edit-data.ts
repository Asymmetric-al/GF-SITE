export interface LocalEditExample {
  readonly id: string;
  readonly tabLabel: string;
  readonly context: string;
  readonly standardPractice: string;
  readonly outsideHabitDeclined: string;
  readonly governanceNote: string;
}

/**
 * Illustrative editorial examples translating Global Fellowship's written
 * local-leadership, host-authority, and field-security policies into concrete
 * contrasts. These are policy illustrations, never attributed field quotes.
 */
export const LOCAL_EDIT_EXAMPLES: readonly LocalEditExample[] = [
  {
    context: "Illustrative example: reviewing a field story before publication",
    governanceNote:
      "Every identifiable field story returns to the local elder or worker in their own working language before publication. Their revision stands, and they may pause or withdraw consent at any time.",
    id: "story",
    outsideHabitDeclined:
      "Publishing an outside summary that credits visiting workers for a breakthrough outreach campaign without asking the local church how the story should be told.",
    standardPractice:
      "Local pastors and believers lead the fellowship, open Scripture with their neighbors, and review every word before anything is published; visiting teammates serve as guests.",
    tabLabel: "Publish a Story",
  },
  {
    context: "Illustrative example: a church asking to send an Exposure Trip",
    governanceNote:
      "Global coordinates logistics and regional teams contextualize, yet local church leaders always hold final say to welcome a visit, reshape its focus, or say not this season without losing fellowship or support.",
    id: "visit",
    outsideHabitDeclined:
      "Arriving with a large visiting group, a preset program schedule, and cameras aimed at producing a highlight video for a home church service.",
    standardPractice:
      "Asking local hosts whether a small listening visit would serve their current season, honoring their timing and boundaries, and coming to sit at their table to learn how to pray.",
    tabLabel: "Host a Visit",
  },
  {
    context:
      "Illustrative example: protecting a congregation in public updates",
    governanceNote:
      "Local believers live permanently with the neighborhood and legal consequences of every detail published online. Safety follows the local leader's judgment first, ahead of fundraising visibility.",
    id: "naming",
    outsideHabitDeclined:
      "Sharing a pastor's full name, town name, and a public map pin showing where new house fellowships gather.",
    standardPractice:
      "Inviting churches to pray for a growing local fellowship in a broad region while keeping names, towns, and photographs strictly within the disclosure tier approved by local elders.",
    tabLabel: "Protect a Name",
  },
] as const;
