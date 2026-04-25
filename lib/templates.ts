/**
 * Repute one-page template system.
 *
 * Every generated site is one page. The page is assembled from a fixed set of
 * templates (one per business type) and a fixed set of layout variants per
 * template. The Reason-to-Choose Analysis classifies the business and picks
 * the dominant pattern, which together select exactly one template + variant.
 *
 * This file is the single source of truth for what Repute can produce.
 * The Copy Generator agent fills these slots, it does not invent new
 * sections. That is what makes the system predictable and reviewable.
 */

export type BusinessType =
  | 'food_hospitality'
  | 'health_wellness'
  | 'education_coaching'
  | 'retail_artisan'
  | 'professional_services'
  | 'experience_venue'

export type LayoutVariant = 'A' | 'B'

export interface Section {
  /** stable id used by Copy Generator to fill slots */
  id: string
  /** human-facing label for the section in the rendered page */
  label: string
  /** what the Copy Generator should put here */
  slotIntent: string
}

export interface TemplateVariant {
  variant: LayoutVariant
  /** when this variant is picked, in plain language */
  pickedWhen: string
  /** ordered list of sections that render on the page */
  sections: Section[]
  /** the call-to-action this variant ends on */
  cta: 'visit' | 'book' | 'order' | 'enquire' | 'call'
}

export interface Template {
  type: BusinessType
  /** label shown in the showcase grid card */
  categoryLabel: string
  /** one-line description of what businesses fall under this template */
  scope: string
  variants: Record<LayoutVariant, TemplateVariant>
}

/**
 * Six sections is the ceiling for any generated page. Every variant uses
 * a subset of these in a fixed order. Slot ids are stable so the Copy
 * Generator can be schema-driven instead of free-form.
 */
const STANDARD_SECTIONS = {
  hero: {
    id: 'hero',
    label: 'Hero',
    slotIntent:
      'Headline pulled directly from the dominant reason-to-choose pattern, in customer language. One sentence. No marketing voice.',
  },
  jobs: {
    id: 'jobs',
    label: 'What customers come for',
    slotIntent:
      'Three to five reason-to-choose patterns rewritten as short, plain-language statements the customer would recognise as their own.',
  },
  proof: {
    id: 'proof',
    label: 'In their own words',
    slotIntent:
      'Three to five short review excerpts, lightly cleaned for grammar, attributed by first name and city. Each excerpt maps to one of the patterns above.',
  },
  who: {
    id: 'who',
    label: 'Who comes here',
    slotIntent:
      'Two or three customer segments the analysis surfaced, in concrete terms (not personas).',
  },
  cta: {
    id: 'cta',
    label: 'Visit, book, or order',
    slotIntent:
      'Single primary action mapped to the business type. No multiple options. No newsletter signup.',
  },
  footer: {
    id: 'footer',
    label: 'Footer',
    slotIntent:
      'Address, hours, phone, and one link to the original Google Maps listing for credibility.',
  },
} as const

const TEMPLATES: Template[] = [
  {
    type: 'food_hospitality',
    categoryLabel: 'Food & hospitality',
    scope: 'Restaurants, cafes, sweet shops, bakeries, dessert parlours.',
    variants: {
      A: {
        variant: 'A',
        pickedWhen:
          'Reviews mostly name specific dishes (the jalebi, the biryani, the dal).',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'What people come back for' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Find us, order in, or book a table' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'visit',
      },
      B: {
        variant: 'B',
        pickedWhen:
          'Reviews mostly talk about the place itself, the family, the chef, or the experience of being there.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'What people remember' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Plan a visit' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'book',
      },
    },
  },
  {
    type: 'health_wellness',
    categoryLabel: 'Health & wellness',
    scope: 'Clinics, dentists, physios, yoga studios, fertility centres.',
    variants: {
      A: {
        variant: 'A',
        pickedWhen:
          'Reviews repeatedly name a specific doctor, teacher, or practitioner.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'Why patients keep coming back' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Book an appointment' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'book',
      },
      B: {
        variant: 'B',
        pickedWhen:
          'Reviews talk about the process: how things were explained, comfort, hygiene, follow-up.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'How it feels to be a patient here' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Book your first consult' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'book',
      },
    },
  },
  {
    type: 'education_coaching',
    categoryLabel: 'Education & coaching',
    scope: 'UPSC academies, IIT/NEET coaching, music schools, language tutors.',
    variants: {
      A: {
        variant: 'A',
        pickedWhen:
          'Reviews credit one teacher, mentor, or method by name.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'What students keep saying' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Sit in on a class' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'enquire',
      },
      B: {
        variant: 'B',
        pickedWhen:
          'Reviews lead with results: ranks, scores, placements, selections.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'What students take away' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Enquire about the next batch' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'enquire',
      },
    },
  },
  {
    type: 'retail_artisan',
    categoryLabel: 'Retail & artisan',
    scope: 'Block-print stores, sweet shops, craft shops, boutique retail.',
    variants: {
      A: {
        variant: 'A',
        pickedWhen:
          'Reviews talk about how things are made: hand-block, fresh-fried, small-batch.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'Why customers come in' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Visit the store' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'visit',
      },
      B: {
        variant: 'B',
        pickedWhen:
          'Reviews talk about the range, the selection, finding things you cannot find elsewhere.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'What people come looking for' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Browse in store' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'visit',
      },
    },
  },
  {
    type: 'professional_services',
    categoryLabel: 'Professional services',
    scope: 'Corporate services, legal, accounting, immigration, advisory.',
    variants: {
      A: {
        variant: 'A',
        pickedWhen:
          'Reviews credit specific people who guided the client through the process.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'What clients keep saying' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Book a consult' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'book',
      },
      B: {
        variant: 'B',
        pickedWhen:
          'Reviews talk about turnaround, reliability, or a process that simply worked.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'How clients describe working with us' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Start a conversation' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'enquire',
      },
    },
  },
  {
    type: 'experience_venue',
    categoryLabel: 'Experience & venue',
    scope: 'Rooftop restaurants, event spaces, studios, escape rooms, galleries.',
    variants: {
      A: {
        variant: 'A',
        pickedWhen:
          'Reviews lead with the view, the room, or the atmosphere.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'What people remember about being here' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Reserve a table' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'book',
      },
      B: {
        variant: 'B',
        pickedWhen:
          'Reviews mention occasions: birthdays, anniversaries, dates, family meals.',
        sections: [
          STANDARD_SECTIONS.hero,
          { ...STANDARD_SECTIONS.jobs, label: 'What people come here for' },
          STANDARD_SECTIONS.proof,
          STANDARD_SECTIONS.who,
          { ...STANDARD_SECTIONS.cta, label: 'Plan your evening' },
          STANDARD_SECTIONS.footer,
        ],
        cta: 'book',
      },
    },
  },
]

export function getTemplate(type: BusinessType): Template {
  const t = TEMPLATES.find((x) => x.type === type)
  if (!t) throw new Error(`Unknown business type: ${type}`)
  return t
}

export function listTemplates(): Template[] {
  return TEMPLATES
}
