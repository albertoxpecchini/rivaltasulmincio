import Page from "@/app/lib/Page"
import html from "./note-legali.html?raw"
import script from "./note-legali.client.js?raw"

export default function NoteLegali() {
  return <Page html={html} script={script} title={"Note Legali — Rivalta sul Mincio"} description={""} />
}
