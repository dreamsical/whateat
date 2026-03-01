
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            width: '100%',
            maxWidth: '100vw',
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'none',
            touchAction: 'pan-y',
            background: 'linear-gradient(to bottom, #FFF5EB 0%, #FFE9D6 100%)',
            fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
            color: '#1a1a1a',
            WebkitOverflowScrolling: 'touch',
        }}>
            <div style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: 0,
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    WhatEat
                </h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            background: showFilters ? '#FF6B6B' : 'white',
                            color: showFilters ? 'white' : '#FF6B6B',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Filter size={20} />
                    </button>
                    <button
                        onClick={() => setShowSettings(true)}
                        style={{
                            background: 'white',
                            color: '#FF6B6B',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>
            {showSettings && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: '100vw',
                    overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    boxSizing: 'border-box',
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        animation: 'slideUp 0.3s ease-out',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                margin: 0,
                            }}>
                                Settings & Data
                            </h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666',
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{
                            background: '#f8f8f8',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '20px',
                        }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                marginBottom: '12px',
                            }}>
                                Your Saved Data
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                fontSize: '14px',
                                color: '#666',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Favorite Restaurants:</span>
                                    <strong style={{ color: '#FF6B6B' }}>
                                        {restaurants.filter(r => r.liked).length}
                                    </strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Active Dietary Filters:</span>
                                    <strong style={{ color: '#FF6B6B' }}>
                                        {dietaryFilters.length}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, #FFF5EB 0%, #FFE9D6 100%)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '20px',
                        }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <Sparkles size={20} style={{ color: '#FF6B6B', flexShrink: 0 }} />
                                <div>
                                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '600' }}>
                                        Learning Your Preferences
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                                        We track your likes, dislikes, and spin choices to recommend better restaurants over time. All data is stored locally on your device.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={clearAllData}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'transparent',
                                color: '#FF6B6B',
                                border: '2px solid #FF6B6B',
                                borderRadius: '12px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = '#FFF5F5';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                            }}
                        >
                            Clear All Data
                        </button>
                    </div>
                </div>
            )}
            {showFilters && (
                <div style={{
                    margin: '0 20px 20px',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    animation: 'slideDown 0.3s ease-out',
                }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600' }}>
                        Dietary Options
                    </h3>
                    <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#999' }}>
                        Shows restaurants likely to have these options
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['vegetarian', 'vegan', 'gluten-free'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => toggleDietaryFilter(filter)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: dietaryFilters.includes(filter)
                                        ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
                                        : '#f5f5f5',
                                    color: dietaryFilters.includes(filter) ? 'white' : '#666',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div style={{ padding: '20px 20px 0' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                    borderRadius: '24px',
                    padding: '24px 20px 20px',
                    marginBottom: '12px',
                    boxShadow: '0 10px 40px rgba(255, 107, 107, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    textAlign: 'center',
                }}>
                    <div style={{
                        position: 'absolute', top: '-50%', right: '-10%',
                        width: '200px', height: '200px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        animation: 'float 6s ease-in-out infinite',
                    }} />
                    <h2 style={{
                        fontSize: '26px', fontWeight: '700', color: 'white',
                        marginBottom: '4px', fontFamily: '"Playfair Display", serif',
                    }}>
                        Random Pick 🎲
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '16px', fontSize: '14px' }}>
                        Completely random — let fate decide
                    </p>
                    <div style={{
                        display: 'flex', gap: '8px', marginBottom: '16px',
                        background: 'rgba(255,255,255,0.15)', padding: '5px',
                        borderRadius: '12px', backdropFilter: 'blur(10px)',
                    }}>
                        <button
                            onClick={() => setSpinMode('favorites')}
                            style={{
                                flex: 1, padding: '9px 16px',
                                background: spinMode === 'favorites' ? 'white' : 'transparent',
                                color: spinMode === 'favorites' ? '#FF6B6B' : 'white',
                                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.3s',
                                boxShadow: spinMode === 'favorites' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                            }}
                        >❤️ My Favorites</button>
                        <button
                            onClick={() => setSpinMode('nearby')}
                            style={{
                                flex: 1, padding: '9px 16px',
                                background: spinMode === 'nearby' ? 'white' : 'transparent',
                                color: spinMode === 'nearby' ? '#FF6B6B' : 'white',
                                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                                cursor: 'pointer', transition: 'all 0.3s',
                                boxShadow: spinMode === 'nearby' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                            }}
                        >🗺️ Try Nearby</button>
                    </div>
                    <button
                        onClick={() => spinForRestaurant()}
                        disabled={isSpinning}
                        style={{
                            background: 'rgba(255,255,255,0.22)',
                            color: 'white',
                            border: '2px solid rgba(255,255,255,0.6)',
                            borderRadius: '14px', padding: '13px 28px',
                            fontSize: '17px', fontWeight: '700',
                            cursor: isSpinning ? 'not-allowed' : 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '10px',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                            transition: 'all 0.2s',
                            animation: isSpinning ? 'pulse 1s infinite' : 'none',
                            opacity: isSpinning ? 0.75 : 1,
                        }}
                        onMouseEnter={(e) => !isSpinning && (e.currentTarget.style.background = 'rgba(255,255,255,0.32)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                    >
                        <Shuffle size={22} style={{ animation: isSpinning ? 'spin 1s linear infinite' : 'none' }} />
                        {isSpinning ? 'Spinning...' : 'Spin to Decide!'}
                    </button>

                    {isSpinning && selectedRestaurant && (
                        <div style={{ marginTop: '14px', color: 'white', fontSize: '18px', fontWeight: '600', animation: 'pulse 0.3s ease-in-out' }}>
                            {selectedRestaurant.name}
                        </div>
                    )}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.25)', margin: '18px 0 16px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', textAlign: 'left' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                                <span style={{ fontSize: '16px' }}>✨</span>
                                <span style={{ fontSize: '15px', fontWeight: '700', color: 'white', fontFamily: '"Playfair Display", serif' }}>AI Discover</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '12px', margin: 0, lineHeight: '1.4' }}>
                                Picks something new based on your taste
                            </p>
                        </div>
                        <button
                            onClick={() => runDiscover()}
                            disabled={isDiscovering}
                            style={{
                                background: 'rgba(255,255,255,0.22)', color: 'white',
                                border: '1.5px solid rgba(255,255,255,0.55)',
                                borderRadius: '12px', padding: '10px 16px',
                                fontSize: '13px', fontWeight: '700',
                                cursor: isDiscovering ? 'not-allowed' : 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                backdropFilter: 'blur(4px)',
                                transition: 'all 0.2s', flexShrink: 0,
                                opacity: isDiscovering ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => { if (!isDiscovering) { e.currentTarget.style.background = 'rgba(255,255,255,0.32)'; e.currentTarget.style.transform = 'scale(1.04)'; }}}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <Sparkles size={15} />
                            {isDiscovering ? 'Analyzing…' : 'Discover'}
                        </button>
                    </div>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '20px',
                }}>
                    <div 
                        onClick={() => {
                            if (listFilter !== 'favorites') {
                                setListFilter('favorites');
                                setShowAllFavorites(false);
                                setShowListFilters(false);
                            }
                        }}
                        style={{
                            background: listFilter === 'favorites' ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' : 'white',
                            color: listFilter === 'favorites' ? 'white' : '#1a1a1a',
                            borderRadius: '14px',
                            padding: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            cursor: listFilter !== 'favorites' ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                            if (listFilter !== 'favorites') {
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <div style={{ fontSize: '20px', fontWeight: '700', color: listFilter === 'favorites' ? 'white' : '#FF6B6B' }}>
                            {filteredFavoritesCount}
                        </div>
                        <div style={{ fontSize: '12px', color: listFilter === 'favorites' ? 'rgba(255,255,255,0.9)' : '#666' }}>
                            Favorites{favHasFilter ? ' *' : ''}
                        </div>
                    </div>
                    <div 
                        onClick={() => { setListFilter('all'); setShowListFilters(false); }}
                        style={{
                            background: listFilter === 'all' ? 'linear-gradient(135deg, #FF8E53 0%, #FFB366 100%)' : 'white',
                            color: listFilter === 'all' ? 'white' : '#1a1a1a',
                            borderRadius: '14px',
                            padding: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center',
                        }}
                        onMouseEnter={(e) => {
                            if (listFilter !== 'all') {
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <div style={{ fontSize: '20px', fontWeight: '700', color: listFilter === 'all' ? 'white' : '#FF8E53' }}>
                            {filteredNearbyCount}
                        </div>
                        <div style={{ fontSize: '12px', color: listFilter === 'all' ? 'rgba(255,255,255,0.9)' : '#666' }}>
                            Nearby{nearbyHasFilter ? ' *' : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ padding: '0 20px 100px' }}>
