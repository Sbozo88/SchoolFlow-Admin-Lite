export type HandoverTaskStatus = "Pending" | "Done";

export type HandoverTask = {
  id: string;
  title: string;
  description: string;
  status: HandoverTaskStatus;
  term: string;
  createdAt: Date;
  updatedAt: Date;
};
