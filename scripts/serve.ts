import Service from "./Service";

export default function (commander: string) {
  const service = new Service(commander);
  service.run();
}
