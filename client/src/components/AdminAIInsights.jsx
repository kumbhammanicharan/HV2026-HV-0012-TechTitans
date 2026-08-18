import React, { useMemo, useState } from 'react';
import {
    AlertTriangle,
    BarChart3,
    Bot,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock3,
    RefreshCw,
    Sparkles,
    Star,
    TrendingUp,
    Users,
    Wrench,
} from 'lucide-react';

const formatNumber = (value) =>
    Number(value || 0).toLocaleString();

const formatPercent = (value) =>
    `${Number(value || 0).toFixed(1)}%`;

const getDate = (complaint) =>
    new Date(
        complaint?.date ||
        complaint?.createdAt ||
        Date.now()
    );

const getDepartment = (complaint) =>
    complaint?.assignedTo?.department ||
    complaint?.raisedBy?.department ||
    '';

const getCategory = (complaint) =>
    complaint?.category ||
    'Uncategorized';

const InsightIcon = ({ type }) => {
    if (type === 'critical') return <AlertTriangle size={19} />;
    if (type === 'warning') return <Clock3 size={19} />;
    if (type === 'positive') return <CheckCircle2 size={19} />;
    if (type === 'trend') return <TrendingUp size={19} />;
    if (type === 'technician') return <Wrench size={19} />;
    return <BarChart3 size={19} />;
};

const typeStyles = {
    critical: {
        icon: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
        badge: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
        border: 'border-red-100 dark:border-red-900/40',
    },
    warning: {
        icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
        border: 'border-amber-100 dark:border-amber-900/40',
    },
    positive: {
        icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
        border: 'border-emerald-100 dark:border-emerald-900/40',
    },
    trend: {
        icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
        border: 'border-blue-100 dark:border-blue-900/40',
    },
    technician: {
        icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
        badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300',
        border: 'border-violet-100 dark:border-violet-900/40',
    },
};

const AIInsightCard = ({ insight }) => {
    const styles = typeStyles[insight.type] || typeStyles.trend;

    return (
        <div
            className={`rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-800 ${styles.border}`}
        >
            <div className="flex gap-3">
                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
                >
                    <InsightIcon type={insight.type} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                            {insight.title}
                        </h3>

                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles.badge}`}
                        >
                            {insight.label}
                        </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {insight.message}
                    </p>

                    {insight.metric && (
                        <div className="mt-3 inline-flex rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {insight.metric}
                        </div>
                    )}

                    {insight.action && (
                        <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Recommendation: {insight.action}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const AdminAIInsights = ({
    complaints = [],
    performance = [],
    complaintStats = {},
    performanceSummary = {},
    onRefresh,
    refreshing = false,
}) => {
    const [expanded, setExpanded] = useState(false);

    const insights = useMemo(() => {
        const result = [];

        const totalComplaints =
            Number(complaintStats.total) || complaints.length;

        /*
         * 1. Department / category hotspot
         * Prefer technician/student department when available.
         * Fall back to complaint category so the insight still works
         * with older complaint records.
         */
        const departmentCounts = {};
        complaints.forEach((complaint) => {
            const department = getDepartment(complaint);

            if (department) {
                departmentCounts[department] =
                    (departmentCounts[department] || 0) + 1;
            }
        });

        const departmentEntries = Object.entries(
            departmentCounts
        ).sort((a, b) => b[1] - a[1]);

        const categoryCounts = {};
        complaints.forEach((complaint) => {
            const category = getCategory(complaint);
            categoryCounts[category] =
                (categoryCounts[category] || 0) + 1;
        });

        const categoryEntries = Object.entries(
            categoryCounts
        ).sort((a, b) => b[1] - a[1]);

        if (departmentEntries.length) {
            const [department, count] =
                departmentEntries[0];
            const percentage =
                totalComplaints > 0
                    ? (count / totalComplaints) * 100
                    : 0;

            if (
                percentage >= 20 ||
                count >= 5
            ) {
                result.push({
                    type: 'critical',
                    label: 'Infrastructure',
                    title: 'Department Hotspot',
                    message: `${department} has ${formatNumber(
                        count
                    )} complaints, representing ${formatPercent(
                        percentage
                    )} of all complaints. This concentration may indicate recurring infrastructure or service issues in this department.`,
                    metric: `${formatNumber(
                        count
                    )} complaints • ${formatPercent(
                        percentage
                    )} share`,
                    action: `Inspect recurring issues and review infrastructure/service conditions in ${department}.`,
                });
            }
        }

        if (!result.length && categoryEntries.length) {
            const [category, count] =
                categoryEntries[0];
            const percentage =
                totalComplaints > 0
                    ? (count / totalComplaints) * 100
                    : 0;

            result.push({
                type: 'critical',
                label: 'Hotspot',
                title: 'Complaint Category Concentration',
                message: `${category} is the most reported complaint category with ${formatNumber(
                    count
                )} complaints (${formatPercent(
                    percentage
                )} of all complaints).`,
                metric: `${formatNumber(
                    count
                )} complaints • ${formatPercent(
                    percentage
                )} share`,
                action: `Investigate recurring ${category.toLowerCase()} issues and consider preventive action.`,
            });
        }

        /*
         * 2. Technician attention
         * Specifically detect low rating + lower-than-average workload.
         */
        const techniciansWithData = performance.filter(
            (item) => item?.technician
        );

        const averageAssigned =
            techniciansWithData.length
                ? techniciansWithData.reduce(
                      (sum, item) =>
                          sum +
                          Number(
                              item?.complaints?.total || 0
                          ),
                      0
                  ) /
                  techniciansWithData.length
                : 0;

        const lowRatingLowWorkload =
            techniciansWithData
                .filter((item) => {
                    const rating =
                        Number(
                            item?.reviews
                                ?.averageRating || 0
                        );
                    const reviews =
                        Number(
                            item?.reviews?.total || 0
                        );
                    const assigned =
                        Number(
                            item?.complaints?.total || 0
                        );

                    return (
                        reviews > 0 &&
                        rating < 3 &&
                        assigned <
                            averageAssigned
                    );
                })
                .sort(
                    (a, b) =>
                        Number(
                            a?.reviews?.averageRating ||
                                0
                        ) -
                        Number(
                            b?.reviews?.averageRating ||
                                0
                        )
                );

        if (lowRatingLowWorkload.length) {
            const item =
                lowRatingLowWorkload[0];
            const name =
                item.technician?.name ||
                'Technician';
            const rating =
                Number(
                    item.reviews?.averageRating ||
                        0
                );
            const assigned =
                Number(
                    item.complaints?.total || 0
                );

            result.push({
                type: 'technician',
                label: 'Attention',
                title: 'Technician Performance Alert',
                message: `${name} has a low student rating of ${rating.toFixed(
                    1
                )}/5 and only ${formatNumber(
                    assigned
                )} assigned complaints, below the team average of ${averageAssigned.toFixed(
                    1
                )}.`,
                metric: `${rating.toFixed(
                    1
                )}/5 rating • ${formatNumber(
                    assigned
                )} assigned`,
                action: `Review workload allocation and recent student feedback for ${name}.`,
            });
        } else {
            const lowRating =
                techniciansWithData
                    .filter(
                        (item) =>
                            Number(
                                item?.reviews
                                    ?.averageRating ||
                                    0
                            ) > 0 &&
                            Number(
                                item?.reviews
                                    ?.averageRating ||
                                    0
                            ) < 3
                    )
                    .sort(
                        (a, b) =>
                            Number(
                                a?.reviews
                                    ?.averageRating ||
                                    0
                            ) -
                            Number(
                                b?.reviews
                                    ?.averageRating ||
                                    0
                            )
                    )[0];

            if (lowRating) {
                const name =
                    lowRating.technician
                        ?.name ||
                    'Technician';
                const rating =
                    Number(
                        lowRating.reviews
                            ?.averageRating || 0
                    );

                result.push({
                    type: 'technician',
                    label: 'Attention',
                    title: 'Low Technician Rating',
                    message: `${name} currently has the lowest recorded student rating at ${rating.toFixed(
                        1
                    )}/5.`,
                    metric: `${rating.toFixed(1)}/5`,
                    action: `Review recent feedback and resolution quality for ${name}.`,
                });
            }
        }

        /*
         * 3. Overdue unresolved complaints using dueInDays.
         */
        const now = new Date();

        const overdue = complaints.filter(
            (complaint) => {
                if (
                    complaint?.status ===
                    'resolved'
                ) {
                    return false;
                }

                const created =
                    getDate(complaint);
                const dueDays =
                    Number(
                        complaint?.dueInDays
                    );

                if (
                    Number.isNaN(
                        created.getTime()
                    ) ||
                    ![1, 2, 3].includes(
                        dueDays
                    )
                ) {
                    return false;
                }

                const dueDate =
                    new Date(created);
                dueDate.setDate(
                    dueDate.getDate() +
                        dueDays
                );

                return dueDate < now;
            }
        );

        if (overdue.length) {
            const percentage =
                totalComplaints > 0
                    ? (overdue.length /
                          totalComplaints) *
                      100
                    : 0;

            result.push({
                type:
                    overdue.length >= 5
                        ? 'critical'
                        : 'warning',
                label: 'Delay',
                title: 'Overdue Complaints',
                message: `${formatNumber(
                    overdue.length
                )} unresolved complaints have passed their expected resolution period.`,
                metric: `${formatNumber(
                    overdue.length
                )} overdue • ${formatPercent(
                    percentage
                )} of all complaints`,
                action: 'Prioritize overdue complaints and review technician workload or recurring blockers.',
            });
        } else {
            result.push({
                type: 'positive',
                label: 'On Track',
                title: 'Resolution Timeliness',
                message:
                    'No unresolved complaints currently appear to have exceeded their expected resolution period.',
                metric: '0 overdue complaints',
                action: 'Continue monitoring resolution timelines.',
            });
        }

        /*
         * 4. Seven-day complaint trend.
         */
        const sevenDaysAgo =
            new Date(now);
        sevenDaysAgo.setDate(
            sevenDaysAgo.getDate() - 7
        );

        const fourteenDaysAgo =
            new Date(now);
        fourteenDaysAgo.setDate(
            fourteenDaysAgo.getDate() - 14
        );

        let recentCount = 0;
        let previousCount = 0;

        complaints.forEach((complaint) => {
            const date = getDate(complaint);

            if (
                date >= sevenDaysAgo &&
                date <= now
            ) {
                recentCount++;
            } else if (
                date >= fourteenDaysAgo &&
                date < sevenDaysAgo
            ) {
                previousCount++;
            }
        });

        if (
            recentCount > 0 ||
            previousCount > 0
        ) {
            const change =
                previousCount > 0
                    ? ((recentCount -
                          previousCount) /
                          previousCount) *
                      100
                    : recentCount > 0
                    ? 100
                    : 0;

            if (change >= 10) {
                result.push({
                    type: 'trend',
                    label: 'Rising',
                    title: 'Complaint Trend',
                    message: `The last 7 days recorded ${formatNumber(
                        recentCount
                    )} complaints compared with ${formatNumber(
                        previousCount
                    )} in the previous 7-day period.`,
                    metric: `${change >= 0 ? '+' : ''}${change.toFixed(
                        1
                    )}% week-over-week`,
                    action: 'Check the categories and departments driving the increase before it becomes a larger backlog.',
                });
            } else if (change <= -10) {
                result.push({
                    type: 'positive',
                    label: 'Improving',
                    title: 'Complaint Trend',
                    message: `Complaint volume fell to ${formatNumber(
                        recentCount
                    )} in the last 7 days from ${formatNumber(
                        previousCount
                    )} in the previous 7 days.`,
                    metric: `${change.toFixed(
                        1
                    )}% week-over-week`,
                    action: 'Maintain the current resolution practices and monitor whether the improvement continues.',
                });
            } else {
                result.push({
                    type: 'trend',
                    label: 'Stable',
                    title: 'Complaint Trend',
                    message: `The last 7 days recorded ${formatNumber(
                        recentCount
                    )} complaints versus ${formatNumber(
                        previousCount
                    )} in the previous 7 days.`,
                    metric: `${change >= 0 ? '+' : ''}${change.toFixed(
                        1
                    )}% week-over-week`,
                    action: 'Monitor recurring categories and departments for emerging issues.',
                });
            }
        }

        /*
         * 5. Overall service health.
         */
        const resolutionRate =
            Number(
                performanceSummary
                    ?.overallResolutionPercentage
            ) ||
            (totalComplaints > 0
                ? (Number(
                      complaintStats.resolved || 0
                  ) /
                      totalComplaints) *
                  100
                : 0);

        const averageRating =
            Number(
                performanceSummary
                    ?.averageTechnicianRating
            ) || 0;

        const totalReviews =
            Number(
                performanceSummary?.totalReviews
            ) || 0;

        if (resolutionRate >= 80) {
            result.push({
                type: 'positive',
                label: 'Healthy',
                title: 'Overall Service Health',
                message: `${formatPercent(
                    resolutionRate
                )} of assigned complaints are resolved, with an average technician rating of ${averageRating.toFixed(
                    1
                )}/5.`,
                metric: `${formatPercent(
                    resolutionRate
                )} resolution • ${averageRating.toFixed(
                    1
                )}/5 rating • ${formatNumber(
                    totalReviews
                )} reviews`,
                action: 'Maintain current performance while addressing the specific alerts above.',
            });
        } else {
            result.push({
                type:
                    resolutionRate < 50
                        ? 'critical'
                        : 'warning',
                label: 'Monitor',
                title: 'Overall Service Health',
                message: `The current resolution rate is ${formatPercent(
                    resolutionRate
                )}, with an average technician rating of ${averageRating.toFixed(
                    1
                )}/5.`,
                metric: `${formatPercent(
                    resolutionRate
                )} resolution • ${averageRating.toFixed(
                    1
                )}/5 rating`,
                action: 'Prioritize pending and overdue complaints and review technician capacity.',
            });
        }

        return result.slice(0, 5);
    }, [
        complaints,
        performance,
        complaintStats,
        performanceSummary,
    ]);

    const visibleInsights = expanded
        ? insights
        : insights.slice(0, 3);

    return (
        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm dark:border-indigo-900/40 dark:bg-slate-800">
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-5 py-5 text-white sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                            <Bot size={24} />
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-extrabold">
                                    AI Insights
                                </h2>
                                <Sparkles size={16} />
                            </div>

                            <p className="mt-0.5 text-xs text-indigo-100 sm:text-sm">
                                Real-time recommendations from your dashboard data
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-indigo-100 sm:inline-flex">
                            Live dashboard analysis
                        </span>

                        {onRefresh && (
                            <button
                                type="button"
                                onClick={onRefresh}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={14}
                                    className={
                                        refreshing
                                            ? 'animate-spin'
                                            : ''
                                    }
                                />
                                Refresh
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                {insights.length ? (
                    <>
                        <div className="grid gap-3 lg:grid-cols-2">
                            {visibleInsights.map(
                                (insight, index) => (
                                    <AIInsightCard
                                        key={`${insight.title}-${index}`}
                                        insight={insight}
                                    />
                                )
                            )}
                        </div>

                        {insights.length > 3 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setExpanded(
                                        (value) =>
                                            !value
                                    )
                                }
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                {expanded ? (
                                    <>
                                        Show fewer insights
                                        <ChevronUp
                                            size={17}
                                        />
                                    </>
                                ) : (
                                    <>
                                        View all AI insights
                                        <ChevronDown
                                            size={17}
                                        />
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                        <Bot
                            className="mx-auto mb-2 text-indigo-500"
                            size={28}
                        />
                        <p className="font-semibold text-slate-700 dark:text-slate-200">
                            Not enough data for AI insights yet.
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Insights will appear as complaint and technician data grows.
                        </p>
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                        Based on current complaints, technician performance and feedback
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Users size={11} />
                        Data-driven
                    </span>
                </div>
            </div>
        </section>
    );
};

export default AdminAIInsights;
