const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PHOTO_LIMIT = 5 * 1024 * 1024;

/** 올릴 수 없는 사진이면 안내 문구, 괜찮으면 null */
export const validatePhoto = (file: File): string | null => {
  if (!PHOTO_TYPES.includes(file.type)) return 'jpeg, png, webp, gif 이미지만 올릴 수 있습니다.';
  if (file.size > PHOTO_LIMIT) return '사진은 5MB 이하만 올릴 수 있습니다.';
  return null;
};
