import Page from "@/app/lib/Page"
import html from "./write.html?raw"
import script from "./write.client.js?raw"

export default function Write() {
  return <Page html={html} script={script} title={"Editor – Rivalta sul Mincio"} description={""} />
}
