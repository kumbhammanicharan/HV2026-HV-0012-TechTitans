import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Bot, ChevronDown, MessageCircle, Send, Sparkles, X } from 'lucide-react';

const API_URL = 'https://campuscare-backend-jq45.onrender.com';

const formatDate = (value) => {
    if (!value) return 'Not available';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return 'Not available';
    }

    return date.toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatStatus = (status) => {
    const value = String(status || 'pending')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return value;
};

const statusTone = (status) => {
    if (status === 'resolved') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (status === 'in-progress') return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
};

const getComplaints = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('Please log in as a student to use the AI Chatbot.');
    }

    const response = await axios.get(
        `${API_URL}/api/complaints/my`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return Array.isArray(response.data) ? response.data : [];
};

const Assistant = () => {
    const [open, setOpen] = useState(false);
    const [complaints, setComplaints] = useState([]);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Hi! I’m your AI Chatbot for CampusCare. I can answer questions about your complaints, status, technician assignment, progress, and resolution details.',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [showQuestions, setShowQuestions] = useState(true);

    const messagesEndRef = useRef(null);

    const questions = useMemo(
        () => [
            'What is the progress of my complaint?',
            'Which technician is assigned to my complaint?',
            'What is the current status of my complaint?',
            'Show my latest complaint',
            'Show all my complaints',
            'Do I have any pending complaints?',
            'Do I have any unresolved complaints?',
            'Which complaints are resolved?',
            'When was my latest complaint submitted?',
            'When was my complaint last updated?',
            'Is my complaint resolved?',
        ],
        []
    );

    useEffect(() => {
        if (!open) return;

        const loadComplaints = async () => {
            try {
                setLoadingData(true);
                const data = await getComplaints();
                setComplaints(data);
            } catch (error) {
                console.error('AI Chatbot complaint fetch error:', error);
            } finally {
                setLoadingData(false);
            }
        };

        loadComplaints();
    }, [open]);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: 'smooth',
                });
            }, 50);
        }
    }, [messages, open]);

    const latestComplaint = complaints[0];

    const findRelevantComplaint = (question) => {
        const lower = question.toLowerCase();

        if (latestComplaint) {
            return latestComplaint;
        }

        return null;
    };

    const buildAnswer = (question) => {
        const lower = question.toLowerCase().trim();

        if (!complaints.length) {
            return {
                text: 'I could not find any complaints linked to your account. Please submit a complaint first, then I can help you track it.',
            };
        }

        const complaint = findRelevantComplaint(lower);

        if (
            lower.includes('how many') ||
            lower.includes('number of complaints') ||
            lower.includes('total complaints')
        ) {
            const pending = complaints.filter((c) => c.status === 'pending').length;
            const inProgress = complaints.filter((c) => c.status === 'in-progress').length;
            const resolved = complaints.filter((c) => c.status === 'resolved').length;

            return {
                text: `You have ${complaints.length} complaint${complaints.length === 1 ? '' : 's'} in total.\n\n🟡 Pending: ${pending}\n🔵 In Progress: ${inProgress}\n🟢 Resolved: ${resolved}`,
            };
        }

        if (
            lower.includes('all my complaints') ||
            lower.includes('show my complaints') ||
            lower.includes('list my complaints')
        ) {
            const list = complaints
                .map(
                    (c, index) =>
                        `${index + 1}. ${c.title || 'Untitled complaint'}\n   Status: ${formatStatus(c.status)}\n   Category: ${c.category || 'Not specified'}`
                )
                .join('\n\n');

            return {
                text: `Here are your complaints:\n\n${list}`,
            };
        }

        if (lower.includes('pending')) {
            const pending = complaints.filter((c) => c.status === 'pending');

            if (!pending.length) {
                return { text: 'You currently have no pending complaints. 🎉' };
            }

            return {
                text:
                    `You have ${pending.length} pending complaint${pending.length === 1 ? '' : 's'}:\n\n` +
                    pending
                        .map(
                            (c, index) =>
                                `${index + 1}. ${c.title || 'Untitled complaint'}\n   Category: ${c.category || 'Not specified'}\n   Submitted: ${formatDate(c.date || c.createdAt)}`
                        )
                        .join('\n\n'),
            };
        }

        if (
            lower.includes('unresolved') ||
            lower.includes('not resolved')
        ) {
            const unresolved = complaints.filter(
                (c) => c.status !== 'resolved'
            );

            if (!unresolved.length) {
                return { text: 'All your complaints are resolved. 🎉' };
            }

            return {
                text:
                    `You have ${unresolved.length} unresolved complaint${unresolved.length === 1 ? '' : 's'}:\n\n` +
                    unresolved
                        .map(
                            (c, index) =>
                                `${index + 1}. ${c.title || 'Untitled complaint'}\n   Status: ${formatStatus(c.status)}`
                        )
                        .join('\n\n'),
            };
        }

        if (
            lower.includes('resolved complaints') ||
            lower.includes('which complaints are resolved')
        ) {
            const resolved = complaints.filter(
                (c) => c.status === 'resolved'
            );

            if (!resolved.length) {
                return { text: 'You do not have any resolved complaints yet.' };
            }

            return {
                text:
                    `You have ${resolved.length} resolved complaint${resolved.length === 1 ? '' : 's'}:\n\n` +
                    resolved
                        .map(
                            (c, index) =>
                                `${index + 1}. ${c.title || 'Untitled complaint'}\n   Resolved: ${formatDate(c.resolvedAt)}`
                        )
                        .join('\n\n'),
            };
        }

        if (
            lower.includes('technician') ||
            lower.includes('assigned to') ||
            lower.includes('who is handling') ||
            lower.includes('who is working')
        ) {
            const technician = complaint?.assignedTo;

            if (!technician) {
                return {
                    text: `Your latest complaint, "${complaint?.title || 'complaint'}", has not been assigned to a technician yet.`,
                };
            }

            return {
                text: `Your latest complaint, "${complaint.title}", is assigned to:\n\n👨‍🔧 ${technician.name || 'Technician'}\nDepartment: ${technician.department || 'Not specified'}\nEmail: ${technician.email || 'Not available'}\n\nAssigned on: ${formatDate(complaint.assignedAt)}`,
            };
        }

        if (
            lower.includes('progress') ||
            lower.includes('where is my complaint') ||
            lower.includes('tracking details') ||
            lower.includes('track my complaint')
        ) {
            const updates = Array.isArray(complaint.staffUpdates)
                ? complaint.staffUpdates
                : [];

            const updateText = updates.length
                ? updates
                      .slice()
                      .reverse()
                      .map(
                          (update, index) =>
                              `${index + 1}. ${formatStatus(update.status)} — ${update.remarks || 'No remarks'}\n   ${formatDate(update.updatedAt)}`
                      )
                      .join('\n\n')
                : 'No technician progress updates have been added yet.';

            return {
                text: `Here are the latest tracking details for your complaint:\n\n📌 ${complaint.title}\nCategory: ${complaint.category || 'Not specified'}\nStatus: ${formatStatus(complaint.status)}\nTechnician: ${complaint.assignedTo?.name || 'Not assigned'}\nSubmitted: ${formatDate(complaint.date || complaint.createdAt)}\nAssigned: ${formatDate(complaint.assignedAt)}\nLast updated: ${formatDate(complaint.updatedAt)}\nResolved: ${formatDate(complaint.resolvedAt)}\n\nProgress updates:\n${updateText}`,
            };
        }

        if (
            lower.includes('status') ||
            lower.includes('current status')
        ) {
            return {
                text: `The current status of your latest complaint, "${complaint.title}", is:\n\n${formatStatus(complaint.status)}`,
            };
        }

        if (
            lower.includes('latest complaint') ||
            lower.includes('recent complaint')
        ) {
            return {
                text: `Your latest complaint:\n\n📌 ${complaint.title}\nCategory: ${complaint.category || 'Not specified'}\nDescription: ${complaint.description || 'Not available'}\nStatus: ${formatStatus(complaint.status)}\nTechnician: ${complaint.assignedTo?.name || 'Not assigned'}\nSubmitted: ${formatDate(complaint.date || complaint.createdAt)}\nLast updated: ${formatDate(complaint.updatedAt)}`,
            };
        }

        if (
            lower.includes('submitted') ||
            lower.includes('when did i submit')
        ) {
            return {
                text: `Your latest complaint, "${complaint.title}", was submitted on ${formatDate(complaint.date || complaint.createdAt)}.`,
            };
        }

        if (
            lower.includes('last updated') ||
            lower.includes('updated')
        ) {
            return {
                text: `Your latest complaint, "${complaint.title}", was last updated on ${formatDate(complaint.updatedAt)}.`,
            };
        }

        if (
            lower.includes('resolved') ||
            lower.includes('is my complaint resolved')
        ) {
            if (complaint.status === 'resolved') {
                return {
                    text: `Yes. Your latest complaint, "${complaint.title}", has been resolved.\n\nResolved on: ${formatDate(complaint.resolvedAt)}\n\nResolution: ${complaint.resolutionNotes || 'No resolution notes were added.'}`,
                };
            }

            return {
                text: `No. Your latest complaint is currently ${formatStatus(complaint.status)}.`,
            };
        }

        if (lower.includes('feedback')) {
            if (complaint.status === 'resolved') {
                return {
                    text: 'Your complaint is resolved, so you can submit feedback from the complaint details page.',
                };
            }

            return {
                text: 'Feedback is available after your complaint is resolved.',
            };
        }

        return {
            text: 'I can help you with your complaint tracking. Try one of the suggested questions below.',
        };
    };

    const askQuestion = async (question) => {
        const trimmed = question.trim();

        if (!trimmed || loading) return;

        setMessages((current) => [
            ...current,
            {
                id: Date.now(),
                type: 'user',
                text: trimmed,
            },
        ]);

        setInput('');
        setShowQuestions(false);
        setLoading(true);

        try {
            let currentComplaints = complaints;

            if (!currentComplaints.length) {
                currentComplaints = await getComplaints();
                setComplaints(currentComplaints);
            }

            const answer = buildAnswer(trimmed);

            setTimeout(() => {
                setMessages((current) => [
                    ...current,
                    {
                        id: Date.now() + 1,
                        type: 'bot',
                        text: answer.text,
                    },
                ]);
                setLoading(false);
            }, 350);
        } catch (error) {
            console.error('AI Chatbot error:', error);

            setMessages((current) => [
                ...current,
                {
                    id: Date.now() + 1,
                    type: 'bot',
                    text: 'I could not access your complaint details right now. Please try again.',
                },
            ]);

            setLoading(false);
        }
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open AI Chatbot"
                className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-white shadow-2xl shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-indigo-600/40 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                    <Bot size={21} />
                </span>

                <span className="text-sm font-bold">
                    AI Chatbot
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[99999] flex max-h-[calc(100vh-3rem)] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900">
            {/* Header */}
            <div className="relative z-10 shrink-0 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-5 py-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                            <Bot size={24} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-extrabold">
                                    CampusCare AI Chatbot
                                </h2>
                                <Sparkles size={15} />
                            </div>

                            <p className="mt-0.5 text-xs text-indigo-100">
                                Your personal complaint assistant
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close AI Chatbot"
                        className="rounded-xl p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-indigo-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_3px_rgba(110,231,183,0.15)]" />
                    Connected to your complaint tracking
                </div>
            </div>

            {/* Messages */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-950">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`mb-4 flex ${
                            message.type === 'user'
                                ? 'justify-end'
                                : 'justify-start'
                        }`}
                    >
                        <div
                            className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                message.type === 'user'
                                    ? 'rounded-br-md bg-indigo-600 text-white'
                                    : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                            }`}
                        >
                            {message.type === 'bot' && (
                                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    <Bot size={14} />
                                    AI Chatbot
                                </div>
                            )}

                            <div className="whitespace-pre-line">
                                {message.text}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="mb-4 flex justify-start">
                        <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.2s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.1s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                            </div>
                        </div>
                    </div>
                )}

                {messages.length <= 1 && (
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => setShowQuestions((value) => !value)}
                            className="mb-2 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        >
                            <span className="flex items-center gap-2">
                                <MessageCircle size={15} />
                                Suggested questions
                            </span>
                            <ChevronDown
                                size={16}
                                className={`transition-transform ${
                                    showQuestions ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        {showQuestions && (
                            <div className="space-y-2">
                                {questions.slice(0, 6).map((question) => (
                                    <button
                                        key={question}
                                        type="button"
                                        disabled={loading || loadingData}
                                        onClick={() => askQuestion(question)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        askQuestion(input);
                    }}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:ring-indigo-950"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Ask about your complaint..."
                        className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                    />

                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        aria-label="Send question"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Send size={17} />
                    </button>
                </form>

                <p className="mt-2 text-center text-[10px] text-slate-400">
                    Answers are based on your CampusCare complaint data.
                </p>
            </div>
        </div>
    );
};

export default Assistant;
