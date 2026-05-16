import { Rocket, Palette, Briefcase, PenTool, Bot, Video, Ticket } from 'lucide-react';

export const SUGGESTED_PROMPTS = [
  {
    title: "AI Startup Landing Page",
    prompt: "Build a sleek landing page for an AI startup that automates customer support. Use a dark theme with glass morphism, scroll-animated hero that pins while scrolling, and floating UI mockups. Cyan/teal accent colors.",
    icon: Rocket
  },
  {
    title: "Personal Portfolio",
    prompt: "Create a bold portfolio for a creative developer using kinetic typography - massive scrolling name in the hero, horizontal scroll project showcase, and neo-brutalist style with hard shadows and high contrast.",
    icon: Palette
  },
  {
    title: "Startup Pitch Page",
    prompt: "Create an editorial-style pitch website for a seed-stage startup. Serif typography (Playfair Display), cream/paper background, animated stat counters on scroll, and elegant asymmetric layouts.",
    icon: Briefcase
  },
  {
    title: "Design Agency Website",
    prompt: "Build a striking agency website with horizontal scroll portfolio section, neo-brutalist design with thick borders and bold color blocking. Include a kinetic marquee of client logos.",
    icon: PenTool
  },
  {
    title: "AI Tool or Web App",
    prompt: "Create a minimal web app UI for an AI writing tool. Vercel/Linear aesthetic with near-black sidebar, subtle hover states, and clean typography. Include a mock editor with floating toolbar.",
    icon: Bot
  },
  {
    title: "Creator / YouTuber Page",
    prompt: "Build an energetic personal brand site for a content creator. Use kinetic typography hero with scroll-triggered video grid, bold gradients, and playful micro-interactions on hover.",
    icon: Video
  },
  {
    title: "Event or Conference Page",
    prompt: "Create a dynamic conference landing page with pinned hero that reveals speaker cards on scroll, countdown timer animation, and a schedule section with staggered entrance animations. Dark theme with neon accent.",
    icon: Ticket
  },
];

export const AI_MODELS = [
  { id: 'gpt-5.2', name: 'GPT-5.2', provider: 'OpenAI' },
  { id: 'claude-4.5-sonnet', name: 'Claude 4.5 Sonnet', provider: 'Anthropic' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'Google' },
];

export const AGENT_MODES = [
  { id: 'agent', name: 'Agent', icon: Bot }, // Using Bot instead of Infinity for consistency or just keep it
  { id: 'ask', name: 'Ask', icon: Bot },
];
