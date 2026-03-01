            {showDiscoverModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden',
                    zIndex: 2100, width: '100%', maxWidth: '100vw',
                }}>
                    <div
                        onClick={(e) => { if (e.target === e.currentTarget && !isDiscovering) setShowDiscoverModal(false); }}
                        style={{
                            width: '100%', height: '100%',
                            maxWidth: '100vw',
                            overflowY: 'auto', overflowX: 'hidden',
                            overscrollBehavior: 'none',
                            WebkitOverflowScrolling: 'touch',
                            background: 'rgba(0,0,0,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '20px', boxSizing: 'border-box',
                            animation: 'fadeIn 0.2s ease-out',
                        }}
                    >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'white', borderRadius: '20px', padding: '28px',
                            maxWidth: '420px', width: '100%', textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s ease-out',
                            position: 'relative',
                        }}
                    >
                        {!isDiscovering && (
                            <button
                                onClick={() => setShowDiscoverModal(false)}
                                style={{ position: 'absolute', top: '14px', right: '18px', background: 'transparent', border: 'none', fontSize: '22px', color: '#bbb', cursor: 'pointer' }}
                            >×</button>
                        )}

                        {isDiscovering && (
                            <>
                                <div style={{ fontSize: '40px', marginBottom: '14px' }}>✨</div>
                                <div style={{ fontSize: '17px', fontWeight: '600', marginBottom: '6px' }}>Analyzing your taste…</div>
                                <div style={{ fontSize: '13px', color: '#888', marginBottom: '22px' }}>Comparing your favorites with nearby options</div>
                                <div style={{
                                    width: '32px', height: '32px', border: '3px solid #7C3AED',
                                    borderTopColor: 'transparent', borderRadius: '50%',
                                    animation: 'spin 1s linear infinite', margin: '0 auto',
                                }} />
                            </>
                        )}

                        {!isDiscovering && discoverRec && discoverRec.restaurant && (
                            <>
                                <div style={{ fontSize: '38px', marginBottom: '10px' }}>✨</div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                                    Recommended for You
                                </div>
                                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
                                    {discoverRec.restaurant.name}
                                </h3>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', fontSize: '13px', color: '#666', marginBottom: '14px', flexWrap: 'wrap' }}>
                                    <span>{discoverRec.restaurant.cuisine}</span>
                                    <span>•</span><span>{discoverRec.restaurant.price}</span>
                                    <span>•</span><span>⭐ {discoverRec.restaurant.rating}</span>
                                    {discoverRec.restaurant.distance > 0 && (<><span>•</span><span>{discoverRec.restaurant.distance} mi</span></>)}
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #f5f0ff, #ede8ff)',
                                    borderRadius: '12px', padding: '14px 16px', marginBottom: '16px',
                                    fontSize: '14px', color: '#4B0082', lineHeight: '1.6', textAlign: 'left',
                                    borderLeft: '3px solid #7C3AED',
                                }}>
                                    💡 {discoverRec.explanation}
                                </div>
                                {discoverRec.restaurant.address && (
                                    <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '16px' }}>
                                        📍 {discoverRec.restaurant.address}
                                    </div>
                                )}
                                <button
                                    onClick={() => openInMaps(discoverRec.restaurant)}
                                    style={{
                                        width: '100%', padding: '14px', marginBottom: '10px',
                                        background: 'linear-gradient(135deg, #7C3AED, #9F67F5)',
                                        color: 'white', border: 'none', borderRadius: '12px',
                                        fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                    }}
                                >Let's Go! 🚗</button>
                                <button
                                    onClick={() => runDiscover(discoverRec.restaurant.name)}
                                    style={{
                                        width: '100%', padding: '12px', marginBottom: '8px',
                                        background: 'transparent', color: '#7C3AED',
                                        border: '2px solid #7C3AED', borderRadius: '12px',
                                        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    }}
                                >✨ Try Another Suggestion</button>
                                <button
                                    onClick={() => setShowDiscoverModal(false)}
                                    style={{
                                        width: '100%', padding: '10px',
                                        background: 'transparent', color: '#aaa',
                                        border: '1px solid #e0e0e0', borderRadius: '10px',
                                        fontSize: '13px', cursor: 'pointer',
                                    }}
                                >Close</button>
                            </>
                        )}

                        {!isDiscovering && discoverRec && !discoverRec.restaurant && (
                            <>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
                                <div style={{ fontSize: '15px', color: '#666', marginBottom: '16px' }}>{discoverRec.explanation}</div>
                                <button onClick={() => setShowDiscoverModal(false)} style={{ padding: '12px 24px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Close</button>
                            </>
                        )}
                    </div>
                    </div>
                </div>
            )}
