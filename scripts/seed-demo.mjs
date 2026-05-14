import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import admin from "firebase-admin";

const DATA_PATH = "ememo/data";
const DEMO_PASSWORD = "Demo@12345";

function loadEnvFile(fileName) {
  const file = resolve(process.cwd(), fileName);
  if (!existsSync(file)) return;
  const text = readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").replace(/^['\"]|['\"]$/g, "");
  }
}

loadEnvFile(".env.local");
loadEnvFile("env.example");

function getCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.cert(JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8")));
  }
  console.error("Missing Firebase Admin credentials.");
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS=C:\\path\\to\\service-account.json");
  console.error("or set FIREBASE_SERVICE_ACCOUNT to the service account JSON string.");
  process.exit(1);
}

const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL;
if (!databaseURL) {
  console.error("Missing VITE_FIREBASE_DATABASE_URL. Add it to .env.local or env.example.");
  process.exit(1);
}

admin.initializeApp({
  credential: getCredential(),
  databaseURL,
});

const now = new Date();
const isoDaysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

const demoUsers = [
  { id: "u_super", name: "Demo Super Admin", email: "demo.superadmin@example.com", dept: "Management", role: "superadmin", active: true },
  { id: "u_admin", name: "Demo Admin", email: "demo.admin@example.com", dept: "Operations", role: "admin", active: true },
  { id: "u_user", name: "Demo Requester", email: "demo.user@example.com", dept: "Sales", role: "user", active: true },
  { id: "u_finance", name: "Demo Finance Approver", email: "demo.finance@example.com", dept: "Finance", role: "user", active: true },
  { id: "u_hr", name: "Demo HR Approver", email: "demo.hr@example.com", dept: "HR", role: "user", active: true },
];

const approver = (id, status = "pending", actionAt = null, comment = "") => {
  const u = demoUsers.find((x) => x.id === id);
  return { userId: u.id, email: u.email, name: u.name, status, comment, actionAt };
};

const demoData = {
  users: Object.fromEntries(demoUsers.map((u) => [u.id, u])),
  memos: {
    m_pending_budget: {
      id: "m_pending_budget",
      title: "ขออนุมัติงบประมาณจัดกิจกรรม Demo Workshop",
      content: "ขออนุมัติงบประมาณสำหรับจัดกิจกรรม Demo Workshop เพื่อใช้ทดสอบ workflow การอนุมัติหลายระดับในระบบ E-Memo Demo",
      category: "งบประมาณ",
      createdBy: "u_user",
      createdAt: isoDaysAgo(1),
      updatedAt: isoDaysAgo(1),
      status: "pending",
      currentLevel: 0,
      attachments: [
        { id: "a_budget", name: "demo-budget.xlsx", size: "24 KB", type: "xlsx", data: "" },
      ],
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
      title: "ประกาศแนวทางการใช้งานระบบ E-Memo Demo",
      content: "เอกสารนี้เป็นตัวอย่าง memo ที่อนุมัติครบทุกลำดับแล้ว ใช้สำหรับทดสอบ timeline, export และ print preview",
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
      workflowLevels: [
        { id: "lv_recalled_1", level: 1, mode: "all", approvers: [approver("u_finance")] },
      ],
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
      levels: [
        { id: "rt_lv_super", mode: "all", approvers: [approver("u_super")] },
      ],
    },
  ],
};

async function upsertAuthUser(user) {
  try {
    const found = await admin.auth().getUserByEmail(user.email);
    await admin.auth().updateUser(found.uid, {
      email: user.email,
      displayName: user.name,
      password: DEMO_PASSWORD,
      disabled: !user.active,
    });
    return "updated";
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw err;
    await admin.auth().createUser({
      email: user.email,
      displayName: user.name,
      password: DEMO_PASSWORD,
      disabled: !user.active,
      emailVerified: true,
    });
    return "created";
  }
}

async function main() {
  const yes = process.argv.includes("--yes");
  if (!yes) {
    console.error("This will overwrite Realtime Database path ememo/data. Re-run with --yes to continue.");
    process.exit(1);
  }

  const results = { created: 0, updated: 0 };
  for (const user of demoUsers) {
    const result = await upsertAuthUser(user);
    results[result] += 1;
  }

  await admin.database().ref(DATA_PATH).set(demoData);

  console.log("Demo seed completed.");
  console.log(`Auth users: ${results.created} created, ${results.updated} updated`);
  console.log(`Realtime Database path: ${DATA_PATH}`);
  console.log("Demo password for all users: Demo@12345");
  console.table(demoUsers.map(({ role, name, email }) => ({ role, name, email })));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await admin.app().delete();
  });