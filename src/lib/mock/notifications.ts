export type Notification = {
  id: string;
  title: string;
  body: string;
  ago: string;
  unread: boolean;
  href: string;
};

export const notifications: Notification[] = [
  {
    id: "n1",
    title: "Booking confirmed",
    body: "Dr. Anand Rao · Tue, 8 Sept, 10:30 am",
    ago: "2h",
    unread: true,
    href: "/appointments/apt_2041",
  },
  {
    id: "n2",
    title: "Recall due soon",
    body: "Diabetic retinopathy screening — book by 5 Oct",
    ago: "1d",
    unread: true,
    href: "/dashboard?tab=recalls",
  },
  {
    id: "n3",
    title: "Prescription ready",
    body: "Allergic conjunctivitis — from your 2 Jul consult",
    ago: "5d",
    unread: false,
    href: "/dashboard?tab=prescriptions",
  },
];
