// 매장 설정. 데이터는 useStoreSettings가 맡고, 이 파일은 카드만 조립한다.
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { selectStore } from "@/features/stores/currentStore";
import { PATHS } from "@/routes/paths";
import {
    AccountCard,
    DangerZone,
    MyStores,
    NotificationSettingsCard,
    StoreInfoCard,
    StoreSettingsHeader,
    useStoreSettings,
} from "@/features/stores";
import "../../css/storeSettings.css";

function StoreSettingsPage() {
    const navigate = useNavigate();
    const {
        current,
        stores,
        user,
        isOwner,
        accountName,
        setAccountName,
        storeName,
        setStoreName,
        settings,
        loading,
        message,
        pending,
        deleteOpen,
        setDeleteOpen,
        saveStoreName,
        saveAccountName,
        toggleSetting,
        confirmDelete,
    } = useStoreSettings();

    if (loading) {
        return <p className="store-settings__status">불러오는 중</p>;
    }

    if (!current || !user) {
        return <p className="store-settings__status">{message || "매장 설정을 불러오지 못했습니다."}</p>;
    }

    return (
        <section className="store-settings">
            <StoreSettingsHeader storeName={current.name} />
            {message && <p className="store-settings__status">{message}</p>}

            <div className="store-settings__grid">
                {isOwner && (
                    <StoreInfoCard
                        store={current}
                        storeName={storeName}
                        onStoreName={setStoreName}
                        onSave={saveStoreName}
                    />
                )}
                <AccountCard
                    user={user}
                    store={current}
                    accountName={accountName}
                    onAccountName={setAccountName}
                    onSave={saveAccountName}
                />
                <MyStores
                    stores={stores}
                    currentId={current.id}
                    wide={!isOwner}
                    onCreate={() => navigate(PATHS.STORE_SETUP, { state: { step: "create" } })}
                    onJoin={() => navigate(PATHS.STORE_SETUP, { state: { step: "join" } })}
                    onSelect={selectStore}
                />
                <NotificationSettingsCard
                    settings={settings}
                    pending={pending}
                    owner={isOwner}
                    onToggle={(key) => void toggleSetting(key)}
                />
                {isOwner && <DangerZone pending={pending} onDelete={() => setDeleteOpen(true)} />}
            </div>

            <ConfirmDialog
                open={deleteOpen}
                title="매장 폐쇄"
                description={`${current.name} 매장을 폐쇄합니다. 이 작업은 되돌릴 수 없습니다.`}
                confirmText={pending ? "폐쇄 중" : "폐쇄"}
                cancelText="취소"
                variant="danger"
                onConfirm={() => void confirmDelete()}
                onClose={() => {
                    if (pending) return;
                    setDeleteOpen(false);
                }}
            />
        </section>
    );
}

export default StoreSettingsPage;
