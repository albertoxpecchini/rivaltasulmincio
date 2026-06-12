import Page from "@/app/lib/Page"
import html from "./dashboard.html?raw"
import script from "./dashboard.client.js?raw"

export default function Dashboard() {
  return <Page html={html} script={script} title={"Dashboard – Rivalta sul Mincio"} description={""} />
}
