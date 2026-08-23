export interface CrewLeadActor {
  type: 'CREW_LEAD';
  id: string;
}

export interface PassengerActor {
  type: 'PASSENGER';
  id: string;
}

export interface CrewLeadProfile {
  id?: string;
  missionCode: string;
  fullName: string;
  email?: string | null;
}
