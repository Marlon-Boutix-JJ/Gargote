export const getDeviceId = () => {
  let id = localStorage.getItem('gargote_device_id');
  if (!id) {
    // Generer un UUID unique basé sur le temps et des octets pseudo-aléatoires
    const rand = Math.random().toString(36).substring(2, 10);
    id = `DEV-${Date.now().toString(36).toUpperCase()}-${rand.toUpperCase()}`;
    localStorage.setItem('gargote_device_id', id);
  }
  return id;
};

export const getDeviceFingerprint = () => {
  return {
    platform: navigator.platform || 'unknown',
    userAgent: navigator.userAgent || 'unknown',
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'fr',
    created: localStorage.getItem('gargote_device_created') || new Date().toISOString()
  };
};
