// AI-powered natural language parser for expense entries
// Extracts amount, title, date, and category dynamically without predefined lists.

const EMOJI_MAP = {
  pizza: '🍕', burger: '🍔', food: '🍕', dinner: '🍽️', lunch: '🍱', breakfast: '🍳', restaurant: '🍽️', cafe: '☕', coffee: '☕', tea: '☕', chai: '☕', drink: '🥤', juice: '🥤', bar: '🍺',
  uber: '🚗', ola: '🚗', auto: '🚗', cab: '🚗', taxi: '🚗', bus: '🚌', train: '🚂', metro: '🚇', petrol: '⛽', fuel: '⛽', flight: '✈️', ticket: '🎫', travel: '✈️', ride: '🚗',
  shoes: '👟', shirt: '👕', clothes: '👕', dress: '👗', shopping: '🛍️', amazon: '🛍️', flipkart: '🛍️', bag: '👜', watch: '⌚', gift: '🎁',
  books: '📚', course: '📚', class: '📚', tuition: '📚', fee: '💵', college: '🏫', school: '🏫', study: '📝', exam: '📝', pen: '✏️', book: '📚',
  medicine: '💊', doctor: '👨‍⚕️', hospital: '🏥', clinic: '🏥', pharmacy: '🏥', gym: '💪', yoga: '🧘', health: '❤️', medical: '💊', dentist: '🦷',
  movie: '🎬', cinema: '🎬', netflix: '📺', spotify: '🎵', game: '🎮', party: '🥳', concert: '🎸', entertainment: '🎬', prime: '📺', youtube: '📺',
  electricity: '⚡', water: '💧', gas: '🔥', internet: '🌐', wifi: '🌐', mobile: '📱', recharge: '📱', bill: '📄', rent: '🏠', utilities: '⚡',
  groceries: '🛒', milk: '🥛', vegetables: '🥦', fruits: '🍎', bread: '🍞', supermarket: '🛒', blinkit: '🛒', zepto: '🛒', dmart: '🛒', grocery: '🛒',
  haircut: '💇', salon: '💇', spa: '🧖', beauty: '💄', personal: '💇',
  laptop: '💻', phone: '📱', computer: '💻', keyboard: '⌨️', gadget: '🔌', device: '🔌',
  salary: '💰', income: '💰', refund: '💰', bonus: '💰',
};

const PREMIUM_PALETTE = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f97316', // Orange
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f59e0b', // Amber
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#a855f7', // Purple-light
  '#f43f5e', // Rose
];

function extractAmount(text) {
  const patterns = [
    /[₹$€£¥₩]\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/,
    /(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:rupees?|rs\.?|dollars?|euros?)/i,
    /(?:Rs\.?\s*)(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /(\d+(?:,\d{3})*(?:\.\d{1,2})?)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  return null;
}

function getStableColor(categoryName) {
  let hash = 0;
  const str = categoryName.toLowerCase().trim();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PREMIUM_PALETTE.length;
  return PREMIUM_PALETTE[index];
}

function getSmartEmoji(categoryName) {
  const lower = categoryName.toLowerCase().trim();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return '🏷️';
}

function cleanDescription(text, amount) {
  // Strip amount and common patterns
  let cleaned = text
    .replace(/[₹$€£¥₩]\s*\d+(?:,\d{3})*(?:\.\d{1,2})?/g, '')
    .replace(/\d+(?:,\d{3})*(?:\.\d{1,2})?\s*(?:rupees?|rs\.?|dollars?|euros?)/gi, '')
    .replace(/(?:Rs\.?\s*)\d+(?:,\d{3})*(?:\.\d{1,2})?/gi, '')
    .replace(/\d+(?:,\d{3})*(?:\.\d{1,2})?/g, '')
    .trim();

  // Strip trailing prepositions left over after stripping amounts (e.g., "for", "on", "at")
  cleaned = cleaned.replace(/\s+\b(for|on|at|to)\b$/gi, '').trim();

  // Strip leading punctuation or noise
  cleaned = cleaned.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim();
  return cleaned;
}

export function parseEntry(text) {
  if (!text || text.trim().length < 3) return null;

  const amount = extractAmount(text);
  if (!amount || amount <= 0) return null;

  const cleaned = cleanDescription(text, amount);
  if (cleaned.length < 2) return null;

  // Rules to extract Category and Title
  let category = '';
  let title = '';

  // Look for prepositions: "on", "for", "at", "to"
  const onMatch = cleaned.match(/(.+?)\s+on\s+(.+)/i);
  const forMatch = cleaned.match(/(.+?)\s+for\s+(.+)/i);
  const atMatch = cleaned.match(/(.+?)\s+at\s+(.+)/i);

  if (onMatch) {
    const categoryPart = onMatch[2].trim();
    const actionPart = onMatch[1].replace(/\b(spent|paid|bought|got|purchased|spend|pay|buy)\b/gi, '').trim();
    category = categoryPart;
    title = actionPart ? `${actionPart} on ${categoryPart}` : categoryPart;
  } else if (forMatch) {
    const categoryPart = forMatch[2].trim();
    const actionPart = forMatch[1].replace(/\b(spent|paid|bought|got|purchased|spend|pay|buy)\b/gi, '').trim();
    category = categoryPart;
    title = actionPart ? `${actionPart} for ${categoryPart}` : categoryPart;
  } else if (atMatch) {
    const placePart = atMatch[2].trim();
    const actionPart = atMatch[1].replace(/\b(spent|paid|bought|got|purchased|spend|pay|buy)\b/gi, '').trim();
    category = actionPart || placePart;
    title = `${actionPart || 'Spent'} at ${placePart}`;
  } else {
    const stripped = cleaned.replace(/^\b(spent|paid|bought|got|purchased|spend|pay|buy|a|an)\b\s*/gi, '').trim();
    category = stripped;
    title = stripped;
  }

  // Final sanitizing and casing
  category = category.replace(/[^\w\s]/g, '').trim();
  title = title.replace(/[^\w\s]/g, '').trim();

  // If empty fallback
  if (!category) category = 'Other';
  if (!title) title = category;

  // Capitalize first letter
  category = category.charAt(0).toUpperCase() + category.slice(1);
  title = title.charAt(0).toUpperCase() + title.slice(1);

  const now = new Date();
  const catColor = getStableColor(category);
  const catIcon = getSmartEmoji(category);

  return {
    id: Date.now().toString(),
    raw: text.trim(),
    title,
    amount,
    category,
    categoryIcon: catIcon,
    categoryColor: catColor,
    date: now.toISOString(),
    dateLabel: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    type: 'expense',
  };
}

export function getCategoryMeta(category) {
  return {
    icon: getSmartEmoji(category),
    color: getStableColor(category),
  };
}
