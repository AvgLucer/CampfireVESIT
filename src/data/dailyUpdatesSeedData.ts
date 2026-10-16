import { DailyUpdate, UpdateApplication } from '../types/dailyUpdates';

const now = new Date();
const inDays = (days: number, hours = 0) => {
  const d = new Date(now.getTime() + (days * 24 + hours) * 60 * 60 * 1000);
  return d.toISOString();
};
const pastDays = (days: number) => {
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
};

export const INITIAL_DAILY_UPDATES: DailyUpdate[] = [
  {
    id: 'upd_genesis_hackathon_01',
    title: 'Genesis 2026: 24-Hour Campus Hardware & AI Hackathon',
    description:
      'The flagship annual hackathon of VESIT is here! Build physical computing prototypes, LLM agents, and smart campus solutions. Food, mentor sprints, gaming breaks, and sleeping pods provided in the campus quad.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    category: 'Hackathon',
    tags: ['AI/ML', 'Hardware', 'Overnight', 'CashPrize', 'Certificates'],
    hostId: 'stu_aarav_vesit_01',
    hostName: 'Aarav Sharma',
    hostUsername: '@aaravsharma',
    hostAvatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    hostDepartment: 'Computer Engineering',
    hostYear: 'FE (First Year)',
    hostRole: 'student',
    contactEmail: '2026.aarav.sharma@ves.ac.in',
    contactPhone: '+91 98201 44521',
    location: 'Computer Labs 401-404, Complex B',
    externalLink: 'https://ves.ac.in/genesis2026',
    customFields: [
      {
        id: 'cf_1',
        label: 'Prize Pool',
        type: 'price',
        value: 50000,
        required: true,
      },
      {
        id: 'cf_2',
        label: 'Team Size',
        type: 'text',
        value: '3 to 4 Students',
        required: true,
      },
      {
        id: 'cf_3',
        label: 'Registration Fee',
        type: 'price',
        value: 0,
        required: false,
      },
      {
        id: 'cf_4',
        label: 'Venue',
        type: 'location',
        value: 'Complex B Labs 401-404 & Amphitheatre',
        required: true,
      },
      {
        id: 'cf_5',
        label: 'Eligibility',
        type: 'text',
        value: 'All FE, SE, TE & BE Students (Valid College ID)',
        required: false,
      },
      {
        id: 'cf_6',
        label: 'Hardware Kits Available',
        type: 'boolean',
        value: true,
        required: false,
      },
      {
        id: 'cf_7',
        label: 'Discord Community',
        type: 'url',
        value: 'https://discord.gg/vesit-devs',
        required: false,
      },
    ],
    acceptsApplications: true,
    maxApplicants: 40,
    applicationQuestions: [
      'What problem or track are you planning to solve (AI agents, campus sustainability, or IoT)?',
      'Provide your GitHub or portfolio profile URL',
      'Names and roll numbers of your team members (if already formed)',
    ],
    status: 'approved',
    publishedAt: pastDays(1),
    expiresAt: inDays(6, 12),
    createdAt: pastDays(2),
    updatedAt: pastDays(1),
    auditLog: [
      {
        id: 'aud_1',
        action: 'submitted',
        actorId: 'stu_aarav_vesit_01',
        actorName: 'Aarav Sharma',
        actorRole: 'student',
        timestamp: pastDays(2),
      },
      {
        id: 'aud_2',
        action: 'approved',
        actorId: 'admin_nupur_giri',
        actorName: 'Dr. Nupur Giri',
        actorRole: 'admin',
        timestamp: pastDays(1),
        feedback: 'Approved. Lab allocation confirmed with technical assistants.',
      },
    ],
  },
  {
    id: 'upd_robocon_workshop_02',
    title: 'Autonomous Mobile Robot & ROS2 Hands-on Workshop',
    description:
      'The VESIT Robotics Team is holding an intensive weekend boot camp on differential drive kinematics, LiDAR slam mapping, and ROS2 navigation. All components and microcontrollers provided.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    category: 'Workshop',
    tags: ['Robotics', 'ROS2', 'HandsOn', 'Hardware', 'Sensors'],
    hostId: 'stu_neha_03',
    hostName: 'Neha Chawla',
    hostUsername: '@nehachawla',
    hostAvatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    hostDepartment: 'Computer Engineering',
    hostYear: 'SE (Second Year)',
    hostRole: 'student',
    contactEmail: '2025.neha.chawla@ves.ac.in',
    contactPhone: '+91 98202 33112',
    location: 'Central Mechanical Workshop & Robotics Arena',
    customFields: [
      {
        id: 'cf_r1',
        label: 'Components Kit Fee',
        type: 'price',
        value: 150,
        required: true,
      },
      {
        id: 'cf_r2',
        label: 'Total Batch Cap',
        type: 'number',
        value: 35,
        required: true,
      },
      {
        id: 'cf_r3',
        label: 'VESIT Lab Certification',
        type: 'boolean',
        value: true,
        required: false,
      },
      {
        id: 'cf_r4',
        label: 'Prerequisites',
        type: 'text',
        value: 'Basic C++ or Python syntax knowledge',
        required: false,
      },
      {
        id: 'cf_r5',
        label: 'WhatsApp Coordinator',
        type: 'contact',
        value: '+91 98202 33112 (Neha - Robocon Lead)',
        required: false,
      },
    ],
    acceptsApplications: true,
    maxApplicants: 35,
    applicationQuestions: [
      'Have you ever programmed an Arduino or microcontroller before?',
      'Why do you want to join the Robocon team?',
    ],
    status: 'approved',
    publishedAt: pastDays(1),
    expiresAt: inDays(4, 6),
    createdAt: pastDays(2),
    updatedAt: pastDays(1),
    auditLog: [
      {
        id: 'aud_r1',
        action: 'submitted',
        actorId: 'stu_neha_03',
        actorName: 'Neha Chawla',
        actorRole: 'student',
        timestamp: pastDays(2),
      },
      {
        id: 'aud_r2',
        action: 'approved',
        actorId: 'admin_nupur_giri',
        actorName: 'Dr. Nupur Giri',
        actorRole: 'admin',
        timestamp: pastDays(1),
        feedback: 'Approved for robotics lab access.',
      },
    ],
  },
  {
    id: 'upd_lost_headphones_03',
    title: 'FOUND: Sony WH-1000XM4 Matte Black Headphones in Amphitheatre',
    description:
      'Found a pair of black Sony over-ear headphones on Row 4 bench near South Stairs right after the 4:15 PM cultural rehearsal. Handed over safely to Main Security Cabin.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
    category: 'Lost & Found',
    tags: ['LostAndFound', 'Amphitheatre', 'SecurityCabin'],
    hostId: 'stu_tanvi_32',
    hostName: 'Tanvi Kulkarni',
    hostUsername: '@tanvikulkarni',
    hostAvatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80',
    hostDepartment: 'Information Technology',
    hostYear: 'FE (First Year)',
    hostRole: 'student',
    contactEmail: '2026.tanvi.kulkarni@ves.ac.in',
    location: 'Main Gate Security Office (Near Registrar)',
    customFields: [
      {
        id: 'cf_l1',
        label: 'Discovery Location',
        type: 'location',
        value: 'Amphitheatre Row 4 (South Wing)',
        required: true,
      },
      {
        id: 'cf_l2',
        label: 'Security Token No.',
        type: 'text',
        value: 'SEC-VESIT-OCT-884',
        required: true,
      },
      {
        id: 'cf_l3',
        label: 'Verification Requirement',
        type: 'long_text',
        value:
          'Please show Bluetooth pairing history on your smartphone or carry the original purchase invoice to claim from Security Officer Mr. Shinde.',
        required: false,
      },
      {
        id: 'cf_l4',
        label: 'Security Officer Contact',
        type: 'contact',
        value: 'Ext. 102 (Gate 1 Cabin)',
        required: false,
      },
    ],
    acceptsApplications: false,
    status: 'approved',
    publishedAt: pastDays(1),
    expiresAt: inDays(6),
    createdAt: pastDays(1),
    updatedAt: pastDays(1),
    auditLog: [
      {
        id: 'aud_l1',
        action: 'approved',
        actorId: 'admin_nupur_giri',
        actorName: 'Dr. Nupur Giri',
        actorRole: 'admin',
        timestamp: pastDays(1),
        feedback: 'Directly approved for student assistance.',
      },
    ],
  },
  {
    id: 'upd_ecell_pitch_04',
    title: 'VESIT E-Cell Innovation Fund & Angel Pitch 2026',
    description:
      'Got a bold hardware, SaaS, or social impact startup idea? Pitch in front of VESIT alumni angel investors and industry founders. Top 3 teams receive immediate micro-grants and incubation workspace.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    category: 'Opportunity',
    tags: ['Startup', 'Incubation', 'PitchDeck', 'Funding', 'Mentorship'],
    hostId: 'admin_nupur_giri',
    hostName: 'Dr. Nupur Giri',
    hostUsername: '@nupurgiri_admin',
    hostAvatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    hostDepartment: 'First-Year Academic Council',
    hostYear: 'Faculty In-Charge',
    hostRole: 'admin',
    contactEmail: '2020.nupur.giri@ves.ac.in',
    location: 'Auditorium & Incubation Cell 301',
    externalLink: 'https://ves.ac.in/ecell/pitch',
    customFields: [
      {
        id: 'cf_e1',
        label: 'Grant Pool',
        type: 'price',
        value: 150000,
        required: true,
      },
      {
        id: 'cf_e2',
        label: 'Incubation Space',
        type: 'boolean',
        value: true,
        required: false,
      },
      {
        id: 'cf_e3',
        label: 'Pitch Deck Slide Limit',
        type: 'number',
        value: 10,
        required: false,
      },
      {
        id: 'cf_e4',
        label: 'Evaluation Criteria',
        type: 'text',
        value: 'Problem validation (40%), Technical feasibility (30%), Execution speed (30%)',
        required: false,
      },
    ],
    acceptsApplications: true,
    maxApplicants: 25,
    applicationQuestions: [
      'What is your startup concept in 2 sentences?',
      'What stage are you at (Idea, Working Prototype, or Active Users)?',
      'Link to your deck or Figma prototype (Google Drive / Canva / Figma)',
    ],
    status: 'approved',
    publishedAt: pastDays(3),
    expiresAt: inDays(12),
    createdAt: pastDays(3),
    updatedAt: pastDays(3),
    auditLog: [
      {
        id: 'aud_e1',
        action: 'approved',
        actorId: 'admin_nupur_giri',
        actorName: 'Dr. Nupur Giri',
        actorRole: 'admin',
        timestamp: pastDays(3),
      },
    ],
  },
  {
    id: 'upd_valorant_tourney_05',
    title: 'Inter-Department LAN Esports Clash: Valorant 5v5',
    description:
      'Calling all campus duelists and initiators! 16 department teams, high-tick campus LAN servers, caster commentary, and live projector stream in Seminar Hall 2.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    category: 'Competition',
    tags: ['Esports', 'Gaming', 'LAN', 'Valorant', 'Trophies'],
    hostId: 'stu_rohan_14',
    hostName: 'Rohan Deshmukh',
    hostUsername: '@rohandeshmukh',
    hostAvatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    hostDepartment: 'EXTC',
    hostYear: 'FE (First Year)',
    hostRole: 'student',
    contactEmail: '2026.rohan.deshmukh@ves.ac.in',
    contactPhone: '+91 97692 88390',
    location: 'Seminar Hall 2 & Server Room',
    customFields: [
      {
        id: 'cf_v1',
        label: 'Prize Pool',
        type: 'price',
        value: 20000,
        required: true,
      },
      {
        id: 'cf_v2',
        label: 'Team Registration Fee',
        type: 'price',
        value: 250,
        required: true,
      },
      {
        id: 'cf_v3',
        label: 'Bring Your Own Peripherals',
        type: 'boolean',
        value: true,
        required: false,
      },
      {
        id: 'cf_v4',
        label: 'Format',
        type: 'text',
        value: 'Single elimination Bo1, Grand Finals Bo3',
        required: false,
      },
    ],
    acceptsApplications: true,
    maxApplicants: 16,
    applicationQuestions: [
      'Team Name and Roster Riot IDs (5 players + 1 sub)',
      'Department / Division represented',
    ],
    status: 'pending', // PENDING REVIEW for Admin to review!
    publishedAt: undefined,
    expiresAt: inDays(5),
    createdAt: pastDays(1),
    updatedAt: pastDays(1),
    auditLog: [
      {
        id: 'aud_v1',
        action: 'submitted',
        actorId: 'stu_rohan_14',
        actorName: 'Rohan Deshmukh',
        actorRole: 'student',
        timestamp: pastDays(1),
      },
    ],
  },
  {
    id: 'upd_ca_timetable_06',
    title: 'Draft Schedule: Continuous Assessment II (Internal Tests)',
    description:
      'First-year students please note the revised dates for CA-II written tests and lab submissions for Semester II. Check subject codes FEC201 through FEC205.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    category: 'Academic Notice',
    tags: ['Exams', 'CA-II', 'FE', 'Timetable'],
    hostId: 'stu_neha_03',
    hostName: 'Neha Chawla',
    hostUsername: '@nehachawla',
    hostAvatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    hostDepartment: 'Computer Engineering',
    hostYear: 'SE (Second Year)',
    hostRole: 'student',
    contactEmail: '2025.neha.chawla@ves.ac.in',
    location: 'Classrooms 201-205, Main Academic Wing',
    customFields: [
      {
        id: 'cf_c1',
        label: 'Notice Ref Number',
        type: 'text',
        value: 'VESIT/EXAM/2026/042-REV',
        required: true,
      },
      {
        id: 'cf_c2',
        label: 'Objection Deadline',
        type: 'datetime',
        value: inDays(3, 17),
        required: true,
      },
    ],
    acceptsApplications: false,
    status: 'changes_requested', // CHANGES REQUESTED by admin to show host view!
    moderationFeedback:
      'Please attach the confirmed laboratory submission calendar signed by Prof. Kulkarni before approval.',
    moderatedBy: 'admin_nupur_giri',
    moderatedAt: pastDays(1),
    expiresAt: inDays(8),
    createdAt: pastDays(2),
    updatedAt: pastDays(1),
    auditLog: [
      {
        id: 'aud_c1',
        action: 'submitted',
        actorId: 'stu_neha_03',
        actorName: 'Neha Chawla',
        actorRole: 'student',
        timestamp: pastDays(2),
      },
      {
        id: 'aud_c2',
        action: 'changes_requested',
        actorId: 'admin_nupur_giri',
        actorName: 'Dr. Nupur Giri',
        actorRole: 'admin',
        timestamp: pastDays(1),
        feedback:
          'Please attach the confirmed laboratory submission calendar signed by Prof. Kulkarni before approval.',
      },
    ],
  },
];

export const INITIAL_UPDATE_APPLICATIONS: UpdateApplication[] = [
  {
    id: 'app_tanvi_genesis_01',
    updateId: 'upd_genesis_hackathon_01',
    updateTitle: 'Genesis 2026: 24-Hour Campus Hardware & AI Hackathon',
    updateCategory: 'Hackathon',
    applicantId: 'stu_tanvi_32',
    applicantName: 'Tanvi Kulkarni',
    applicantUsername: '@tanvikulkarni',
    applicantEmail: '2026.tanvi.kulkarni@ves.ac.in',
    applicantPhone: '+91 98199 43210',
    applicantDepartment: 'Information Technology',
    applicantYear: 'FE (First Year)',
    applicantRollNumber: '32',
    applicantAvatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=80',
    statement:
      'Our team is building an offline smart campus mesh network using ESP32 nodes and local LLM quantization. Excited to participate!',
    answers: [
      {
        question:
          'What problem or track are you planning to solve (AI agents, campus sustainability, or IoT)?',
        answer: 'Campus IoT mesh network for automated lab environmental monitoring.',
      },
      {
        question: 'Provide your GitHub or portfolio profile URL',
        answer: 'https://github.com/tanvi-kulkarni',
      },
      {
        question: 'Names and roll numbers of your team members (if already formed)',
        answer: 'Tanvi Kulkarni (FE IT 32), Rohan Deshmukh (FE EXTC 14), Siddharth Iyer (FE CMPN 19)',
      },
    ],
    status: 'pending',
    submittedAt: pastDays(1),
  },
  {
    id: 'app_aarav_robocon_02',
    updateId: 'upd_robocon_workshop_02',
    updateTitle: 'Autonomous Mobile Robot & ROS2 Hands-on Workshop',
    updateCategory: 'Workshop',
    applicantId: 'stu_aarav_vesit_01',
    applicantName: 'Aarav Sharma',
    applicantUsername: '@aaravsharma',
    applicantEmail: '2026.aarav.sharma@ves.ac.in',
    applicantPhone: '+91 98201 44521',
    applicantDepartment: 'Computer Engineering',
    applicantYear: 'FE (First Year)',
    applicantRollNumber: '24',
    applicantAvatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    statement:
      'Keen to understand LiDAR point clouds and ROS2 message passing for autonomous ground rovers.',
    answers: [
      {
        question: 'Have you ever programmed an Arduino or microcontroller before?',
        answer: 'Yes, built an automated solar tracker with Arduino Nano last semester.',
      },
      {
        question: 'Why do you want to join the Robocon team?',
        answer: 'Want to contribute to the navigation stack for national ABU Robocon.',
      },
    ],
    status: 'accepted',
    hostFeedback: 'Welcome to the workshop! Please bring your laptop with Ubuntu 22.04 or WSL2 installed.',
    submittedAt: pastDays(1),
    reviewedAt: pastDays(0),
  },
];
