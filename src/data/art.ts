export type MotifId =
  | 'wave'
  | 'handshake'
  | 'nametag'
  | 'vietnam'
  | 'replay'
  | 'shy'
  | 'chat'
  | 'later'
  | 'menu'
  | 'latte'
  | 'takeaway'
  | 'sweet'
  | 'sugar'
  | 'oat'
  | 'price'
  | 'paycard'
  | 'table'
  | 'chef'
  | 'allergy'
  | 'chicken'
  | 'water'
  | 'wrongdish'
  | 'bill'
  | 'split'
  | 'browse'
  | 'size'
  | 'fitting'
  | 'cost'
  | 'sale'
  | 'take'
  | 'returns'
  | 'bag'
  | 'station'
  | 'museum'
  | 'walk'
  | 'turn'
  | 'timer'
  | 'bus'
  | 'lost'
  | 'map'
  | 'checkin'
  | 'clock'
  | 'breakfast'
  | 'wifi'
  | 'towel'
  | 'ac'
  | 'luggage'
  | 'wakeup'
  | 'unwell'
  | 'fever'
  | 'twodays'
  | 'doctor'
  | 'rx'
  | 'pills'
  | 'insurance'
  | 'appoint'
  | 'meeting'
  | 'email'
  | 'late'
  | 'slow'
  | 'check'
  | 'deadline'
  | 'dayoff'
  | 'thanks'
  | 'sister'
  | 'home'
  | 'weekend'
  | 'dinner'
  | 'miss'
  | 'gift'
  | 'plusfriend'
  | 'regards'
  | 'callme'
  | 'ask'
  | 'signal'
  | 'callback'
  | 'voicemail'
  | 'wrongnum'
  | 'textpin'
  | 'busy'
  | 'airline'
  | 'window'
  | 'scale'
  | 'gate'
  | 'delay'
  | 'boarding'
  | 'plug'
  | 'carousel'
  | 'police'
  | 'ambulance'
  | 'stolen'
  | 'passport'
  | 'hospital'
  | 'tourist'
  | 'borrow'
  | 'embassy'

export type ArtSpec = {
  motif: MotifId
  bg: string
  accent: string
}

export const phraseArt: Record<string, ArtSpec> = {
  'greet-1': { motif: 'wave', bg: '#f4d7c3', accent: '#c45c26' },
  'greet-2': { motif: 'handshake', bg: '#f3e0c8', accent: '#9a3f16' },
  'greet-3': { motif: 'nametag', bg: '#efe4cf', accent: '#c45c26' },
  'greet-4': { motif: 'vietnam', bg: '#f8d9d2', accent: '#c0392b' },
  'greet-5': { motif: 'replay', bg: '#e7e0d4', accent: '#5d5348' },
  'greet-6': { motif: 'shy', bg: '#f0ddc8', accent: '#8b5a2b' },
  'greet-7': { motif: 'chat', bg: '#eadcc8', accent: '#c45c26' },
  'greet-8': { motif: 'later', bg: '#f2d8c0', accent: '#9a3f16' },
  'cafe-1': { motif: 'menu', bg: '#efe0cc', accent: '#8b5a2b' },
  'cafe-2': { motif: 'latte', bg: '#f3d9c4', accent: '#8b5a2b' },
  'cafe-3': { motif: 'takeaway', bg: '#edd6c0', accent: '#6b3f22' },
  'cafe-4': { motif: 'sweet', bg: '#f7e0d4', accent: '#c45c26' },
  'cafe-5': { motif: 'sugar', bg: '#f4ead8', accent: '#8b5a2b' },
  'cafe-6': { motif: 'oat', bg: '#efe4c8', accent: '#7a5a28' },
  'cafe-7': { motif: 'price', bg: '#f0e2c6', accent: '#9a3f16' },
  'cafe-8': { motif: 'paycard', bg: '#e8ddd0', accent: '#3f4f6a' },
  'rest-1': { motif: 'table', bg: '#f3ddd0', accent: '#9a3f16' },
  'rest-2': { motif: 'chef', bg: '#f6e6d4', accent: '#c45c26' },
  'rest-3': { motif: 'allergy', bg: '#f8e4d6', accent: '#a33b2b' },
  'rest-4': { motif: 'chicken', bg: '#f3dcc8', accent: '#9a3f16' },
  'rest-5': { motif: 'water', bg: '#dce8ea', accent: '#2b6cb0' },
  'rest-6': { motif: 'wrongdish', bg: '#f6ddd4', accent: '#9b2c2c' },
  'rest-7': { motif: 'bill', bg: '#eee4d4', accent: '#5d5348' },
  'rest-8': { motif: 'split', bg: '#efe0d0', accent: '#9a3f16' },
  'shop-1': { motif: 'browse', bg: '#f4e6d6', accent: '#b4532a' },
  'shop-2': { motif: 'size', bg: '#f0ddd0', accent: '#b4532a' },
  'shop-3': { motif: 'fitting', bg: '#f6e2d4', accent: '#c45c26' },
  'shop-4': { motif: 'cost', bg: '#efe4cc', accent: '#9a3f16' },
  'shop-5': { motif: 'sale', bg: '#f8e0d2', accent: '#c0392b' },
  'shop-6': { motif: 'take', bg: '#f2ddc8', accent: '#b4532a' },
  'shop-7': { motif: 'returns', bg: '#eadfd2', accent: '#5d5348' },
  'shop-8': { motif: 'bag', bg: '#f3e2d0', accent: '#b4532a' },
  'dir-1': { motif: 'station', bg: '#dce8df', accent: '#3d6b4f' },
  'dir-2': { motif: 'museum', bg: '#e4e0d6', accent: '#3f4f6a' },
  'dir-3': { motif: 'walk', bg: '#e6eedc', accent: '#3d6b4f' },
  'dir-4': { motif: 'turn', bg: '#e3eadc', accent: '#2f5d50' },
  'dir-5': { motif: 'timer', bg: '#e8e4d6', accent: '#8b5a2b' },
  'dir-6': { motif: 'bus', bg: '#dce8e4', accent: '#2f5d50' },
  'dir-7': { motif: 'lost', bg: '#efe4d4', accent: '#9a3f16' },
  'dir-8': { motif: 'map', bg: '#e4ecd8', accent: '#3d6b4f' },
  'hotel-1': { motif: 'checkin', bg: '#e4e8e2', accent: '#2f5d50' },
  'hotel-2': { motif: 'clock', bg: '#e8e4d8', accent: '#2f5d50' },
  'hotel-3': { motif: 'breakfast', bg: '#f4e6d2', accent: '#c45c26' },
  'hotel-4': { motif: 'wifi', bg: '#dce6ea', accent: '#2b6cb0' },
  'hotel-5': { motif: 'towel', bg: '#e8eef0', accent: '#2f5d50' },
  'hotel-6': { motif: 'ac', bg: '#dce8ee', accent: '#1f4e79' },
  'hotel-7': { motif: 'luggage', bg: '#e8e0d4', accent: '#8b5a2b' },
  'hotel-8': { motif: 'wakeup', bg: '#efe4d4', accent: '#9a3f16' },
  'health-1': { motif: 'unwell', bg: '#f3e0d8', accent: '#a33b2b' },
  'health-2': { motif: 'fever', bg: '#f6ddd6', accent: '#a33b2b' },
  'health-3': { motif: 'twodays', bg: '#f0e4d8', accent: '#9a3f16' },
  'health-4': { motif: 'doctor', bg: '#e4ece8', accent: '#2f5d50' },
  'health-5': { motif: 'rx', bg: '#e8e6dc', accent: '#a33b2b' },
  'health-6': { motif: 'pills', bg: '#ece6dc', accent: '#2f5d50' },
  'health-7': { motif: 'insurance', bg: '#e4e8e2', accent: '#3f4f6a' },
  'health-8': { motif: 'appoint', bg: '#eae4d8', accent: '#a33b2b' },
  'work-1': { motif: 'meeting', bg: '#e4e6ea', accent: '#3f4f6a' },
  'work-2': { motif: 'email', bg: '#e6e8ee', accent: '#2b6cb0' },
  'work-3': { motif: 'late', bg: '#f0e4d6', accent: '#c45c26' },
  'work-4': { motif: 'slow', bg: '#e8e4dc', accent: '#3f4f6a' },
  'work-5': { motif: 'check', bg: '#e6eadc', accent: '#2f5d50' },
  'work-6': { motif: 'deadline', bg: '#f3e0d4', accent: '#9b2c2c' },
  'work-7': { motif: 'dayoff', bg: '#e8eedc', accent: '#3d6b4f' },
  'work-8': { motif: 'thanks', bg: '#f4e6d4', accent: '#c45c26' },
  'fam-1': { motif: 'sister', bg: '#f0e0ea', accent: '#7a4b8a' },
  'fam-2': { motif: 'home', bg: '#efe6d6', accent: '#8b5a2b' },
  'fam-3': { motif: 'weekend', bg: '#e8eedc', accent: '#3d6b4f' },
  'fam-4': { motif: 'dinner', bg: '#f4e2d2', accent: '#c45c26' },
  'fam-5': { motif: 'miss', bg: '#f3dde6', accent: '#7a4b8a' },
  'fam-6': { motif: 'gift', bg: '#f6e4d4', accent: '#c45c26' },
  'fam-7': { motif: 'plusfriend', bg: '#ece4dc', accent: '#7a4b8a' },
  'fam-8': { motif: 'regards', bg: '#efe6da', accent: '#7a4b8a' },
  'phone-1': { motif: 'callme', bg: '#dce6f0', accent: '#2b6cb0' },
  'phone-2': { motif: 'ask', bg: '#e2e8f0', accent: '#2b6cb0' },
  'phone-3': { motif: 'signal', bg: '#e6e4dc', accent: '#5d5348' },
  'phone-4': { motif: 'callback', bg: '#dce8ee', accent: '#1f4e79' },
  'phone-5': { motif: 'voicemail', bg: '#e4e8ee', accent: '#2b6cb0' },
  'phone-6': { motif: 'wrongnum', bg: '#f0e0dc', accent: '#9b2c2c' },
  'phone-7': { motif: 'textpin', bg: '#e0eadc', accent: '#2f5d50' },
  'phone-8': { motif: 'busy', bg: '#e6e6ea', accent: '#3f4f6a' },
  'air-1': { motif: 'airline', bg: '#dce6f0', accent: '#1f4e79' },
  'air-2': { motif: 'window', bg: '#d8e6f2', accent: '#2b6cb0' },
  'air-3': { motif: 'scale', bg: '#e4e6ea', accent: '#3f4f6a' },
  'air-4': { motif: 'gate', bg: '#dce8ee', accent: '#1f4e79' },
  'air-5': { motif: 'delay', bg: '#f0e4d6', accent: '#c45c26' },
  'air-6': { motif: 'boarding', bg: '#e8e0d6', accent: '#9b2c2c' },
  'air-7': { motif: 'plug', bg: '#e4eadc', accent: '#2f5d50' },
  'air-8': { motif: 'carousel', bg: '#e2e6ea', accent: '#1f4e79' },
  'emg-1': { motif: 'police', bg: '#f3ddd8', accent: '#9b2c2c' },
  'emg-2': { motif: 'ambulance', bg: '#f6dcd8', accent: '#9b2c2c' },
  'emg-3': { motif: 'stolen', bg: '#efe0d6', accent: '#9a3f16' },
  'emg-4': { motif: 'passport', bg: '#e4e6ea', accent: '#1f4e79' },
  'emg-5': { motif: 'hospital', bg: '#e8ece8', accent: '#a33b2b' },
  'emg-6': { motif: 'tourist', bg: '#efe6d6', accent: '#c45c26' },
  'emg-7': { motif: 'borrow', bg: '#e4e8ee', accent: '#2b6cb0' },
  'emg-8': { motif: 'embassy', bg: '#e6e4dc', accent: '#3f4f6a' },
}

export function artFor(phraseId: string): ArtSpec {
  return phraseArt[phraseId] ?? { motif: 'wave', bg: '#efe4d4', accent: '#c45c26' }
}
