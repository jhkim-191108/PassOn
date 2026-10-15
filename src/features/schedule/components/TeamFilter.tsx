import type { StoreTeam } from '../types';
import '../../../css/TeamFilter.css';

interface Props {
  teams: StoreTeam[];
  /** null = 전체 */
  selectedTeamId: string | null;
  onChange: (teamId: string | null) => void;
}

// 근무조 필터 (Figma에는 없는 추가 기능 — 근무조별로 달력을 걸러봄)
export const TeamFilter = ({ teams, selectedTeamId, onChange }: Props) => {
  if (teams.length === 0) return null;

  const options: { id: string | null; name: string }[] = [{ id: null, name: '전체' }, ...teams];

  return (
    <div className="team-filter" role="group" aria-label="근무조 필터">
      <span className="team-filter__label">근무조</span>
      <div className="team-filter__chips">
        {options.map((team) => {
          const selected = team.id === selectedTeamId;
          return (
            <button
              key={team.id ?? 'all'}
              type="button"
              className={`team-filter__chip${selected ? ' team-filter__chip--selected' : ''}`}
              aria-pressed={selected}
              onClick={() => onChange(team.id)}
            >
              {team.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
