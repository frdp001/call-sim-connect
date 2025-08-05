export const generateMeetingId = (): string => {
  const part1 = Math.floor(Math.random() * 900) + 100; // 3 digits
  const part2 = Math.floor(Math.random() * 900) + 100; // 3 digits  
  const part3 = Math.floor(Math.random() * 9000) + 1000; // 4 digits
  
  return `${part1} ${part2} ${part3}`;
};

// Generate a consistent meeting ID for this session
export const MEETING_ID = generateMeetingId();

// Base64 encoding/decoding utilities for email parameters
export const encodeEmailToBase64 = (email: string): string => {
  return btoa(email);
};

export const decodeEmailFromBase64 = (encodedEmail: string): string | null => {
  try {
    return atob(encodedEmail);
  } catch (error) {
    console.error('Invalid base64 string:', error);
    return null;
  }
};