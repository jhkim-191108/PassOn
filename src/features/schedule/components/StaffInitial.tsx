import '../../../css/ScheduleCommon.css';

interface Props {
  name: string;
  isMe?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

// 근무표 전용 이니셜 원 — "나"를 초록으로 강조해야 해서 공용 Avatar 대신 사용
// TODO: 공용 Avatar에 강조(variant) 옵션이 생기면 교체 검토
export const StaffInitial = ({ name, isMe = false, size = 'sm', className = '' }: Props) => (
  <span
    className={`staff-initial staff-initial--${size}${isMe ? ' staff-initial--me' : ''} ${className}`.trim()}
    title={name}
    aria-hidden="true"
  >
    {name[0]}
  </span>
);
