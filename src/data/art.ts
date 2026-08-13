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
  emoji: string
  caption: string
}

const fallback: ArtSpec = {
  motif: 'wave',
  bg: '#efe4d4',
  accent: '#c45c26',
  emoji: '👋',
  caption: 'Chào hỏi',
}

export const phraseArt: Record<string, ArtSpec> = {
  'greet-1': { motif: 'wave', bg: '#f4d7c3', accent: '#c45c26', emoji: '👋', caption: 'Hai người chào nhau' },
  'greet-2': { motif: 'handshake', bg: '#f3e0c8', accent: '#9a3f16', emoji: '🤝', caption: 'Bắt tay làm quen' },
  'greet-3': { motif: 'nametag', bg: '#efe4cf', accent: '#c45c26', emoji: '📛', caption: 'Tự giới thiệu tên' },
  'greet-4': { motif: 'vietnam', bg: '#f8d9d2', accent: '#c0392b', emoji: '🇻🇳', caption: 'Đến từ Việt Nam' },
  'greet-5': { motif: 'replay', bg: '#e7e0d4', accent: '#5d5348', emoji: '🔁', caption: 'Nhờ nói lại' },
  'greet-6': { motif: 'shy', bg: '#f0ddc8', accent: '#8b5a2b', emoji: '😅', caption: 'Tiếng Anh chưa giỏi' },
  'greet-7': { motif: 'chat', bg: '#eadcc8', accent: '#c45c26', emoji: '💬', caption: 'Kết thúc trò chuyện' },
  'greet-8': { motif: 'later', bg: '#f2d8c0', accent: '#9a3f16', emoji: '👋', caption: 'Tạm biệt, hẹn gặp lại' },
  'cafe-1': { motif: 'menu', bg: '#efe0cc', accent: '#8b5a2b', emoji: '📋', caption: 'Xem thực đơn' },
  'cafe-2': { motif: 'latte', bg: '#f3d9c4', accent: '#8b5a2b', emoji: '☕', caption: 'Gọi latte đá' },
  'cafe-3': { motif: 'takeaway', bg: '#edd6c0', accent: '#6b3f22', emoji: '🥤', caption: 'Mang đi' },
  'cafe-4': { motif: 'sweet', bg: '#f7e0d4', accent: '#c45c26', emoji: '🍬', caption: 'Đồ uống có ngọt không?' },
  'cafe-5': { motif: 'sugar', bg: '#f4ead8', accent: '#8b5a2b', emoji: '🧂', caption: 'Xin ít đường' },
  'cafe-6': { motif: 'oat', bg: '#efe4c8', accent: '#7a5a28', emoji: '🌾', caption: 'Hỏi sữa yến mạch' },
  'cafe-7': { motif: 'price', bg: '#f0e2c6', accent: '#9a3f16', emoji: '💰', caption: 'Hỏi giá' },
  'cafe-8': { motif: 'paycard', bg: '#e8ddd0', accent: '#3f4f6a', emoji: '💳', caption: 'Trả bằng thẻ' },
  'rest-1': { motif: 'table', bg: '#f3ddd0', accent: '#9a3f16', emoji: '🍽️', caption: 'Đặt bàn hai người' },
  'rest-2': { motif: 'chef', bg: '#f6e6d4', accent: '#c45c26', emoji: '👨‍🍳', caption: 'Hỏi món nên gọi' },
  'rest-3': { motif: 'allergy', bg: '#f8e4d6', accent: '#a33b2b', emoji: '🥜', caption: 'Dị ứng đậu phộng' },
  'rest-4': { motif: 'chicken', bg: '#f3dcc8', accent: '#9a3f16', emoji: '🍗', caption: 'Gọi gà nướng' },
  'rest-5': { motif: 'water', bg: '#dce8ea', accent: '#2b6cb0', emoji: '💧', caption: 'Xin thêm nước' },
  'rest-6': { motif: 'wrongdish', bg: '#f6ddd4', accent: '#9b2c2c', emoji: '🚫', caption: 'Món bị gọi nhầm' },
  'rest-7': { motif: 'bill', bg: '#eee4d4', accent: '#5d5348', emoji: '🧾', caption: 'Xin hóa đơn' },
  'rest-8': { motif: 'split', bg: '#efe0d0', accent: '#9a3f16', emoji: '✂️', caption: 'Chia hóa đơn' },
  'shop-1': { motif: 'browse', bg: '#f4e6d6', accent: '#b4532a', emoji: '👀', caption: 'Chỉ xem, chưa mua' },
  'shop-2': { motif: 'size', bg: '#f0ddd0', accent: '#b4532a', emoji: '👕', caption: 'Hỏi size nhỏ hơn' },
  'shop-3': { motif: 'fitting', bg: '#f6e2d4', accent: '#c45c26', emoji: '🚪', caption: 'Xin thử đồ' },
  'shop-4': { motif: 'cost', bg: '#efe4cc', accent: '#9a3f16', emoji: '🏷️', caption: 'Hỏi giá sản phẩm' },
  'shop-5': { motif: 'sale', bg: '#f8e0d2', accent: '#c0392b', emoji: '🏷️', caption: 'Hỏi giảm giá' },
  'shop-6': { motif: 'take', bg: '#f2ddc8', accent: '#b4532a', emoji: '🛍️', caption: 'Quyết định mua' },
  'shop-7': { motif: 'returns', bg: '#eadfd2', accent: '#5d5348', emoji: '↩️', caption: 'Hỏi đổi trả' },
  'shop-8': { motif: 'bag', bg: '#f3e2d0', accent: '#b4532a', emoji: '👜', caption: 'Xin túi' },
  'dir-1': { motif: 'station', bg: '#dce8df', accent: '#3d6b4f', emoji: '🚉', caption: 'Hỏi nhà ga gần nhất' },
  'dir-2': { motif: 'museum', bg: '#e4e0d6', accent: '#3f4f6a', emoji: '🏛️', caption: 'Hỏi đường tới bảo tàng' },
  'dir-3': { motif: 'walk', bg: '#e6eedc', accent: '#3d6b4f', emoji: '🚶', caption: 'Đi bộ tới được không' },
  'dir-4': { motif: 'turn', bg: '#e3eadc', accent: '#2f5d50', emoji: '⬅️', caption: 'Đi thẳng, rẽ trái' },
  'dir-5': { motif: 'timer', bg: '#e8e4d6', accent: '#8b5a2b', emoji: '⏱️', caption: 'Mất bao lâu' },
  'dir-6': { motif: 'bus', bg: '#dce8e4', accent: '#2f5d50', emoji: '🚌', caption: 'Bắt xe buýt nào' },
  'dir-7': { motif: 'lost', bg: '#efe4d4', accent: '#9a3f16', emoji: '🧭', caption: 'Bị lạc đường' },
  'dir-8': { motif: 'map', bg: '#e4ecd8', accent: '#3d6b4f', emoji: '🗺️', caption: 'Chỉ giúp trên bản đồ' },
  'hotel-1': { motif: 'checkin', bg: '#e4e8e2', accent: '#2f5d50', emoji: '🏨', caption: 'Check-in khách sạn' },
  'hotel-2': { motif: 'clock', bg: '#e8e4d8', accent: '#2f5d50', emoji: '🕒', caption: 'Giờ nhận / trả phòng' },
  'hotel-3': { motif: 'breakfast', bg: '#f4e6d2', accent: '#c45c26', emoji: '🥐', caption: 'Hỏi bữa sáng' },
  'hotel-4': { motif: 'wifi', bg: '#dce6ea', accent: '#2b6cb0', emoji: '📶', caption: 'Hỏi mật khẩu Wi-Fi' },
  'hotel-5': { motif: 'towel', bg: '#e8eef0', accent: '#2f5d50', emoji: '🧺', caption: 'Xin thêm khăn' },
  'hotel-6': { motif: 'ac', bg: '#dce8ee', accent: '#1f4e79', emoji: '❄️', caption: 'Máy lạnh hỏng' },
  'hotel-7': { motif: 'luggage', bg: '#e8e0d4', accent: '#8b5a2b', emoji: '🧳', caption: 'Gửi hành lý' },
  'hotel-8': { motif: 'wakeup', bg: '#efe4d4', accent: '#9a3f16', emoji: '⏰', caption: 'Nhờ đánh thức 6 giờ' },
  'health-1': { motif: 'unwell', bg: '#f3e0d8', accent: '#a33b2b', emoji: '🤒', caption: 'Cảm thấy không khỏe' },
  'health-2': { motif: 'fever', bg: '#f6ddd6', accent: '#a33b2b', emoji: '🌡️', caption: 'Đau đầu và sốt' },
  'health-3': { motif: 'twodays', bg: '#f0e4d8', accent: '#9a3f16', emoji: '📅', caption: 'Đã được hai ngày' },
  'health-4': { motif: 'doctor', bg: '#e4ece8', accent: '#2f5d50', emoji: '🩺', caption: 'Cần gặp bác sĩ' },
  'health-5': { motif: 'rx', bg: '#e8e6dc', accent: '#a33b2b', emoji: '📄', caption: 'Thuốc có cần đơn không' },
  'health-6': { motif: 'pills', bg: '#ece6dc', accent: '#2f5d50', emoji: '💊', caption: 'Uống thuốc lúc nào' },
  'health-7': { motif: 'insurance', bg: '#e4e8e2', accent: '#3f4f6a', emoji: '🛡️', caption: 'Có bảo hiểm y tế' },
  'health-8': { motif: 'appoint', bg: '#eae4d8', accent: '#a33b2b', emoji: '📆', caption: 'Đặt lịch ngày mai' },
  'work-1': { motif: 'meeting', bg: '#e4e6ea', accent: '#3f4f6a', emoji: '👥', caption: 'Xin xếp cuộc họp' },
  'work-2': { motif: 'email', bg: '#e6e8ee', accent: '#2b6cb0', emoji: '📧', caption: 'Gửi email xác nhận' },
  'work-3': { motif: 'late', bg: '#f0e4d6', accent: '#c45c26', emoji: '🏃', caption: 'Báo đến muộn' },
  'work-4': { motif: 'slow', bg: '#e8e4dc', accent: '#3f4f6a', emoji: '🐢', caption: 'Nhờ nói chậm hơn' },
  'work-5': { motif: 'check', bg: '#e6eadc', accent: '#2f5d50', emoji: '🔎', caption: 'Để tôi kiểm tra đã' },
  'work-6': { motif: 'deadline', bg: '#f3e0d4', accent: '#9b2c2c', emoji: '📌', caption: 'Hạn chót thứ Sáu' },
  'work-7': { motif: 'dayoff', bg: '#e8eedc', accent: '#3d6b4f', emoji: '🌴', caption: 'Xin nghỉ ngày mai' },
  'work-8': { motif: 'thanks', bg: '#f4e6d4', accent: '#c45c26', emoji: '🙏', caption: 'Cảm ơn đã giúp' },
  'fam-1': { motif: 'sister', bg: '#f0e0ea', accent: '#7a4b8a', emoji: '👩', caption: 'Giới thiệu chị gái' },
  'fam-2': { motif: 'home', bg: '#efe6d6', accent: '#8b5a2b', emoji: '🏠', caption: 'Sống cùng bố mẹ' },
  'fam-3': { motif: 'weekend', bg: '#e8eedc', accent: '#3d6b4f', emoji: '🗓️', caption: 'Hỏi kế hoạch cuối tuần' },
  'fam-4': { motif: 'dinner', bg: '#f4e2d2', accent: '#c45c26', emoji: '🍜', caption: 'Mời ăn tối' },
  'fam-5': { motif: 'miss', bg: '#f3dde6', accent: '#7a4b8a', emoji: '💗', caption: 'Nhớ bạn, hẹn gặp' },
  'fam-6': { motif: 'gift', bg: '#f6e4d4', accent: '#c45c26', emoji: '🎉', caption: 'Chúc mừng tin vui' },
  'fam-7': { motif: 'plusfriend', bg: '#ece4dc', accent: '#7a4b8a', emoji: '➕', caption: 'Xin dẫn thêm bạn' },
  'fam-8': { motif: 'regards', bg: '#efe6da', accent: '#7a4b8a', emoji: '💌', caption: 'Gửi lời hỏi thăm' },
  'phone-1': { motif: 'callme', bg: '#dce6f0', accent: '#2b6cb0', emoji: '📞', caption: 'Alo, tôi là Minh' },
  'phone-2': { motif: 'ask', bg: '#e2e8f0', accent: '#2b6cb0', emoji: '👩‍💼', caption: 'Xin gặp Anna' },
  'phone-3': { motif: 'signal', bg: '#e6e4dc', accent: '#5d5348', emoji: '📶', caption: 'Sóng kém, nghe rõ không' },
  'phone-4': { motif: 'callback', bg: '#dce8ee', accent: '#1f4e79', emoji: '🔄', caption: 'Năm phút nữa gọi lại' },
  'phone-5': { motif: 'voicemail', bg: '#e4e8ee', accent: '#2b6cb0', emoji: '💬', caption: 'Để lại lời nhắn' },
  'phone-6': { motif: 'wrongnum', bg: '#f0e0dc', accent: '#9b2c2c', emoji: '❌', caption: 'Gọi nhầm số' },
  'phone-7': { motif: 'textpin', bg: '#e0eadc', accent: '#2f5d50', emoji: '📍', caption: 'Nhắn địa chỉ giúp' },
  'phone-8': { motif: 'busy', bg: '#e6e6ea', accent: '#3f4f6a', emoji: '🤫', caption: 'Đang họp, lát nhắn lại' },
  'air-1': { motif: 'airline', bg: '#dce6f0', accent: '#1f4e79', emoji: '✈️', caption: 'Hỏi quầy check-in' },
  'air-2': { motif: 'window', bg: '#d8e6f2', accent: '#2b6cb0', emoji: '🪟', caption: 'Xin ghế cửa sổ' },
  'air-3': { motif: 'scale', bg: '#e4e6ea', accent: '#3f4f6a', emoji: '⚖️', caption: 'Hỏi giới hạn cân nặng' },
  'air-4': { motif: 'gate', bg: '#dce8ee', accent: '#1f4e79', emoji: '🚪', caption: 'Hỏi cổng lên máy bay' },
  'air-5': { motif: 'delay', bg: '#f0e4d6', accent: '#c45c26', emoji: '⏳', caption: 'Hỏi chuyến bay có trễ' },
  'air-6': { motif: 'boarding', bg: '#e8e0d6', accent: '#9b2c2c', emoji: '🎫', caption: 'Mất thẻ lên máy bay' },
  'air-7': { motif: 'plug', bg: '#e4eadc', accent: '#2f5d50', emoji: '🔌', caption: 'Hỏi ổ sạc' },
  'air-8': { motif: 'carousel', bg: '#e2e6ea', accent: '#1f4e79', emoji: '🛄', caption: 'Nhận hành lý ở đâu' },
  'emg-1': { motif: 'police', bg: '#f3ddd8', accent: '#9b2c2c', emoji: '🚓', caption: 'Gọi cảnh sát' },
  'emg-2': { motif: 'ambulance', bg: '#f6dcd8', accent: '#9b2c2c', emoji: '🚑', caption: 'Cần xe cấp cứu' },
  'emg-3': { motif: 'stolen', bg: '#efe0d6', accent: '#9a3f16', emoji: '👜', caption: 'Bị mất trộm túi' },
  'emg-4': { motif: 'passport', bg: '#e4e6ea', accent: '#1f4e79', emoji: '📘', caption: 'Mất hộ chiếu' },
  'emg-5': { motif: 'hospital', bg: '#e8ece8', accent: '#a33b2b', emoji: '🏥', caption: 'Hỏi bệnh viện gần nhất' },
  'emg-6': { motif: 'tourist', bg: '#efe6d6', accent: '#c45c26', emoji: '🧳', caption: 'Khách, tiếng Anh ít' },
  'emg-7': { motif: 'borrow', bg: '#e4e8ee', accent: '#2b6cb0', emoji: '📱', caption: 'Xin mượn điện thoại' },
  'emg-8': { motif: 'embassy', bg: '#e6e4dc', accent: '#3f4f6a', emoji: '🏛️', caption: 'Liên hệ đại sứ quán' },
}

export function artFor(phraseId: string): ArtSpec {
  return phraseArt[phraseId] ?? fallback
}
