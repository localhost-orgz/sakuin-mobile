export type SplitParticipant = {
  id: string;
  name: string;
};

export type SplitItem = {
  name: string;
  quantity?: number;
  price?: number;
  total: number;
};

export type SplitSession = {
  amount: number;
  items: SplitItem[];
  participants: SplitParticipant[];
  /** Participant ids assigned to each item index */
  assignedProducts: string[][];
};

export type ParticipantBillItem = {
  name: string;
  itemTotal: number;
  share: number;
  sharedWith: number;
};

export type ParticipantBill = {
  participant: SplitParticipant;
  items: ParticipantBillItem[];
  total: number;
};

let session: SplitSession | null = null;

export const setSplitSession = (data: SplitSession) => {
  session = data;
};

export const getSplitSession = (): SplitSession | null => session;

export const clearSplitSession = () => {
  session = null;
};

export const computeParticipantBills = (
  data: SplitSession,
): ParticipantBill[] =>
  data.participants.map((participant) => {
    const items: ParticipantBillItem[] = [];
    let total = 0;

    data.items.forEach((item, idx) => {
      const assigned = data.assignedProducts[idx] ?? [];
      if (!assigned.includes(participant.id) || assigned.length === 0) return;

      const share = item.total / assigned.length;
      items.push({
        name: item.name,
        itemTotal: item.total,
        share,
        sharedWith: assigned.length,
      });
      total += share;
    });

    return { participant, items, total };
  });
