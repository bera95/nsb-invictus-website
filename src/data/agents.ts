/**
 * AI agent workforce — roles we build into custom agent platforms.
 * These describe what we build for clients; activity examples are illustrative.
 */
import type { IconName } from './icons';

export interface AgentRole { name: string; role: string; icon: IconName; color: string; does: string[]; example: string }

export const agentRoles: AgentRole[] = [
  { name: 'Marketing agent', role: 'Campaigns & social', icon: 'megaphone', color: '#ff4fd8', does: ['Plans campaigns and content calendars', 'Writes and schedules social posts', 'Creates on-brand images and visuals'], example: 'Drafted 5 LinkedIn posts with matching visuals' },
  { name: 'Content agent', role: 'Blogs & website copy', icon: 'text', color: '#a996ff', does: ['Researches topics and keywords', 'Writes blog articles and landing pages', 'Updates and refreshes existing content'], example: 'Published a 1,800-word guide after editor approval' },
  { name: 'SEO & GEO agent', role: 'Search & AI visibility', icon: 'search', color: '#22d3ee', does: ['Monitors rankings and AI-answer visibility', 'Finds technical and content issues', 'Suggests and drafts fixes'], example: 'Flagged 3 pages that lost featured snippets' },
  { name: 'Sales agent', role: 'Leads & follow-up', icon: 'briefcase', color: '#5fdcb0', does: ['Qualifies and scores incoming leads', 'Drafts personalised follow-ups', 'Updates the CRM automatically'], example: 'Qualified 12 new leads and booked 2 calls' },
  { name: 'Support agent', role: 'Customer service', icon: 'headset', color: '#7fe6f6', does: ['Answers customer questions 24/7', 'Uses your knowledge base and policies', 'Escalates complex cases to people'], example: 'Resolved 41 tickets, escalated 3 to the team' },
  { name: 'Analytics agent', role: 'Reports & insight', icon: 'chart', color: '#f5b544', does: ['Builds weekly performance reports', 'Detects anomalies in GA4 and ads', 'Explains what changed and why'], example: 'Spotted a checkout drop and identified the cause' },
  { name: 'Operations agent', role: 'Admin & back office', icon: 'workflow', color: '#7c5cff', does: ['Processes documents, invoices and forms', 'Moves data between your systems', 'Prepares summaries and approvals'], example: 'Processed 86 invoices into the accounting system' },
];

export const agentPlatformSteps = [
  { title: 'Map the work', text: 'We identify which tasks across your departments are repetitive, rule-based or research-heavy.' },
  { title: 'Design your agents', text: 'Each agent gets a clear role, access to the right tools and data, and rules for when to involve a person.' },
  { title: 'One app for everything', text: 'Agents run in one secure web app with a dashboard, approvals, history and permissions for your team.' },
  { title: 'Measure and expand', text: 'We track time saved and quality, then add agents and skills where they create the most value.' },
];
