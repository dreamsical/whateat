                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
                        {listFilter === 'favorites' ? 'My Favorites' : 'Near You'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {listFilter === 'favorites' && totalFavoritesCount > 3 && (
                            <button
                                onClick={() => setShowAllFavorites(!showAllFavorites)}
                                style={{
                                    background: 'transparent', border: 'none', color: '#FF6B6B',
                                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
                                }}
                            >
                                {showAllFavorites ? 'Show Less' : `View All (${totalFavoritesCount})`}
                                <ChevronRight size={16} style={{ transform: showAllFavorites ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </button>
                        )}
                        {listFilter === 'all' && filteredRestaurants.length > NEARBY_DEFAULT_LIMIT && (
                            <button
                                onClick={() => setShowAllNearby(!showAllNearby)}
                                style={{
                                    background: 'transparent', border: 'none', color: '#FF6B6B',
                                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px', padding: 0,
                                }}
                            >
                                {showAllNearby ? 'Show Less' : `View All (${filteredRestaurants.length})`}
                                <ChevronRight size={16} style={{ transform: showAllNearby ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </button>
                        )}
                        {listFilter === 'all' && userLocation && listViewMode === 'list' && (
                            <button
                                onClick={() => { setLastNearbyFetch(null); fetchNearbyRestaurants(); }}
                                disabled={isLoadingNearby}
                                style={{
                                    background: 'transparent', border: 'none', color: '#FF6B6B',
                                    fontSize: '14px', fontWeight: '600', padding: 0,
                                    cursor: isLoadingNearby ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    opacity: isLoadingNearby ? 0.5 : 1,
                                }}
                            >
                                🔄 {isLoadingNearby ? '...' : 'Refresh'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Location search bar — only shown in Nearby view */}
                {listFilter === 'all' && (
                    <div style={{ marginBottom: '12px' }}>
                        {/* Active override pill */}
                        {searchLocation ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: '#FFF0EB', border: '1.5px solid #FF8E53',
                                borderRadius: '10px', padding: '8px 12px',
                            }}>
                                <span style={{ fontSize: '14px' }}>🔍</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#FF6B6B', flex: 1 }}>
                                    {searchLocation.label}
                                </span>
                                <button
                                    onClick={clearSearchLocation}
                                    title="Return to my location"
                                    style={{
                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                        color: '#FF6B6B', fontSize: '18px', padding: 0, lineHeight: 1,
                                        fontWeight: '700',
                                    }}
                                >×</button>
                            </div>
                        ) : (
                            /* Search input */
                            <div style={{
                                display: 'flex', gap: '8px', alignItems: 'center',
                            }}>
                                <div style={{
                                    flex: 1, display: 'flex', alignItems: 'center',
                                    background: '#f5f5f5', borderRadius: '10px',
                                    padding: '0 12px', gap: '6px',
                                }}>
                                    <span style={{ fontSize: '14px', flexShrink: 0 }}>📍</span>
                                    <input
                                        type="text"
                                        value={locationSearchInput}
                                        onChange={(e) => {
                                            setLocationSearchInput(e.target.value);
                                            setLocationSearchError(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') geocodeAndSearchLocation(locationSearchInput);
                                        }}
                                        placeholder="Search by city, zip, or address…"
                                        style={{
                                            flex: 1, border: 'none', background: 'transparent',
                                            fontSize: '13px', padding: '9px 0', outline: 'none',
                                            color: '#333',
                                        }}
                                    />
                                    {locationSearchInput.length > 0 && (
                                        <button
                                            onClick={() => { setLocationSearchInput(''); setLocationSearchError(null); }}
                                            style={{
                                                background: 'transparent', border: 'none',
                                                cursor: 'pointer', color: '#aaa', fontSize: '16px',
                                                padding: 0, lineHeight: 1, flexShrink: 0,
                                            }}
                                        >×</button>
                                    )}
                                </div>
                                <button
                                    onClick={() => geocodeAndSearchLocation(locationSearchInput)}
                                    disabled={isGeocodingLocation || !locationSearchInput.trim()}
                                    style={{
                                        background: locationSearchInput.trim() ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' : '#eee',
                                        color: locationSearchInput.trim() ? 'white' : '#bbb',
                                        border: 'none', borderRadius: '10px',
                                        padding: '9px 14px', fontSize: '13px', fontWeight: '700',
                                        cursor: locationSearchInput.trim() ? 'pointer' : 'default',
                                        transition: 'all 0.2s', flexShrink: 0,
                                        opacity: isGeocodingLocation ? 0.6 : 1,
                                    }}
                                >
                                    {isGeocodingLocation ? '…' : 'Go'}
                                </button>
                            </div>
                        )}
                        {locationSearchError && (
                            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#e44', padding: '0 2px' }}>
                                {locationSearchError}
                            </p>
                        )}
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                        <button
                            onClick={() => setListViewMode('list')}
                            style={{
                                padding: '5px 10px', borderRadius: '8px', border: 'none',
                                background: listViewMode === 'list' ? 'white' : 'transparent',
                                color: listViewMode === 'list' ? '#FF6B6B' : '#999',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                boxShadow: listViewMode === 'list' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s',
                            }}
                        >☰ List</button>
                        <button
                            onClick={() => setListViewMode('map')}
                            style={{
                                padding: '5px 10px', borderRadius: '8px', border: 'none',
                                background: listViewMode === 'map' ? 'white' : 'transparent',
                                color: listViewMode === 'map' ? '#FF6B6B' : '#999',
                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                boxShadow: listViewMode === 'map' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s',
                            }}
                        >🗺️ Map</button>
                    </div>
                </div>
                {listViewMode === 'list' && (
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                {listFilter === 'favorites' && (
                                    <button onClick={() => setFavoritesSort('date')} style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: favoritesSort === 'date' ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: favoritesSort === 'date' ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>Recently Added</button>
                                )}
                                {listFilter === 'all' && (
                                    <button onClick={() => setNearbySort('distance')} style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: nearbySort === 'distance' ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: nearbySort === 'distance' ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>Nearest</button>
                                )}
                                <button
                                    onClick={() => {
                                        const currentSort = listFilter === 'favorites' ? favoritesSort : nearbySort;
                                        if (currentSort === 'name') {
                                            setNameSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setNameSortDir('asc');
                                            listFilter === 'favorites' ? setFavoritesSort('name') : setNearbySort('name');
                                        }
                                    }}
                                    style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: (listFilter === 'favorites' ? favoritesSort : nearbySort) === 'name' ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: (listFilter === 'favorites' ? favoritesSort : nearbySort) === 'name' ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>
                                    {(listFilter === 'favorites' ? favoritesSort : nearbySort) === 'name'
                                        ? (nameSortDir === 'asc' ? 'A-Z ↑' : 'Z-A ↓')
                                        : 'A-Z'}
                                </button>
                                <button
                                    onClick={() => listFilter === 'favorites' ? setFavoritesSort('distance') : setNearbySort('rating')}
                                    style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: (listFilter === 'favorites'
                                            ? favoritesSort === 'distance'
                                            : nearbySort === 'rating') ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: (listFilter === 'favorites'
                                            ? favoritesSort === 'distance'
                                            : nearbySort === 'rating') ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>{listFilter === 'favorites' ? 'Nearest' : 'Top Rated'}</button>
                                <button
                                    onClick={() => {
                                        const currentSort = listFilter === 'favorites' ? favoritesSort : nearbySort;
                                        if (currentSort === 'price') {
                                            setPriceSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setPriceSortDir('asc');
                                            listFilter === 'favorites' ? setFavoritesSort('price') : setNearbySort('price');
                                        }
                                    }}
                                    style={{
                                        padding: '5px 11px', borderRadius: '16px', border: 'none',
                                        background: (listFilter === 'favorites' ? favoritesSort : nearbySort) === 'price' ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                        color: (listFilter === 'favorites' ? favoritesSort : nearbySort) === 'price' ? 'white' : '#666',
                                        fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                    }}>
                                    Price {(listFilter === 'favorites' ? favoritesSort : nearbySort) === 'price' ? (priceSortDir === 'asc' ? '↑' : '↓') : ''}
                                </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setShowListFilters(!showListFilters)}
                                style={{
                                    padding: '5px 11px', borderRadius: '16px', border: 'none',
                                    background: totalActiveFilters > 0
                                        ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f0f0f0',
                                    color: totalActiveFilters > 0 ? 'white' : '#666',
                                    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                }}
                            >
                                🎛️ Filter {totalActiveFilters > 0 ? `(${totalActiveFilters})` : ''}
                            </button>
                        </div>
                        {showListFilters && (
                            <div style={{
                                background: 'white', borderRadius: '14px', padding: '14px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '8px',
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Cuisine
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {availableCuisines.map(c => (
                                            <button key={c} onClick={() => {
                                                setActiveCuisineFilters(prev =>
                                                    prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                                                );
                                            }} style={{
                                                padding: '4px 10px', borderRadius: '12px', border: 'none',
                                                background: activeCuisineFilters.includes(c) ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeCuisineFilters.includes(c) ? 'white' : '#555',
                                                fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                            }}>{c}</button>
                                        ))}
                                        {availableCuisines.length === 0 && (
                                            <span style={{ fontSize: '12px', color: '#aaa' }}>No cuisine data available</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Price Range
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {availablePrices.map(p => (
                                            <button key={p} onClick={() => {
                                                setActivePriceFilters(prev =>
                                                    prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                                                );
                                            }} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activePriceFilters.includes(p) ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activePriceFilters.includes(p) ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '4px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Max Distance
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[0.5, 1, 2, 5].map(d => (
                                            <button key={d} onClick={() => setActiveDistanceFilter(activeDistanceFilter === d ? null : d)} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activeDistanceFilter === d ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeDistanceFilter === d ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>{d < 1 ? `½ mi` : `${d} mi`}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '4px', marginTop: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Min Rating
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[3.5, 4.0, 4.5].map(r => (
                                            <button key={r} onClick={() => setActiveRatingFilter(activeRatingFilter === r ? null : r)} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activeRatingFilter === r ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeRatingFilter === r ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>⭐ {r}+</button>
                                        ))}
                                    </div>
                                </div>
                                {totalActiveFilters > 0 && (
                                    <button onClick={clearAllListFilters}
                                        style={{
                                            marginTop: '12px', padding: '5px 12px', borderRadius: '10px',
                                            border: 'none', background: '#fff0f0', color: '#FF6B6B',
                                            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                                        }}
                                    >✕ Clear all filters</button>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {listViewMode === 'map' && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            {activeCuisineFilters.map(c => (
                                <span key={c} onClick={() => setActiveCuisineFilters(prev => prev.filter(x => x !== c))}
                                    style={{ padding: '4px 10px', borderRadius: '12px', background: '#FFE9D6', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    {c} ✕
                                </span>
                            ))}
                            {activePriceFilters.map(p => (
                                <span key={p} onClick={() => setActivePriceFilters(prev => prev.filter(x => x !== p))}
                                    style={{ padding: '4px 10px', borderRadius: '12px', background: '#FFE9D6', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    {p} ✕
                                </span>
                            ))}
                            {activeDistanceFilter !== null && (
                                <span onClick={() => setActiveDistanceFilter(null)}
                                    style={{ padding: '4px 10px', borderRadius: '12px', background: '#FFE9D6', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    ≤{activeDistanceFilter < 1 ? '½' : activeDistanceFilter} mi ✕
                                </span>
                            )}
                            {activeRatingFilter !== null && (
                                <span onClick={() => setActiveRatingFilter(null)}
                                    style={{ padding: '4px 10px', borderRadius: '12px', background: '#FFE9D6', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    ⭐ {activeRatingFilter}+ ✕
                                </span>
                            )}
                            <button
                                onClick={() => setShowListFilters(!showListFilters)}
                                style={{
                                    padding: '6px 13px', borderRadius: '16px', border: 'none',
                                    background: totalActiveFilters > 0
                                        ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f0f0f0',
                                    color: totalActiveFilters > 0 ? 'white' : '#666',
                                    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                }}
                            >
                                🎛️ Filter {totalActiveFilters > 0 ? `(${totalActiveFilters})` : ''}
                            </button>
                        </div>
                        {showListFilters && (
                            <div style={{
                                background: 'white', borderRadius: '14px', padding: '14px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '10px',
                            }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cuisine</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {availableCuisines.map(c => (
                                            <button key={c} onClick={() => setActiveCuisineFilters(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])} style={{
                                                padding: '4px 10px', borderRadius: '12px', border: 'none',
                                                background: activeCuisineFilters.includes(c) ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeCuisineFilters.includes(c) ? 'white' : '#555',
                                                fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                                            }}>{c}</button>
                                        ))}
                                        {availableCuisines.length === 0 && <span style={{ fontSize: '12px', color: '#aaa' }}>No cuisine data available</span>}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {availablePrices.map(p => (
                                            <button key={p} onClick={() => setActivePriceFilters(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activePriceFilters.includes(p) ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activePriceFilters.includes(p) ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '4px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max Distance</div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[0.5, 1, 2, 5].map(d => (
                                            <button key={d} onClick={() => setActiveDistanceFilter(activeDistanceFilter === d ? null : d)} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activeDistanceFilter === d ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeDistanceFilter === d ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>{d < 1 ? `½ mi` : `${d} mi`}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '4px', marginTop: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#444', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Min Rating</div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {[3.5, 4.0, 4.5].map(r => (
                                            <button key={r} onClick={() => setActiveRatingFilter(activeRatingFilter === r ? null : r)} style={{
                                                padding: '6px 14px', borderRadius: '12px', border: 'none',
                                                background: activeRatingFilter === r ? 'linear-gradient(135deg,#FF6B6B,#FF8E53)' : '#f5f5f5',
                                                color: activeRatingFilter === r ? 'white' : '#555',
                                                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                            }}>⭐ {r}+</button>
                                        ))}
                                    </div>
                                </div>
                                {totalActiveFilters > 0 && (
                                    <button onClick={clearAllListFilters}
                                        style={{ marginTop: '12px', padding: '5px 12px', borderRadius: '10px', border: 'none', background: '#fff0f0', color: '#FF6B6B', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                        ✕ Clear all filters
                                    </button>
                                )}
                            </div>
                        )}
                        {!userLocation && mapRestaurants.length === 0 ? (
                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '30px 20px',
                                textAlign: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
                                <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                                    Allow location access to see restaurants on the map.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ position: 'relative' }}>
                                    <div
                                        ref={mapRef}
                                        style={{
                                            width: '100%',
                                            height: '380px',
                                            borderRadius: '16px',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                            overflow: 'hidden',
                                        }}
                                    />
                                    {userLocation && (
                                        <button
                                            onClick={() => {
                                                const target = realUserLocationRef.current || userLocation;
                                                if (leafletMapRef.current && target) {
                                                    leafletMapRef.current.flyTo(
                                                        [target.lat, target.lng], 15,
                                                        { animate: true, duration: 0.8 }
                                                    );
                                                }
                                            }}
                                            title="Go to my location"
                                            style={{
                                                position: 'absolute',
                                                bottom: '12px',
                                                right: '12px',
                                                zIndex: 1000,
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: 'white',
                                                border: 'none',
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px',
                                            }}
                                        >🎯</button>
                                    )}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginTop: '10px',
                                    fontSize: '12px',
                                    color: '#666',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                }}>
                                    {userLocation && <span>🔵 You &nbsp;·&nbsp; 🎯 Go to me</span>}
                                    {listFilter === 'favorites' ? <span>❤️ Favorite</span> : <span>🍽️ Nearby</span>}
                                    <span style={{ color: '#aaa' }}>Tap a pin → Open in Maps</span>
                                </div>
                                {mapRestaurants.length === 0 && listFilter === 'favorites' && (
                                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#999', marginTop: '8px' }}>
                                        Your favorites are being located… if nothing appears, they may lack address data. Add restaurants via Search to get map pins.
                                    </p>
                                )}
                                {unmappableFavorites.length > 0 && listFilter === 'favorites' && (
                                    <div style={{
                                        marginTop: '10px',
                                        background: '#fff8f0',
                                        borderRadius: '12px',
                                        padding: '10px 14px',
                                        fontSize: '12px',
                                        color: '#888',
                                        border: '1px solid #ffe4cc',
                                    }}>
                                        <strong style={{ color: '#FF8E53' }}>Not mapped ({unmappableFavorites.length}):</strong>{' '}
                                        {unmappableFavorites.map(r => r.name).join(', ')} — no address data available.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
                {listViewMode === 'list' && listFilter === 'all' && !userLocation && !isLoadingNearby ? (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '36px 24px',
                        textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📍</div>
                        <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
                            {locationError === 'denied' ? 'Location Access Blocked' : 'Location Access Needed'}
                        </h4>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
                            {locationError === 'denied'
                                ? 'Your browser blocked location access. Open your browser\'s site settings, allow location for this page, then tap Try Again.'
                                : locationError === 'file_protocol_mobile'
                                ? 'Location works when opening this file on a desktop browser. On mobile, you\'ll need to host it via HTTPS (e.g. drag it to netlify.com/drop for a free instant link).'
                                : 'To show restaurants near you, WhatEat needs your location. Your location is only used to find nearby restaurants and is never stored or shared.'}
                        </p>
                        <button
                            onClick={getUserLocation}
                            style={{
                                padding: '14px 28px',
                                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                color: 'white', border: 'none', borderRadius: '12px',
                                fontSize: '15px', fontWeight: '600', cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
                            }}
                        >
                            📍 {locationError === 'denied' ? 'Try Again' : 'Share My Location'}
                        </button>
                        {!locationError && (
                            <p style={{ fontSize: '12px', color: '#aaa', marginTop: '12px' }}>
                                If your browser blocks the prompt, check the address bar for a location icon and allow access there.
                            </p>
                        )}
                    </div>
                ) : listViewMode === 'list' && listFilter === 'all' && isLoadingNearby ? (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '40px 20px',
                        textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{
                            width: '36px', height: '36px', border: '3px solid #FF6B6B',
                            borderTopColor: 'transparent', borderRadius: '50%',
                            animation: 'spin 1s linear infinite', margin: '0 auto 16px',
                        }} />
                        <p style={{ fontSize: '15px', color: '#666', margin: 0 }}>Finding restaurants near you…</p>
                    </div>
                ) : listViewMode === 'list' && listFilter === 'all' && nearbyApiError ? (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '32px 24px',
                        textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
                        <h4 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: '#1a1a1a' }}>
                            {nearbyApiError === 'key' ? 'API Key Not Authorized' : 'Connection Error'}
                        </h4>
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: '1.6' }}>
                            {nearbyApiError === 'key'
                                ? 'Your Google Places API key needs to allow this domain. In Google Cloud Console → Credentials → your key → HTTP referrers, add: dreamsical.github.io/*'
                                : 'Could not reach Google Places. Check your connection and try again.'}
                        </p>
                        <button
                            onClick={() => { setLastNearbyFetch(null); fetchNearbyRestaurants(); }}
                            style={{
                                padding: '10px 20px', borderRadius: '10px', border: 'none',
                                background: 'linear-gradient(135deg,#FF6B6B,#FF8E53)',
                                color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                            }}
                        >Try Again</button>
                    </div>
                ) : listViewMode === 'list' && displayRestaurants.length === 0 ? (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            {listFilter === 'favorites' ? '💔' : '🔍'}
                        </div>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1a1a1a' }}>
                            {listFilter === 'favorites' ? 'No favorites yet' : 'No restaurants found'}
                        </h4>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: totalActiveFilters > 0 ? '16px' : '0' }}>
                            {listFilter === 'favorites'
                                ? 'Heart some restaurants to see them here!'
                                : totalActiveFilters > 0
                                ? 'No restaurants match your current filters.'
                                : userLocation ? 'Try adjusting your filters or tap Refresh above.' : 'Enable location to see restaurants near you.'}
                        </p>
                        {totalActiveFilters > 0 && (
                            <button
                                onClick={clearAllListFilters}
                                style={{
                                    padding: '10px 20px', borderRadius: '12px', border: 'none',
                                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                                    color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(255,107,107,0.25)',
                                }}
                            >✕ Clear all filters</button>
                        )}
                    </div>
                ) : listViewMode === 'list' ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}>
                        {displayRestaurants.map((restaurant, index) => (
                            <div
                                key={restaurant.id}
                                onClick={() => openInMaps(restaurant)}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    animation: `slideUp 0.4s ease-out ${index * 0.1}s backwards`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        marginBottom: '4px',
                                    }}>
                                        {restaurant.name}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: restaurant.address ? '#888' : '#bbb',
                                        marginBottom: '6px',
                                        fontStyle: restaurant.address ? 'normal' : 'italic',
                                    }}>
                                        📍 {restaurant.address || 'Address not available'}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#666',
                                        marginBottom: '8px',
                                    }}>
                                        {restaurant.cuisine} • {restaurant.price} • {restaurant.distance} mi
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '14px',
                                    }}>
                                        <Star size={14} fill="#FFB800" stroke="#FFB800" />
                                        <span style={{ fontWeight: '600' }}>{restaurant.rating}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLike(restaurant.id);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        transition: 'transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    <Heart
                                        size={24}
                                        fill={restaurant.liked ? '#FF6B6B' : 'none'}
                                        stroke={restaurant.liked ? '#FF6B6B' : '#ddd'}
                                    />
                                </button>
                                {listFilter === 'all' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Hide "${restaurant.name}" forever? It won't appear in your Nearby list, Spin, or Discover.`)) {
                                                blacklistRestaurant(restaurant.name);
                                            }
                                        }}
                                        title="Never show again"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            transition: 'transform 0.2s',
                                            color: '#ccc',
                                            fontSize: '18px',
                                            lineHeight: 1,
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.color = '#ff4444'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#ccc'; }}
                                    >🚫</button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : null}

                {/* Load More / exhausted — only in nearby list view */}
                {listFilter === 'all' && listViewMode === 'list' && nearbyRestaurants.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
                        {hasMoreNearby ? (
                            <button
                                onClick={loadMoreNearby}
                                disabled={isLoadingMoreNearby}
                                style={{
                                    background: 'white',
                                    border: '2px solid #FF8E53',
                                    borderRadius: '12px',
                                    padding: '10px 24px',
                                    color: '#FF6B6B',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: isLoadingMoreNearby ? 'not-allowed' : 'pointer',
                                    opacity: isLoadingMoreNearby ? 0.6 : 1,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(255,107,107,0.15)',
                                }}
                            >
                                {isLoadingMoreNearby ? '🔍 Finding more…' : '🔍 Load More Restaurants'}
                            </button>
                        ) : (
                            <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
                                No more restaurants found nearby
                            </p>
                        )}
                    </div>
                )}
            </div>
            <button
                onClick={() => setShowAddModal(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(255, 107, 107, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    zIndex: 999,
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.1)';
                    e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 107, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 107, 0.4)';
                }}
            >
                <Plus size={28} />
            </button>
