import iconEye from '@/assets/Icon-eye.png';
import { useState, type InputHTMLAttributes } from 'react';

import Input from '@/components/ui/Input';

import '../../../css/authInput.css';
import '../../../css/PasswordInput.css'

// 로그인 · 회원가입에서 같이 쓰는 비밀번호 입력 (보기/숨기기 토글 포함)
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** 보기 상태를 바깥에서 제어할 때 사용 (예: 비밀번호 확인 칸과 함께 토글) */
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
};

function PasswordInput({
  className = '',
  visible: controlledVisible,
  onVisibleChange,
  ...inputProps
}: Props) {
  const [innerVisible, setInnerVisible] = useState(false);
  const visible = controlledVisible ?? innerVisible;

  const toggle = () => {
    const next = !visible;
    if (controlledVisible === undefined) setInnerVisible(next);
    onVisibleChange?.(next);
  };

  return (
    <div className="password-input">
      <Input
        {...inputProps}
        type={visible ? 'text' : 'password'}
        className={`auth-input password-input__field ${className}`.trim()}
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={toggle}
        aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
        aria-pressed={visible}
      >
        <img src={iconEye} alt="" width={16} height={16} />
      </button>
    </div>
  );
}

export default PasswordInput;
