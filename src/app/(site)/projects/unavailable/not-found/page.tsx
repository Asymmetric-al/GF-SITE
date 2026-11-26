import { notFound } from "next/navigation";

/**
 * Static prerendered 404 rewrite target for `src/proxy.ts` when a
 * `/projects/:slug` request fails pre-stream serving admission (unlisted,
 * concluded, or withdrawn). Calling `notFound()` synchronously during
 * prerendering guarantees a genuine HTTP `404` status code under Next.js 16
 * `cacheComponents: true` while displaying our custom Finance recovery UI.
 */
const ProjectUnavailableNotFoundPage = (): never => {
  notFound();
};

export default ProjectUnavailableNotFoundPage;
