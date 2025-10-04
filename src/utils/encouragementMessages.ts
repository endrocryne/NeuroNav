export const encouragementMessages = [
  "You're doing great!",
  "One step at a time.",
  "It's okay to take a break.",
  "Small progress is still progress.",
  "You've got this!"
];

export function getRandomEncouragementMessage(): string {
  return encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
}
