interface StoreSettingsHeaderProps {
    storeName: string;
}

function StoreSettingsHeader({ storeName }: StoreSettingsHeaderProps) {
    return (
        <header className="store-settings__header">
            <h1>매장 설정</h1>
            <p>{storeName}</p>
        </header>
    );
}

export default StoreSettingsHeader;
