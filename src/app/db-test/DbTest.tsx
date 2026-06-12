import Page from "@/app/lib/Page"
import html from "./db-test.html?raw"
import script from "./db-test.client.js?raw"

export default function DbTest() {
  return <Page html={html} script={script} title={"Database Test — Rivalta sul Mincio"} description={""} />
}
