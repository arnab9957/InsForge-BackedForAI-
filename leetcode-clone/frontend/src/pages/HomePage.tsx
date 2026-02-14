
import { useQuery } from '@tanstack/react-query';
import { insforge } from '../lib/insforge';
import { Link } from 'react-router-dom';
import { Circle, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
    const { data: problems, isLoading } = useQuery({
        queryKey: ['problems'],
        queryFn: async () => {
            const { data, error } = await insforge.database
                .from('problems')
                .select('*')
                .order('id');
            if (error) throw error;
            return data;
        }
    });

    // Fetch user's solved problems
    const { data: userSubmissions } = useQuery({
        queryKey: ['user-submissions'],
        queryFn: async () => {
            const { data: { user } } = await insforge.auth.getCurrentUser();
            if (!user) return [];

            const { data } = await insforge.database
                .from('submissions')
                .select('problem_id, status')
                .eq('user_id', user.id);
            return data || [];
        }
    });

    // Helper to check problem status
    const getProblemStatus = (problemId: number) => {
        if (!userSubmissions || userSubmissions.length === 0) return 'not-attempted';
        const hasSolved = userSubmissions.some((sub: any) => sub.problem_id === problemId && sub.status === 'AC');
        if (hasSolved) return 'solved';
        const hasAttempted = userSubmissions.some((sub: any) => sub.problem_id === problemId);
        return hasAttempted ? 'attempted' : 'not-attempted';
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Pick One</h1>
                <div className="flex gap-2">
                    {/* Filters could go here */}
                </div>
            </div>

            <div className="bg-dark-card rounded-xl overflow-hidden border border-white/5">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-dark-sub font-medium text-sm">
                    <div className="col-span-1">Status</div>
                    <div className="col-span-6">Title</div>
                    <div className="col-span-3">Difficulty</div>
                    <div className="col-span-2">Acceptance</div>
                </div>

                <div className="divide-y divide-white/5">
                    {isLoading ? (
                        // Skeleton Loader
                        [1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 p-4 animate-pulse">
                                <div className="col-span-1"><div className="h-4 w-4 bg-white/5 rounded-full"></div></div>
                                <div className="col-span-6"><div className="h-4 w-48 bg-white/5 rounded"></div></div>
                                <div className="col-span-3"><div className="h-4 w-16 bg-white/5 rounded"></div></div>
                                <div className="col-span-2"><div className="h-4 w-12 bg-white/5 rounded"></div></div>
                            </div>
                        ))
                    ) : (
                        // Problem List
                        problems?.map((problem: any) => {
                            const status = getProblemStatus(problem.id);
                            return (
                                <div key={problem.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors items-center group">
                                    <div className="col-span-1">
                                        {status === 'solved' ? (
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        ) : status === 'attempted' ? (
                                            <Circle size={16} className="text-yellow-500" />
                                        ) : (
                                            <Circle size={16} className="text-dark-sub" />
                                        )}
                                    </div>
                                    <div className="col-span-6">
                                        <Link to={`/problem/${problem.slug}`} className="font-medium group-hover:text-brand-yellow transition-colors">
                                            {problem.title}
                                        </Link>
                                        <div className="flex gap-2 mt-1">
                                            {problem.tags && problem.tags.map((tag: string) => (
                                                <span key={tag} className="text-xs bg-dark-bg px-2 py-0.5 rounded-full text-dark-sub">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <span className={`
                                        ${problem.difficulty === 'EASY' ? 'text-green-500' : ''}
                                        ${problem.difficulty === 'MEDIUM' ? 'text-yellow-500' : ''}
                                        ${problem.difficulty === 'HARD' ? 'text-red-500' : ''}
                                        font-medium text-sm
                                    `}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-dark-sub text-sm">
                                        {problem.acceptance_rate}%
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
