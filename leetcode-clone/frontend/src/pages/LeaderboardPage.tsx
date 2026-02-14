
import { useQuery } from '@tanstack/react-query';
import { insforge } from '../lib/insforge';
import { Trophy, Medal } from 'lucide-react';

export default function LeaderboardPage() {
    const { data: profiles, isLoading } = useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const { data, error } = await insforge.database
                .from('profiles')
                .select('username, solved_count, total_submissions')
                .order('solved_count', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data;
        },
        refetchInterval: 10000  // Auto-refresh every 10 seconds
    });

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center gap-3 mb-8">
                <Trophy className="text-brand-orange" size={32} />
                <h1 className="text-2xl font-bold">Leaderboard</h1>
            </div>

            <div className="bg-dark-card rounded-xl overflow-hidden border border-white/5">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-dark-sub font-medium text-sm">
                    <div className="col-span-2">Rank</div>
                    <div className="col-span-6">User</div>
                    <div className="col-span-4 text-right">Problems Solved</div>
                </div>

                <div className="divide-y divide-white/5">
                    {isLoading ? (
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 p-4 animate-pulse">
                                <div className="col-span-2"><div className="h-4 w-8 bg-white/5 rounded"></div></div>
                                <div className="col-span-6"><div className="h-4 w-32 bg-white/5 rounded"></div></div>
                                <div className="col-span-4"><div className="h-4 w-12 bg-white/5 rounded ml-auto"></div></div>
                            </div>
                        ))
                    ) : (
                        profiles?.map((profile: any, index: number) => (
                            <div key={profile.username} className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors items-center">
                                <div className="col-span-2 font-medium flex items-center gap-2">
                                    {index + 1}
                                    {index === 0 && <Medal size={16} className="text-yellow-500" />}
                                    {index === 1 && <Medal size={16} className="text-gray-400" />}
                                    {index === 2 && <Medal size={16} className="text-amber-700" />}
                                </div>
                                <div className="col-span-6 font-medium text-white">
                                    {profile.username || 'Anonymous'}
                                </div>
                                <div className="col-span-4 text-right text-brand-orange font-bold">
                                    {profile.solved_count || 0}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
