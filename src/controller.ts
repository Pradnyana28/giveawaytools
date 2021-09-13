import SocMedService from "./services/SocMedService";
import Instagram from "./instagram/Instagram";
import { ioInput } from "./libs/utils";

export default async function controller(browserInstance: Promise<any>) {
  const browser = await browserInstance;

  const ig = new Instagram({
    browser,
    is2faEnabled: false,
    tenantName: 'pradnyana-giveaway'
  });
  const session = new SocMedService(ig);
  await session.boot();

  const postShortcode = await ioInput('Input the post shortcode => ', true);
  console.log('Start retrieving likes');
  const likes = await session.getPostLikes(postShortcode);
  await session.saveLikes(postShortcode, likes);
}