            {showAddModal && (
                <div style={{
                    position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 1000,
                }}>
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) resetAddModal(); }}
                    style={{
                    width: '100%', height: '100%',
                    overflowY: 'auto', overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    boxSizing: 'border-box',
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '0',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '92vh',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideUp 0.3s ease-out',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            padding: '20px 20px 0',
                            flexShrink: 0,
                        }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                margin: 0,
                            }}>
                                Add Restaurant
                            </h2>
                            <button
                                onClick={resetAddModal}
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
                        </div>
                        <div style={{ overflowY: 'auto', padding: '0 20px 20px', flex: 1 }}>
                        {multipleSearchResults.length === 0 && (
                            <div style={{
                                display: 'flex',
                                background: '#f5f5f5',
                                borderRadius: '12px',
                                padding: '4px',
                                marginBottom: '16px',
                                gap: '4px',
                            }}>
                                <button
                                    onClick={() => setManualEntryMode(false)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: !manualEntryMode ? 'white' : 'transparent',
                                        color: !manualEntryMode ? '#FF6B6B' : '#999',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: !manualEntryMode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    🔍 Search Google
                                </button>
                                <button
                                    onClick={() => setManualEntryMode(true)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: manualEntryMode ? 'white' : 'transparent',
                                        color: manualEntryMode ? '#FF6B6B' : '#999',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: manualEntryMode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    ✏️ Enter Manually
                                </button>
                            </div>
                        )}
                        {manualEntryMode && multipleSearchResults.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px' }}>
                                    For restaurants far away or not found by search. Google Maps will use the address you enter.
                                </p>
                                {[
                                    { key: 'name', label: 'Restaurant Name *', placeholder: 'e.g., Wok of Flames', type: 'text' },
                                    { key: 'address', label: 'Address (used for navigation)', placeholder: 'e.g., 1234 Main St, Los Angeles, CA', type: 'text' },
                                    { key: 'cuisine', label: 'Cuisine Type', placeholder: 'e.g., Chinese, Italian, Korean…', type: 'text' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            value={manualForm[field.key]}
                                            onChange={(e) => setManualForm({ ...manualForm, [field.key]: e.target.value })}
                                            placeholder={field.placeholder}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                fontSize: '14px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                transition: 'border-color 0.2s',
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
                                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                        />
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Price Range</label>
                                        <select
                                            value={manualForm.price}
                                            onChange={(e) => setManualForm({ ...manualForm, price: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                fontSize: '14px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                outline: 'none',
                                                background: 'white',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {['$', '$$', '$$$', '$$$$'].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Rating (1-5)</label>
                                        <input
                                            type="number"
                                            min="1" max="5" step="0.1"
                                            value={manualForm.rating}
                                            onChange={(e) => setManualForm({ ...manualForm, rating: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                fontSize: '14px',
                                                border: '2px solid #e0e0e0',
                                                borderRadius: '10px',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
                                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!manualForm.name.trim()) return;
                                        addManualRestaurant({
                                            ...manualForm,
                                            distance: 0,
                                            dietary: [],
                                        });
                                        setManualEntryMode(false);
                                        setManualForm({ name: '', address: '', cuisine: '', price: '$$', rating: '4.0' });
                                    }}
                                    disabled={!manualForm.name.trim()}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: manualForm.name.trim()
                                            ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
                                            : '#e0e0e0',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: manualForm.name.trim() ? 'pointer' : 'not-allowed',
                                        marginTop: '4px',
                                    }}
                                >
                                    ✓ Add to Favorites
                                </button>
                            </div>
                        )}

                        {!manualEntryMode && multipleSearchResults.length === 0 ? (
                            <>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#666',
                                    marginBottom: '16px',
                                }}>
                                    Enter the name of a restaurant you'd like to add to your favorites
                                </p>

                                <div style={{
                                    position: 'relative',
                                    marginBottom: '16px',
                                }}>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && searchQuery.trim()) {
                                                searchRestaurant(searchQuery);
                                            }
                                        }}
                                        placeholder="e.g., Tony's Pizza, Blue Bottle Coffee..."
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px',
                                            fontSize: '16px',
                                            border: '2px solid #e0e0e0',
                                            borderRadius: '12px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
                                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                                    />
                                </div>

                                <button
                                    onClick={() => searchRestaurant(searchQuery)}
                                    disabled={!searchQuery.trim() || isSearching}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: !searchQuery.trim() || isSearching 
                                            ? '#e0e0e0' 
                                            : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: !searchQuery.trim() || isSearching ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {isSearching ? (
                                        <>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid white',
                                                borderTopColor: 'transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite',
                                            }} />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search size={20} />
                                            Search Restaurant
                                        </>
                                    )}
                                </button>
                                {searchApiError && (
                                    <div style={{
                                        marginTop: '12px', padding: '12px 14px',
                                        background: '#fff3f3', borderRadius: '10px',
                                        border: '1px solid #ffd0d0',
                                    }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#c0392b', marginBottom: '4px' }}>
                                            {searchApiError === 'key' ? '🔑 API Key Not Authorized' : '⚠️ Connection Error'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
                                            {searchApiError === 'key'
                                                ? 'Add dreamsical.github.io/* to your Google API key\'s allowed HTTP referrers in Google Cloud Console.'
                                                : 'Could not reach Google. Check your connection and try again.'}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : !manualEntryMode ? (
                            <>
                                {multipleSearchResults.length > 0 ? (
                                    <>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '12px',
                                        }}>
                                            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                                                Found {multipleSearchResults.length} result{multipleSearchResults.length > 1 ? 's' : ''}. Select one:
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                background: '#f5f5f5',
                                                borderRadius: '10px',
                                                padding: '3px',
                                                gap: '2px',
                                            }}>
                                                <button
                                                    onClick={() => setAddModalViewMode('list')}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '7px',
                                                        border: 'none',
                                                        background: addModalViewMode === 'list' ? 'white' : 'transparent',
                                                        color: addModalViewMode === 'list' ? '#FF6B6B' : '#999',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: addModalViewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >☰ List</button>
                                                <button
                                                    onClick={() => setAddModalViewMode('map')}
                                                    style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '7px',
                                                        border: 'none',
                                                        background: addModalViewMode === 'map' ? 'white' : 'transparent',
                                                        color: addModalViewMode === 'map' ? '#FF6B6B' : '#999',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        boxShadow: addModalViewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >🗺️ Map</button>
                                            </div>
                                        </div>
                                        {addModalViewMode === 'map' && (
                                            <div style={{ marginBottom: '12px' }}>
                                                <div
                                                    ref={addMapRef}
                                                    style={{
                                                        width: '100%',
                                                        height: '260px',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                        overflow: 'hidden',
                                                        marginBottom: '8px',
                                                    }}
                                                />
                                                <p style={{ fontSize: '11px', color: '#aaa', textAlign: 'center', margin: 0 }}>
                                                    Tap a pin to select · scroll list below to see details
                                                </p>
                                            </div>
                                        )}
                                        <div
                                            ref={addModalListRef}
                                            style={{
                                            maxHeight: addModalViewMode === 'map' ? '160px' : '240px',
                                            overflowY: 'auto',
                                            marginBottom: '12px',
                                        }}>
                                            {multipleSearchResults.map((result, index) => (
                                                <div
                                                    key={index}
                                                    ref={selectedSearchResult === result ? selectedResultRef : null}
                                                    onClick={() => setSelectedSearchResult(result)}
                                                    style={{
                                                        background: selectedSearchResult === result ? '#FFF5F5' : '#f8f8f8',
                                                        border: selectedSearchResult === result ? '2px solid #FF6B6B' : '2px solid transparent',
                                                        borderRadius: '12px',
                                                        padding: '14px 16px',
                                                        marginBottom: '10px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        gap: '12px',
                                                        alignItems: 'flex-start',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (selectedSearchResult !== result) {
                                                            e.currentTarget.style.background = '#f0f0f0';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (selectedSearchResult !== result) {
                                                            e.currentTarget.style.background = '#f8f8f8';
                                                        }
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                                        background: selectedSearchResult === result ? '#FF6B6B' : '#ccc',
                                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '12px', fontWeight: '700', marginTop: '2px',
                                                    }}>
                                                        {index + 1}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{
                                                            fontSize: '15px',
                                                            fontWeight: '700',
                                                            marginBottom: '4px',
                                                            margin: '0 0 4px',
                                                            color: '#1a1a1a',
                                                        }}>
                                                            {result.name}
                                                        </h4>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: '#666',
                                                            marginBottom: '6px',
                                                        }}>
                                                            📍 {result.address}
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            gap: '8px',
                                                            alignItems: 'center',
                                                            fontSize: '12px',
                                                            flexWrap: 'wrap',
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <Star size={12} fill="#FFB800" stroke="#FFB800" />
                                                                <span style={{ fontWeight: '600' }}>{result.rating}</span>
                                                            </div>
                                                            <span style={{ color: '#ccc' }}>•</span>
                                                            <span>{result.price}</span>
                                                            <span style={{ color: '#ccc' }}>•</span>
                                                            <span>{result.distance} mi</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: '10px',
                                            marginBottom: searchRadius < 40233.6 ? '10px' : '0',
                                        }}>
                                            <button
                                                onClick={() => {
                                                    if (selectedSearchResult) {
                                                        addManualRestaurant(selectedSearchResult);
                                                    }
                                                }}
                                                disabled={!selectedSearchResult}
                                                style={{
                                                    flex: 1,
                                                    padding: '13px',
                                                    background: selectedSearchResult 
                                                        ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)'
                                                        : '#e0e0e0',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    cursor: selectedSearchResult ? 'pointer' : 'not-allowed',
                                                    transition: 'transform 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (selectedSearchResult) e.target.style.transform = 'scale(1.02)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'scale(1)';
                                                }}
                                            >
                                                Add Selected ✓
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMultipleSearchResults([]);
                                                    setSelectedSearchResult(null);
                                                    setSearchQuery('');
                                                    setSearchRadius(8046.72);
                                                    setAddModalViewMode('list');
                                                    if (addLeafletMapRef.current) {
                                                        addLeafletMapRef.current.remove();
                                                        addLeafletMapRef.current = null;
                                                    }
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '13px',
                                                    background: 'transparent',
                                                    color: '#FF6B6B',
                                                    border: '2px solid #FF6B6B',
                                                    borderRadius: '12px',
                                                    fontSize: '14px',
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
                                                Search Again
                                            </button>
                                        </div>
                                        {searchRadius < 40233.6 && (
                                            <button
                                                onClick={() => searchRestaurant(searchQuery, true)}
                                                disabled={isSearching}
                                                style={{
                                                    width: '100%', padding: '10px', marginTop: '8px',
                                                    background: 'transparent', color: '#FF6B6B',
                                                    border: '1px dashed #FF6B6B', borderRadius: '10px',
                                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                                }}
                                            >🔍 Expand search radius (up to 25 miles)</button>
                                        )}
                                    </>
                ) : (
                                    <>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#666',
                                            marginBottom: '16px',
                                            textAlign: 'center',
                                        }}>
                                            No results found for "{searchQuery}"
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {searchRadius < 40233.6 && (
                                                <button
                                                    onClick={() => searchRestaurant(searchQuery, true)}
                                                    disabled={isSearching}
                                                    style={{
                                                        width: '100%', padding: '14px',
                                                        background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)',
                                                        color: 'white', border: 'none', borderRadius: '12px',
                                                        fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                                    }}
                                                >🔍 Try wider search (up to 25 miles)</button>
                                            )}
                                            <button
                                                onClick={() => { setMultipleSearchResults([]); setSearchQuery(''); setSearchRadius(8046.72); }}
                                                style={{
                                                    width: '100%', padding: '14px',
                                                    background: 'transparent', color: '#FF6B6B',
                                                    border: '2px solid #FF6B6B', borderRadius: '12px',
                                                    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                                }}
                                            >Search Again</button>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : null}
                        </div>
                    </div>
                </div>
                </div>
            )}
