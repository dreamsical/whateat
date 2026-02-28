            {showDuplicateWarning && (
                <div
                    onClick={() => setShowDuplicateWarning(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 2000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px', animation: 'fadeIn 0.2s ease-out',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '20px', padding: '32px 28px',
                            maxWidth: '360px', width: '100%', textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                            animation: 'slideUp 0.3s ease-out',
                        }}
                    >
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❤️</div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#1a1a1a' }}>
                            Already in Favorites!
                        </h3>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px', lineHeight: '1.5' }}>
                            <strong style={{ color: '#FF6B6B' }}>{duplicateName}</strong> at this address is already on your My Favorites list. To add a different location of the same restaurant, search again with the specific address.
                        </p>
                        <button
                            onClick={() => setShowDuplicateWarning(false)}
                            style={{
                                width: '100%', padding: '14px',
                                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '16px', fontWeight: '600', cursor: 'pointer',
                            }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
            {showSaveToast && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#2D3748',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 2000,
                    animation: 'slideUpFade 0.3s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span>✓</span>
                    <span>Saved to your preferences</span>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUpFade {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
            `}</style>
        </div>
    );
}

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RestaurantApp />);