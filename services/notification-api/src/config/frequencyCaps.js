export const FREQUENCY_CAPS = {
  EMAIL: {
    maxCount: 3,
    windowSeconds: 24 * 60 * 60,
  },
  SMS: {
    maxCount: 2,
    windowSeconds: 24 * 60 * 60,
  },
  PUSH: {
    maxCount: 5,
    windowSeconds: 24 * 60 * 60,
  },
  WHATSAPP: {
    maxCount: 2,
    windowSeconds: 24 * 60 * 60,
  },
};