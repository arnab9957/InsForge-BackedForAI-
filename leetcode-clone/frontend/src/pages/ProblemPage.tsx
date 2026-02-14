import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insforge } from '../lib/insforge';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { Play, Send, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_EXECUTION_URL = import.meta.env.VITE_EXECUTION_API_URL || 'http://localhost:3001/execute';

export default function ProblemPage() {
    const { slug } = useParams();
    const queryClient = useQueryClient();
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');

    // Fetch Problem Details
    const { data: problem, isLoading } = useQuery({
        queryKey: ['problem', slug],
        queryFn: async () => {
            const { data, error } = await insforge.database
                .from('problems')
                .select('*')
                .eq('slug', slug)
                .single();
            if (error) throw error;
            return data;
        }
    });

    // Fetch user's latest submission for this problem and language
    const { data: latestSubmission } = useQuery({
        queryKey: ['latest-submission', slug, language],
        queryFn: async () => {
            const { data: { user } } = await insforge.auth.getCurrentUser();
            if (!user || !problem) return null;

            const { data } = await insforge.database
                .from('submissions')
                .select('*')
                .eq('problem_id', problem.id)
                .eq('user_id', user.id)
                .eq('language', language)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            return data;
        },
        enabled: !!problem?.id
    });

    // Set initial code: prioritize latest submission, fallback to template
    React.useEffect(() => {
        if (latestSubmission?.code) {
            // Load user's previous solution
            setCode(latestSubmission.code);
        } else if (problem?.template_code) {
            // Load template code if no submission exists
            setCode(problem.template_code[language] || '// Write your solution here');
        }
    }, [latestSubmission, problem, language]);



    // Execute Code Mutation
    const executeMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(MOCK_EXECUTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language,
                    code,
                    tests: problem.test_cases
                })
            });
            return response.json();
        },
        onSuccess: (data) => {
            if (data.error) {
                toast.error('Execution Error');
            } else {
                toast.success('Execution Complete');
            }
        },
        onError: () => toast.error('Failed to execute code')
    });

    // Submit Solution Mutation
    const submitMutation = useMutation({
        mutationFn: async (result: any) => {
            const { data: { user } } = await insforge.auth.getCurrentUser();

            const { error } = await insforge.database
                .from('submissions')
                .insert([{
                    user_id: user?.id,
                    problem_id: problem.id,
                    language,
                    code,
                    status: result.status || 'WA', // Simplified status logic
                    runtime: result.runtime,
                    memory: result.memory,
                    stdout: result.output
                }]);

            if (error) throw error;
            return { success: true, result };
        },
        onSuccess: (data) => {
            const result = data.result;

            // Check if all tests passed
            if (result?.status === 'AC' || (result?.passedTests && result.totalTests && result.passedTests === result.totalTests)) {
                toast.success(
                    `🎉 Accepted! All ${result.totalTests || 'test cases'} passed!\n✅ Problem Solved!`,
                    { duration: 5000 }
                );
            } else if (result?.passedTests !== undefined && result?.totalTests !== undefined) {
                toast.error(
                    `Wrong Answer\n${result.passedTests}/${result.totalTests} test cases passed`,
                    { duration: 4000 }
                );
            } else {
                toast.success('Solution Submitted!');
            }

            // Invalidate queries to refresh submission data
            queryClient.invalidateQueries({ queryKey: ['latest-submission', slug, language] });
            queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
        }
    });

    const handleRun = () => {
        executeMutation.mutate();
    };

    const handleSubmit = async () => {
        // In a real app, we'd run against hidden tests here
        const result = await executeMutation.mutateAsync();
        submitMutation.mutate(result);
    };

    if (isLoading) return <div className="text-white p-8">Loading problem...</div>;
    if (!problem) return <div className="text-red-400 p-8">Problem not found</div>;

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* Left Panel: Description */}
            <div className="w-1/2 flex flex-col border-r border-white/10">
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('description')}
                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'description' ? 'text-white border-b-2 border-brand-yellow' : 'text-dark-sub hover:text-white'}`}
                    >
                        Description
                    </button>
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'submissions' ? 'text-white border-b-2 border-brand-yellow' : 'text-dark-sub hover:text-white'}`}
                    >
                        Submissions
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'description' ? (
                        <div className="prose prose-invert max-w-none">
                            <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
                            <div className="flex gap-2 mb-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${problem.difficulty === 'EASY' ? 'bg-green-500/20 text-green-500' : ''}
                  ${problem.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                  ${problem.difficulty === 'HARD' ? 'bg-red-500/20 text-red-500' : ''}
                `}>
                                    {problem.difficulty}
                                </span>
                            </div>
                            <ReactMarkdown>{problem.description}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-dark-sub text-center py-10">
                            No submissions yet
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Editor & Console */}
            <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
                {/* Editor Header */}
                <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-dark-card">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-dark-bg text-white text-sm px-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-brand-yellow cursor-pointer"
                    >
                        <option value="javascript" className="bg-dark-bg text-white">JavaScript</option>
                        <option value="python" className="bg-dark-bg text-white">Python</option>
                        <option value="cpp" className="bg-dark-bg text-white">C++</option>
                    </select>

                    <div className="flex gap-2">
                        <button className="p-1 hover:bg-white/10 rounded">
                            <RefreshCw size={14} className="text-dark-sub" />
                        </button>
                    </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1">
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>

                {/* Console / Output */}
                <div className="h-1/3 border-t border-white/10 bg-dark-bg flex flex-col">
                    <div className="h-10 border-b border-white/10 flex items-center px-4 gap-4 bg-dark-card">
                        <span className="text-sm font-medium text-dark-sub">Console</span>
                    </div>

                    <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                        {executeMutation.isPending && <div className="text-yellow-500">Running code...</div>}
                        {executeMutation.data && (
                            <div>
                                {executeMutation.data.error ? (
                                    <div className="text-red-400">
                                        <div className="font-bold mb-2">❌ Error</div>
                                        <div>{executeMutation.data.error}</div>
                                    </div>
                                ) : (
                                    <div>
                                        {executeMutation.data.status === 'AC' && (
                                            <div className="text-green-400 font-bold mb-3">
                                                ✅ Execution Successful
                                            </div>
                                        )}

                                        {executeMutation.data.output && (
                                            <div className="text-gray-300">
                                                <div className="text-dark-sub mb-1 text-xs">Output:</div>
                                                <div className="whitespace-pre-wrap">{executeMutation.data.output}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-dark-card">
                        <button
                            onClick={handleRun}
                            disabled={executeMutation.isPending}
                            className="px-6 py-2 bg-dark-card border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Play size={16} /> Run
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitMutation.isPending || executeMutation.isPending}
                            className="px-6 py-2 bg-brand-yellow hover:bg-brand-darkYellow text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Send size={16} /> Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
