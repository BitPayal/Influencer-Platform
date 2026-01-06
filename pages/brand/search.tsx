import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { indianStates } from '@/lib/utils';
import { Influencer } from '@/types';
import { Layout } from '@/components/Layout';
import { Loader2, Search, Filter, AlertCircle, Users, MapPin, RefreshCw } from 'lucide-react';

const InfluencerSearch: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [influencers, setInfluencers] = useState<Influencer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const mounted = useRef(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [minFollowers, setMinFollowers] = useState('');

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }
        
        // Initial search only if we haven't loaded data yet or explicitly want to
        if (user.role === 'marketing' && influencers.length === 0 && !loading && !error) {
             handleSearch();
        }
    }, [user, authLoading]); // Removed handleSearch from deps to avoid loops

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!mounted.current) return;
        setLoading(true);
        setError('');

        try {
            let query = supabase
                .from('influencers')
                .select('*')
                .eq('approval_status', 'approved'); // Only approved influencers

            if (searchTerm) {
                query = query.ilike('full_name', `%${searchTerm}%`);
            }

            if (selectedState) {
                query = query.eq('state', selectedState);
            }

            if (minFollowers) {
                query = query.gte('follower_count', parseInt(minFollowers));
            }

            // Add timeout to the query (60s)
            console.log("Executing Supabase search query...");
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Search timed out. Please refresh.')), 60000)
            );
            // Prevent unhandled rejection if query finishes first
            timeoutPromise.catch(() => {});

            const { data, error: searchError } = await Promise.race([
                query,
                timeoutPromise
            ]) as any;

            if (searchError) throw new Error(searchError.message || "Failed to search influencers");
            
            if (mounted.current) {
                setInfluencers(data || []);
            }
        } catch (error: any) {
            console.error("Error searching influencers:", error);
            if (mounted.current) setError(error.message || "Failed to load influencers. Please check your connection.");
        } finally {
            if (mounted.current) setLoading(false);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Find Influencers - Cehpoint</title>
            </Head>

            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Find Creators</h1>
                        <p className="mt-2 text-lg text-gray-600">Discover and connect with top influencers for your brand.</p>
                    </div>
                    {/* Fixed: changed variant='outline' to 'secondary' */}
                    <Button variant="secondary" onClick={() => router.push('/brand/dashboard')}>Back to Dashboard</Button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                        <Filter className="h-5 w-5 text-indigo-600" />
                        <h2>Filter Influencers</h2>
                    </div>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <Input
                            id="search"
                            label="Search Name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="e.g. Rahul"
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />
                        <Select
                            id="state"
                            label="Location (State)"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            options={[{value: '', label: 'All States'}, ...indianStates.map(s => ({value: s, label: s}))]}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />
                        <Input
                            id="followers"
                            label="Min Followers"
                            type="number"
                            value={minFollowers}
                            onChange={(e) => setMinFollowers(e.target.value)}
                            placeholder="1000"
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />
                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm w-full md:w-auto"
                            isLoading={loading}
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                         {/* Added Retry Button */}
                        <Button variant="danger" size="sm" onClick={() => handleSearch()}>
                            <RefreshCw className="h-4 w-4 mr-1" /> Retry
                        </Button>
                    </div>
                )}

                {/* Results */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                        <p className="text-gray-500">Searching for the best matches...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {influencers.length === 0 && !error ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                                <Users className="h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-lg font-medium text-gray-900">No influencers found</p>
                                <p className="text-gray-500 text-center max-w-sm mt-1">
                                    We couldn't find any influencers matching your criteria. Try adjusting your filters.
                                </p>
                                {/* Fixed: changed variant='link' to 'ghost' */}
                                <Button 
                                    variant="ghost" 
                                    className="mt-4 text-indigo-600 hover:bg-indigo-50"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedState('');
                                        setMinFollowers('');
                                        // We trigger a search with empty params
                                        // Need to clear states first, then search. 
                                        // Ideally, pass empty params to search fn, but simplest is just clear and let user re-click or auto-trigger.
                                        // Actually, let's just reload the page or trigger search manually.
                                        setTimeout(() => handleSearch(), 100); 
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            influencers.map((inf) => (
                                <div key={inf.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className="bg-indigo-50 text-indigo-600 h-14 w-14 rounded-full flex items-center justify-center font-bold text-xl ring-4 ring-white shadow-sm">
                                                    {inf.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                        {inf.full_name}
                                                    </h3>
                                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                                        <MapPin className="h-3.5 w-3.5 mr-1" />
                                                        {inf.state}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2 space-y-3 mb-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 flex items-center gap-1.5">
                                                    <Users className="h-4 w-4" />
                                                    Followers
                                                </span>
                                                <span className="font-bold text-gray-900">{inf.follower_count.toLocaleString()}</span>
                                            </div>
                                            <div className="h-px bg-gray-200" />
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Platform</span> 
                                                <span className="font-medium text-gray-900">Instagram / YouTube</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4">
                                            <Button 
                                                variant="primary" 
                                                className="w-full bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-none font-semibold transition-colors"
                                                onClick={() => {
                                                    router.push(`/messages?userId=${inf.user_id}`);
                                                }}
                                            >
                                                Send Message
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default InfluencerSearch;
