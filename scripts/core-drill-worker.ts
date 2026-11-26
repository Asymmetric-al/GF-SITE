import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

interface PayloadLayoutBlock {
  readonly blockType?: string;
  readonly headline?: string;
}

interface PayloadRecord {
  readonly filename?: string;
  readonly id: number | string;
  readonly layout?: readonly PayloadLayoutBlock[];
  readonly slug?: string;
  readonly url?: string;
}

interface PayloadCreateInput {
  readonly collection: string;
  readonly context?: { readonly cmsLocalSeed: boolean };
  readonly data: object;
  readonly draft?: boolean;
  readonly filePath?: string;
  readonly overrideAccess: boolean;
}

interface PayloadFindByIdInput {
  readonly collection: string;
  readonly id: number;
  readonly overrideAccess: boolean;
}

interface PayloadUpdateInput {
  readonly collection: string;
  readonly context?: { readonly cmsLocalSeed: boolean };
  readonly data: object;
  readonly draft?: boolean;
  readonly id: number;
  readonly overrideAccess: boolean;
}

interface PayloadDeleteInput {
  readonly collection: string;
  readonly context?: { readonly cmsLocalSeed: boolean };
  readonly id: number;
  readonly overrideAccess: boolean;
}

interface DynamicPayloadInstance {
  readonly create: (args: PayloadCreateInput) => Promise<PayloadRecord>;
  readonly delete: (args: PayloadDeleteInput) => Promise<void>;
  readonly destroy: () => Promise<void>;
  readonly findByID: (args: PayloadFindByIdInput) => Promise<PayloadRecord>;
  readonly update: (args: PayloadUpdateInput) => Promise<PayloadRecord>;
}

interface PayloadRuntimeExports {
  readonly getPayload: (args: {
    readonly config: unknown;
  }) => Promise<DynamicPayloadInstance>;
}

interface PayloadConfigExports {
  readonly default: unknown;
}

const isPayloadRuntimeExports = (
  value: unknown
): value is PayloadRuntimeExports =>
  typeof value === "object" &&
  value !== null &&
  "getPayload" in value &&
  typeof value.getPayload === "function";

const isPayloadConfigExports = (
  value: unknown
): value is PayloadConfigExports =>
  typeof value === "object" && value !== null && "default" in value;

const isObjectValue = (value: unknown): value is object =>
  typeof value === "object" && value !== null;

const importExternalModule = async (specifier: string): Promise<object> => {
  const loaded: unknown = await import(specifier);

  if (!isObjectValue(loaded)) {
    throw new Error(`Module ${specifier} did not export an object.`);
  }

  return loaded;
};

const coreRepoDir = path.resolve(
  process.env.CORE_REPO_DIR ?? path.resolve(import.meta.dirname, "../../core")
);

const coreAdminDir = path.join(coreRepoDir, "apps", "admin");

const FIXTURE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC";

const makeLexicalDoc = (headingText: string, paragraphText: string) => ({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: headingText,
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        tag: "h1",
        type: "heading",
        version: 1,
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: paragraphText,
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
});

const runSeed = async (
  payload: DynamicPayloadInstance,
  originalCwd: string
): Promise<void> => {
  const tenant = await payload.create({
    collection: "tenants",
    context: { cmsLocalSeed: true },
    data: {
      isActive: true,
      name: "Global Fellowship Drill",
      primaryDomain: "gf-drill.local",
      slug: "gf-drill",
    },
    overrideAccess: true,
  });

  const tmpMediaPath = path.join(originalCwd, "scratch-gf-drill-square.png");

  fs.writeFileSync(tmpMediaPath, Buffer.from(FIXTURE_PNG_BASE64, "base64"));

  let media: PayloadRecord;

  try {
    media = await payload.create({
      collection: "media",
      context: { cmsLocalSeed: true },
      data: {
        alt: "Synthetic non-identifying verification image",
        caption: "Synthetic drill plate (non-identifying)",
        tenant: tenant.id,
      },
      filePath: tmpMediaPath,
      overrideAccess: true,
    });
  } finally {
    fs.rmSync(tmpMediaPath, { force: true });
  }

  const project = await payload.create({
    collection: "project-pages",
    context: { cmsLocalSeed: true },
    data: {
      _status: "published",
      fundId: "11111111-1111-4111-8111-111111111111",
      layout: [
        {
          backgroundImage: media.id,
          blockType: "hero",
          eyebrow: "Regional Fellowship Drill",
          headline: "Regional Elders Gathering (Synthetic Drill v1)",
          primaryCtaHref: "/financials",
          primaryCtaLabel: "Inspect 2025 Financials",
          subheading:
            "Synthetic non-sensitive project page verifying live Core Payload CMS v4 delivery.",
        },
        {
          blockType: "rich-text",
          body: makeLexicalDoc(
            "Embedded H1 Demoted Under Section H2",
            "Local elders lead every gathering and review published summaries in their own working language."
          ),
          heading: "Project overview",
        },
        {
          blockType: "impact-stats",
          heading: "2025 Synthetic Drill Summary",
          items: [
            {
              description: "2025 synthetic drill scope",
              label: "Regional study groups",
              value: "12",
            },
          ],
        },
        {
          blockType: "call-to-action",
          buttonHref: "/financials",
          buttonLabel: "Inspect 2025 Financials",
          copy: "Review our transparent 2025 financial statements before participating.",
          headline: "Transparent Stewardship First",
          openInNewTab: false,
        },
      ],
      pageType: "project",
      slug: "regional-elders-gathering-drill",
      summary:
        "Synthetic non-sensitive project page verifying live Core Payload CMS v4 delivery.",
      templateKey: "local-project-template",
      tenant: tenant.id,
      title: "Regional Elders Gathering (Synthetic Drill v1)",
    },
    draft: false,
    overrideAccess: true,
  });

  const draftProject = await payload.create({
    collection: "project-pages",
    context: { cmsLocalSeed: true },
    data: {
      _status: "draft",
      fundId: "22222222-2222-4222-8222-222222222222",
      layout: [
        {
          blockType: "rich-text",
          body: makeLexicalDoc(
            "Private Draft Heading",
            "Unpublished draft content that must never render publicly."
          ),
          heading: "Confidential Draft Section",
        },
      ],
      pageType: "project",
      slug: "unpublished-draft-project-drill",
      summary: "Unpublished draft project summary (must stay hidden).",
      templateKey: "local-project-template",
      tenant: tenant.id,
      title: "Unpublished Draft Project Secret Title",
    },
    draft: true,
    overrideAccess: true,
  });

  const missionaryGivingId = "33333333-3333-4333-8333-333333333333";
  const draftMissionaryGivingId = "44444444-4444-4444-8444-444444444444";

  const missionaryPage = await payload.create({
    collection: "missionary-giving-pages",
    context: { cmsLocalSeed: true },
    data: {
      _status: "published",
      layout: [
        {
          backgroundImage: media.id,
          blockType: "hero",
          eyebrow: "Synthetic Field Team",
          headline: "Synthetic Field Family (Drill v1)",
          subheading:
            "Synthetic non-identifying missionary giving page verifying live Core Payload CMS v4 delivery.",
        },
        {
          blockType: "rich-text",
          body: makeLexicalDoc(
            "Missionary Calling Heading Demoted",
            "Serving by invitation alongside local church elders in our synthetic drill region."
          ),
          heading: "Ministry story",
        },
      ],
      missionaryId: missionaryGivingId,
      pageType: "missionary_giving",
      slug: "synthetic-field-family-drill",
      summary:
        "Synthetic non-identifying missionary giving page verifying live Core Payload CMS v4 delivery.",
      templateKey: "missionary-giving-template",
      tenant: tenant.id,
      title: "Synthetic Field Family (Drill v1)",
    },
    draft: false,
    overrideAccess: true,
  });

  const draftMissionaryPage = await payload.create({
    collection: "missionary-giving-pages",
    context: { cmsLocalSeed: true },
    data: {
      _status: "draft",
      layout: [
        {
          blockType: "rich-text",
          body: makeLexicalDoc(
            "Confidential Missionary Draft",
            "Unpublished missionary draft content that must never render publicly."
          ),
          heading: "Confidential Draft Section",
        },
      ],
      missionaryId: draftMissionaryGivingId,
      pageType: "missionary_giving",
      slug: "unpublished-draft-missionary-drill",
      summary: "Unpublished missionary draft summary (must stay hidden).",
      templateKey: "missionary-giving-template",
      tenant: tenant.id,
      title: "Unpublished Draft Missionary Secret Title",
    },
    draft: true,
    overrideAccess: true,
  });

  const navigation = await payload.create({
    collection: "navigation",
    context: { cmsLocalSeed: true },
    data: {
      items: [
        {
          href: `/projects/${project.slug ?? ""}`,
          label: "Regional Elders Gathering (Synthetic Drill v1)",
          openInNewTab: false,
        },
        {
          href: `/projects/${draftProject.slug ?? ""}`,
          label: "Unpublished Draft Project Secret Title",
          openInNewTab: false,
        },
        {
          href: `/missionaries/${missionaryGivingId}`,
          label: "Synthetic Field Family (Drill v1)",
          openInNewTab: false,
        },
        {
          href: `/missionaries/${draftMissionaryGivingId}`,
          label: "Unpublished Draft Missionary Secret Title",
          openInNewTab: false,
        },
      ],
      label: "Drill Projects and Missionaries Navigation",
      tenant: tenant.id,
    },
    overrideAccess: true,
  });

  const missionary = await payload.create({
    collection: "missionary-profiles",
    context: { cmsLocalSeed: true },
    data: {
      bio: "Synthetic non-identifying regional coordinator profile for live CMS verification.",
      fullName: "Synthetic Regional Coordinator",
      slug: "synthetic-regional-coordinator",
      tagline: "Serving alongside local elders",
      tenant: tenant.id,
    },
    overrideAccess: true,
  });

  const update = await payload.create({
    collection: "ministry-updates",
    context: { cmsLocalSeed: true },
    data: {
      _status: "published",
      content: makeLexicalDoc(
        "Regional Fellowship Note",
        "Pray with local elders gathering for Scripture study across our synthetic drill region."
      ),
      excerpt:
        "Published live from Core Payload CMS v4 during end-to-end verification.",
      missionary: missionary.id,
      publishedAt: "2026-11-23T12:00:00.000Z",
      slug: "synthetic-prayer-note-drill",
      tenant: tenant.id,
      title: "Synthetic Regional Prayer Note (Drill v1)",
    },
    draft: false,
    overrideAccess: true,
  });

  const draftUpdate = await payload.create({
    collection: "ministry-updates",
    context: { cmsLocalSeed: true },
    data: {
      _status: "draft",
      content: makeLexicalDoc(
        "Unpublished Draft Update",
        "Unpublished draft story text that must never appear on /stories."
      ),
      excerpt: "Unpublished draft excerpt (must stay hidden).",
      missionary: missionary.id,
      publishedAt: "2026-11-24T12:00:00.000Z",
      slug: "unpublished-draft-update-drill",
      tenant: tenant.id,
      title: "Unpublished Draft Story Secret Title",
    },
    draft: true,
    overrideAccess: true,
  });

  process.stdout.write(
    `DRILL_RESULT:${JSON.stringify({
      draftMissionaryGivingId,
      draftMissionaryPageDocId: String(draftMissionaryPage.id),
      draftProjectId: String(draftProject.id),
      draftProjectSlug: draftProject.slug ?? "",
      draftUpdateId: String(draftUpdate.id),
      mediaFilename: media.filename ?? "",
      mediaId: String(media.id),
      mediaUrl: media.url ?? "",
      missionaryGivingId,
      missionaryId: String(missionary.id),
      missionaryPageDocId: String(missionaryPage.id),
      navigationId: String(navigation.id),
      projectId: String(project.id),
      projectSlug: project.slug ?? "",
      tenantId: String(tenant.id),
      updateId: String(update.id),
    })}\n`
  );
};

const runUpdate = async (
  payload: DynamicPayloadInstance,
  projectId: number,
  missionaryPageDocId: number,
  updateId: number
): Promise<void> => {
  const [existingProject, existingMissionaryPage] = await Promise.all([
    payload.findByID({
      collection: "project-pages",
      id: projectId,
      overrideAccess: true,
    }),
    payload.findByID({
      collection: "missionary-giving-pages",
      id: missionaryPageDocId,
      overrideAccess: true,
    }),
  ]);

  const updatedLayout: readonly PayloadLayoutBlock[] =
    existingProject.layout === undefined
      ? []
      : existingProject.layout.map((block) =>
          block.blockType === "hero"
            ? {
                ...block,
                headline: "Regional Elders Gathering (Synthetic Drill v2)",
              }
            : block
        );

  const updatedMissionaryLayout: readonly PayloadLayoutBlock[] =
    existingMissionaryPage.layout === undefined
      ? []
      : existingMissionaryPage.layout.map((block) =>
          block.blockType === "hero"
            ? {
                ...block,
                headline: "Synthetic Field Family (Drill v2)",
              }
            : block
        );

  await payload.update({
    collection: "project-pages",
    context: { cmsLocalSeed: true },
    data: {
      _status: "published",
      layout: updatedLayout,
      summary:
        "Updated live in Core Payload CMS v4 (v2) to verify signed cache tag invalidation.",
      title: "Regional Elders Gathering (Synthetic Drill v2)",
    },
    draft: false,
    id: projectId,
    overrideAccess: true,
  });

  await payload.update({
    collection: "missionary-giving-pages",
    context: { cmsLocalSeed: true },
    data: {
      _status: "published",
      layout: updatedMissionaryLayout,
      summary:
        "Updated live missionary giving page (v2) to verify immediate redaction.",
      title: "Synthetic Field Family (Drill v2)",
    },
    draft: false,
    id: missionaryPageDocId,
    overrideAccess: true,
  });

  await payload.update({
    collection: "ministry-updates",
    context: { cmsLocalSeed: true },
    data: {
      _status: "published",
      excerpt:
        "Updated live in Core Payload CMS v4 (v2) to verify uncached consent-first updates feed.",
      title: "Synthetic Regional Prayer Note (Drill v2)",
    },
    draft: false,
    id: updateId,
    overrideAccess: true,
  });

  process.stdout.write(`DRILL_RESULT:${JSON.stringify({ updated: true })}\n`);
};

const runWithdraw = async (
  payload: DynamicPayloadInstance,
  projectId: number,
  missionaryPageDocId: number,
  updateId: number,
  mediaId: number
): Promise<void> => {
  await payload.update({
    collection: "project-pages",
    context: { cmsLocalSeed: true },
    data: { _status: "draft" },
    draft: false,
    id: projectId,
    overrideAccess: true,
  });

  await payload.update({
    collection: "missionary-giving-pages",
    context: { cmsLocalSeed: true },
    data: { _status: "draft" },
    draft: false,
    id: missionaryPageDocId,
    overrideAccess: true,
  });

  await payload.update({
    collection: "ministry-updates",
    context: { cmsLocalSeed: true },
    data: { _status: "draft" },
    draft: false,
    id: updateId,
    overrideAccess: true,
  });

  await payload.delete({
    collection: "media",
    context: { cmsLocalSeed: true },
    id: mediaId,
    overrideAccess: true,
  });

  process.stdout.write(`DRILL_RESULT:${JSON.stringify({ withdrawn: true })}\n`);
};

const run = async (): Promise<void> => {
  const [command = "", arg1, arg2, arg3, arg4] = process.argv.slice(2);
  const originalCwd = process.cwd();

  process.chdir(coreAdminDir);

  const requireFromAdmin = createRequire(
    path.join(coreAdminDir, "package.json")
  );

  const payloadEntryUrl = pathToFileURL(
    requireFromAdmin.resolve("payload")
  ).href;

  const payloadConfigUrl = pathToFileURL(
    path.join(coreAdminDir, "payload.config.ts")
  ).href;

  const [rawPayloadModule, rawConfigModule] = await Promise.all([
    importExternalModule(payloadEntryUrl),
    importExternalModule(payloadConfigUrl),
  ]);

  if (
    !isPayloadRuntimeExports(rawPayloadModule) ||
    !isPayloadConfigExports(rawConfigModule)
  ) {
    throw new Error("Unable to load Payload v4 runtime from CORE_REPO_DIR.");
  }

  const payload = await rawPayloadModule.getPayload({
    config: rawConfigModule.default,
  });

  try {
    if (command === "seed") {
      await runSeed(payload, originalCwd);
    } else if (command === "update") {
      await runUpdate(payload, Number(arg1), Number(arg2), Number(arg3));
    } else if (command === "withdraw") {
      await runWithdraw(
        payload,
        Number(arg1),
        Number(arg2),
        Number(arg3),
        Number(arg4)
      );
    } else {
      throw new Error(`Unknown drill command: ${command}`);
    }
  } finally {
    await payload.destroy();
    process.chdir(originalCwd);
  }
};

try {
  await run();
  process.exit(0);
} catch (error) {
  process.stderr.write(`DRILL_WORKER_ERROR: ${String(error)}\n`);
  process.exit(1);
}
