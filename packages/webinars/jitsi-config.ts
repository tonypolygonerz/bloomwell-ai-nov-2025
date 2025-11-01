export type WebinarRole = 'admin' | 'guest' | 'attendee'

export const generateWebinarConfig = (webinarId: string, role: WebinarRole) => ({
  roomName: `bloomwell-internal-${webinarId}`,
  domain: 'meet.jit.si',
  configOverwrite: {
    startVideoMuted: role === 'attendee',
    startAudioMuted: role === 'attendee',
    enableWelcomePage: false,
    prejoinPageEnabled: false,
  },
  interfaceConfigOverwrite: {
    TOOLBAR_BUTTONS:
      role === 'admin'
        ? ['microphone', 'camera', 'recording', 'participants', 'chat', 'desktop']
        : role === 'guest'
          ? ['microphone', 'camera', 'chat']
          : ['chat'],
  },
})
