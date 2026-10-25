import iconCamera from '@/assets/Icon-camera.png';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { validatePhoto } from '../utils/profile';
import '../../../css/ProfileAvatar.css';

interface Props {
  name: string;
  onUpload: (file: File) => Promise<void>;
}

// 프로필 사진 (원을 누르면 사진 선택 → 바로 업로드)
//       client.ts에 토큰 꺼내는 함수나 blob 응답 옵션이 생기면 처음 화면에도 사진 표시
export const ProfileAvatar = ({ name, onUpload }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 미리보기 주소 정리
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 파일을 다시 골라도 동작하도록
    if (!file) return;

    const message = validatePhoto(file);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
      setPreview(URL.createObjectURL(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : '사진을 올리지 못했어요.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="profile-avatar">
      <button
        type="button"
        className="profile-avatar__circle"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label="프로필 사진 변경"
      >
        {preview ? (
          <img className="profile-avatar__image" src={preview} alt="" />
        ) : (
          <span className="profile-avatar__initial">{name.slice(0, 1)}</span>
        )}
        <span className="profile-avatar__camera" aria-hidden="true">
          <img src={iconCamera} alt="" width={16} height={16} />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="profile-avatar__input"
        onChange={handleChange}
      />
      <p className={`profile-avatar__hint${error ? ' profile-avatar__hint--error' : ''}`} role={error ? 'alert' : undefined}>
        {isUploading ? '사진을 올리는 중이에요…' : (error ?? '프로필 사진을 클릭해서 변경하세요')}
      </p>
    </div>
  );
};
