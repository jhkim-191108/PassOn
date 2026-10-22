import Input from '@/components/ui/Input';

import { NAME_MAX_LENGTH } from '../utils/profile';
import '../../../css/ProfileCard.css';

interface Props {
  name: string;
  email: string;
  nameError?: string;
  onNameChange: (value: string) => void;
}

export const AccountInfoCard = ({ name, email, nameError, onNameChange }: Props) => (
  <section className="profile-card">
    <h2 className="profile-card__title">계정 정보</h2>
    <div className="profile-card__fields">
      <Input
        label="이름"
        value={name}
        maxLength={NAME_MAX_LENGTH}
        onChange={(e) => onNameChange(e.target.value)}
        error={nameError}
        autoComplete="name"
      />
      <Input label="이메일" value={email} disabled hint="이메일은 변경할 수 없어요." />
    </div>
  </section>
);
