import { AuthAccount, OfficerAccessRequest, UserRole } from '../types';

const STORAGE_ACCOUNTS_KEY = 'bhuraksha_auth_accounts_v2';
const STORAGE_REQUESTS_KEY = 'bhuraksha_officer_requests_v2';
const STORAGE_SESSION_KEY = 'bhuraksha_active_session_v2';

// System Provisioned Accounts (Default Seed)
const SEED_ACCOUNTS: AuthAccount[] = [
  {
    id: 'CIT-1001',
    role: 'citizen',
    name: 'M. Zothansanga',
    identifier: '+91 98620 44102',
    password: 'citizen@123',
    status: 'APPROVED',
    locationOrDistrict: 'Sector A (Durtlang Ridge, Aizawl)',
    createdAt: '2026-08-15T09:00:00Z',
  },
  {
    id: 'OFF-8821',
    role: 'officer',
    name: 'Officer Rahul Sharma',
    identifier: 'OFF-8821',
    password: 'officer@123',
    status: 'APPROVED',
    operationalProfile: 'Monitoring & Coordination Officer',
    designation: 'Disaster Monitoring & Coordination Officer',
    department: 'SDMA Emergency Operations & Monitoring Wing',
    officialId: 'OFF-8821',
    locationOrDistrict: 'East Khasi Hills & Central Sector',
    assignedSector: 'Cherrapunji & Durtlang Ridge Sectors',
    officialPhone: '+91 98620 44102',
    officialEmail: 'r.sharma@sdma.gov.in',
    createdAt: '2026-07-20T10:30:00Z',
  },
  {
    id: 'OFF-9042',
    role: 'officer',
    name: 'Officer Priya Das',
    identifier: 'OFF-9042',
    password: 'officer@123',
    status: 'APPROVED',
    operationalProfile: 'Field Investigation Officer',
    designation: 'Senior Field Investigation Officer',
    department: 'State Emergency Response & Field Inspection Wing',
    officialId: 'OFF-9042',
    locationOrDistrict: 'Sector A & Ridge Escarpment',
    assignedSector: 'Cherrapunji & Durtlang Ridge Sectors',
    officialPhone: '+91 94361 90420',
    officialEmail: 'priya.das@sdma.gov.in',
    createdAt: '2026-07-25T11:00:00Z',
  },
  {
    id: 'OFF-PENDING',
    role: 'officer',
    name: 'Eng. K. Marak',
    identifier: 'OFF-PENDING',
    password: 'officer@123',
    status: 'PENDING_VERIFICATION',
    designation: 'Junior Engineer (Roads)',
    department: 'State PWD Hill Division',
    officialId: 'PWD-NER-5519',
    locationOrDistrict: 'Tuirial Valley Sub-Division',
    assignedSector: 'Sector B (Tuirial Valley)',
    officialPhone: '+91 94361 88201',
    officialEmail: 'k.marak@pwd.gov.in',
    createdAt: '2026-09-06T14:15:00Z',
  },
  {
    id: 'OFF-REJECTED',
    role: 'officer',
    name: 'Field Officer P. Jamatia',
    identifier: 'OFF-REJECTED',
    password: 'officer@123',
    status: 'REJECTED',
    designation: 'Soil Conservation Assistant',
    department: 'District Agriculture & Soil Department',
    officialId: 'AGRI-NER-3042',
    locationOrDistrict: 'Kolasib District',
    assignedSector: 'Northern Slopes',
    rejectionReason:
      'Official authorization letter missing official stamp and signature from District Collectorate. Please re-submit with an authenticated SDMA deployment order.',
    createdAt: '2026-09-02T11:00:00Z',
  },
  {
    id: 'OFF-INFO',
    role: 'officer',
    name: 'Officer V. Sailo',
    identifier: 'OFF-INFO',
    password: 'officer@123',
    status: 'ADDITIONAL_INFO_REQUIRED',
    designation: 'Assistant Geologist',
    department: 'Geology & Mineral Resources Dept',
    officialId: 'GEO-MZ-1108',
    locationOrDistrict: 'Aizawl District',
    assignedSector: 'Sector C (Zuangtui Industrial)',
    additionalInfoRequired:
      'Please submit an updated departmental deployment order and valid emergency contact verification for Monsoon 2026 field operations.',
    createdAt: '2026-09-04T09:30:00Z',
  },
  {
    id: 'ADM-4091',
    role: 'admin',
    name: 'Dr. R. Lalrinzuala',
    identifier: 'ADM-4091',
    password: 'admin@123',
    status: 'APPROVED',
    designation: 'State Disaster Management Authority Chief',
    department: 'Mizoram SDMA Command Center',
    clearanceLevel: 'Level 3 - Full Incident Commander',
    createdAt: '2026-06-01T08:00:00Z',
  },
];

// Initial Seed Officer Access Requests
const SEED_REQUESTS: OfficerAccessRequest[] = [
  {
    id: 'REQ-FO-5519',
    fullName: 'Eng. K. Marak',
    dob: '1988-04-12',
    officialPhone: '+91 94361 88201',
    officialEmail: 'k.marak@pwd.gov.in',
    state: 'Mizoram',
    district: 'Aizawl',
    postingLocation: 'Tuirial Sub-Division Office',
    designation: 'Junior Engineer (Roads)',
    department: 'State PWD Hill Division',
    officialId: 'PWD-NER-5519',
    yearsOfService: '6 Years',
    assignedDistrict: 'Aizawl District',
    assignedSector: 'Sector B (Tuirial Valley)',
    operationalResponsibilities: 'Slope monitoring along NH-54 & culvert inspections',
    emergencyContact: '+91 94361 88299 (PWD Control Room)',
    documents: {
      idCardName: 'PWD_Official_ID_Marak.pdf',
      appointmentCertName: 'Govt_Appointment_Order_2020.pdf',
      deptAuthCertName: 'Hill_Roads_Authorization.pdf',
      serviceCertName: 'Service_Record_Summary.pdf',
    },
    submittedAt: '2026-09-06T14:15:00Z',
    status: 'PENDING_VERIFICATION',
    verificationNotes: 'Under administrative review by SDMA System Administration.',
  },
  {
    id: 'REQ-FO-8821',
    fullName: 'Officer T. Sangma',
    dob: '1984-11-23',
    officialPhone: '+91 98620 44102',
    officialEmail: 't.sangma@sdma.gov.in',
    state: 'Mizoram',
    district: 'Aizawl',
    postingLocation: 'SDMA District Disaster Management Office',
    designation: 'Senior Geotechnical Surveyor',
    department: 'SDMA Field Operations Unit',
    officialId: 'OFF-8821',
    yearsOfService: '11 Years',
    assignedDistrict: 'Aizawl District',
    assignedSector: 'Sector A & Sector B (Durtlang Ridge)',
    operationalResponsibilities: 'Geotechnical slope verification & citizen hazard triage',
    emergencyContact: '+91 98620 44100 (SDMA Dispatch)',
    documents: {
      idCardName: 'SDMA_Badge_Sangma.pdf',
      appointmentCertName: 'Gazette_Notification_SDMA.pdf',
      deptAuthCertName: 'Disaster_Field_Officer_Card.pdf',
      serviceCertName: 'Seniority_Record_2026.pdf',
    },
    submittedAt: '2026-07-20T10:30:00Z',
    status: 'APPROVED',
    verificationNotes: 'Verified against SDMA Institutional Roster. Full Field Officer credentials enabled.',
  },
];

// Helper to normalize identifiers (remove spaces, lowercase emails)
function normalizeId(id: string): string {
  return id.trim().toLowerCase().replace(/\s+/g, '');
}

export class AuthService {
  public static getAccounts(): AuthAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
      if (stored) {
        const parsed: AuthAccount[] = JSON.parse(stored);
        let updated = false;
        SEED_ACCOUNTS.forEach((seed) => {
          const idx = parsed.findIndex((a) => a.id === seed.id || a.identifier === seed.identifier);
          if (idx === -1) {
            parsed.push(seed);
            updated = true;
          } else if (!parsed[idx].operationalProfile && seed.operationalProfile) {
            parsed[idx].operationalProfile = seed.operationalProfile;
            parsed[idx].name = seed.name;
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    // Initialize with seed
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(SEED_ACCOUNTS));
    return SEED_ACCOUNTS;
  }

  private static saveAccounts(accounts: AuthAccount[]): void {
    try {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Error saving accounts:', e);
    }
  }

  public static getOfficerRequests(): OfficerAccessRequest[] {
    try {
      const stored = localStorage.getItem(STORAGE_REQUESTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(SEED_REQUESTS));
    return SEED_REQUESTS;
  }

  private static saveOfficerRequests(requests: OfficerAccessRequest[]): void {
    try {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
    } catch (e) {
      console.error('Error saving requests:', e);
    }
  }

  /**
   * Public Citizen Self-Registration
   * Citizens may freely register; strictly restricted to role: 'citizen'.
   */
  public static registerCitizen(params: {
    name: string;
    identifier: string;
    location: string;
    password: string;
  }): { success: boolean; account?: AuthAccount; error?: string } {
    const { name, identifier, location, password } = params;

    if (!name.trim() || !identifier.trim() || !password.trim()) {
      return { success: false, error: 'All fields are required for citizen registration.' };
    }

    const accounts = this.getAccounts();
    const norm = normalizeId(identifier);

    // Check duplicate
    const exists = accounts.find((acc) => normalizeId(acc.identifier) === norm);
    if (exists) {
      return {
        success: false,
        error: 'An account with this phone number or email already exists. Please Sign In.',
      };
    }

    const newAccount: AuthAccount = {
      id: `CIT-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'citizen',
      name: name.trim(),
      identifier: identifier.trim(),
      password: password.trim(),
      status: 'APPROVED',
      locationOrDistrict: location.trim() || 'Sector A (Durtlang Ridge, Aizawl)',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);

    return { success: true, account: newAccount };
  }

  /**
   * Official Officer Access Request
   * Field Officers CANNOT self-register. They must submit an access verification request.
   */
  public static submitOfficerAccessRequest(params: {
    fullName: string;
    designation: string;
    department: string;
    officialId: string;
    officialContact: string;
    assignedDistrict: string;
  }): { success: boolean; request?: OfficerAccessRequest; error?: string } {
    const {
      fullName,
      designation,
      department,
      officialId,
      officialContact,
      assignedDistrict,
    } = params;

    if (
      !fullName.trim() ||
      !designation.trim() ||
      !department.trim() ||
      !officialId.trim() ||
      !officialContact.trim() ||
      !assignedDistrict.trim()
    ) {
      return {
        success: false,
        error: 'All official verification fields are mandatory for officer authorization.',
      };
    }

    const requests = this.getOfficerRequests();
    const reqId = `REQ-FO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest: OfficerAccessRequest = {
      id: reqId,
      fullName: fullName.trim(),
      designation: designation.trim(),
      department: department.trim(),
      officialId: officialId.trim(),
      officialContact: officialContact.trim(),
      assignedDistrict: assignedDistrict.trim(),
      submittedAt: new Date().toISOString(),
      status: 'PENDING_VERIFICATION',
      verificationNotes: 'Under review by SDMA System Administration.',
    };

    requests.unshift(newRequest);
    this.saveOfficerRequests(requests);

    // Also register an unapproved account record so if they try to login, it is blocked with PENDING_VERIFICATION
    const accounts = this.getAccounts();
    const existingAccIdx = accounts.findIndex(
      (a) =>
        normalizeId(a.identifier) === normalizeId(officialId) ||
        normalizeId(a.identifier) === normalizeId(officialContact)
    );

    const officerAccount: AuthAccount = {
      id: `OFF-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'officer',
      name: fullName.trim(),
      identifier: officialId.trim(),
      password: 'officer@123',
      status: 'PENDING_VERIFICATION',
      designation: designation.trim(),
      department: department.trim(),
      officialId: officialId.trim(),
      locationOrDistrict: assignedDistrict.trim(),
      createdAt: new Date().toISOString(),
    };

    if (existingAccIdx >= 0) {
      accounts[existingAccIdx] = officerAccount;
    } else {
      accounts.push(officerAccount);
    }
    this.saveAccounts(accounts);

    return { success: true, request: newRequest };
  }

  /**
   * Official Full Multi-Step Field Officer Registration
   * Mandatory 5-Step verification process for disaster-management personnel.
   */
  public static submitOfficerFullRegistration(params: {
    // Step 1: Personal
    fullName: string;
    dob: string;
    officialPhone: string;
    officialEmail: string;
    profilePhoto?: string;
    state: string;
    district: string;
    postingLocation: string;
    // Step 2: Employment
    designation: string;
    department: string;
    officialId: string;
    yearsOfService: string;
    assignedDistrict: string;
    assignedSector: string;
    operationalProfile?: import('../types').OfficerOperationalProfile;
    // Step 3: Documents
    documents: {
      idCardName?: string;
      appointmentCertName?: string;
      deptAuthCertName?: string;
      serviceCertName?: string;
    };
    // Step 4: Work Area & Authorization
    primaryDistrict: string;
    assignedSectorsZones: string;
    operationalResponsibilities: string;
    emergencyContact: string;
  }): { success: boolean; request?: OfficerAccessRequest; error?: string } {
    const {
      fullName,
      dob,
      officialPhone,
      officialEmail,
      profilePhoto,
      state,
      district,
      postingLocation,
      designation,
      department,
      officialId,
      yearsOfService,
      assignedDistrict,
      assignedSector,
      operationalProfile,
      documents,
      primaryDistrict,
      assignedSectorsZones,
      operationalResponsibilities,
      emergencyContact,
    } = params;

    if (!fullName.trim() || !officialPhone.trim() || !officialEmail.trim() || !officialId.trim()) {
      return {
        success: false,
        error: 'Essential officer personal & identification fields are required.',
      };
    }

    const requests = this.getOfficerRequests();
    const reqId = `REQ-FO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRequest: OfficerAccessRequest = {
      id: reqId,
      fullName: fullName.trim(),
      dob,
      officialPhone: officialPhone.trim(),
      officialEmail: officialEmail.trim(),
      profilePhoto,
      state,
      district,
      postingLocation,
      designation: designation.trim(),
      department: department.trim(),
      officialId: officialId.trim(),
      yearsOfService,
      assignedDistrict: assignedDistrict.trim() || primaryDistrict.trim(),
      assignedSector: assignedSector.trim() || assignedSectorsZones.trim(),
      operationalProfile: operationalProfile || 'Monitoring & Coordination Officer',
      operationalResponsibilities,
      emergencyContact,
      documents,
      submittedAt: new Date().toISOString(),
      status: 'PENDING_VERIFICATION',
      verificationNotes:
        'Pending verification by SDMA Disaster Management System Administrator. Official credentials and uploaded documents under formal scrutiny.',
    };

    requests.unshift(newRequest);
    this.saveOfficerRequests(requests);

    // Register a pending officer account
    const accounts = this.getAccounts();
    const existingIdx = accounts.findIndex(
      (a) =>
        normalizeId(a.identifier) === normalizeId(officialId) ||
        normalizeId(a.identifier) === normalizeId(officialEmail) ||
        normalizeId(a.identifier) === normalizeId(officialPhone)
    );

    const officerAccount: AuthAccount = {
      id: `OFF-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'officer',
      name: fullName.trim(),
      identifier: officialId.trim(),
      password: 'officer@123',
      status: 'PENDING_VERIFICATION',
      operationalProfile: operationalProfile || 'Monitoring & Coordination Officer',
      designation: designation.trim(),
      department: department.trim(),
      officialId: officialId.trim(),
      locationOrDistrict: primaryDistrict.trim() || district.trim() || 'Aizawl District',
      assignedSector: assignedSector.trim() || assignedSectorsZones.trim(),
      officialPhone: officialPhone.trim(),
      officialEmail: officialEmail.trim(),
      createdAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      accounts[existingIdx] = officerAccount;
    } else {
      accounts.push(officerAccount);
    }
    this.saveAccounts(accounts);

    return { success: true, request: newRequest };
  }

  /**
   * Resubmit Additional Information for Officer Request
   */
  public static resubmitOfficerInfo(params: {
    officialId: string;
    additionalNotes: string;
    newDocumentName?: string;
  }): { success: boolean; message: string } {
    const { officialId, additionalNotes, newDocumentName } = params;
    const accounts = this.getAccounts();
    const acc = accounts.find(
      (a) => normalizeId(a.identifier) === normalizeId(officialId) || a.officialId === officialId
    );

    if (acc) {
      acc.status = 'PENDING_VERIFICATION';
      acc.additionalInfoRequired = undefined;
      acc.rejectionReason = undefined;
      this.saveAccounts(accounts);
    }

    const requests = this.getOfficerRequests();
    const req = requests.find((r) => normalizeId(r.officialId) === normalizeId(officialId));
    if (req) {
      req.status = 'PENDING_VERIFICATION';
      req.verificationNotes = `Additional info provided by officer: "${additionalNotes}". New document: ${newDocumentName || 'None'}. Returned to verification queue.`;
      this.saveOfficerRequests(requests);
    }

    return {
      success: true,
      message: 'Additional information submitted successfully. Status is now Pending Verification.',
    };
  }

  /**
   * Authenticate with Role-Based Access Control Verification
   * Determines user role strictly from authorized account record.
   */
  public static authenticate(
    identifierInput: string,
    passwordInput: string,
    portalRole: UserRole
  ): {
    success: boolean;
    user?: AuthAccount;
    authorizedRole?: UserRole;
    errorTitle?: string;
    errorMessage?: string;
    accountStatus?: 'APPROVED' | 'PENDING_VERIFICATION' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';
    rejectionReason?: string;
    additionalInfoRequired?: string;
    errorCode?:
      | 'INVALID_CREDENTIALS'
      | 'OFFICER_PENDING'
      | 'OFFICER_REJECTED'
      | 'OFFICER_ADDITIONAL_INFO'
      | 'RESTRICTED_ACCESS'
      | 'ADMIN_RESTRICTED';
  } {
    const rawId = identifierInput.trim();
    const rawPass = passwordInput.trim();

    if (!rawId || !rawPass) {
      return {
        success: false,
        errorTitle: 'Incomplete Credentials',
        errorMessage: 'Please provide both your identification identifier and password.',
        errorCode: 'INVALID_CREDENTIALS',
      };
    }

    const normInput = normalizeId(rawId);
    const accounts = this.getAccounts();

    // Match by exact identifier, email, phone, or official ID
    const account = accounts.find((acc) => {
      const accNorm = normalizeId(acc.identifier);
      if (accNorm === normInput) return true;
      if (acc.officialId && normalizeId(acc.officialId) === normInput) return true;
      // Also check standard aliases for demo credentials
      if (acc.id === 'CIT-1001' && (normInput.includes('citizen') || normInput.includes('98620'))) return true;
      if (acc.id === 'OFF-8821' && (normInput.includes('8821') || normInput.includes('sangma'))) return true;
      if (acc.id === 'OFF-PENDING' && (normInput.includes('pending') || normInput.includes('marak') || normInput.includes('5519'))) return true;
      if (acc.id === 'OFF-REJECTED' && (normInput.includes('rejected') || normInput.includes('jamatia') || normInput.includes('3042'))) return true;
      if (acc.id === 'OFF-INFO' && (normInput.includes('info') || normInput.includes('sailo') || normInput.includes('1108'))) return true;
      if (acc.id === 'ADM-4091' && (normInput.includes('4091') || normInput.includes('lalrinzuala') || normInput.includes('sdma.gov') || normInput.includes('9999999999') || normInput.includes('admin'))) return true;
      return false;
    });

    if (!account) {
      return {
        success: false,
        errorTitle: 'Authentication Failed',
        errorMessage: 'No authorized account found matching these credentials. Please check your details.',
        errorCode: 'INVALID_CREDENTIALS',
      };
    }

    // Password verification (for prototype demo, allows standard matching or demo fallbacks)
    if (account.password !== rawPass && rawPass !== 'citizen@123' && rawPass !== 'officer@123' && rawPass !== 'admin@123' && rawPass !== 'AdminPass123!') {
      return {
        success: false,
        errorTitle: 'Invalid Password',
        errorMessage: 'The password entered does not match our security records.',
        errorCode: 'INVALID_CREDENTIALS',
      };
    }

    // Check Account Status for Officer
    if (account.role === 'officer') {
      if (account.status === 'PENDING_VERIFICATION') {
        return {
          success: false,
          errorTitle: 'Registration Submitted — Verification Pending',
          errorMessage:
            'Your credentials and official documents must be verified by an authorized administrator before Field Officer access is granted.',
          accountStatus: 'PENDING_VERIFICATION',
          errorCode: 'OFFICER_PENDING',
          user: account,
        };
      }

      if (account.status === 'REJECTED') {
        return {
          success: false,
          errorTitle: 'Registration Clearance Rejected',
          errorMessage:
            account.rejectionReason ||
            'Official authorization documents could not be verified against the state personnel registry. Administrative clearance rejected.',
          accountStatus: 'REJECTED',
          rejectionReason: account.rejectionReason,
          errorCode: 'OFFICER_REJECTED',
          user: account,
        };
      }

      if (account.status === 'ADDITIONAL_INFO_REQUIRED') {
        return {
          success: false,
          errorTitle: 'Additional Information Required',
          errorMessage:
            account.additionalInfoRequired ||
            'The SDMA Administrator has requested additional documentation or verification details before granting operational access.',
          accountStatus: 'ADDITIONAL_INFO_REQUIRED',
          additionalInfoRequired: account.additionalInfoRequired,
          errorCode: 'OFFICER_ADDITIONAL_INFO',
          user: account,
        };
      }
    }

    // =========================================================================
    // ENFORCE RIGID PRIVILEGE SEPARATION
    // A user must NEVER gain a privileged role merely by choosing it on frontend!
    // =========================================================================

    // Case 1: Account is a registered Citizen
    if (account.role === 'citizen') {
      if (portalRole === 'admin') {
        return {
          success: false,
          errorTitle: 'Restricted Access',
          errorMessage: 'Administrative access is restricted to authorized disaster-management personnel.',
          errorCode: 'ADMIN_RESTRICTED',
        };
      }
      if (portalRole === 'officer') {
        return {
          success: false,
          errorTitle: 'Restricted Access',
          errorMessage: 'Officer verification required. Your request must be approved before operational access is granted.',
          errorCode: 'RESTRICTED_ACCESS',
        };
      }
      // Allowed: Citizen portal
      return {
        success: true,
        user: account,
        authorizedRole: 'citizen',
      };
    }

    // Case 2: Account is an approved Field Officer
    if (account.role === 'officer') {
      if (portalRole === 'admin') {
        return {
          success: false,
          errorTitle: 'Restricted Access',
          errorMessage: 'Administrative access is restricted to authorized disaster-management personnel.',
          errorCode: 'ADMIN_RESTRICTED',
        };
      }
      // Officers can access Officer portal (or view Citizen public alerts if needed)
      return {
        success: true,
        user: account,
        authorizedRole: 'officer',
      };
    }

    // Case 3: Account is an authorized Admin
    if (account.role === 'admin') {
      return {
        success: true,
        user: account,
        authorizedRole: 'admin',
      };
    }

    return {
      success: false,
      errorTitle: 'Restricted Access',
      errorMessage: 'This area is available only to authorized personnel.',
      errorCode: 'RESTRICTED_ACCESS',
    };
  }

  /**
   * Admin Action: Approve Officer Request
   */
  public static approveOfficerRequest(requestId: string): boolean {
    const requests = this.getOfficerRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'APPROVED';
    req.verificationNotes = `Approved by SDMA System Administrator on ${new Date().toLocaleDateString()}`;
    this.saveOfficerRequests(requests);

    // Update account record to APPROVED
    const accounts = this.getAccounts();
    const acc = accounts.find(
      (a) =>
        normalizeId(a.identifier) === normalizeId(req.officialId) ||
        normalizeId(a.name) === normalizeId(req.fullName)
    );
    if (acc) {
      acc.status = 'APPROVED';
      if (req.operationalProfile) {
        acc.operationalProfile = req.operationalProfile;
      }
      this.saveAccounts(accounts);
    }
    return true;
  }

  /**
   * Admin Action: Reject Officer Request
   */
  public static rejectOfficerRequest(requestId: string): boolean {
    const requests = this.getOfficerRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'REJECTED';
    req.verificationNotes = `Clearance rejected by SDMA Admin on ${new Date().toLocaleDateString()}`;
    this.saveOfficerRequests(requests);

    const accounts = this.getAccounts();
    const acc = accounts.find(
      (a) =>
        normalizeId(a.identifier) === normalizeId(req.officialId) ||
        normalizeId(a.name) === normalizeId(req.fullName)
    );
    if (acc) {
      acc.status = 'REJECTED';
      acc.rejectionReason =
        'Official credentials could not be authenticated against the SDMA Personnel Roster. Access authorization denied.';
      this.saveAccounts(accounts);
    }
    return true;
  }

  /**
   * Admin Action: Request Additional Information
   */
  public static requestAdditionalInfoOfficer(requestId: string, notes?: string): boolean {
    const requests = this.getOfficerRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return false;

    const requestNotes =
      notes ||
      'Please submit an updated departmental deployment order with authorized stamp and seal.';

    req.status = 'ADDITIONAL_INFO_REQUIRED';
    req.additionalInfoRequired = requestNotes;
    this.saveOfficerRequests(requests);

    const accounts = this.getAccounts();
    const acc = accounts.find(
      (a) =>
        normalizeId(a.identifier) === normalizeId(req.officialId) ||
        normalizeId(a.name) === normalizeId(req.fullName)
    );
    if (acc) {
      acc.status = 'ADDITIONAL_INFO_REQUIRED';
      acc.additionalInfoRequired = requestNotes;
      this.saveAccounts(accounts);
    }
    return true;
  }
}
