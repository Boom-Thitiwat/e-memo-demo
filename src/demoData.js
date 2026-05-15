export const DEMO_PASSWORD = "Demo@12345";
export const DEMO_SESSION_KEY = "ememo.demo.userEmail";
export const DEMO_DATA_KEY = "ememo.demo.data";

export const DEMO_USERS = [
  { id: "u_super", name: "Demo Super Admin", email: "demo.superadmin@example.com", dept: "Management", role: "superadmin", active: true, viewScope: "all" },
  { id: "u_admin", name: "Demo Admin", email: "demo.admin@example.com", dept: "Operations", role: "admin", active: true, viewScope: "all" },
  { id: "u_user", name: "Demo Requester", email: "demo.user@example.com", dept: "Sales", role: "user", active: true, viewScope: "dept" },
  { id: "u_finance", name: "Demo Finance Approver", email: "demo.finance@example.com", dept: "Finance", role: "user", active: true, viewScope: "dept" },
  { id: "u_hr", name: "Demo HR Approver", email: "demo.hr@example.com", dept: "HR", role: "user", active: true, viewScope: "dept" },
];

export function getDemoUserByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  return DEMO_USERS.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function isDemoLogin(email, password) {
  return !!getDemoUserByEmail(email) && password === DEMO_PASSWORD;
}

export function createDemoAuthUser(email) {
  const user = getDemoUserByEmail(email);
  if (!user) return null;
  return {
    uid: user.id,
    email: user.email,
    displayName: user.name,
    isDemo: true,
  };
}

const isoDaysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export function createDemoData() {
  const users = Object.fromEntries(DEMO_USERS.map((u) => [u.id, { ...u }]));
  const approver = (id, status = "pending", actionAt = null, comment = "") => {
    const u = users[id];
    return { userId: u.id, email: u.email, name: u.name, status, comment, actionAt };
  };

  return {
    users,
    memos: {
      m_pending_budget: {
        id: "m_pending_budget",
        title: "ขออนุมัติงบประมาณ Demo Workshop",
        content: "ตัวอย่าง memo สำหรับทดสอบ workflow การอนุมัติหลายระดับในระบบ E-Memo Demo",
        category: "งบประมาณ",
        createdBy: "u_user",
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
        status: "pending",
        currentLevel: 0,
        attachments: [{ id: "a_budget", name: "demo-budget.xlsx", size: "24 KB", type: "xlsx", data: "" }],
        notify: { emailList: ["demo.admin@example.com"], postToTeams: false, postToPowerAuto: false, postToLine: false },
        workflowLevels: [
          { id: "lv_pending_1", level: 1, mode: "any", approvers: [approver("u_finance")] },
          { id: "lv_pending_2", level: 2, mode: "all", approvers: [approver("u_admin")] },
        ],
        signatureZones: [
          { id: "z_finance", label: "ผู้ตรวจสอบงบประมาณ", assignedTo: "u_finance", signerName: "Demo Finance Approver", x: 58, y: 70 },
          { id: "z_admin", label: "ผู้อนุมัติ", assignedTo: "u_admin", signerName: "Demo Admin", x: 58, y: 82 },
        ],
        history: [{ action: "created", by: "u_user", at: isoDaysAgo(1), comment: "สร้าง memo demo" }],
      },
      m_approved_policy: {
        id: "m_approved_policy",
        title: "ประกาศแนวทางการใช้งาน E-Memo Demo",
        content: "ตัวอย่าง memo ที่อนุมัติครบแล้ว ใช้ทดสอบ timeline, export และ print preview",
        category: "นโยบาย",
        docNo: "OPS-2569-0001",
        createdBy: "u_admin",
        createdAt: isoDaysAgo(7),
        updatedAt: isoDaysAgo(5),
        status: "approved",
        currentLevel: 1,
        attachments: [],
        notify: { emailList: ["demo.user@example.com", "demo.finance@example.com"], postToTeams: false, postToPowerAuto: false, postToLine: false },
        workflowLevels: [
          { id: "lv_approved_1", level: 1, mode: "all", approvers: [approver("u_super", "approved", isoDaysAgo(5), "อนุมัติสำหรับ demo")] },
        ],
        signatureZones: [{ id: "z_super", label: "ผู้อนุมัติ", assignedTo: "u_super", signerName: "Demo Super Admin", x: 60, y: 78 }],
        history: [
          { action: "created", by: "u_admin", at: isoDaysAgo(7), comment: "สร้างเอกสารตัวอย่าง" },
          { action: "approved", by: "u_super", at: isoDaysAgo(5), comment: "อนุมัติสำหรับ demo" },
        ],
      },
      m_draft_purchase: {
        id: "m_draft_purchase",
        title: "ร่าง memo ขอจัดซื้ออุปกรณ์สำนักงาน",
        content: "ร่างเอกสารตัวอย่างสำหรับทดสอบการแก้ไขและส่งอนุมัติภายหลัง",
        category: "จัดซื้อจัดจ้าง",
        createdBy: "u_user",
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(2),
        status: "draft",
        currentLevel: 0,
        attachments: [],
        notify: { emailList: [], postToTeams: false, postToPowerAuto: false, postToLine: false },
        workflowLevels: [],
        signatureZones: [],
        history: [{ action: "created", by: "u_user", at: isoDaysAgo(2), comment: "บันทึกเป็นร่าง" }],
      },
      m_rejected_hr: {
        id: "m_rejected_hr",
        title: "คำขอปรับวันจัดอบรมภายใน",
        content: "ตัวอย่าง memo ที่ถูกปฏิเสธ เพื่อให้เห็นสถานะและ comment จากผู้อนุมัติ",
        category: "HR",
        createdBy: "u_hr",
        createdAt: isoDaysAgo(10),
        updatedAt: isoDaysAgo(9),
        status: "rejected",
        currentLevel: 0,
        attachments: [],
        notify: { emailList: ["demo.hr@example.com"], postToTeams: false, postToPowerAuto: false, postToLine: false },
        workflowLevels: [
          { id: "lv_rejected_1", level: 1, mode: "all", approvers: [approver("u_admin", "rejected", isoDaysAgo(9), "ขอข้อมูลประกอบเพิ่มเติมก่อนอนุมัติ")] },
        ],
        signatureZones: [],
        history: [
          { action: "created", by: "u_hr", at: isoDaysAgo(10), comment: "ส่งอนุมัติ" },
          { action: "rejected", by: "u_admin", at: isoDaysAgo(9), comment: "ขอข้อมูลประกอบเพิ่มเติมก่อนอนุมัติ" },
        ],
      },
      m_recalled_report: {
        id: "m_recalled_report",
        title: "รายงานผลการทดสอบระบบประจำเดือน",
        content: "ตัวอย่าง memo ที่ถูกเรียกคืนโดยผู้สร้าง เพื่อทดสอบ flow recalled และการแก้ไขส่งใหม่",
        category: "รายงาน",
        createdBy: "u_user",
        createdAt: isoDaysAgo(4),
        updatedAt: isoDaysAgo(3),
        status: "recalled",
        currentLevel: 0,
        attachments: [],
        notify: { emailList: [], postToTeams: false, postToPowerAuto: false, postToLine: false },
        workflowLevels: [{ id: "lv_recalled_1", level: 1, mode: "all", approvers: [approver("u_finance")] }],
        signatureZones: [],
        history: [
          { action: "created", by: "u_user", at: isoDaysAgo(4), comment: "ส่งอนุมัติ" },
          { action: "recalled", by: "u_user", at: isoDaysAgo(3), comment: "เรียกคืนเพื่อแก้ไขข้อมูล" },
        ],
      },
    },
    notifyConfig: {
      email: { enabled: false },
      teams: { enabled: false, webhookUrl: "" },
      powerauto: { enabled: false, webhookUrl: "" },
      line: { enabled: false, channelAccessToken: "", groupId: "" },
    },
    pdfTemplates: {},
    docCounters: { OPS_2569: 1, SALES_2569: 0, FINANC_2569: 0 },
    routeTemplates: [
      {
        id: "rt_budget_two_step",
        name: "Demo: งบประมาณ 2 ระดับ",
        desc: "ตรวจสอบโดย Finance แล้วอนุมัติโดย Admin",
        createdBy: "u_user",
        levels: [
          { id: "rt_lv_1", mode: "any", approvers: [approver("u_finance")] },
          { id: "rt_lv_2", mode: "all", approvers: [approver("u_admin")] },
        ],
      },
      {
        id: "rt_policy_superadmin",
        name: "Demo: อนุมัติโดย Super Admin",
        desc: "ใช้กับประกาศหรือนโยบายทั่วไป",
        createdBy: "u_admin",
        levels: [{ id: "rt_lv_super", mode: "all", approvers: [approver("u_super")] }],
      },
    ],
  };
}