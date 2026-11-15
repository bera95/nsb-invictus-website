/** Delivery process, engagement models and principles — shared by the homepage and /approach/. */
export const process = [
  { n: '01', title: 'Discover', text: 'We understand the business goal, the people involved and the constraints before proposing any technology.', outputs: ['Goals & success criteria', 'Process and system review', 'Prioritised opportunities'] },
  { n: '02', title: 'Architect', text: 'We design the solution — architecture, data, integrations, security and user experience — and agree a realistic plan.', outputs: ['Solution architecture', 'Scope & roadmap', 'Estimate and milestones'] },
  { n: '03', title: 'Build', text: 'We deliver in short, visible iterations with working software at each step, automated testing and regular reviews.', outputs: ['Iterative releases', 'Quality assurance', 'Documentation'] },
  { n: '04', title: 'Evolve', text: 'After launch we measure, support and improve — so the solution keeps creating value as the business grows.', outputs: ['Monitoring & support', 'Performance reviews', 'Continuous improvement'] },
];

export const engagementModels = [
  { title: 'Discovery sprint', for: 'Any organisation with an idea or problem to define', text: 'A short, fixed-scope engagement that produces a technical roadmap, architecture and estimate.' },
  { title: 'Project delivery', for: 'Startups and SMEs with a defined scope', text: 'A dedicated team delivers a product, platform or system against agreed milestones.' },
  { title: 'Dedicated team', for: 'Scale-ups and growing product companies', text: 'A long-term, cross-functional team that works as an extension of your organisation.' },
  { title: 'Transformation programme', for: 'Enterprises and complex organisations', text: 'Multi-phase modernisation across systems, data, automation and digital channels.' },
];

export const principles = [
  { title: 'Engineering before decoration', text: 'Every visual and interactive element serves a purpose. Architecture, security and performance come first.' },
  { title: 'You own what we build', text: 'Source code, documentation and infrastructure belong to you. No artificial lock-in.' },
  { title: 'Transparent delivery', text: 'Clear scope, visible progress and honest communication — especially when something changes.' },
  { title: 'Privacy and security by design', text: 'Data protection and secure engineering practices are built in from the first decision.' },
  { title: 'Measured outcomes', text: 'We define what success looks like up front and measure against it after launch.' },
  { title: 'Built for the long term', text: 'Maintainable code and sensible technology choices that will still make sense in five years.' },
];

export const standards = [
  { area: 'Frontend', items: ['TypeScript', 'React, Next.js & modern frameworks', 'Accessible, responsive UI', 'Performance budgets'] },
  { area: 'Backend & APIs', items: ['Node.js, Python, PHP', 'REST & GraphQL APIs', 'Event-driven integrations', 'Automated testing'] },
  { area: 'AI & Data', items: ['LLM integration & retrieval', 'Evaluation & guardrails', 'Data pipelines', 'BI & visualisation'] },
  { area: 'Cloud & Ops', items: ['Infrastructure as code', 'CI/CD pipelines', 'Monitoring & alerting', 'Security reviews'] },
];
