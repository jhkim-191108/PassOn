import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/api/client";
import { logout } from "@/api/auth";
import { changePassword, loadMyPhoto, updateMe, uploadMyPhoto } from "@/api/users";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";
import { selectStore } from "@/features/stores/currentStore";
import { ROLE_BADGE } from "@/features/stores/labels";
import { useAppSession } from "@/layouts/appSession";
import { PATHS } from "@/routes/paths";
import iconBack from "@/assets/Icon-back.png";
import iconCamera from "@/assets/Icon-camera.png";
import "@/css/mypage.css";

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PHOTO_LIMIT = 5 * 1024 * 1024;
const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\s])\S{8,72}$/;

function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, stores, currentStore, replaceUser } = useAppSession();
    const fileRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState(user.name);
    const [currentPassword, setCurrentPassword] = useState("");
    const [nextPassword, setNextPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [saved, setSaved] = useState(false);
    const [pending, setPending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoutConfirm, setLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        setName(user.name);
    }, [user.name]);

    useEffect(() => {
        if (user.photo === false) {
            setPhotoUrl((current) => {
                if (current) URL.revokeObjectURL(current);
                return null;
            });
            return;
        }

        let cancelled = false;
        let created: string | null = null;

        async function load() {
            try {
                const blob = await loadMyPhoto();
                if (cancelled || !blob) return;
                created = URL.createObjectURL(blob);
                setPhotoUrl((current) => {
                    if (current && current !== created) URL.revokeObjectURL(current);
                    return created;
                });
            } catch {
                if (!cancelled) setPhotoUrl(null);
            }
        }

        void load();
        return () => {
            cancelled = true;
            if (created) URL.revokeObjectURL(created);
        };
    }, [user.id, user.photo]);

    function goBack() {
        if (location.key === "default") {
            navigate(PATHS.DASHBOARD);
            return;
        }
        navigate(-1);
    }

    function openPhotoPicker() {
        fileRef.current?.click();
    }

    async function changePhoto(file: File | undefined) {
        if (!file || uploading) return;
        if (!PHOTO_TYPES.includes(file.type)) {
            setSaved(false);
            setMessage("jpeg, png, webp, gif 이미지만 올릴 수 있습니다.");
            return;
        }
        if (file.size > PHOTO_LIMIT) {
            setSaved(false);
            setMessage("사진은 5MB 이하만 올릴 수 있습니다.");
            return;
        }

        setUploading(true);
        setSaved(false);
        setMessage("");
        try {
            const updated = await uploadMyPhoto(file);
            const preview = URL.createObjectURL(file);
            setPhotoUrl((current) => {
                if (current) URL.revokeObjectURL(current);
                return preview;
            });
            replaceUser(updated);
        } catch (error) {
            setMessage(error instanceof ApiError ? error.message : "사진을 바꾸지 못했습니다.");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    }

    async function save(event: FormEvent) {
        event.preventDefault();
        if (pending) return;

        const nextName = name.trim();
        const passwordTouched = currentPassword.length > 0 || nextPassword.length > 0 || confirmPassword.length > 0;
        if (!nextName) {
            setSaved(false);
            setMessage("이름을 입력해 주세요.");
            return;
        }
        if (nextName.length > 40) {
            setSaved(false);
            setMessage("이름은 40자까지 입력할 수 있습니다.");
            return;
        }
        if (passwordTouched) {
            if (!currentPassword || !nextPassword || !confirmPassword) {
                setSaved(false);
                setMessage("비밀번호를 모두 입력해 주세요.");
                return;
            }
            if (nextPassword !== confirmPassword) {
                setSaved(false);
                setMessage("새 비밀번호가 서로 다릅니다.");
                return;
            }
            if (!PASSWORD_RULE.test(nextPassword)) {
                setSaved(false);
                setMessage("비밀번호는 8자 이상이며 영문 대문자, 소문자, 특수문자를 포함해야 합니다.");
                return;
            }
        }
        if (nextName === user.name && !passwordTouched) {
            setSaved(false);
            setMessage("");
            return;
        }

        setPending(true);
        setSaved(false);
        setMessage("");
        try {
            if (nextName !== user.name) {
                replaceUser(await updateMe(nextName));
            }
            if (passwordTouched) {
                await changePassword(currentPassword, nextPassword);
                setCurrentPassword("");
                setNextPassword("");
                setConfirmPassword("");
            }
            setSaved(true);
            setMessage("저장했습니다.");
        } catch (error) {
            setMessage(error instanceof ApiError ? error.message : "저장하지 못했습니다.");
        } finally {
            setPending(false);
        }
    }

    async function confirmLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
        } finally {
            navigate(PATHS.LOGIN, { replace: true });
        }
    }

    const initial = (user.name.trim().charAt(0) || "나");

    return (
        <section className="mypage">
            <header className="mypage__header">
                <button type="button" className="mypage__back" onClick={goBack} aria-label="뒤로">
                    <img src={iconBack} alt="" width={18} height={18} />
                </button>
                <h1>마이페이지</h1>
            </header>

            <div className="mypage__profile">
                <div className="mypage__avatar-wrap">
                    <button type="button" className="mypage__avatar" onClick={openPhotoPicker} disabled={uploading}>
                        {photoUrl ? <img src={photoUrl} alt="" /> : <span>{initial}</span>}
                    </button>
                    <button type="button" className="mypage__camera" onClick={openPhotoPicker} disabled={uploading} aria-label="프로필 사진 변경">
                        <img src={iconCamera} alt="" width={14} height={14} />
                    </button>
                </div>
                <p>프로필 사진을 클릭해서 변경하세요</p>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    onChange={(event) => void changePhoto(event.target.files?.[0])}
                />
            </div>

            <div className="mypage__stores">
                <p className="mypage__label">소속 매장</p>
                {stores.length === 0 ? (
                    <p className="mypage__empty">소속된 매장이 없어요.</p>
                ) : (
                    <ul>
                        {stores.map((store) => {
                            const current = store.id === currentStore?.id;
                            return (
                                <li key={store.id}>
                                    <button
                                        type="button"
                                        className={current ? "mypage__store mypage__store--current" : "mypage__store"}
                                        onClick={() => selectStore(store.id)}
                                    >
                                        <span className="mypage__store-mark">{store.name.trim().charAt(0) || "매"}</span>
                                        <span className="mypage__store-text">
                                            <strong>{store.name}</strong>
                                            <span>{ROLE_BADGE[store.myRole]}</span>
                                        </span>
                                        {current && <span className="mypage__current">현재</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <form className="mypage__form" onSubmit={(event) => void save(event)}>
                <section className="mypage__card">
                    <p className="mypage__label">계정 정보</p>
                    <Input label="이름" value={name} maxLength={40} onChange={(event) => setName(event.target.value)} />
                    <Input label="이메일" value={user.email} disabled hint="이메일은 변경할 수 없어요." />
                </section>

                <section className="mypage__card">
                    <p className="mypage__label">비밀번호 변경</p>
                    <Input
                        label="현재 비밀번호"
                        type="password"
                        autoComplete="current-password"
                        placeholder="현재 비밀번호"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                    />
                    <Input
                        label="새 비밀번호"
                        type="password"
                        autoComplete="new-password"
                        placeholder="8자 이상, 대·소문자, 특수문자"
                        value={nextPassword}
                        onChange={(event) => setNextPassword(event.target.value)}
                    />
                    <Input
                        label="새 비밀번호 확인"
                        type="password"
                        autoComplete="new-password"
                        placeholder="비밀번호 확인"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                </section>

                {message && <p className={saved ? "mypage__status mypage__status--saved" : "mypage__status"}>{message}</p>}

                <button type="submit" className="mypage__save" disabled={pending}>
                    {pending ? "저장 중..." : "저장하기"}
                </button>
            </form>

            <button type="button" className="mypage__logout" onClick={() => setLogoutConfirm(true)}>
                로그아웃
            </button>

            <ConfirmDialog
                open={logoutConfirm}
                title="로그아웃"
                description="로그아웃 하시겠습니까?"
                confirmText={loggingOut ? "로그아웃 중..." : "로그아웃"}
                variant="danger"
                cancelText="취소"
                onClose={() => {
                    if (!loggingOut) setLogoutConfirm(false);
                }}
                onConfirm={() => void confirmLogout()}
            />
        </section>
    );
}

export default MyPage;
