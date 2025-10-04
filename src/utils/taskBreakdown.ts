export function breakdownTask(taskString: string): string[] {
  const lowerTask = taskString.toLowerCase();

  // Check for cleaning keywords
  if (lowerTask.includes('clean') || lowerTask.includes('tidy')) {
    return [
      'Declutter surfaces',
      'Wipe down counters',
      'Do the dishes',
      'Sweep the floor',
      'Take out the trash'
    ];
  }

  // Check for project/essay keywords
  if (lowerTask.includes('project') || lowerTask.includes('essay') || lowerTask.includes('paper')) {
    return [
      'Review the requirements',
      'Create an outline',
      'Research one source article',
      'Write the introduction',
      'Take a 5-minute break'
    ];
  }

  // Check for cooking keywords
  if (lowerTask.includes('cook') || lowerTask.includes('meal') || lowerTask.includes('dinner')) {
    return [
      'Check what ingredients you have',
      'Make a shopping list if needed',
      'Prep ingredients',
      'Cook the meal',
      'Clean up as you go'
    ];
  }

  // Check for laundry keywords
  if (lowerTask.includes('laundry') || lowerTask.includes('wash clothes')) {
    return [
      'Sort clothes by color',
      'Load the washing machine',
      'Add detergent',
      'Start the wash cycle',
      'Transfer to dryer when done'
    ];
  }

  // Check for homework/study keywords
  if (lowerTask.includes('homework') || lowerTask.includes('study')) {
    return [
      'Gather materials and notes',
      'Find a quiet space',
      'Read through the assignment',
      'Work for 25 minutes',
      'Take a short break'
    ];
  }

  // Check for email/communication keywords
  if (lowerTask.includes('email') || lowerTask.includes('respond') || lowerTask.includes('reply')) {
    return [
      'Open email inbox',
      'Read the message carefully',
      'Draft a response',
      'Proofread before sending',
      'Send the email'
    ];
  }

  // Default: return the original task as a single item
  return [taskString];
}
