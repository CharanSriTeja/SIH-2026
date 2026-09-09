export type UserRole = 'admin' | 'officer' | 'citizen';

export type OfficerOperationalProfile =
  | 'Monitoring & Coordination Officer'
  | 'Field Investigation Officer';

export type OfficerRegistrationStatus =
  | 'APPROVED'
  | 'PENDING_VERIFICATION'
  | 'REJECTED'
  | 'ADDITIONAL_INFO_REQUIRED';

export interface AuthAccount {
  id: string;
  role: UserRole;
  name: string;
  identifier: string;
  password: string;
  status: OfficerRegistrationStatus;
  operationalProfile?: OfficerOperationalProfile;
  locationOrDistrict?: string;
  designation?: string;
  department?: string;
  officialId?: string;
  clearanceLevel?: string;
  createdAt: string;
  rejectionReason?: string;
  additionalInfoRequired?: string;
  assignedSector?: string;
  officialPhone?: string;
  officialEmail?: string;
}

export interface OfficerAccessRequest {
  id: string;
  fullName: string;
  dob?: string;
  officialPhone?: string;
  officialEmail?: string;
  profilePhoto?: string;
  state?: string;
  district?: string;
  postingLocation?: string;
  designation: string;
  department: string;
  officialId: string;
  officialContact?: string;
  yearsOfService?: string;
  assignedDistrict: string;
  assignedSector?: string;
  operationalProfile?: OfficerOperationalProfile;
  operationalResponsibilities?: string;
  emergencyContact?: string;
  documents?: {
    idCardName?: string;
    appointmentCertName?: string;
    deptAuthCertName?: string;
    serviceCertName?: string;
  };
  submittedAt: string;
  status: OfficerRegistrationStatus;
  verificationNotes?: string;
  rejectionReason?: string;
  additionalInfoRequired?: string;
}

export type CitizenReportProblemType =
  | 'Ground Crack'
  | 'Soil Erosion'
  | 'Water Seepage'
  | 'Rockfall'
  | 'Road Damage'
  | 'Road Blockage'
  | 'Mudflow'
  | 'Retaining Wall Damage'
  | 'Other';

export type CitizenReportStatus =
  | 'PENDING VERIFICATION'
  | 'INVESTIGATION ASSIGNED'
  | 'VERIFIED'
  | 'REJECTED / DUPLICATE'
  | 'NEW'
  | 'UNDER REVIEW'
  | 'UNABLE TO VERIFY'
  | 'INVESTIGATION COMPLETED'
  | 'ASSISTANCE REQUESTED'
  | 'RESOLVED';

export interface OperationalCitizenReport {
  id: string;
  reportId: string;
  citizenName?: string;
  location: string;
  district: string;
  sector: string;
  problemType: CitizenReportProblemType;
  submittedDateTime: string;
  photoUrl: string;
  hasPhoto?: boolean;
  videoUrl?: string;
  description: string;
  status: CitizenReportStatus;
  rejectionReason?: string;
  riskContext: {
    areaRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    rainfall24h: string;
    soilMoisture: string;
    slopeContext: string;
    nearbyInfrastructure: string;
  };
  assignedOfficerName?: string;
  assignedOfficerId?: string;
  investigationTaskId?: string;
  investigationReport?: CompletedInvestigationReport;
}

export type InvestigationPriority = 'IMMEDIATE' | 'HIGH' | 'ROUTINE' | 'NORMAL' | 'CRITICAL';

export type InvestigationStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN PROGRESS'
  | 'COMPLETED'
  | 'DECLINED';

export interface CompletedInvestigationReport {
  id: string;
  taskId: string;
  reportId: string;
  investigatorName: string;
  officerId: string;
  location: string;
  observedHazard: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  weatherCondition?: 'Heavy Rain' | 'Drizzle' | 'Clear' | 'Fog';
  slopeCondition: string;
  impactedRadiusMeters?: number;
  groundCondition?: string;
  roadCondition?: string;
  waterDrainageCondition?: string;
  recommendEvacuation?: boolean;
  roadBlockageRisk?: 'FULL' | 'PARTIAL' | 'NONE';
  voiceNoteRecorded?: boolean;
  voiceNoteDurationSec?: number;
  assistanceRequested?: boolean;
  assistanceTypeNeeded?: string;
  additionalNotes: string;
  photos: string[];
  submittedDateTime: string;
  coordinates?: [number, number];
  isOfflineSynced?: boolean;
}

export interface InvestigationTask {
  id: string;
  reportId: string;
  location: string;
  hazardType: string;
  priority: InvestigationPriority;
  reasonForInvestigation: string;
  assignedInvestigatorName: string;
  assignedInvestigatorId: string;
  assignedByOfficer: string;
  status: InvestigationStatus;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  declinedReason?: string;
  distanceKm?: number;
  estTravelMinutes?: number;
  citizenEvidence?: {
    photoUrl: string;
    description: string;
    problemType: string;
  };
  riskContext?: {
    areaRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    rainfallInfo: string;
    notes: string;
  };
  completedReport?: CompletedInvestigationReport;
}

export type ResponseTeamType =
  | 'Evacuation & Resident Transport'
  | 'Road Clearance & Heavy Machinery'
  | 'Emergency Slope Shoring / Sandbagging'
  | 'Geotechnical Sensor Rapid Deployment';

export type RequiredAssistanceType =
  | 'ROAD CLEARANCE'
  | 'RESCUE & EVACUATION'
  | 'MEDICAL SUPPORT'
  | 'FIRE & EMERGENCY RESPONSE'
  | 'TRAFFIC / ROAD CONTROL'
  | 'RELIEF & LOGISTICS'
  | 'OTHER';

export type ResponseTeamStatus =
  | 'RESPONSE TEAM DISPATCHED'
  | 'ON SITE'
  | 'RESOLVED'
  | 'TASK SENT'
  | 'ACCEPTED'
  | 'TEAM RESPONDING'
  | 'COMPLETED';

export interface ResponseTeamTask {
  id: string;
  incidentId: string;
  location: string;
  sector?: string;
  hazardType: string;
  priority: 'ROUTINE' | 'HIGH' | 'IMMEDIATE' | 'NORMAL' | 'CRITICAL';
  teamType?: ResponseTeamType;
  requiredAssistance: RequiredAssistanceType[];
  additionalInstructions: string;
  assignedTeamName: string;
  teamLeaderName: string;
  status: ResponseTeamStatus;
  sentAt: string;
  acceptedAt?: string;
  respondingAt?: string;
  completedAt?: string;
}

export interface EnvironmentalTelemetry {
  rainfallMm24h: number;
  rainfallRateMmHr: number;
  soilMoisturePct: number;
  slopeDeg: number;
  porePressureKpa: number;
  historicalEventsCount: number;
  terrainClassification: string;
  shearStressRatio: number;
  riskProbabilityPct: number;
}

export interface RiskZone {
  id: string;
  name: string;
  region: string;
  state: string;
  coordinates: [number, number];
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  rainfall24h: number;
  soilSaturation: number;
  slopeAngle: number;
  peopleAtRisk: number;
  registeredRecipients: number;
  infrastructure: {
    schools: number;
    hospitals: number;
    bridges: number;
    roadSegments: number;
  };
  shelter: {
    name: string;
    distanceKm: number;
    capacity: number;
    currentOccupancy: number;
    coordinates: [number, number];
  };
}

export interface SystemStage {
  step: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  metrics: string;
  technology: string;
}

export interface FieldIncidentReport {
  id: string;
  reporterName: string;
  reporterRole: 'citizen' | 'field_official' | 'quick_response_team';
  locationName: string;
  district: string;
  state: string;
  coordinates: [number, number];
  timestamp: string;
  category: 'tension_crack' | 'slope_movement' | 'rockfall' | 'road_blockage' | 'culvert_overflow' | 'mudflow';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  photoUrl: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'QRT_DEPLOYED' | 'RESOLVED';
  synced: boolean;
}

export interface RoadLifeline {
  id: string;
  highwayCode: string;
  corridorName: string;
  state: string;
  status: 'OPEN' | 'RESTRICTED' | 'BLOCKED';
  vulnerabilityScore: number;
  blockageCause?: string;
  estimatedClearance?: string;
  bypassRouteName?: string;
  activeMachinery: string;
  coordinates: [number, number];
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM';
}

export interface ImdWeatherStation {
  id: string;
  stationName: string;
  district: string;
  state: string;
  rainfall24hMm: number;
  rainfallHourlyRateMm: number;
  radarEchoDbz: number;
  warningColor: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  forecast72hText: string;
  satelliteVapourSaturation: number;
  lastUpdated: string;
}

export interface InSituSensorNode {
  id: string;
  sensorType: 'TDR_SOIL_MOISTURE' | 'PIEZOMETER_PORE_PRESSURE' | 'MEMS_TILTMETER' | 'RAIN_GAUGE';
  location: string;
  sectorId: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  batteryPct: number;
  telemetrySource: 'LORAWAN' | 'SATELLITE_UPLINK' | 'CELLULAR_4G';
}

export interface MultilingualBroadcast {
  languageCode: 'en' | 'as' | 'lus' | 'hi' | 'bn';
  languageName: string;
  nativeLabel: string;
  headline: string;
  messageBody: string;
  actionGuidance: string;
  safetyShelter: string;
}
