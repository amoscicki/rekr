import * as z from "zod";

// Bazowy schemat dla wspólnych pól
const baseSchema = {
  label: z.string().min(1, "Nazwa jest wymagana"),
  url: z.string().url().optional().or(z.literal("")),
};

// Schemat dla trybu update (wymaga ID)
export const updateSchema = z.object({
  ...baseSchema,
  id: z.string(),
});

// Schemat dla trybu insert (bez ID)
export const insertSchema = z.object({
  ...baseSchema,
});

export type UpdateFormData = z.infer<typeof updateSchema>;
export type InsertFormData = z.infer<typeof insertSchema>;

export interface NavigationItem {
  id: string;
  label: string;
  url?: string;
  children?: NavigationItem[];
}

export interface NavigationFormData {
  label: string;
  url?: string;
}

export const EXAMPLE_MENU: NavigationItem[] = [
  {
    id: "1",
    label: "Promocje",
    url: "https://rc32141.redcart.pl/promocje",
  },
  {
    id: "2",
    label: "Diamenty forbesa",
    url: "https://www.forbes.pl/diamenty",
    children: [
      {
        id: "2-1",
        label: "Diamenty forbesa",
        url: "https://www.forbes.pl/diamenty",
      },
      {
        id: "2-2",
        label: "Diamenty forbesa",
        url: "https://www.forbes.pl/diamenty",
      },
    ],
  },
  {
    id: "3",
    label: "Diamenty forbesa",
    url: "https://www.forbes.pl/diamenty",
  },
];
