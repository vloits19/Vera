export const badWordsEn = [
  'fuck', 'bitch', 'asshole', 'shit', 'cunt', 'dick', 'nigger', 'nigga', 
  'fag', 'faggot', 'whore', 'slut', 'bastard', 'motherfucker', 'cock', 
  'pussy', 'twat', 'wanker', 'retard', 'cum', 'slutty'
];

export const badWordsId = [
  'anjing', 'babi', 'monyet', 'bangsat', 'kontol', 'memek', 'jembut', 
  'ngentot', 'entot', 'peler', 'pepek', 'puki', 'pukimak', 'bajingan', 
  'kampret', 'tolol', 'goblok', 'bego', 'perek', 'lonte', 'jablay', 
  'sundel', 'ngewe', 'kntl', 'mmk', 'anjg', 'bgst'
];

export const badWordsOther = [
  'puta', 'mierda', 'pendejo', 'chinga', 'cabron', // ES
  'merde', 'putain', 'salope', 'connard', // FR
  'kurwa', // PL
  'blyat', 'cyka', 'suka' // RU
];

// Long enough to safely check as substrings without boundaries
export const harmfulSubstrings = [
  'motherfucker', 'ngentot', 'pukimak', 'bajingan', 'faggot', 'nigger'
];

export function isHarmful(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();

  // Normalize leetspeak (replace symbols/numbers with corresponding letters)
  const charMap: Record<string, string> = {
    '@': 'a', '4': 'a',
    '8': 'b',
    '3': 'e',
    '1': 'i', '!': 'i', '|': 'i',
    '0': 'o',
    '5': 's', '$': 's',
    '7': 't', '+': 't',
    'v': 'u'
  };

  let normalizedText = '';
  for (const char of lowerText) {
    normalizedText += charMap[char] || char;
  }
  
  // Combine all bad words
  const allWords = [...badWordsEn, ...badWordsId, ...badWordsOther];
  
  for (const word of allWords) {
    // Create a regex that allows non-word characters between letters
    // Example: "fuck" becomes "\bf[\W_]*u[\W_]*c[\W_]*k\b"
    const chars = word.split('');
    const spacedRegexStr = chars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\W_]*');
    const regex = new RegExp(`\\b${spacedRegexStr}\\b`, 'i');
    
    if (regex.test(normalizedText)) {
      return true;
    }
  }
  
  // Check substrings for more aggressive matching of severe words (no boundary required)
  // We can strip spaces to catch "m o t h e r f u c k e r" anywhere
  const strippedText = normalizedText.replace(/[\W_]+/g, '');
  for (const sub of harmfulSubstrings) {
    const cleanSub = sub.replace(/[^a-z]/g, '');
    if (strippedText.includes(cleanSub)) {
      return true;
    }
  }
  
  return false;
}
