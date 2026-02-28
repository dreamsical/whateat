    if (view === 'result' && selectedRestaurant) {
        const isSpin = resultSource === 'spin';
        const isWizard = resultSource === 'wizard';
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                overflow: 'hidden',
                fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
            }}>
                <button
                    onClick={() => setView('main')}
                    style={{
                        position: 'absolute', top: '20px', left: '20px', zIndex: 10,
                        background: 'rgba(255,255,255,0.2)', border: 'none',
                        borderRadius: '10px', padding: '8px 16px',
                        color: 'white', fontSize: '14px', fontWeight: '600',
                        cursor: 'pointer', backdropFilter: 'blur(10px)',
                    }}
                >← Back</button>
                <div style={{
                    width: '100%',
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '64px 20px 20px',
                    boxSizing: 'border-box',
                }}>
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px 20px 20px',
                    maxWidth: '380px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    animation: 'slideUp 0.5s ease-out',
                }}>
                    <div style={{ fontSize: '32px', marginBottom: '6px' }}>
                        🎲
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                        Spin Result
                    </div>

                    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
                        {selectedRestaurant.name}
                    </h2>

                    <div style={{
                        display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center',
                        marginBottom: '8px', color: '#666', fontSize: '13px', flexWrap: 'wrap',
                    }}>
                        <span>{selectedRestaurant.cuisine}</span>
                        <span>•</span><span>{selectedRestaurant.price}</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Star size={12} fill="#FFB800" stroke="#FFB800" />{selectedRestaurant.rating}
                        </span>
                    </div>

                    {selectedRestaurant.distance > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#667eea', fontSize: '12px', marginBottom: '8px' }}>
                            <MapPin size={13} />{selectedRestaurant.distance} mi away
                        </div>
                    )}

                    {selectedRestaurant.address && (
                        <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '16px' }}>
                            📍 {selectedRestaurant.address}
                        </div>
                    )}

                    <button
                        onClick={() => openInMaps(selectedRestaurant)}
                        style={{
                            width: '100%', padding: '13px', marginBottom: '8px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                        }}
                    >Let's Go! 🚗</button>

                    <button
                        onClick={() => spinForRestaurant(null, true)}
                        disabled={isSpinningAgain}
                        style={{
                            width: '100%', padding: '13px', marginBottom: '8px',
                            background: isSpinningAgain
                                ? 'linear-gradient(135deg, #FF8E53 0%, #FF6B6B 100%)'
                                : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                            color: 'white', border: 'none', borderRadius: '12px',
                            fontSize: '15px', fontWeight: '600', cursor: isSpinningAgain ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'opacity 0.2s', opacity: isSpinningAgain ? 0.85 : 1,
                        }}
                    >
                        <span style={{ display: 'inline-block', animation: isSpinningAgain ? 'spin 0.6s linear infinite' : 'none' }}>🎲</span>
                        {isSpinningAgain ? 'Spinning…' : 'Spin Again'}
                    </button>

                    <button
                        onClick={() => setView('main')}
                        style={{
                            width: '100%', padding: '10px',
                            background: 'transparent', color: '#999',
                            border: '1px solid #e0e0e0', borderRadius: '12px',
                            fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                        }}
                    >Back to Main</button>
                </div>
                </div>
            </div>
        );
    }
