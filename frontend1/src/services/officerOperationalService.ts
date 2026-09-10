import {
  OperationalCitizenReport,
  InvestigationTask,
  ResponseTeamTask,
  CompletedInvestigationReport,
  InvestigationPriority,
  RequiredAssistanceType,
  CitizenReportStatus
} from '../types';

const STORAGE_CITIZEN_REPORTS_KEY = 'bhuraksha_operational_citizen_reports_v2';
const STORAGE_INVESTIGATION_TASKS_KEY = 'bhuraksha_operational_investigation_tasks_v2';
const STORAGE_RESPONSE_TASKS_KEY = 'bhuraksha_operational_response_tasks_v2';

export interface AvailableInvestigator {
  id: string;
  name: string;
  designation: string;
  district: string;
  contact: string;
  activeTasks: number;
}

export const AUTHORIZED_INVESTIGATORS: AvailableInvestigator[] = [
  {
    id: 'OFF-9042',
    name: 'Officer Priya Das',
    designation: 'Senior Field Investigation Officer',
    district: 'Aizawl & East Khasi Hills',
    contact: '+91 94361 90420',
    activeTasks: 1,
  },
  {
    id: 'OFF-7714',
    name: 'Officer David Lyngdoh',
    designation: 'Geotechnical Field Investigator',
    district: 'Cherrapunji & Sohra Division',
    contact: '+91 98622 77140',
    activeTasks: 0,
  },
  {
    id: 'OFF-6631',
    name: 'Officer L. Malsawma',
    designation: 'Slope Hazard Inspector',
    district: 'Tuirial Valley & Central Division',
    contact: '+91 94363 66311',
    activeTasks: 0,
  },
];

export const RESPONSE_TEAMS = [
  {
    id: 'RT-01',
    name: 'Evacuation & Resident Transport',
    leader: 'Capt. R. Kharkongor',
    specialty: 'Civil Defense & Mountain Evacuation',
    contact: '+91 98630 11200',
    base: 'Central Disaster Response Post',
  },
  {
    id: 'RT-02',
    name: 'Road Clearance & Heavy Machinery',
    leader: 'Eng. L. Thangkhiew',
    specialty: 'Heavy Earthmovers & Slump Clearance',
    contact: '+91 94361 33410',
    base: 'NH-54 Hill Highway Division',
  },
  {
    id: 'RT-03',
    name: 'Emergency Slope Shoring / Sandbagging',
    leader: 'Chief Insp. H. Marwein',
    specialty: 'Structural Shoring & Hydraulic Gabions',
    contact: '+91 94360 88910',
    base: 'State Emergency Services HQ',
  },
  {
    id: 'RT-04',
    name: 'Geotechnical Sensor Rapid Deployment',
    leader: 'Dr. S. Mazumdar',
    specialty: 'Acoustic / Tilt Wireline Sensor Setup',
    contact: '+91 98625 55420',
    base: 'GSI Geohazard Field Unit',
  },
];

const SEED_CITIZEN_REPORTS: OperationalCitizenReport[] = [
  {
    id: 'CIT-REP-1052',
    reportId: '#1052',
    citizenName: 'M. Zothansanga',
    location: 'Cherrapunji Sector (Nohkalikai Road Km 7.8)',
    district: 'East Khasi Hills',
    sector: 'Sector A',
    problemType: 'Ground Crack',
    submittedDateTime: 'Today, 14:10 IST',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    hasPhoto: true,
    description: 'Long continuous ground crack across the outer road berm. Asphalt has subsided approximately 12 centimeters following 180mm rainfall.',
    status: 'PENDING VERIFICATION',
    riskContext: {
      areaRiskLevel: 'HIGH',
      rainfall24h: '194 mm / 24h',
      soilMoisture: '88% (Pore Saturation Critical)',
      slopeContext: 'Steep hill slope (38° gradient)',
      nearbyInfrastructure: 'Nohkalikai Access Road & 2 Village Settlements (140 households)',
    },
  },
  {
    id: 'CIT-REP-1049',
    reportId: '#1049',
    citizenName: 'L. Hmingthanga',
    location: 'Durtlang Ridge Sector (Km 14.2 Ridge Escarpment)',
    district: 'Aizawl District',
    sector: 'Sector A',
    problemType: 'Water Seepage',
    submittedDateTime: 'Today, 13:25 IST',
    photoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    hasPhoto: true,
    description: 'Heavy muddy water discharging from retaining wall weep holes with loose soil particles emerging. Wall showing slight outward tilt.',
    status: 'INVESTIGATION ASSIGNED',
    riskContext: {
      areaRiskLevel: 'HIGH',
      rainfall24h: '142 mm / 24h',
      soilMoisture: '84% (High Saturation)',
      slopeContext: 'Cut slope with RCC retaining structure (42° gradient)',
      nearbyInfrastructure: 'Ridge Highway & Sub-station Feeder Line',
    },
    assignedOfficerName: 'Officer Priya Das',
    assignedOfficerId: 'OFF-9042',
    investigationTaskId: 'INV-1024',
  },
  {
    id: 'CIT-REP-1048',
    reportId: '#1048',
    citizenName: 'R. Lalbiakzuala',
    location: 'Tuirial Valley Corridor (Bridge #3 Approach)',
    district: 'Aizawl District',
    sector: 'Sector B',
    problemType: 'Retaining Wall Damage',
    submittedDateTime: 'Today, 11:45 IST',
    photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    hasPhoto: true,
    description: 'Toe erosion along the riverbank embankment near bridge pier. Runoff cutting deep gullies into the shoulder.',
    status: 'PENDING VERIFICATION',
    riskContext: {
      areaRiskLevel: 'MODERATE',
      rainfall24h: '112 mm / 24h',
      soilMoisture: '76% (Elevated)',
      slopeContext: 'River valley terrace slope (25° gradient)',
      nearbyInfrastructure: 'Tuirial River Lifeline Bridge & Water Supply Pipeline',
    },
  },
  {
    id: 'CIT-REP-1044',
    reportId: '#1044',
    citizenName: 'K. Vanlalruata',
    location: 'Mawsynram Slopes (Mawkdok Escarpment)',
    district: 'East Khasi Hills',
    sector: 'Sector C',
    problemType: 'Rockfall',
    submittedDateTime: 'Today, 09:15 IST',
    photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    hasPhoto: true,
    description: 'Multiple shale boulders fell across the outer bypass lane. Overhang rocks above appear unstable after continuous drizzle.',
    status: 'VERIFIED',
    riskContext: {
      areaRiskLevel: 'HIGH',
      rainfall24h: '210 mm / 24h',
      soilMoisture: '91% (Critical)',
      slopeContext: 'Jointed rock escarpment (55° gradient)',
      nearbyInfrastructure: 'State Highway 5 & Tourist Viewpoint Area',
    },
    assignedOfficerName: 'Officer Priya Das',
    assignedOfficerId: 'OFF-9042',
    investigationTaskId: 'INV-1021',
  },
  {
    id: 'CIT-REP-1041',
    reportId: '#1041',
    citizenName: 'Anonymous Citizen',
    location: 'Bawngkawn Inner By-lane',
    district: 'Aizawl District',
    sector: 'Sector C',
    problemType: 'Road Damage',
    submittedDateTime: 'Today, 08:30 IST',
    photoUrl: '',
    hasPhoto: false,
    description: 'Potholes after rain on minor residential cul-de-sac.',
    status: 'REJECTED / DUPLICATE',
    rejectionReason: 'False alarm / Routine municipal pavement wear, no active mass slope movement observed.',
    riskContext: {
      areaRiskLevel: 'LOW',
      rainfall24h: '60 mm / 24h',
      soilMoisture: '45%',
      slopeContext: 'Gentle grade (8° gradient)',
      nearbyInfrastructure: 'Internal access alley',
    },
  },
];

const SEED_INVESTIGATION_TASKS: InvestigationTask[] = [
  {
    id: 'INV-1024',
    reportId: '#1049',
    location: 'Durtlang Ridge Sector (Km 14.2 Ridge Escarpment)',
    hazardType: 'Water Seepage & Wall Distress',
    priority: 'IMMEDIATE',
    reasonForInvestigation: 'Substantial seepage and outward retaining wall deflection reported after heavy rainfall; risk of sudden structural failure above primary transport route.',
    assignedInvestigatorName: 'Officer Priya Das',
    assignedInvestigatorId: 'OFF-9042',
    assignedByOfficer: 'Officer Rahul Sharma',
    status: 'ASSIGNED',
    createdAt: '15 mins ago',
    distanceKm: 1.4,
    estTravelMinutes: 9,
    citizenEvidence: {
      photoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
      description: 'Heavy muddy water discharging from retaining wall weep holes with loose soil particles emerging. Wall showing slight outward tilt.',
      problemType: 'Water Seepage',
    },
    riskContext: {
      areaRiskLevel: 'HIGH',
      rainfallInfo: '142 mm rainfall in last 24h, pore water pressure increasing',
      notes: 'Investigate retaining wall integrity, measure tilt displacement, check for crest tension cracks on the upper terrace.',
    }
  },
  {
    id: 'INV-1021',
    reportId: '#1044',
    location: 'Mawsynram Slopes (Mawkdok Escarpment)',
    hazardType: 'Rockfall & Unstable Escarpment Overhang',
    priority: 'HIGH',
    reasonForInvestigation: 'Active rockfall on outer bypass road; immediate inspection needed to determine if larger detachment is imminent.',
    assignedInvestigatorName: 'Officer Priya Das',
    assignedInvestigatorId: 'OFF-9042',
    assignedByOfficer: 'Officer Rahul Sharma',
    status: 'COMPLETED',
    createdAt: 'Today, 09:30 IST',
    acceptedAt: 'Today, 09:42 IST',
    completedAt: 'Today, 10:45 IST',
    distanceKm: 3.2,
    estTravelMinutes: 18,
    citizenEvidence: {
      photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      description: 'Multiple shale boulders fell across the outer bypass lane.',
      problemType: 'Rockfall',
    },
    completedReport: {
      id: 'REP-INV-1021',
      taskId: 'INV-1021',
      reportId: '#1044',
      investigatorName: 'Officer Priya Das',
      officerId: 'OFF-9042',
      location: 'Mawsynram Slopes (Mawkdok Escarpment)',
      observedHazard: 'Rockfall & Unstable Escarpment Overhang',
      severity: 'HIGH',
      weatherCondition: 'Heavy Rain',
      slopeCondition: 'Active movement observed with joint dilation',
      impactedRadiusMeters: 65,
      groundCondition: 'Saturated shale debris with active talus sliding',
      roadCondition: 'Single lane blocked by 3 large boulders (1.2m diameter)',
      waterDrainageCondition: 'Natural cascade overflow spilling directly onto road formation',
      recommendEvacuation: false,
      roadBlockageRisk: 'PARTIAL',
      voiceNoteRecorded: true,
      voiceNoteDurationSec: 18,
      assistanceRequested: true,
      assistanceTypeNeeded: 'Road Clearance & Heavy Machinery',
      additionalNotes: 'Immediate mechanical clearance and temporary boulder net catch barrier recommended.',
      photos: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
      ],
      submittedDateTime: 'Today, 10:45 IST',
      coordinates: [25.298, 91.582],
      isOfflineSynced: true,
    }
  },
];

const SEED_RESPONSE_TASKS: ResponseTeamTask[] = [
  {
    id: 'RESP-401',
    incidentId: 'INC-1044',
    location: 'Mawsynram Slopes (Mawkdok Escarpment Km 21.4)',
    hazardType: 'Rockfall & Road Obstruction',
    priority: 'HIGH',
    requiredAssistance: ['ROAD CLEARANCE', 'TRAFFIC / ROAD CONTROL'],
    additionalInstructions: 'Deploy heavy excavator and rock breaker to clear outer bypass. Place traffic warning barriers 200m ahead.',
    assignedTeamName: 'Road Clearance Team',
    teamLeaderName: 'Eng. L. Thangkhiew',
    status: 'ACCEPTED',
    sentAt: 'Today, 11:00 IST',
    acceptedAt: 'Today, 11:08 IST',
  }
];

export class OfficerOperationalService {
  // Citizen Reports
  public static getCitizenReports(): OperationalCitizenReport[] {
    try {
      const stored = localStorage.getItem(STORAGE_CITIZEN_REPORTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    localStorage.setItem(STORAGE_CITIZEN_REPORTS_KEY, JSON.stringify(SEED_CITIZEN_REPORTS));
    return SEED_CITIZEN_REPORTS;
  }

  public static saveCitizenReports(reports: OperationalCitizenReport[]): void {
    try {
      localStorage.setItem(STORAGE_CITIZEN_REPORTS_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error(e);
    }
  }

  // Investigation Tasks
  public static getInvestigationTasks(): InvestigationTask[] {
    try {
      const stored = localStorage.getItem(STORAGE_INVESTIGATION_TASKS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    localStorage.setItem(STORAGE_INVESTIGATION_TASKS_KEY, JSON.stringify(SEED_INVESTIGATION_TASKS));
    return SEED_INVESTIGATION_TASKS;
  }

  public static saveInvestigationTasks(tasks: InvestigationTask[]): void {
    try {
      localStorage.setItem(STORAGE_INVESTIGATION_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }

  // Response Tasks
  public static getResponseTasks(): ResponseTeamTask[] {
    try {
      const stored = localStorage.getItem(STORAGE_RESPONSE_TASKS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    localStorage.setItem(STORAGE_RESPONSE_TASKS_KEY, JSON.stringify(SEED_RESPONSE_TASKS));
    return SEED_RESPONSE_TASKS;
  }

  public static saveResponseTasks(tasks: ResponseTeamTask[]): void {
    try {
      localStorage.setItem(STORAGE_RESPONSE_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }

  // Action: Create and Assign Investigation Task from Citizen Report
  public static assignInvestigationTask(params: {
    reportId: string;
    location: string;
    hazardType: string;
    priority: InvestigationPriority;
    reasonForInvestigation: string;
    assignedInvestigatorId: string;
    assignedByOfficer: string;
    citizenPhotoUrl: string;
    citizenDescription: string;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    rainfallInfo: string;
  }): { success: boolean; task: InvestigationTask } {
    const investigator = AUTHORIZED_INVESTIGATORS.find((i) => i.id === params.assignedInvestigatorId) || AUTHORIZED_INVESTIGATORS[0];
    const taskId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTask: InvestigationTask = {
      id: taskId,
      reportId: params.reportId,
      location: params.location,
      hazardType: params.hazardType,
      priority: params.priority,
      reasonForInvestigation: params.reasonForInvestigation,
      assignedInvestigatorName: investigator.name,
      assignedInvestigatorId: investigator.id,
      assignedByOfficer: params.assignedByOfficer,
      status: 'ASSIGNED',
      createdAt: 'Just now',
      citizenEvidence: {
        photoUrl: params.citizenPhotoUrl,
        description: params.citizenDescription,
        problemType: params.hazardType,
      },
      riskContext: {
        areaRiskLevel: params.riskLevel,
        rainfallInfo: params.rainfallInfo,
        notes: params.reasonForInvestigation,
      }
    };

    const tasks = this.getInvestigationTasks();
    tasks.unshift(newTask);
    this.saveInvestigationTasks(tasks);

    // Update the citizen report status
    const reports = this.getCitizenReports();
    const rep = reports.find((r) => r.reportId === params.reportId || r.id === params.reportId);
    if (rep) {
      rep.status = 'INVESTIGATION ASSIGNED';
      rep.assignedOfficerName = investigator.name;
      rep.assignedOfficerId = investigator.id;
      rep.investigationTaskId = taskId;
      this.saveCitizenReports(reports);
    }

    return { success: true, task: newTask };
  }

  // Action: Investigator Accepts Task
  public static acceptInvestigationTask(taskId: string): boolean {
    const tasks = this.getInvestigationTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    task.status = 'ACCEPTED';
    task.acceptedAt = 'Just now';
    this.saveInvestigationTasks(tasks);
    return true;
  }

  // Action: Investigator Starts Investigation
  public static startInvestigation(taskId: string): boolean {
    const tasks = this.getInvestigationTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    task.status = 'IN PROGRESS';
    this.saveInvestigationTasks(tasks);
    return true;
  }

  // Action: Investigator Submits Completed Investigation
  public static submitCompletedInvestigation(params: {
    taskId: string;
    reportId: string;
    investigatorName: string;
    officerId: string;
    location: string;
    observedHazard: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    groundCondition: string;
    slopeCondition: string;
    roadCondition: string;
    waterDrainageCondition: string;
    additionalNotes: string;
    photos: string[];
    coordinates?: [number, number];
  }): boolean {
    const tasks = this.getInvestigationTasks();
    const task = tasks.find((t) => t.id === params.taskId);

    const completedReport: CompletedInvestigationReport = {
      id: `REP-${params.taskId}`,
      taskId: params.taskId,
      reportId: params.reportId,
      investigatorName: params.investigatorName,
      officerId: params.officerId,
      location: params.location,
      observedHazard: params.observedHazard,
      severity: params.severity,
      groundCondition: params.groundCondition,
      slopeCondition: params.slopeCondition,
      roadCondition: params.roadCondition,
      waterDrainageCondition: params.waterDrainageCondition,
      additionalNotes: params.additionalNotes,
      photos: params.photos.length > 0 ? params.photos : [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80'
      ],
      submittedDateTime: 'Just now',
      coordinates: params.coordinates || [25.298, 91.582],
      isOfflineSynced: true,
    };

    if (task) {
      task.status = 'COMPLETED';
      task.completedAt = 'Just now';
      task.completedReport = completedReport;
      this.saveInvestigationTasks(tasks);
    }

    // Also update citizen report
    const reports = this.getCitizenReports();
    const rep = reports.find((r) => r.reportId === params.reportId || r.investigationTaskId === params.taskId);
    if (rep) {
      rep.status = 'INVESTIGATION COMPLETED';
      rep.investigationReport = completedReport;
      this.saveCitizenReports(reports);
    }

    return true;
  }

  // Action: Create Response Team Task
  public static createResponseTask(params: {
    incidentId: string;
    location: string;
    hazardType: string;
    priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
    requiredAssistance: RequiredAssistanceType[];
    additionalInstructions: string;
    teamName: string;
    teamLeaderName: string;
  }): ResponseTeamTask {
    const taskId = `RESP-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: ResponseTeamTask = {
      id: taskId,
      incidentId: params.incidentId,
      location: params.location,
      hazardType: params.hazardType,
      priority: params.priority,
      requiredAssistance: params.requiredAssistance,
      additionalInstructions: params.additionalInstructions,
      assignedTeamName: params.teamName,
      teamLeaderName: params.teamLeaderName,
      status: 'TASK SENT',
      sentAt: 'Just now',
    };

    const responseTasks = this.getResponseTasks();
    responseTasks.unshift(newTask);
    this.saveResponseTasks(responseTasks);

    // Update citizen report if matching
    const reports = this.getCitizenReports();
    const rep = reports.find((r) => r.reportId === params.incidentId || r.id === params.incidentId);
    if (rep) {
      rep.status = 'ASSISTANCE REQUESTED';
      this.saveCitizenReports(reports);
    }

    return newTask;
  }

  // Action: Reject / Close Citizen Report with reason
  public static rejectCitizenReport(reportId: string, reason: string): boolean {
    const reports = this.getCitizenReports();
    const rep = reports.find((r) => r.reportId === reportId || r.id === reportId);
    if (!rep) return false;

    rep.status = 'REJECTED / DUPLICATE';
    rep.rejectionReason = reason;
    this.saveCitizenReports(reports);
    return true;
  }

  // Action: Decline / Reassign Investigation Task
  public static declineInvestigationTask(taskId: string, reason: string): boolean {
    const tasks = this.getInvestigationTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    task.status = 'DECLINED';
    task.declinedReason = reason;
    this.saveInvestigationTasks(tasks);

    // Also update citizen report status back so it can be reassigned
    const reports = this.getCitizenReports();
    const rep = reports.find((r) => r.investigationTaskId === taskId || r.reportId === task.reportId);
    if (rep) {
      rep.status = 'PENDING VERIFICATION';
      rep.assignedOfficerName = undefined;
      rep.assignedOfficerId = undefined;
      rep.investigationTaskId = undefined;
      this.saveCitizenReports(reports);
    }

    return true;
  }

  // Action: Deploy Response Team from Monitoring Desk
  public static deployResponseTeam(params: {
    incidentId: string;
    location: string;
    sector?: string;
    hazardType: string;
    priority: 'ROUTINE' | 'HIGH' | 'IMMEDIATE' | 'NORMAL' | 'CRITICAL';
    teamType: ResponseTeamType;
    additionalInstructions: string;
  }): ResponseTeamTask {
    const team = RESPONSE_TEAMS.find((t) => t.name === params.teamType) || RESPONSE_TEAMS[0];
    const taskId = `RT-DISPATCH-${Math.floor(100 + Math.random() * 900)}`;

    const newTask: ResponseTeamTask = {
      id: taskId,
      incidentId: params.incidentId,
      location: params.location,
      sector: params.sector || 'Sector A',
      hazardType: params.hazardType,
      priority: params.priority,
      teamType: params.teamType,
      requiredAssistance: ['ROAD CLEARANCE'],
      additionalInstructions: params.additionalInstructions,
      assignedTeamName: team.name,
      teamLeaderName: team.leader,
      status: 'RESPONSE TEAM DISPATCHED',
      sentAt: 'Just now',
    };

    const responseTasks = this.getResponseTasks();
    responseTasks.unshift(newTask);
    this.saveResponseTasks(responseTasks);

    // Update citizen report if matching
    const reports = this.getCitizenReports();
    const rep = reports.find((r) => r.reportId === params.incidentId || r.id === params.incidentId);
    if (rep) {
      rep.status = 'ASSISTANCE REQUESTED';
      this.saveCitizenReports(reports);
    }

    return newTask;
  }

  // Advance Response Team Task status: DISPATCHED -> ON SITE -> RESOLVED
  public static cycleResponseTeamStatus(taskId: string): ResponseTeamTask | null {
    const responseTasks = this.getResponseTasks();
    const task = responseTasks.find((t) => t.id === taskId);
    if (!task) return null;

    if (task.status === 'RESPONSE TEAM DISPATCHED' || task.status === 'TASK SENT' || task.status === 'ACCEPTED') {
      task.status = 'ON SITE';
      task.respondingAt = 'Just now';
    } else if (task.status === 'ON SITE' || task.status === 'TEAM RESPONDING') {
      task.status = 'RESOLVED';
      task.completedAt = 'Just now';
    }
    this.saveResponseTasks(responseTasks);
    return task;
  }

  // Advance Response Team Task status (for interactive demo)
  public static advanceResponseTaskStatus(taskId: string): ResponseTeamTask | null {
    return this.cycleResponseTeamStatus(taskId);
  }

  // Update citizen report status directly
  public static updateCitizenReportStatus(reportId: string, status: CitizenReportStatus): void {
    const reports = this.getCitizenReports();
    const rep = reports.find((r) => r.reportId === reportId || r.id === reportId);
    if (rep) {
      rep.status = status;
      this.saveCitizenReports(reports);
    }
  }
}
