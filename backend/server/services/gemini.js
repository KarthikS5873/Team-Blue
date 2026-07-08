import { GoogleGenAI, Type } from '@google/genai';
import { formatINR, aggregateByCategory } from './format.js';

let aiClient = null;

export function autoAssignPriority(title, deadline, businessProfile) {
  const lower = (title || '').toLowerCase();

  const highKeywords = [
    'client', 'deliverable', 'invoice', 'payment', 'proposal', 'contract', 'agreement',
    'revision', 'urgent', 'meeting', 'call', 'revenue', 'sale', 'deal',
    'pitch', 'presentation', 'launch', 'release', 'deploy', 'review', 'approval',
    'follow up', 'follow-up', 'send to', 'deliver to', 'submit', 'quote', 'estimate',
    'close', 'win', 'sign', 'onboard', 'kickoff', 'milestone',
    'pay', 'bill', 'money', 'receipt',
    'bug', 'fix', 'error', 'issue', 'critical', 'emergency',
    'complaint', 'escalation', 'overdue', 'due today', 'due tomorrow',
    'prospect', 'lead', 'opportunity', 'quote', 'statement',
    'hire', 'freelance', 'gig', 'assignment', 'brief',
    'action', 'response', 'reply', 'confirm', 'schedule',
    'write', 'draft', 'prepare', 'create', 'develop', 'build',
    'complete', 'finish', 'finalize', 'deliver'
  ];
  const lowKeywords = [
    'clean', 'organize', 'admin', 'archive', 'sort', 'tidy', 'label',
    'cleanup', 'clean up', 'trash', 'spam', 'junk',
    'read', 'reading', 'blog', 'article', 'watch', 'video', 'tutorial',
    'browse', 'surf', 'scroll', 'notification',
    'organizing', 'cleanup'
  ];

  let priority = 'medium';

  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      console.log(`[autoAssign] title="${title}" -> high (deadline <= 1 day)`);
      return 'high';
    }
    if (diffDays <= 3) {
      priority = 'high';
    }
  }

  for (const kw of highKeywords) {
    if (lower.includes(kw)) {
      console.log(`[autoAssign] title="${title}" keyword="${kw}" -> high`);
      return 'high';
    }
  }

  for (const kw of lowKeywords) {
    if (lower.includes(kw)) {
      console.log(`[autoAssign] title="${title}" keyword="${kw}" -> low`);
      return 'low';
    }
  }

  console.log(`[autoAssign] title="${title}" -> ${priority} (no keywords matched)`);
  return priority;
}

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'business-advisor' }
      }
    });
  }
  return aiClient;
}

function computeFreelancerMetrics(businessProfile, todayActivities, pastActivities, tasks) {
  const allActivities = [...todayActivities, ...pastActivities];

  const totalHours = allActivities.reduce((s, a) => s + (Number(a.hours_spent) || 0), 0);
  const billableHours = allActivities.filter(a => a.category === 'Client Work').reduce((s, a) => s + (Number(a.hours_spent) || 0), 0);
  const adminHours = allActivities.filter(a => a.category === 'Admin & Finance').reduce((s, a) => s + (Number(a.hours_spent) || 0), 0);
  const marketingHours = allActivities.filter(a => a.category === 'Marketing').reduce((s, a) => s + (Number(a.hours_spent) || 0), 0);
  const learningHours = allActivities.filter(a => a.category === 'Skill Development').reduce((s, a) => s + (Number(a.hours_spent) || 0), 0);
  const networkingHours = allActivities.filter(a => a.category === 'Networking').reduce((s, a) => s + (Number(a.hours_spent) || 0), 0);
  const proposalsHours = allActivities.filter(a => a.category === 'Proposals & Pitches').reduce((s, a) => s + (Number(a.hours_spent) || 0), 0);

  const monthlyRev = Number(businessProfile.monthly_revenue) || 0;
  const nonBillableHours = totalHours - billableHours;
  const utilizationRate = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;
  const effectiveHourlyRate = billableHours > 0 ? Math.round((monthlyRev / 22) / (billableHours / Math.max(1, Math.ceil(totalHours / 8)))) : 0;
  const adminPct = totalHours > 0 ? Math.round((adminHours / totalHours) * 100) : 0;
  const marketingPct = totalHours > 0 ? Math.round((marketingHours / totalHours) * 100) : 0;
  const networkingPct = totalHours > 0 ? Math.round((networkingHours / totalHours) * 100) : 0;
  const learningPct = totalHours > 0 ? Math.round((learningHours / totalHours) * 100) : 0;
  const proposalsPct = totalHours > 0 ? Math.round((proposalsHours / totalHours) * 100) : 0;
  const focusScore = totalHours > 0 ? Math.round(((billableHours + proposalsHours) / totalHours) * 100) : 0;
  const proposalsSent = allActivities.filter(a => a.category === 'Proposals & Pitches').length;
  const costOfNonBillable = monthlyRev > 0 && totalHours > 0
    ? Math.round(((adminHours + marketingHours + networkingHours) / totalHours) * monthlyRev)
    : 0;

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return {
    totalHours, billableHours, nonBillableHours, adminHours, marketingHours,
    learningHours, networkingHours, proposalsHours, monthlyRev, utilizationRate,
    effectiveHourlyRate, adminPct, marketingPct, networkingPct, learningPct,
    proposalsPct, focusScore, proposalsSent, costOfNonBillable, taskCompletionRate
  };
}

function fallbackRecommendations(businessProfile, todayActivities, pastActivities, tasks) {
  const m = computeFreelancerMetrics(businessProfile, todayActivities, pastActivities, tasks);
  const allActivities = [...todayActivities, ...pastActivities];
  const recommendations = [];
  const timeWastedTasks = [];
  const areasToFocus = [];

  const sortedByHours = {};
  allActivities.forEach(a => {
    const name = a.activity_name || 'General';
    const cat = a.category || 'Other';
    const hrs = Number(a.hours_spent) || 0;
    if (!sortedByHours[name]) sortedByHours[name] = { name, category: cat, hours: 0 };
    sortedByHours[name].hours += hrs;
  });
  const sortedActivities = Object.values(sortedByHours).sort((a, b) => b.hours - a.hours);

  const isRecreational = (name) => /drawing|sketch|paint|music|song|game|play|watch|movie|tv|sleep|rest|fun|hobby|leisure|lunch|dinner|break|gym|exercise|workout|coffee|relax|nap/i.test(name);

  if (m.utilizationRate < 50 && m.totalHours > 0) {
    recommendations.push({
      priority: 'Critical',
      title: `Increase billable utilization from ${m.utilizationRate}% to 60%+`,
      timeSpent: `${m.billableHours.toFixed(1)}h billable of ${m.totalHours.toFixed(1)}h total`,
      category: 'Client Work',
      businessContribution: 'High',
      productivityImpact: 'High',
      revenueContribution: 'High',
      automationPotential: 'Medium',
      whyFlagged: `Your utilization rate is ${m.utilizationRate}% — well below the 60-75% target for healthy freelancers. At ${m.monthlyRev > 0 ? formatINR(m.monthlyRev) : 'your current'} monthly revenue, every 10% increase in utilization could add significant income. ${m.adminPct}% of your time goes to Admin & Finance tasks which could be automated or batched.`,
      clientGrowthImpact: 'High',
      revenueGrowthImpact: 'High',
      brandVisibilityImpact: 'Low',
      productDevelopmentImpact: 'Medium',
      opportunityCostImpact: 'High',
      timeLossPercentage: `${100 - m.utilizationRate}% non-billable`,
      growthGainPercentage: `${Math.min(40, Math.round((60 - m.utilizationRate) * 1.5))}% potential revenue gain`,
      risks: ['Revenue stagnation from too few billable hours', 'Difficulty hitting monthly revenue targets', 'Burnout from stretching across too many non-billable tasks'],
      alternatives: ['Block 4-hour deep work sessions for client work daily', 'Use time-blocking (e.g. 9-1 client work, 1-2 admin)', 'Automate invoicing and bookkeeping with FreshBooks/Wave'],
      timeReduction: `${m.adminHours.toFixed(1)}h admin → ${Math.max(1, Math.round(m.adminHours * 0.3))}h`,
      timeSaved: `${Math.round(m.adminHours * 0.7)}h/week recovered`,
      clientCallsIncrease: `+${Math.min(10, Math.round(m.adminHours * 0.8))} calls`,
      salesActivitiesIncrease: `+${Math.min(8, Math.round(m.adminHours * 0.5))} activities`,
      productivityIncrease: `+${Math.round((60 - m.utilizationRate) * 0.8)}%`,
      revenuePotential: m.monthlyRev > 0 ? `${formatINR(Math.round(m.monthlyRev * 0.3))} extra potential` : 'Higher income potential',
      confidenceScore: '96%',
      confidenceReason: `Based on your actual ${m.totalHours.toFixed(1)}h of activity data showing ${m.utilizationRate}% utilization`
    });
  }

  if (m.effectiveHourlyRate > 0 && m.effectiveHourlyRate < 500 && m.billableHours > 0) {
    const suggestedRate = Math.round(m.effectiveHourlyRate * 1.3);
    const potentialRevenue = Math.round((suggestedRate - m.effectiveHourlyRate) * m.billableHours * 22);
    recommendations.push({
      priority: 'Important',
      title: `Raise your effective hourly rate from ₹${m.effectiveHourlyRate.toLocaleString('en-IN')} to ₹${suggestedRate.toLocaleString('en-IN')}`,
      timeSpent: `${m.billableHours.toFixed(1)}h billable`,
      category: 'Pricing Strategy',
      businessContribution: 'High',
      productivityImpact: 'Low',
      revenueContribution: 'High',
      automationPotential: 'Low',
      whyFlagged: `Your effective hourly rate is ₹${m.effectiveHourlyRate.toLocaleString('en-IN')}/hr, which is below the healthy freelancer benchmark of ₹500-₹1,500/hr. A 30% rate increase to ₹${suggestedRate.toLocaleString('en-IN')}/hr could add ${potentialRevenue > 0 ? formatINR(potentialRevenue) : 'significant'} monthly revenue without working more hours.`,
      clientGrowthImpact: 'Medium',
      revenueGrowthImpact: 'High',
      brandVisibilityImpact: 'Medium',
      productDevelopmentImpact: 'Low',
      opportunityCostImpact: 'Medium',
      timeLossPercentage: '0%',
      growthGainPercentage: `${Math.round(((suggestedRate - m.effectiveHourlyRate) / m.effectiveHourlyRate) * 100)}% revenue gain`,
      risks: ['Undercharging leading to burnout from needing more clients', 'Attracting price-sensitive low-value clients', 'Difficulty raising rates later once anchored low'],
      alternatives: ['Increase rates by 20% for new clients immediately', 'Offer tiered packages (Basic/Pro/Premium) instead of hourly', 'Switch to value-based pricing tied to client outcomes'],
      timeReduction: 'Same hours, higher income',
      timeSaved: '0 hrs (pricing strategy change)',
      clientCallsIncrease: `+${Math.round(m.billableHours * 0.3)} premium calls`,
      salesActivitiesIncrease: '+5 value-based proposals',
      productivityIncrease: '+0% (strategy change, not time change)',
      revenuePotential: potentialRevenue > 0 ? `${formatINR(potentialRevenue)}/mo extra` : 'Significant income increase',
      confidenceScore: '93%',
      confidenceReason: `Based on your effective rate of ₹${m.effectiveHourlyRate.toLocaleString('en-IN')}/hr vs industry benchmarks`
    });
  }

  if (m.adminPct > 20 && m.adminHours > 0) {
    timeWastedTasks.push({
      task: `Admin & Finance (${m.adminHours.toFixed(1)}h)`,
      reason: `${m.adminPct}% of your total time (${m.adminHours.toFixed(1)}h) is spent on administrative tasks. For a freelancer earning ${m.monthlyRev > 0 ? formatINR(m.monthlyRev) : 'revenue'}/mo, this represents approximately ${m.costOfNonBillable > 0 ? formatINR(m.costOfNonBillable) : 'significant'} in opportunity cost. Automate invoicing, bookkeeping, and scheduling.`,
      minutesWasted: Math.round(m.adminHours * 60 * 0.7)
    });
  }

  if (m.marketingPct < 10 && m.totalHours > 0) {
    areasToFocus.push({
      area: 'Marketing & Lead Generation',
      reason: `Only ${m.marketingPct}% of your time is on marketing. Freelancers should invest 10-15% of their time in marketing to maintain a healthy pipeline. Increase to at least 3-4 hours/week on content, outreach, and networking.`,
      hoursRecommended: Math.max(3, Math.round(m.totalHours * 0.12))
    });
  }

  if (m.learningPct < 5 && m.totalHours > 0) {
    areasToFocus.push({
      area: 'Skill Development',
      reason: `Only ${m.learningPct}% of your time goes to skill development. Investing 5-10% of your time in learning keeps your rates competitive and opens higher-value opportunities.`,
      hoursRecommended: Math.max(2, Math.round(m.totalHours * 0.08))
    });
  }

  if (m.proposalsPct < 5 && m.totalHours > 0) {
    areasToFocus.push({
      area: 'Proposals & Pitches',
      reason: `Only ${m.proposalsPct}% of your time goes to creating proposals. For every 10 proposals sent, freelancers typically win 3-5 clients. Increase proposal output to build your pipeline.`,
      hoursRecommended: Math.max(3, Math.round(m.totalHours * 0.1))
    });
  }

  sortedActivities.slice(0, 3).forEach(act => {
    if (isRecreational(act.name)) {
      recommendations.push({
        priority: 'Optional',
        title: `Maintain balanced recovery time for "${act.name}"`,
        timeSpent: `${act.hours.toFixed(1)}h total`,
        category: act.category,
        businessContribution: 'Low',
        productivityImpact: 'High',
        revenueContribution: 'Very Low',
        automationPotential: 'Low',
        whyFlagged: `"${act.name}" represents ${act.hours.toFixed(1)}h of personal time. While essential for preventing freelancer burnout, it should be scheduled outside core billable hours (9 AM - 4 PM).`,
        clientGrowthImpact: 'No Impact',
        revenueGrowthImpact: 'No Impact',
        brandVisibilityImpact: 'No Impact',
        productDevelopmentImpact: 'No Impact',
        opportunityCostImpact: 'Low',
        timeLossPercentage: '0% business loss',
        growthGainPercentage: 'Prevents Burnout',
        risks: ['Scheduling personal time during peak client hours', 'Potential deadline pressure if billable work is displaced'],
        alternatives: ['Schedule recreational time after 4 PM or on weekends', 'Use as a reward after completing client deliverables'],
        timeReduction: `${act.hours.toFixed(1)}h → ${act.hours.toFixed(1)}h`,
        timeSaved: '0 hrs (vital recovery time)',
        clientCallsIncrease: '0 calls',
        salesActivitiesIncrease: '0 activities',
        productivityIncrease: '+10% energy boost',
        revenuePotential: 'Indirect (burnout protection)',
        confidenceScore: '98%',
        confidenceReason: 'Correctly identified as recreational activity based on activity name'
      });
    }
  });

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'Important',
      title: m.utilizationRate < 60 ? `Optimize your ${m.utilizationRate}% utilization rate` : `Maintain your strong ${m.utilizationRate}% utilization rate`,
      timeSpent: `${m.billableHours.toFixed(1)}h billable of ${m.totalHours.toFixed(1)}h total`,
      category: 'Productivity',
      businessContribution: 'High',
      productivityImpact: 'High',
      revenueContribution: 'High',
      automationPotential: 'Medium',
      whyFlagged: `Your activity data shows ${m.totalHours.toFixed(1)}h logged with ${m.billableHours.toFixed(1)}h of billable client work. Your utilization rate of ${m.utilizationRate}% ${m.utilizationRate < 60 ? 'is below the 60% freelancer benchmark. Focus on reducing admin overhead and protecting client work time.' : 'is healthy. Keep protecting your billable hours.'}`,
      clientGrowthImpact: 'High',
      revenueGrowthImpact: 'High',
      brandVisibilityImpact: 'Low',
      productDevelopmentImpact: 'Medium',
      opportunityCostImpact: 'Medium',
      timeLossPercentage: `${100 - m.utilizationRate}% non-billable`,
      growthGainPercentage: `${Math.min(30, Math.round((60 - m.utilizationRate) * 1.2))}% potential gain`,
      risks: ['Admin creep reducing billable hours', 'Inconsistent client pipeline'],
      alternatives: ['Use time-blocking: 9-12 client work, 1-2 admin', 'Automate repetitive tasks', 'Batch admin tasks into one afternoon'],
      timeReduction: `${m.adminHours.toFixed(1)}h admin → ${Math.max(1, Math.round(m.adminHours * 0.4))}h`,
      timeSaved: `${Math.round(m.adminHours * 0.6)}h/week saved`,
      clientCallsIncrease: `+${Math.min(8, Math.round(m.adminHours * 0.7))} calls`,
      salesActivitiesIncrease: `+${Math.min(6, Math.round(m.adminHours * 0.4))} activities`,
      productivityIncrease: `+${Math.round((60 - m.utilizationRate) * 0.7)}%`,
      revenuePotential: m.monthlyRev > 0 ? `${formatINR(Math.round(m.monthlyRev * 0.25))} extra potential` : 'Higher income potential',
      confidenceScore: '94%',
      confidenceReason: `Based on your actual activity data showing ${m.totalHours.toFixed(1)}h logged across ${allActivities.length} entries`
    });
  }

  if (timeWastedTasks.length === 0) {
    timeWastedTasks.push({
      task: 'Administrative Tasks',
      reason: `${m.adminPct}% of your time (${m.adminHours.toFixed(1)}h) is spent on admin. As a freelancer, every hour on admin is an hour not earning. Automate with FreshBooks, Calendly, or Notion.`,
      minutesWasted: Math.round(m.adminHours * 60 * 0.6) || 120
    });
  }

  if (areasToFocus.length === 0) {
    areasToFocus.push({
      area: 'Client Work & Proposal Generation',
      reason: `Focus on increasing billable hours and sending more proposals. With ${m.totalHours.toFixed(1)}h logged and ${m.proposalsSent} proposals sent, strengthening your pipeline will stabilize freelance income.`,
      hoursRecommended: Math.max(4, Math.round(m.billableHours * 0.3) || 4)
    });
  }

  const growthFactor = Math.max(0.05, Math.min(0.3, (60 - m.utilizationRate) / 200 + 0.1));
  const projectedMonthly = m.monthlyRev > 0
    ? m.monthlyRev
    : 50000;

  const incomeGrowthProjections = [
    { label: 'Current', revenueProjected: projectedMonthly },
    { label: 'Month 1', revenueProjected: Math.round(projectedMonthly * (1 + growthFactor * 0.5)) },
    { label: 'Month 2', revenueProjected: Math.round(projectedMonthly * (1 + growthFactor * 1.2)) },
    { label: 'Month 3', revenueProjected: Math.round(projectedMonthly * (1 + growthFactor * 2.0)) }
  ];

  const formatINRLocal = (val) => `\u20B9${val.toLocaleString('en-IN')}`;

  const incomeGrowthStatement = m.utilizationRate < 60
    ? `As a freelancer, your ${m.utilizationRate}% utilization rate means ${100 - m.utilizationRate}% of your time is non-billable. By reducing admin overhead from ${m.adminPct}% to 15% and increasing marketing from ${m.marketingPct}% to 12%, you could boost billable hours by ${Math.round((60 - m.utilizationRate) * 0.5)}h/week — potentially increasing monthly revenue from ${formatINRLocal(projectedMonthly)} to ${formatINRLocal(incomeGrowthProjections[3].revenueProjected)} within 3 months.`
    : `Your ${m.utilizationRate}% utilization rate is strong. To grow further as a freelancer, consider raising your effective rate of ₹${m.effectiveHourlyRate.toLocaleString('en-IN')}/hr by 20% and converting project clients to monthly retainers. This could increase revenue from ${formatINRLocal(projectedMonthly)} to ${formatINRLocal(incomeGrowthProjections[3].revenueProjected)} in 3 months.`;

  return {
    recommendations,
    timeWastedTasks,
    areasToFocus,
    incomeGrowthStatement,
    incomeGrowthProjections,
    taskPriorities: {
      high: tasks.filter(t => /client|invoice|deliverable|project|revision|deadline|proposal|contract|payment|urgent/i.test(t.task_name)).map(t => t.task_name),
      medium: tasks.filter(t => !/client|invoice|deliver|project|revision|deadline|proposal|contract|payment|urgent|email|clean|admin|organize|file/i.test(t.task_name)).map(t => t.task_name),
      low: tasks.filter(t => /email|clean|admin|organize|file|research|read|update/i.test(t.task_name)).map(t => t.task_name)
    },
    todayFocus: m.utilizationRate < 50
      ? `Focus on delivering ${Math.max(2, Math.round(4 - m.adminHours))} hours of billable client work today. Batch admin tasks into one 30-min block.`
      : `Protect your billable hours today. Start with your highest-value client deliverable before checking email.`,
    weekFocus: m.proposalsPct < 5
      ? `Send at least 2 proposals or pitches this week to build your freelance pipeline.`
      : `This week, focus on delivering client work and raising rates for new inquiries.`
  };
}

export async function generateRecommendations(businessProfile, todayActivities, pastActivities, tasks) {
  try {
    const client = getGeminiClient();
    const m = computeFreelancerMetrics(businessProfile, todayActivities, pastActivities, tasks);

    const todaySummary = todayActivities.length > 0
      ? todayActivities.map(a => `- ${a.activity_name} (${a.hours_spent}h, ${a.category})${a.result ? ` \u2192 ${a.result}` : ''}`).join('\n')
      : 'No activities logged today.';

    const pastSummary = pastActivities.length > 0
      ? aggregateByCategory(pastActivities).map(c => `- ${c.category}: ${c.totalHours}h across ${c.count} entries`).join('\n')
      : 'No past activity data available.';

    const tasksSummary = tasks.length > 0
      ? tasks.map(t => `- [${t.priority}] ${t.task_name}${t.deadline ? ` (due: ${t.deadline})` : ''}`).join('\n')
      : 'No pending tasks.';

    const prompt = `You are an Elite Freelance Business Growth Consultant with 20+ years of experience helping freelancers and solopreneurs scale their income, optimize their time, and build sustainable businesses.

FREELANCER CONTEXT — This user is a FREELANCER/SOLOPRENEUR. Tailor ALL advice specifically to freelancers.

BUSINESS PROFILE:
Name: ${businessProfile.business_name}
Role: ${businessProfile.role}
Location: ${businessProfile.location || 'Unknown'}
Description: ${businessProfile.description || 'N/A'}
Goal: ${businessProfile.goal || 'Not specified'}
Monthly Revenue: ${formatINR(businessProfile.monthly_revenue)}
Weekly Revenue: ${formatINR(businessProfile.weekly_revenue)}

COMPUTED FREELANCER METRICS (use these for analysis):
- Total Hours Logged: ${m.totalHours.toFixed(1)}h
- Billable Hours (Client Work): ${m.billableHours.toFixed(1)}h
- Non-Billable Hours: ${m.nonBillableHours.toFixed(1)}h
- Utilization Rate: ${m.utilizationRate}% (Target: 60-75% for healthy freelancers)
- Effective Hourly Rate: \u20B9${m.effectiveHourlyRate.toLocaleString('en-IN')}/hr (Target: \u20B9500-\u20B91,500/hr)
- Time Allocation — Admin: ${m.adminPct}%, Marketing: ${m.marketingPct}%, Learning: ${m.learningPct}%, Networking: ${m.networkingPct}%, Proposals: ${m.proposalsPct}%
- Focus Score: ${m.focusScore}% (Client Work + Proposals as % of total)
- Proposals Sent: ${m.proposalsSent}
- Admin Cost (Opportunity): \u20B9${m.costOfNonBillable.toLocaleString('en-IN')}
- Task Completion Rate: ${m.taskCompletionRate}%

TODAY'S ACTIVITIES:
${todaySummary}

HISTORICAL ACTIVITY SUMMARY:
${pastSummary}

PENDING TASKS:
${tasksSummary}

FREELANCER ANALYSIS RULES:
1. Calculate and reference the UTILIZATION RATE. If below 60%, flag it as critical and suggest specific admin automation tools (FreshBooks, Wave, Calendly, Notion).
2. Calculate the EFFECTIVE HOURLY RATE. If below \u20B9500/hr, recommend a 20-30% rate increase with concrete scripts for communicating it to clients.
3. Analyze TIME ALLOCATION. If Admin > 20%, recommend specific automation. If Marketing < 10%, recommend pipeline building. If Learning < 5%, recommend skill investment.
4. Every recommendation must reference the freelancer's actual business name, role, revenue figures, and activity data. Never give generic business advice.
5. For INCOME PROJECTIONS: Base them on the actual monthly revenue and show how utilization improvements compound.

Return your report in this exact JSON format:
{
  "recommendations": [
    {
      "priority": "Critical / Important / Optional",
      "title": "Freelancer-specific recommendation title referencing their actual data",
      "timeSpent": "e.g. 12h billable of 20h total",
      "category": "e.g. Client Work, Pricing, Productivity",
      "businessContribution": "Low / Medium / High",
      "productivityImpact": "Low / Medium / High",
      "revenueContribution": "Low / Medium / High",
      "automationPotential": "Low / Medium / High",
      "whyFlagged": "Detailed freelancer-specific explanation referencing their actual utilization, hourly rate, and time allocation",
      "clientGrowthImpact": "Low / Medium / High / No Impact / Delayed / Minimal",
      "revenueGrowthImpact": "Low / Medium / High / No Impact / Delayed / Minimal",
      "brandVisibilityImpact": "Low / Medium / High / No Impact / Delayed / Minimal",
      "productDevelopmentImpact": "Low / Medium / High / No Impact / Delayed / Minimal",
      "opportunityCostImpact": "Low / Medium / High",
      "timeLossPercentage": "e.g. 35% non-billable time",
      "growthGainPercentage": "e.g. 22% potential revenue gain",
      "risks": ["Freelancer-specific risk 1", "Risk 2"],
      "alternatives": ["Freelancer-specific tool/strategy 1", "Alternative 2"],
      "timeReduction": "e.g. 8h admin \u2192 2h/wk",
      "timeSaved": "e.g. 6h/week",
      "clientCallsIncrease": "e.g. +6 calls",
      "salesActivitiesIncrease": "e.g. +5 proposals",
      "productivityIncrease": "e.g. +18%",
      "revenuePotential": "e.g. \u20B925,000 extra monthly",
      "confidenceScore": "e.g. 93%",
      "confidenceReason": "Specific data-driven reason"
    }
  ],
  "timeWastedTasks": [
    {
      "task": "Activity name",
      "reason": "Freelancer-specific opportunity cost calculation",
      "minutesWasted": 120
    }
  ],
  "areasToFocus": [
    {
      "area": "Specific focus area",
      "reason": "Freelancer-specific impact explanation",
      "hoursRecommended": 5
    }
  ],
  "incomeGrowthStatement": "Freelancer-specific coaching statement referencing their utilization rate, hourly rate, and revenue gap",
  "incomeGrowthProjections": [
    { "label": "Current", "revenueProjected": ${Number(businessProfile.monthly_revenue) || 50000} },
    { "label": "Month 1", "revenueProjected": 55000 },
    { "label": "Month 2", "revenueProjected": 62000 },
    { "label": "Month 3", "revenueProjected": 75000 }
  ],
  "taskPriorities": {
    "high": ["Task name"],
    "medium": ["Task name"],
    "low": ["Task name"]
  },
  "todayFocus": "Single-sentence freelancer coaching focus for today",
  "weekFocus": "Single-sentence freelancer coaching focus for the week"
}

CRITICAL RULES:
- Never generate generic responses. EVERY recommendation must reference actual freelancer data above.
- Use \u20B9 for currency formatting.
- Freelancer-specific tools to recommend: FreshBooks, Wave, Calendly, Notion, Toggl, Harvest, Upwork, Fiverr, LinkedIn, Canva, Mailchimp.
- Rate increase recommendations must include a script: "I'm updating my rates for new projects. My new rate is \u20B9X/hr."
- Personal hobbies/recharge activities must be 'Optional' priority with 'Prevents Burnout' messaging.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  priority: { type: Type.STRING },
                  title: { type: Type.STRING },
                  timeSpent: { type: Type.STRING },
                  category: { type: Type.STRING },
                  businessContribution: { type: Type.STRING },
                  productivityImpact: { type: Type.STRING },
                  revenueContribution: { type: Type.STRING },
                  automationPotential: { type: Type.STRING },
                  whyFlagged: { type: Type.STRING },
                  clientGrowthImpact: { type: Type.STRING },
                  revenueGrowthImpact: { type: Type.STRING },
                  brandVisibilityImpact: { type: Type.STRING },
                  productDevelopmentImpact: { type: Type.STRING },
                  opportunityCostImpact: { type: Type.STRING },
                  timeLossPercentage: { type: Type.STRING },
                  growthGainPercentage: { type: Type.STRING },
                  risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  timeReduction: { type: Type.STRING },
                  timeSaved: { type: Type.STRING },
                  clientCallsIncrease: { type: Type.STRING },
                  salesActivitiesIncrease: { type: Type.STRING },
                  productivityIncrease: { type: Type.STRING },
                  revenuePotential: { type: Type.STRING },
                  confidenceScore: { type: Type.STRING },
                  confidenceReason: { type: Type.STRING }
                },
                required: [
                  'priority', 'title', 'timeSpent', 'category', 'businessContribution', 'productivityImpact',
                  'revenueContribution', 'automationPotential', 'whyFlagged', 'clientGrowthImpact', 'revenueGrowthImpact',
                  'brandVisibilityImpact', 'productDevelopmentImpact', 'opportunityCostImpact', 'timeLossPercentage',
                  'growthGainPercentage', 'risks', 'alternatives', 'timeReduction', 'timeSaved', 'clientCallsIncrease',
                  'salesActivitiesIncrease', 'productivityIncrease', 'revenuePotential', 'confidenceScore', 'confidenceReason'
                ]
              }
            },
            timeWastedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  minutesWasted: { type: Type.INTEGER }
                },
                required: ['task', 'reason', 'minutesWasted']
              }
            },
            areasToFocus: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  hoursRecommended: { type: Type.INTEGER }
                },
                required: ['area', 'reason', 'hoursRecommended']
              }
            },
            incomeGrowthStatement: { type: Type.STRING },
            incomeGrowthProjections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  revenueProjected: { type: Type.INTEGER }
                },
                required: ['label', 'revenueProjected']
              }
            },
            taskPriorities: {
              type: Type.OBJECT,
              properties: {
                high: { type: Type.ARRAY, items: { type: Type.STRING } },
                medium: { type: Type.ARRAY, items: { type: Type.STRING } },
                low: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['high', 'medium', 'low']
            },
            todayFocus: { type: Type.STRING },
            weekFocus: { type: Type.STRING }
          },
          required: ['recommendations', 'timeWastedTasks', 'areasToFocus', 'incomeGrowthStatement', 'incomeGrowthProjections', 'taskPriorities', 'todayFocus', 'weekFocus']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error('No response from Gemini');

    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('Gemini recommendation error, running fallback:', error);
    return fallbackRecommendations(businessProfile, todayActivities, pastActivities, tasks);
  }
}

function fallbackPrioritize(tasks, businessProfile) {
  const result = { high: [], medium: [], low: [] };
  for (const t of tasks) {
    const priority = autoAssignPriority(t.task_name, t.deadline, businessProfile);
    result[priority].push(t.task_name);
  }
  return result;
}

export async function prioritizeSingleTask(title, deadline, businessProfile) {
  try {
    const client = getGeminiClient();
    const goal = businessProfile?.goal || 'Not specified';
    const role = businessProfile?.role || 'Freelancer';
    const deadlineStr = deadline ? `Deadline: ${deadline}` : 'No deadline';

    const prompt = `You are a Freelance Task Prioritization AI.

TASK: "${title}"
${deadlineStr}
FREELANCER ROLE: ${role}
BUSINESS GOAL: ${goal}

Classify this task's priority for a freelancer:
- HIGH: Client deliverables, invoicing, contracts, urgent deadlines, revenue-generating tasks
- MEDIUM: Business development, marketing, portfolio updates, skill development
- LOW: Admin, email cleanup, organizing, archiving, reading

Return ONLY: {"priority": "high"} / {"priority": "medium"} / {"priority": "low"}`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: { type: Type.STRING }
          },
          required: ['priority']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error('No response from Gemini');

    const result = JSON.parse(responseText.trim());
    const p = (result.priority || '').toLowerCase();
    if (['high', 'medium', 'low'].includes(p)) return p;
    return 'medium';
  } catch (error) {
    console.warn('Single task AI prioritization failed, using local logic:', error.message);
    return autoAssignPriority(title, deadline, businessProfile);
  }
}

export async function generateTaskPriorities(businessProfile, tasks) {
  try {
    const client = getGeminiClient();

    const tasksSummary = tasks.map(t =>
      `- ${t.task_name} [Priority: ${t.priority}, Status: ${t.status}${t.deadline ? `, Deadline: ${t.deadline}` : ''}]`
    ).join('\n');

    const monthlyRev = Number(businessProfile.monthly_revenue) || 0;

    const prompt = `You are a Freelance Business Prioritization Coach.

FREELANCER CONTEXT:
Business: ${businessProfile.business_name}
Role: ${businessProfile.role}
Goal: ${businessProfile.goal || 'Not specified'}
Monthly Revenue: \u20B9${monthlyRev.toLocaleString('en-IN')}/mo
Description: ${businessProfile.description || 'N/A'}

TASKS TO PRIORITIZE:
${tasksSummary}

FREELANCER PRIORITIZATION RULES (apply in this order):

1. CLIENT DELIVERABLES (HIGHEST):
   - Tasks with "client", "deliverable", "project", "revision", "deadline" → HIGH
   - These directly earn revenue and maintain client relationships

2. INVOICING & CASH FLOW:
   - Tasks with "invoice", "payment", "proposal", "contract" → HIGH
   - Late invoicing = late payment = cash flow problems for freelancers

3. BUSINESS DEVELOPMENT:
   - Tasks with "pitch", "proposal", "portfolio", "case study" → MEDIUM-HIGH
   - Builds your pipeline to prevent feast-famine cycles

4. MARKETING & VISIBILITY:
   - Tasks with "blog", "social", "linkedin", "content", "network" → MEDIUM
   - Important for long-term pipeline but not urgent unless pipeline is empty

5. SKILL DEVELOPMENT:
   - Tasks with "learn", "course", "certification", "training" → MEDIUM-LOW
   - Important for rate increases but not urgent

6. ADMIN (LOWEST):
   - Tasks with "email", "clean", "organize", "admin", "file", "backup" → LOW
   - Non-billable overhead — batch into one session and minimize

EXAMPLES:
- "Send invoice to Client X" → HIGH (revenue protection)
- "Revise website copy for Client Y" → HIGH (client deliverable)
- "Write LinkedIn post" → MEDIUM (pipeline building)
- "Update portfolio website" → MEDIUM (business development)
- "Organize email inbox" → LOW (non-billable overhead)
- "Research new tools" → LOW (unless directly saves billable hours)

Return ONLY:
{
  "high": ["task name 1", "task name 2"],
  "medium": ["task name 3"],
  "low": ["task name 4"]
}

No explanations. Only categorize into High, Medium, Low based on freelancer-specific rules above.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            high: { type: Type.ARRAY, items: { type: Type.STRING } },
            medium: { type: Type.ARRAY, items: { type: Type.STRING } },
            low: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['high', 'medium', 'low']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error('No response from Gemini');

    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('Gemini task prioritization error, using fallback:', error);
    return fallbackPrioritize(tasks, businessProfile);
  }
}

export async function generateGoalIntelligence(businessProfile, todayActivities, pastActivities, tasks, goalConfig) {
  try {
    const client = getGeminiClient();
    const m = computeFreelancerMetrics(businessProfile, todayActivities, pastActivities, tasks);

    const todaySummary = todayActivities.length > 0
      ? todayActivities.map(a => `- ${a.activity_name} (${a.hours_spent}h, ${a.category})`).join('\n')
      : 'No activities logged today.';

    const pastSummary = pastActivities.length > 0
      ? aggregateByCategory(pastActivities).map(c => `- ${c.category}: ${c.totalHours}h`).join('\n')
      : 'No past activity data.';

    const tasksSummary = tasks.length > 0
      ? tasks.map(t => `- ${t.task_name} (${t.priority})`).join('\n')
      : 'No pending tasks.';

    const focusAreasStr = (goalConfig.focusAreas || []).join(', ');
    const currentRevenue = Number(goalConfig.currentRevenue) || Number(businessProfile.monthly_revenue) || 50000;
    const targetRevenue = Number(goalConfig.targetRevenue) || 150000;
    const revenueGap = Math.max(0, targetRevenue - currentRevenue);

    const prompt = `You are an Elite Freelance Business Growth Consultant and Revenue Optimization Advisor.

FREELANCER CONTEXT — This user is a FREELANCER. Generate a customized Revenue Mapping & Goal Intelligence report specifically for a freelance business.

BUSINESS PROFILE:
Name: ${businessProfile.business_name}
Role: ${businessProfile.role}
Location: ${businessProfile.location || 'Unknown'}
Description: ${businessProfile.description || 'N/A'}
Monthly Revenue: ${formatINR(businessProfile.monthly_revenue)}

CURRENT FREELANCER METRICS:
- Utilization Rate: ${m.utilizationRate}% (Target: 60-75%)
- Effective Hourly Rate: \u20B9${m.effectiveHourlyRate.toLocaleString('en-IN')}/hr
- Time Allocation: Admin ${m.adminPct}%, Marketing ${m.marketingPct}%, Client Work ${m.utilizationRate}%
- Focus Score: ${m.focusScore}%

GOAL TARGETS:
Primary Goal: ${goalConfig.primaryGoal}
Target Monthly Revenue: ${formatINR(goalConfig.targetRevenue)}
Current Monthly Revenue: ${formatINR(goalConfig.currentRevenue)}
Goal Duration: ${goalConfig.duration}
Team Size: ${goalConfig.teamSize}
Average Project Value: ${formatINR(goalConfig.avgProjectValue)}
Target Focus Areas: ${focusAreasStr}

TODAY'S ACTIVITIES:
${todaySummary}

HISTORICAL WORK EFFORT:
${pastSummary}

FREELANCER-SPECIFIC GOAL ANALYSIS:
1. Revenue Gap: ${formatINR(revenueGap)}/mo
2. To close the gap using rates: Need to increase rate by ${currentRevenue > 0 ? Math.round((revenueGap / currentRevenue) * 100) : 0}% OR
3. To close the gap using hours: Need ${m.effectiveHourlyRate > 0 ? Math.round(revenueGap / m.effectiveHourlyRate) : 'X'} more billable hours/month
4. Freelancer Growth Levers:
   - Raise hourly rate by 20-30%
   - Convert project clients to monthly retainers
   - Reduce admin overhead to free up billable hours
   - Increase marketing to build pipeline

Return your goal analysis in this exact JSON format:
{
  "goalOverview": {
    "goalName": "Freelancer goal description",
    "currentRevenue": ${currentRevenue},
    "targetRevenue": ${targetRevenue},
    "duration": "${goalConfig.duration}",
    "progressPercentage": ${Math.min(100, Math.round((currentRevenue / targetRevenue) * 100))}
  },
  "revenueMapping": {
    "revenueGap": ${revenueGap},
    "weeklyTarget": ${Math.round(revenueGap / (parseInt(goalConfig.duration) / 4 || 12))},
    "dailyTarget": ${Math.round(revenueGap / (parseInt(goalConfig.duration) || 90))}
  },
  "findings": [
    "Freelancer-specific finding 1 referencing their utilization or hourly rate",
    "Freelancer-specific finding 2"
  ],
  "goalRisks": {
    "marketingRisk": "Low / Medium / High",
    "revenueRisk": "Low / Medium / High",
    "growthRisk": "Low / Medium / High",
    "clientRisk": "Low / Medium / High",
    "burnoutRisk": "Low / Medium / High",
    "cashFlowRisk": "Low / Medium / High",
    "deadlineRisk": "Low / Medium / High"
  },
  "timeReallocation": [
    { "category": "Finance", "current": ${m.adminPct}, "recommended": 15 },
    { "category": "Marketing", "current": ${m.marketingPct}, "recommended": 12 },
    { "category": "Client Work", "current": ${m.utilizationRate}, "recommended": 65 }
  ],
  "actionPlan": [
    { "week": "Week 1", "task": "Freelancer-specific action" },
    { "week": "Week 2", "task": "Freelancer-specific action" }
  ],
  "revenueForecast": [
    { "label": "Current", "revenue": ${currentRevenue} },
    { "label": "Month 1", "revenue": ${Math.round(currentRevenue + revenueGap * 0.18)} },
    { "label": "Month 2", "revenue": ${Math.round(currentRevenue + revenueGap * 0.45)} },
    { "label": "Month 3", "revenue": ${Math.round(currentRevenue + revenueGap * 0.75)} },
    { "label": "Target", "revenue": ${targetRevenue} }
  ],
  "executiveSummary": {
    "businessHealth": ${Math.min(100, m.utilizationRate + 20)},
    "productivityScore": ${Math.min(100, m.focusScore + 15)},
    "growthPotential": "Low / Medium / High",
    "highestROIActivity": "Client Work",
    "lowestROIActivity": "Admin & Finance",
    "biggestOpportunity": "Freelancer-specific opportunity",
    "estimatedTimeSaved": "e.g. ${Math.round(m.adminHours * 0.6)} hrs/week",
    "estimatedRevenueGrowth": "e.g. +${currentRevenue > 0 ? Math.round((revenueGap / currentRevenue) * 50) : 30}%",
    "goalAchievementProbability": ${Math.min(100, 50 + m.utilizationRate)},
    "confidenceScore": ${Math.min(100, 60 + m.focusScore)}
  }
}

Rules:
- Make all targets math-logical based on duration and revenue gap.
- Every finding must reference this freelancer's actual metrics.
- Use \u20B9 for currency formatting.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            goalOverview: {
              type: Type.OBJECT,
              properties: {
                goalName: { type: Type.STRING },
                currentRevenue: { type: Type.INTEGER },
                targetRevenue: { type: Type.INTEGER },
                duration: { type: Type.STRING },
                progressPercentage: { type: Type.INTEGER }
              },
              required: ['goalName', 'currentRevenue', 'targetRevenue', 'duration', 'progressPercentage']
            },
            revenueMapping: {
              type: Type.OBJECT,
              properties: {
                revenueGap: { type: Type.INTEGER },
                weeklyTarget: { type: Type.INTEGER },
                dailyTarget: { type: Type.INTEGER }
              },
              required: ['revenueGap', 'weeklyTarget', 'dailyTarget']
            },
            findings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            goalRisks: {
              type: Type.OBJECT,
              properties: {
                marketingRisk: { type: Type.STRING },
                revenueRisk: { type: Type.STRING },
                growthRisk: { type: Type.STRING },
                clientRisk: { type: Type.STRING },
                burnoutRisk: { type: Type.STRING },
                cashFlowRisk: { type: Type.STRING },
                deadlineRisk: { type: Type.STRING }
              },
              required: ['marketingRisk', 'revenueRisk', 'growthRisk', 'clientRisk', 'burnoutRisk', 'cashFlowRisk', 'deadlineRisk']
            },
            timeReallocation: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  current: { type: Type.INTEGER },
                  recommended: { type: Type.INTEGER }
                },
                required: ['category', 'current', 'recommended']
              }
            },
            actionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.STRING },
                  task: { type: Type.STRING }
                },
                required: ['week', 'task']
              }
            },
            revenueForecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  revenue: { type: Type.INTEGER }
                },
                required: ['label', 'revenue']
              }
            },
            executiveSummary: {
              type: Type.OBJECT,
              properties: {
                businessHealth: { type: Type.INTEGER },
                productivityScore: { type: Type.INTEGER },
                growthPotential: { type: Type.STRING },
                highestROIActivity: { type: Type.STRING },
                lowestROIActivity: { type: Type.STRING },
                biggestOpportunity: { type: Type.STRING },
                estimatedTimeSaved: { type: Type.STRING },
                estimatedRevenueGrowth: { type: Type.STRING },
                goalAchievementProbability: { type: Type.INTEGER },
                confidenceScore: { type: Type.INTEGER }
              },
              required: [
                'businessHealth', 'productivityScore', 'growthPotential', 'highestROIActivity',
                'lowestROIActivity', 'biggestOpportunity', 'estimatedTimeSaved', 'estimatedRevenueGrowth',
                'goalAchievementProbability', 'confidenceScore'
              ]
            }
          },
          required: [
            'goalOverview', 'revenueMapping', 'findings', 'goalRisks', 'timeReallocation',
            'actionPlan', 'revenueForecast', 'executiveSummary'
          ]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error('No response from Gemini');
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error('Gemini goal intelligence error, using fallback:', error);
    return fallbackGoalIntelligence(businessProfile, todayActivities, pastActivities, tasks, goalConfig);
  }
}

export function fallbackGoalIntelligence(businessProfile, todayActivities, pastActivities, tasks, goalConfig) {
  const m = computeFreelancerMetrics(businessProfile, todayActivities, pastActivities, tasks);
  const currentRevenue = Number(goalConfig.currentRevenue) || Number(businessProfile.monthly_revenue) || 50000;
  const targetRevenue = Number(goalConfig.targetRevenue) || 150000;
  const revenueGap = Math.max(0, targetRevenue - currentRevenue);

  const durationText = goalConfig.duration || '90 Days';
  let days = 90;
  if (durationText.includes('30')) days = 30;
  else if (durationText.includes('60')) days = 60;
  else if (durationText.includes('180') || durationText.includes('6 Month')) days = 180;
  else if (durationText.includes('Year')) days = 365;

  const weeklyTarget = Math.round(revenueGap / (days / 7));
  const dailyTarget = Math.round(revenueGap / days);
  const progress = Math.round((currentRevenue / targetRevenue) * 100);

  const findings = [
    `Your utilization rate is ${m.utilizationRate}%. ${m.utilizationRate < 60 ? 'This is below the 60% target for freelancers — recovering just 5h/week of admin time adds billable capacity.' : 'This is healthy — maintain it.'}`,
    `Marketing represents ${m.marketingPct}% of your logged time. ${m.marketingPct < 10 ? 'Freelancers should invest 10-15% in marketing to maintain pipeline.' : 'This is a good allocation for a freelancer.'}`,
    `Your effective hourly rate is \u20B9${m.effectiveHourlyRate.toLocaleString('en-IN')}/hr. ${m.effectiveHourlyRate < 500 ? 'A 20-30% rate increase is recommended.' : 'Consider raising rates 10-20% annually.'}`,
    `Administrative tasks consume ${m.adminPct}% of your time. ${m.adminPct > 20 ? 'Automating these could free up significant billable capacity.' : 'This is manageable for a freelancer.'}`
  ];

  return {
    goalOverview: {
      goalName: `Reach ${formatINR(targetRevenue)} Monthly Revenue as a Freelancer`,
      currentRevenue,
      targetRevenue,
      duration: durationText,
      progressPercentage: progress > 100 ? 100 : progress
    },
    revenueMapping: {
      revenueGap,
      weeklyTarget,
      dailyTarget
    },
    findings,
    goalRisks: {
      marketingRisk: m.marketingPct < 5 ? 'High' : 'Medium',
      revenueRisk: revenueGap > 50000 ? 'High' : 'Medium',
      growthRisk: m.focusScore < 50 ? 'High' : 'Medium',
      clientRisk: m.proposalsPct < 3 ? 'High' : 'Medium',
      burnoutRisk: m.utilizationRate > 80 ? 'High' : m.utilizationRate < 40 ? 'Medium' : 'Low',
      cashFlowRisk: revenueGap > currentRevenue * 0.5 ? 'High' : 'Medium',
      deadlineRisk: 'Medium'
    },
    timeReallocation: [
      { category: 'Client Work', current: m.utilizationRate, recommended: Math.min(75, m.utilizationRate + 15) },
      { category: 'Marketing', current: m.marketingPct, recommended: Math.max(10, m.marketingPct + 5) },
      { category: 'Admin & Finance', current: m.adminPct, recommended: Math.max(10, Math.round(m.adminPct * 0.5)) },
      { category: 'Skill Development', current: m.learningPct, recommended: Math.max(5, m.learningPct + 2) }
    ],
    actionPlan: [
      { week: 'Week 1', task: 'Audit current freelance rates and increase by 20% for new clients' },
      { week: 'Week 2', task: 'Automate invoicing and bookkeeping with FreshBooks or Wave' },
      { week: 'Week 3', task: 'Send 5 proposals or pitches to build pipeline' },
      { week: 'Week 4', task: 'Create 1 case study from best client project' },
      { week: 'Week 5', task: 'Pitch retainer agreement to 1 existing client' },
      { week: 'Week 6', task: 'Review pipeline, adjust rates, plan next quarter focus areas' }
    ],
    revenueForecast: [
      { label: 'Current', revenue: currentRevenue },
      { label: 'Month 1', revenue: Math.round(currentRevenue + revenueGap * 0.18) },
      { label: 'Month 2', revenue: Math.round(currentRevenue + revenueGap * 0.45) },
      { label: 'Month 3', revenue: Math.round(currentRevenue + revenueGap * 0.75) },
      { label: 'Target', revenue: targetRevenue }
    ],
    executiveSummary: {
      businessHealth: Math.min(100, Math.round((m.utilizationRate + m.focusScore) / 2 + 10)),
      productivityScore: Math.min(100, Math.round(m.focusScore + 15)),
      growthPotential: m.utilizationRate < 50 ? 'High' : m.utilizationRate > 75 ? 'Medium' : 'High',
      highestROIActivity: m.utilizationRate > 0 ? 'Client Work' : 'Lead Generation',
      lowestROIActivity: m.adminPct > 20 ? 'Admin & Finance' : 'None specific',
      biggestOpportunity: m.marketingPct < 10 ? 'Marketing & Outreach' : 'Rate Optimization',
      estimatedTimeSaved: `${Math.max(2, Math.round(m.adminHours * 0.6))} hrs/week`,
      estimatedRevenueGrowth: `+${Math.round((revenueGap / Math.max(1, currentRevenue)) * 50)}%`,
      goalAchievementProbability: Math.min(100, 50 + m.utilizationRate),
      confidenceScore: Math.min(100, 60 + m.focusScore)
    }
  };
}
