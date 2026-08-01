export const voiceConfig = {
  enabled: true,

  input: {
    sampleRate: 16000,
    channels: 1,
  },

  output: {
    sampleRate: 24000,
    channels: 1,
  },

  echoCancellation: true,

  noiseSuppression: true,

  autoGainControl: true,
} as const;
