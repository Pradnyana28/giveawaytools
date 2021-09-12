import Instagram from "./instagram/Instagram";
import Service from "./service";

export default async function controller(browserInstance: Promise<any>) {
  const browser = await browserInstance;

  const ig = new Instagram({
    browser,
    is2faEnabled: false,
    tenantName: 'my-tenant'
  });
  const session = new Service(ig);
  const page = await session.boot();

  if (page) {

  }
}