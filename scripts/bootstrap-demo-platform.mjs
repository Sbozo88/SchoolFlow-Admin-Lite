#!/usr/bin/env node
/**
 * Print (and optionally describe) Super Admin + two demo schools bootstrap pack.
 * Pure builders only — no Firebase credentials required for preview.
 *
 *   node scripts/bootstrap-demo-platform.mjs
 *   node scripts/bootstrap-demo-platform.mjs --json
 */
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Load via tsx when available
async function main() {
  const { register } = await import("tsx/esm/api").catch(() => ({ register: null }));
  if (register) register();

  const modPath = resolve(root, "src/lib/provision/bootstrapDemoPlatform.ts");
  const mod = await import(pathToFileURL(modPath).href);

  const bootstrap = mod.buildDemoPlatformBootstrap({
    actorUserId: "user-super-admin-demo",
    nowIso: "2026-07-15T12:00:00.000Z",
  });
  mod.assertDemoPlatformIsolation(bootstrap);

  const summary = {
    superAdmin: {
      id: bootstrap.superAdmin.id,
      email: bootstrap.superAdmin.email,
      platformRole: bootstrap.superAdmin.platformRole,
      tenantId: bootstrap.superAdmin.tenantId,
      role: bootstrap.superAdmin.role,
      isPlatformOnly: bootstrap.superAdmin.isPlatformOnly,
    },
    schools: bootstrap.schools.map((s) => ({
      name: s.definition.organizationName,
      tenantId: s.provision.tenantId,
      adminEmail: s.definition.adminEmail,
      learners: s.demo.learners.length,
      attendance: s.demo.attendance.length,
      payments: s.demo.payments.length,
      submissions: s.demo.parentSubmissions.length,
    })),
  };

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log("SchoolFlow demo platform bootstrap\n");
    console.log("Super Admin (platform-only):");
    console.log(`  id:    ${summary.superAdmin.id}`);
    console.log(`  email: ${summary.superAdmin.email}`);
    console.log(`  role:  ${summary.superAdmin.platformRole} (tenantId=${summary.superAdmin.tenantId})`);
    console.log("\nSchools:");
    for (const school of summary.schools) {
      console.log(`  - ${school.name}`);
      console.log(`      tenantId: ${school.tenantId}`);
      console.log(`      admin:    ${school.adminEmail}`);
      console.log(
        `      demo:     ${school.learners} learners, ${school.attendance} attendance, ${school.payments} payments, ${school.submissions} submissions`,
      );
    }
    console.log("\nIsolation OK. Persist from Super Admin UI: “Load demo platform”.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
