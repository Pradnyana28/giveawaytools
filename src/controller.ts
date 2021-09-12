import SocMedService from "./services/SocMedService";
import Instagram from "./instagram/Instagram";

export default async function controller(browserInstance: Promise<any>) {
  const browser = await browserInstance;

  const ig = new Instagram({
    browser,
    is2faEnabled: false,
    tenantName: 'pradnyana-giveaway'
  });
  const session = new SocMedService(ig);
  await session.boot();

  await session.getPostLikes('CFhMm9_gkcq');
}