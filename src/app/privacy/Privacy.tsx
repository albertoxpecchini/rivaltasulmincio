import Page from "@/app/lib/Page"
import html from "./privacy.html?raw"
import script from "./privacy.client.js?raw"

export default function Privacy() {
  return <Page html={html} script={script} title={"Privacy Policy — Rivalta sul Mincio"} description={""} />
}
