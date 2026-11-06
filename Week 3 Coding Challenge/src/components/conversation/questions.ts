import type { AnswerField, Step } from "@/domain/conversation";

export type Option = { value: string; label: string; hint?: string };

export type Question = {
  field: AnswerField;
  number: number;
  stepLabel: string;
  summaryLabel: string;
  prompt: string;
  options: Option[];
};

export const QUESTIONS: Question[] = [
  {
    field: "goal",
    number: 1,
    stepLabel: "Goal",
    summaryLabel: "Goal",
    prompt: "What are you looking for?",
    options: [
      { value: "project_experience", label: "Project experience" },
      { value: "learning", label: "Learning" },
      { value: "community_involvement", label: "Community involvement" },
      { value: "not_sure", label: "Not sure yet" },
    ],
  },
  {
    field: "experience",
    number: 2,
    stepLabel: "Experience",
    summaryLabel: "Experience",
    prompt: "How much tech experience do you have?",
    options: [
      {
        value: "new_to_tech",
        label: "New to tech",
        hint: "No tech job or team project yet",
      },
      {
        value: "some_experience",
        label: "Some experience",
        hint: "A course, bootcamp, or side project",
      },
      {
        value: "experienced_in_tech",
        label: "Experienced in tech",
        hint: "Worked in a tech role before",
      },
    ],
  },
  {
    field: "availability",
    number: 3,
    stepLabel: "Time",
    summaryLabel: "Time",
    prompt: "About how many hours a week can you give?",
    options: [
      { value: "under_5", label: "Under 5 hours" },
      { value: "5_to_10", label: "5 to 10 hours" },
      { value: "10_to_20", label: "10 to 20 hours" },
      { value: "more_than_20", label: "More than 20 hours" },
    ],
  },
];

export function questionFor(step: Step) {
  return QUESTIONS.find((question) => question.field === step);
}

export function labelFor(field: AnswerField, value: string | null) {
  const question = QUESTIONS.find((item) => item.field === field);
  return question?.options.find((option) => option.value === value)?.label;
}
