import type { StaffMember, StoreTeam } from '../types';

// Figma data.ts의 STAFF_LIST · TEAMS (임시 데모 데이터)
// TODO: 직원 관리 담당의 직원/근무조 API가 생기면 교체

export const MOCK_TEAMS: StoreTeam[] = [
  { id: 'team_hall', storeId: 'store1', name: '홀팀', color: 'rose', createdAt: '2025-03-15' },
  { id: 'team_kitchen', storeId: 'store1', name: '주방팀', color: 'orange', createdAt: '2025-03-15' },
  { id: 'team_morning', storeId: 'store1', name: '오전팀', color: 'sky', createdAt: '2025-04-01' },
  { id: 'team_closing', storeId: 'store1', name: '마감팀', color: 'violet', createdAt: '2025-04-01' },
];

export const MOCK_STAFF: StaffMember[] = [
  { id: 'u1', name: '김민지', email: 'minji@morning.kr', role: 'owner', shifts: ['풀타임'], teamId: null, teamName: null, isActive: true, joinedAt: '2025-03-15', departedAt: null },
  { id: 'u2', name: '박준호', email: 'junho@morning.kr', role: 'manager', shifts: ['오전', '오후'], teamId: null, teamName: null, isActive: true, joinedAt: '2025-04-01', departedAt: null },
  { id: 'u3', name: '이지연', email: 'jiyeon@morning.kr', role: 'staff', shifts: ['오전'], teamId: 'team_morning', teamName: '오전팀', isActive: true, joinedAt: '2025-05-10', departedAt: null },
  { id: 'u4', name: '최서준', email: 'seojun@morning.kr', role: 'staff', shifts: ['마감'], teamId: 'team_closing', teamName: '마감팀', isActive: true, joinedAt: '2025-07-20', departedAt: null },
  { id: 'u5', name: '정하늘', email: 'haneul@morning.kr', role: 'staff', shifts: ['오후', '마감'], teamId: 'team_hall', teamName: '홀팀', isActive: true, joinedAt: '2025-09-01', departedAt: null },
  { id: 'u6', name: '오유진', email: 'yujin@morning.kr', role: 'staff', shifts: ['오전', '오후'], teamId: null, teamName: null, isActive: false, joinedAt: '2025-06-01', departedAt: '2026-08-31' },
];
