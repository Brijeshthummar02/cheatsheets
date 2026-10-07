import { Binary, Code2, Container, GitBranch, Layers3 } from 'lucide-react';

/**
 * Single source of truth for the cheatsheet topics.
 *
 * `color` is the brand tone — use it for decoration only (tints, borders, dots, glows).
 * `ink`   is the same hue darkened to pass WCAG AA (>= 4.5:1) against the cream surfaces —
 *         use it for text, icons-as-text and as the background behind white text.
 * (Spring Boot's teal #72BAA9 is only 2.2:1 as text, which is why `ink` exists.)
 *
 * Tint helper: `${topic.color}1A` etc. append a hex alpha to the 6-digit values below.
 */
export const TOPICS = {
  java: {
    id: 'java',
    path: '/java',
    title: 'Java Foundation',
    shortTitle: 'Java',
    flowLabel: 'Java Flow',
    color: '#2C687B',
    ink: '#2C687B',
    icon: Code2,
    language: 'java',
  },
  springboot: {
    id: 'springboot',
    path: '/springboot',
    title: 'Spring Boot Flow',
    shortTitle: 'Spring Boot',
    flowLabel: 'Spring Boot Flow',
    color: '#72BAA9',
    ink: '#2A7565',
    icon: Layers3,
    language: 'java',
  },
  dsa: {
    id: 'dsa',
    path: '/dsa',
    title: 'DSA Strategy',
    shortTitle: 'DSA',
    flowLabel: 'DSA Flow',
    color: '#6E1A37',
    ink: '#6E1A37',
    icon: Binary,
    language: 'java',
  },
  git: {
    id: 'git',
    path: '/git',
    title: 'Git Execution',
    shortTitle: 'Git',
    flowLabel: 'Git Flow',
    color: '#AE2448',
    ink: '#AE2448',
    icon: GitBranch,
    language: 'bash',
  },
  devops: {
    id: 'devops',
    path: '/devops',
    title: 'DevOps Playbook',
    shortTitle: 'DevOps',
    flowLabel: 'DevOps Flow',
    color: '#D97706',
    ink: '#A8480B',
    icon: Container,
    language: 'bash',
  },
};

export const TOPIC_IDS = Object.keys(TOPICS);

export const getTopic = (id) => TOPICS[id] ?? TOPICS.java;
