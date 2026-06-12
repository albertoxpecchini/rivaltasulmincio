import Page from "@/app/lib/Page"
import html from "./reset.html?raw"
import script from "./reset.client.js?raw"

export default function Reset() {
  return <Page html={html} script={script} title={"Nuova password | Rivalta sul Mincio"} description={""} />
}
