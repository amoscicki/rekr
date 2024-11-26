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
